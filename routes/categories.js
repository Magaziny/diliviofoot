import { Router } from 'express';
import { authenticate } from './auth.js';
import db from '../db.js';

const router = Router();

// Получение всех категорий
router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM categories').all());
});

// Создание категории (только admin)
router.post('/', authenticate, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
  const { id, name } = req.body;
  try {
    db.prepare('INSERT INTO categories (id, name) VALUES (?, ?)').run(id, name);
    res.json({ id, name });
  } catch (e) {
    res.status(400).json({ error: 'Категория с таким ID уже существует' });
  }
});

// Обновление категории (только admin)
router.put('/:oldId', authenticate, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
  const { id, name } = req.body;
  const { oldId } = req.params;

  try {
    db.transaction(() => {
      if (id !== oldId) {
        db.prepare('UPDATE products SET category = ? WHERE category = ?').run(id, oldId);
        db.prepare('UPDATE categories SET id = ?, name = ? WHERE id = ?').run(id, name, oldId);
      } else {
        db.prepare('UPDATE categories SET name = ? WHERE id = ?').run(name, oldId);
      }
    })();
    res.json({ message: 'OK' });
  } catch (e) {
    res.status(400).json({ error: 'Ошибка обновления категории' });
  }
});

// Удаление категории (только admin, только если нет товаров)
router.delete('/:id', authenticate, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
  const productsCount = db.prepare('SELECT count(*) as count FROM products WHERE category = ?').get(req.params.id);
  if (productsCount.count > 0) {
    return res.status(400).json({ error: 'Нельзя удалить категорию, в которой есть товары' });
  }
  db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
  res.json({ message: 'OK' });
});

export default router;
