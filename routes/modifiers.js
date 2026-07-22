import { Router } from 'express';
import { authenticate } from './auth.js';
import db from '../db.js';

const router = Router();

// Получение всех модификаторов
router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM modifiers').all());
});

// Создание модификатора (только admin)
router.post('/', authenticate, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
  const { name, price } = req.body;
  const info = db.prepare('INSERT INTO modifiers (name, price) VALUES (?, ?)').run(name, price);
  res.json({ id: info.lastInsertRowid, name, price });
});

// Обновление модификатора (только admin)
router.put('/:id', authenticate, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
  const { name, price } = req.body;
  db.prepare('UPDATE modifiers SET name = ?, price = ? WHERE id = ?').run(name, price, req.params.id);
  res.json({ message: 'OK' });
});

// Удаление модификатора (только admin)
router.delete('/:id', authenticate, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
  db.prepare('DELETE FROM modifiers WHERE id = ?').run(req.params.id);
  res.json({ message: 'OK' });
});

// Получение продуктов, к которым привязан модификатор
router.get('/:id/products', (req, res) => {
  const products = db.prepare(`
    SELECT p.* FROM products p
    JOIN product_modifiers pm ON p.id = pm.product_id
    WHERE pm.modifier_id = ?
  `).all(req.params.id);
  res.json(products);
});

// Привязка модификатора к продуктам
router.post('/:id/products', authenticate, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
  const { productIds } = req.body;
  const modifierId = req.params.id;

  db.transaction(() => {
    db.prepare('DELETE FROM product_modifiers WHERE modifier_id = ?').run(modifierId);
    const insert = db.prepare('INSERT INTO product_modifiers (product_id, modifier_id) VALUES (?, ?)');
    productIds.forEach(prodId => insert.run(prodId, modifierId));
  })();
  res.json({ message: 'OK' });
});

export default router;
