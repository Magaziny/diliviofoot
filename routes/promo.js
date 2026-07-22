import { Router } from 'express';
import { authenticate } from './auth.js';
import db from '../db.js';

const router = Router();

// Вспомогательная функция для валидации промокода
export function validatePromoCode(code, total) {
  if (!code) {
    return { valid: false, message: 'Промокод не указан' };
  }

  const cleanCode = code.trim().toUpperCase();
  const promo = db.prepare('SELECT * FROM promo_codes WHERE code = ?').get(cleanCode);

  if (!promo) {
    return { valid: false, message: 'Промокод не существует' };
  }

  if (promo.is_active !== 1) {
    return { valid: false, message: 'Промокод деактивирован' };
  }

  // Проверка лимита использований
  if (promo.max_uses !== null && promo.uses_count >= promo.max_uses) {
    return { valid: false, message: 'Лимит использования промокода исчерпан' };
  }

  // Проверка срока действия
  if (promo.expires_at) {
    const now = new Date();
    const expiry = new Date(promo.expires_at);
    // Если дата истечения валидная и текущее время больше даты истечения
    if (!isNaN(expiry.getTime()) && now > expiry) {
      return { valid: false, message: 'Срок действия промокода истек' };
    }
  }

  // Проверка минимальной суммы заказа
  if (total < promo.min_order_amount) {
    return { 
      valid: false, 
      message: `Минимальная сумма заказа для применения: ${promo.min_order_amount} m` 
    };
  }

  // Расчет скидки
  let discount_amount = 0;
  if (promo.discount_type === 'percent') {
    discount_amount = Math.round((total * promo.discount_value) / 100);
  } else if (promo.discount_type === 'fixed') {
    discount_amount = promo.discount_value;
  }

  // Скидка не может превышать сумму заказа
  discount_amount = Math.min(total, discount_amount);

  return {
    valid: true,
    code: promo.code,
    discount_type: promo.discount_type,
    discount_value: promo.discount_value,
    discount_amount,
    message: 'Промокод успешно применен'
  };
}

// 1. Публичный эндпоинт валидации промокода
router.post('/validate', (req, res) => {
  const { code, total } = req.body;
  
  if (total === undefined || isNaN(Number(total))) {
    return res.status(400).json({ error: 'Не указана сумма заказа' });
  }

  try {
    const result = validatePromoCode(code, Number(total));
    res.json(result);
  } catch (e) {
    console.error('[PROMO] Ошибка валидации промокода:', e);
    res.status(500).json({ error: 'Внутренняя ошибка при проверке промокода' });
  }
});

// --- Только для администраторов ---

const checkAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Доступ запрещен (требуются права администратора)' });
  }
  next();
};

// 2. Получение списка всех промокодов
router.get('/', authenticate, checkAdmin, (req, res) => {
  try {
    const promos = db.prepare('SELECT * FROM promo_codes ORDER BY created_at DESC').all();
    res.json(promos);
  } catch (e) {
    console.error('[PROMO] Ошибка получения промокодов:', e);
    res.status(500).json({ error: 'Не удалось получить промокоды' });
  }
});

// 3. Создание нового промокода
router.post('/', authenticate, checkAdmin, (req, res) => {
  const { 
    code, 
    discount_type, 
    discount_value, 
    min_order_amount, 
    max_uses, 
    expires_at, 
    is_active 
  } = req.body;

  if (!code || !discount_value) {
    return res.status(400).json({ error: 'Код и размер скидки обязательны' });
  }

  const cleanCode = code.trim().toUpperCase();
  const type = discount_type === 'fixed' ? 'fixed' : 'percent';
  const val = Number(discount_value);
  const minAmount = Number(min_order_amount) || 0;
  const maxUses = (max_uses === '' || max_uses === undefined || max_uses === null) ? null : Number(max_uses);
  const expiry = expires_at || null;
  const active = is_active === false ? 0 : 1;

  try {
    // Проверим уникальность кода
    const existing = db.prepare('SELECT id FROM promo_codes WHERE code = ?').get(cleanCode);
    if (existing) {
      return res.status(400).json({ error: 'Промокод с таким кодом уже существует' });
    }

    const insert = db.prepare(`
      INSERT INTO promo_codes 
      (code, discount_type, discount_value, min_order_amount, max_uses, expires_at, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const info = insert.run(cleanCode, type, val, minAmount, maxUses, expiry, active);
    const newPromo = db.prepare('SELECT * FROM promo_codes WHERE id = ?').get(info.lastInsertRowid);
    
    console.log(`[PROMO] Создан промокод: ${cleanCode}`);
    res.json(newPromo);
  } catch (e) {
    console.error('[PROMO] Ошибка создания промокода:', e);
    res.status(500).json({ error: 'Ошибка сервера при создании промокода' });
  }
});

// 4. Обновление промокода
router.put('/:id', authenticate, checkAdmin, (req, res) => {
  const { 
    code, 
    discount_type, 
    discount_value, 
    min_order_amount, 
    max_uses, 
    expires_at, 
    is_active 
  } = req.body;
  const { id } = req.params;

  if (!code || !discount_value) {
    return res.status(400).json({ error: 'Код и размер скидки обязательны' });
  }

  const cleanCode = code.trim().toUpperCase();
  const type = discount_type === 'fixed' ? 'fixed' : 'percent';
  const val = Number(discount_value);
  const minAmount = Number(min_order_amount) || 0;
  const maxUses = (max_uses === '' || max_uses === undefined || max_uses === null) ? null : Number(max_uses);
  const expiry = expires_at || null;
  const active = (is_active === 1 || is_active === true) ? 1 : 0;

  try {
    // Проверим уникальность кода у других промокодов
    const existing = db.prepare('SELECT id FROM promo_codes WHERE code = ? AND id != ?').get(cleanCode, id);
    if (existing) {
      return res.status(400).json({ error: 'Другой промокод уже использует этот код' });
    }

    const update = db.prepare(`
      UPDATE promo_codes 
      SET code = ?, discount_type = ?, discount_value = ?, min_order_amount = ?, max_uses = ?, expires_at = ?, is_active = ?
      WHERE id = ?
    `);
    
    update.run(cleanCode, type, val, minAmount, maxUses, expiry, active, id);
    const updatedPromo = db.prepare('SELECT * FROM promo_codes WHERE id = ?').get(id);
    
    console.log(`[PROMO] Обновлен промокод #${id}: ${cleanCode}`);
    res.json(updatedPromo);
  } catch (e) {
    console.error('[PROMO] Ошибка обновления промокода:', e);
    res.status(500).json({ error: 'Ошибка сервера при обновлении промокода' });
  }
});

// 5. Удаление промокода
router.delete('/:id', authenticate, checkAdmin, (req, res) => {
  const { id } = req.params;
  try {
    const promo = db.prepare('SELECT code FROM promo_codes WHERE id = ?').get(id);
    if (!promo) {
      return res.status(404).json({ error: 'Промокод не найден' });
    }

    db.prepare('DELETE FROM promo_codes WHERE id = ?').run(id);
    console.log(`[PROMO] Удален промокод #${id}: ${promo.code}`);
    res.json({ message: 'Промокод успешно удален' });
  } catch (e) {
    console.error('[PROMO] Ошибка удаления промокода:', e);
    res.status(500).json({ error: 'Ошибка сервера при удалении промокода' });
  }
});

export default router;
