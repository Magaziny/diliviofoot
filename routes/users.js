import { Router } from 'express';
import { authenticate } from './auth.js';
import db from '../db.js';

const router = Router();

// Хелпер преобразования в boolean (0/1)
const toBool = (val) => {
  if (val === 'false' || val === false || val === 0 || val === '0') return 0;
  return 1;
};

// --- Список пользователей ---
router.get('/', authenticate, (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'operator')
    return res.status(403).json({ error: 'Access denied' });
  const users = db.prepare('SELECT id, username, phone, address, role, loyalty_points FROM users').all();
  res.json(users);
});

// Получение списка курьеров
router.get('/couriers', authenticate, (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'operator')
    return res.status(403).json({ error: 'Access denied' });
  const couriers = db.prepare('SELECT id, username, phone FROM users WHERE role = ?').all('courier');
  res.json(couriers);
});

// Редактирование клиента/пользователя
router.put('/:id', authenticate, (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'operator')
    return res.status(403).json({ error: 'Access denied' });
  const { username, phone, address, loyalty_points } = req.body;
  const userId = req.params.id;

  try {
    db.prepare('UPDATE users SET username = ?, phone = ?, address = ?, loyalty_points = ? WHERE id = ?')
      .run(username, phone, address, parseInt(loyalty_points) || 0, userId);
    console.log(`[USER] Обновлен пользователь ID ${userId}: ${username}`);
    res.json({ message: 'Пользователь обновлен' });
  } catch (e) {
    console.error('Update User Error:', e);
    if (e.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ error: 'Пользователь с таким телефоном или именем уже существует' });
    } else {
      res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
  }
});

// Удаление сотрудника (только admin, нельзя удалить самого себя)
router.delete('/:id', authenticate, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
  db.prepare('DELETE FROM users WHERE id = ? AND role != ?').run(req.params.id, 'admin');
  res.json({ message: 'Сотрудник удален' });
});

export default router;
