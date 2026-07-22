import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { authenticate } from './auth.js';
import db from '../db.js';
import { UPLOADS_DIR } from '../paths.js';

const router = Router();

// Хелпер преобразования в boolean (0/1)
const toBool = (val) => {
  if (val === 'false' || val === false || val === 0 || val === '0') return 0;
  return 1;
};

// Настройка multer для загрузки изображений
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// --- Продукты ---
router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM products').all());
});

// Создание товара (только admin)
router.post('/', authenticate, upload.single('image'), (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
  const {
    category, name, description, price, sale_price, is_available, show_in_stories, has_variants,
    price_s, price_m, price_l, has_s, has_m, has_l, has_traditional, has_thin, related_products
  } = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : req.body.image;

  const info = db.prepare(
    `INSERT INTO products (
      category, name, description, price, sale_price, is_available, show_in_stories, has_variants,
      image, price_s, price_m, price_l, has_s, has_m, has_l, has_traditional, has_thin,
      size_s_name, size_m_name, size_l_name, variants_label, is_popular, option_label, option_1_name, option_2_name, related_products
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    category, name, description, price, sale_price || null,
    toBool(is_available), toBool(show_in_stories), toBool(has_variants),
    imagePath,
    parseInt(price_s) || 0, parseInt(price_m) || 0, parseInt(price_l) || 0,
    toBool(has_s), toBool(has_m), toBool(has_l), toBool(has_traditional), toBool(has_thin),
    req.body.size_s_name || '25 см', req.body.size_m_name || '30 см', req.body.size_l_name || '35 см',
    req.body.variants_label || 'Размер',
    toBool(req.body.is_popular),
    req.body.option_label || 'Тесто',
    req.body.option_1_name || 'Традиционное',
    req.body.option_2_name || 'Тонкое',
    related_products || '[]'
  );
  console.log(`[MENU] Добавлен новый товар: ${name}`);
  res.json({ id: info.lastInsertRowid });
});

// Обновление товара (только admin)
router.put('/:id', authenticate, upload.single('image'), (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
  const productId = parseInt(req.params.id);
  if (isNaN(productId)) return res.status(400).json({ error: 'Invalid product ID' });
  const {
    category, name, description, price, sale_price, is_available, show_in_stories, has_variants,
    price_s, price_m, price_l, has_s, has_m, has_l, has_traditional, has_thin,
    size_s_name, size_m_name, size_l_name, variants_label, is_popular,
    option_label, option_1_name, option_2_name, related_products
  } = req.body;
  console.log(`[MENU] Обновляем товар ID: ${productId}`);
  let imagePath = req.body.image;
  if (req.file) imagePath = `/uploads/${req.file.filename}`;

  db.prepare(
    `UPDATE products SET
      category = ?, name = ?, description = ?, price = ?, sale_price = ?,
      is_available = ?, show_in_stories = ?, has_variants = ?, image = ?,
      price_s = ?, price_m = ?, price_l = ?, has_s = ?, has_m = ?, has_l = ?,
      has_traditional = ?, has_thin = ?, size_s_name = ?, size_m_name = ?, size_l_name = ?,
      variants_label = ?, is_popular = ?, option_label = ?, option_1_name = ?, option_2_name = ?, related_products = ?
    WHERE id = ?`
  ).run(
    category, name, description, price, sale_price || null,
    toBool(is_available), toBool(show_in_stories), toBool(has_variants),
    imagePath,
    parseInt(price_s) || 0, parseInt(price_m) || 0, parseInt(price_l) || 0,
    toBool(has_s), toBool(has_m), toBool(has_l), toBool(has_traditional), toBool(has_thin),
    size_s_name || '25 см', size_m_name || '30 см', size_l_name || '35 см',
    variants_label || 'Размер',
    toBool(is_popular),
    option_label || 'Тесто',
    option_1_name || 'Традиционное',
    option_2_name || 'Тонкое',
    related_products || '[]',
    productId
  );
  res.json({ message: 'OK' });
});


// Удаление товара (только admin)
router.delete('/:id', authenticate, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
  const productId = parseInt(req.params.id);
  if (isNaN(productId)) return res.status(400).json({ error: 'Invalid product ID' });
  db.prepare('DELETE FROM products WHERE id = ?').run(productId);
  res.json({ message: 'OK' });
});

// --- Модификаторы конкретного продукта ---
router.get('/:id/modifiers', (req, res) => {
  const mods = db.prepare(`
    SELECT m.* FROM modifiers m
    JOIN product_modifiers pm ON m.id = pm.modifier_id
    WHERE pm.product_id = ?
  `).all(req.params.id);
  res.json(mods);
});

router.post('/:id/modifiers', authenticate, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
  const { modifierIds } = req.body;
  const productId = req.params.id;

  db.transaction(() => {
    db.prepare('DELETE FROM product_modifiers WHERE product_id = ?').run(productId);
    const insert = db.prepare('INSERT INTO product_modifiers (product_id, modifier_id) VALUES (?, ?)');
    modifierIds.forEach(modId => insert.run(productId, modId));
  })();
  res.json({ message: 'OK' });
});

export default router;
