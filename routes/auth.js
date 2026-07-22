import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.js';

const router = Router();
const SECRET_KEY = process.env.JWT_SECRET;
if (!SECRET_KEY) {
  console.error('[FATAL] JWT_SECRET не задан в .env! Запуск сервера отменён.');
  process.exit(1);
}

// Middleware аутентификации (экспортируется для переиспользования в других роутах)
export const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    req.user = decoded;
    next();
  });
};

// Проверка существования номера телефона
router.post('/check-phone', (req, res) => {
  const { phone } = req.body;
  const user = db.prepare('SELECT id FROM users WHERE phone = ?').get(phone);
  res.json({ exists: !!user });
});

// Регистрация клиента
router.post('/register', (req, res) => {
  const { username, password, phone, address } = req.body;

  // Серверная валидация входных данных
  if (!username || username.trim().length < 2) {
    return res.status(400).json({ error: 'Имя пользователя слишком короткое (минимум 2 символа)' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Пароль должен быть не менее 6 символов' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  try {
    const info = db.prepare(
      'INSERT INTO users (username, password, phone, address, role, loyalty_points) VALUES (?, ?, ?, ?, ?, 0)'
    ).run(username, hashedPassword, phone, address, 'customer');
    const token = jwt.sign(
      { id: info.lastInsertRowid, username, role: 'customer' },
      SECRET_KEY,
      { expiresIn: '24h' }
    );
    res.json({
      token,
      user: { id: info.lastInsertRowid, username, role: 'customer', phone, address, loyalty_points: 0 }
    });
  } catch (e) {
    res.status(400).json({ error: 'Пользователь уже существует' });
  }
});

// Вход (по логину или телефону)
router.post('/login', (req, res) => {
  const { username, phone, password } = req.body;
  let user;
  if (phone) user = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone);
  else if (username) user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

  if (user && bcrypt.compareSync(password, user.password)) {
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      SECRET_KEY,
      { expiresIn: '24h' }
    );
    console.log(`[AUTH] Успешный вход: ${username || phone} (Роль: ${user.role})`);
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        phone: user.phone,
        address: user.address,
        loyalty_points: user.loyalty_points || 0
      }
    });
  } else {
    console.warn(`[AUTH] Неудачная попытка входа: ${username || phone}`);
    res.status(401).json({ error: 'Неверные данные' });
  }
});

// Получение профиля текущего пользователя
router.get('/me', authenticate, (req, res) => {
  try {
    const user = db.prepare(
      'SELECT id, username, role, phone, address, loyalty_points FROM users WHERE id = ?'
    ).get(req.user.id);
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: 'Ошибка получения профиля' });
  }
});

// Обновление профиля администратора
router.put('/update-admin', authenticate, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
  const { username, password } = req.body;
  if (password) {
    const hashedPassword = bcrypt.hashSync(password, 10);
    db.prepare('UPDATE users SET username = ?, password = ? WHERE id = ?').run(username, hashedPassword, req.user.id);
  } else {
    db.prepare('UPDATE users SET username = ? WHERE id = ?').run(username, req.user.id);
  }
  res.json({ message: 'OK' });
});

// Добавление сотрудника (только admin)
router.post('/add-staff', authenticate, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
  const { username, password, role } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Логин и пароль обязательны' });
  }

  const validRoles = ['operator', 'courier'];
  const assignedRole = validRoles.includes(role) ? role : 'operator';

  try {
    const hashedPassword = bcrypt.hashSync(password, 10);
    db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run(username, hashedPassword, assignedRole);
    console.log(`[STAFF] Добавлен новый сотрудник: ${username} (роль: ${assignedRole})`);
    res.json({ message: 'Сотрудник добавлен' });
  } catch (e) {
    console.error('Add Staff Error:', e);
    if (e.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ error: 'Пользователь с таким логином уже существует' });
    } else {
      res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
  }
});

export default router;
