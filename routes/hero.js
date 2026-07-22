import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { authenticate } from './auth.js';
import db from '../db.js';
import { UPLOADS_DIR } from '../paths.js';

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Получение всех слайдов
router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM hero_slides').all());
});

// Создание слайда (только admin)
router.post('/', authenticate, upload.single('image'), (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
  const { title, subtitle, price, particles, countdown_to } = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : req.body.image;
  const info = db.prepare(
    'INSERT INTO hero_slides (title, subtitle, price, image, particles, countdown_to) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(title, subtitle, price, imagePath, particles || null, countdown_to || null);
  res.json({ id: info.lastInsertRowid });
});

// Обновление слайда (только admin)
router.put('/:id', authenticate, upload.single('image'), (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
  const { title, subtitle, price, particles, countdown_to } = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : req.body.image;
  db.prepare(
    'UPDATE hero_slides SET title = ?, subtitle = ?, price = ?, image = ?, particles = ?, countdown_to = ? WHERE id = ?'
  ).run(title, subtitle, price, imagePath, particles || null, countdown_to || null, req.params.id);
  res.json({ message: 'OK' });
});

// Удаление слайда (только admin)
router.delete('/:id', authenticate, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
  db.prepare('DELETE FROM hero_slides WHERE id = ?').run(req.params.id);
  res.json({ message: 'OK' });
});

export default router;
