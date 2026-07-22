import { Router } from 'express';
import { authenticate } from './auth.js';
import db from '../db.js';
import multer from 'multer';
import path from 'path';
import { UPLOADS_DIR } from '../paths.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

const router = Router();

// Получение всех настроек (публичное, нужно для клиента)
router.get('/', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM settings').all();
    const settings = {};
    rows.forEach(row => { settings[row.key] = row.value; });
    res.json(settings);
  } catch (e) {
    console.error('Failed to fetch settings:', e);
    res.status(500).json({ error: 'Ошибка получения настроек' });
  }
});

// Обновление настроек (admin или operator)
router.put('/', authenticate, (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'operator')
    return res.status(403).json({ error: 'Access denied' });

  const newSettings = req.body;
  try {
    const update = db.prepare(
      'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
    );
    db.transaction(() => {
      Object.entries(newSettings).forEach(([key, value]) => update.run(key, String(value)));
    })();
    console.log(`[SETTINGS] Обновлены настройки:`, newSettings);
    res.json({ message: 'OK' });
  } catch (e) {
    console.error('Settings Update Error:', e);
    res.status(500).json({ error: 'Ошибка обновления настроек' });
  }
});

// Загрузка логотипа
router.post('/logo', authenticate, upload.single('logo'), (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'operator')
    return res.status(403).json({ error: 'Access denied' });

  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const logoPath = `/uploads/${req.file.filename}`;
  res.json({ logo_url: logoPath });
});

// Загрузка фона
router.post('/background', authenticate, upload.single('background'), (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'operator')
    return res.status(403).json({ error: 'Access denied' });

  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const bgPath = `/uploads/${req.file.filename}`;
  res.json({ background_url: bgPath });
});

export default router;
