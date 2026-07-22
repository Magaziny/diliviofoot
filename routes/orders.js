import { Router } from 'express';
import { authenticate } from './auth.js';
import db from '../db.js';
import { sendPushToUser } from './push.js';
import { validatePromoCode } from './promo.js';

const router = Router();

// Создание заказа (публичное)
router.post('/', (req, res) => {
  const { 
    user_id, 
    customer_name, 
    customer_phone, 
    customer_address, 
    items, 
    total_price, 
    gift_applied,
    promo_code 
  } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Корзина пуста' });
  }

  const isGift = (gift_applied === true || gift_applied === 'true') ? 1 : 0;

  // Серверный расчет стоимости для валидации промокода
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const giftDiscount = isGift ? [...items].sort((a, b) => a.price - b.price)[0]?.price || 0 : 0;
  const baseTotal = subtotal - giftDiscount;

  let appliedPromoCode = null;
  let appliedDiscountAmount = 0;

  if (promo_code) {
    const promoResult = validatePromoCode(promo_code, baseTotal);
    if (!promoResult.valid) {
      return res.status(400).json({ error: promoResult.message });
    }
    appliedPromoCode = promoResult.code;
    appliedDiscountAmount = promoResult.discount_amount;
  }

  const insertOrder = db.prepare(
    'INSERT INTO orders (user_id, customer_name, customer_phone, customer_address, total_price, gift_issued, promo_code, discount_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );
  const insertItem = db.prepare(
    'INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES (?, ?, ?, ?, ?)'
  );

  // Атомарная транзакция: заказ создаётся только если все позиции вставлены успешно
  const createOrderTransaction = db.transaction((orderData, orderItems) => {
    const info = insertOrder.run(
      orderData.user_id || null,
      orderData.customer_name,
      orderData.customer_phone,
      orderData.customer_address,
      orderData.total_price,
      orderData.isGift,
      orderData.promo_code,
      orderData.discount_amount
    );
    const orderId = info.lastInsertRowid;

    for (const item of orderItems) {
      const baseProductId = typeof item.id === 'string' && item.id.includes('-')
        ? parseInt(item.id.split('-')[0])
        : parseInt(item.id);
      insertItem.run(orderId, baseProductId, item.name, item.quantity, item.price);
    }

    // Инкрементируем счетчик использования промокода
    if (orderData.promo_code) {
      db.prepare('UPDATE promo_codes SET uses_count = uses_count + 1 WHERE code = ?').run(orderData.promo_code);
    }

    return orderId;
  });

  try {
    const orderId = createOrderTransaction(
      { 
        user_id, 
        customer_name, 
        customer_phone, 
        customer_address, 
        total_price, 
        isGift,
        promo_code: appliedPromoCode,
        discount_amount: appliedDiscountAmount
      },
      items
    );

    // Начисление баллов лояльности: 1 балл за каждые 10 единиц суммы
    let loyaltyPointsAdded = 0;
    if (user_id) {
      const pointsToAdd = Math.floor((total_price || 0) / 10);
      if (pointsToAdd > 0) {
        db.prepare('UPDATE users SET loyalty_points = loyalty_points + ? WHERE id = ?').run(pointsToAdd, user_id);
        db.prepare('UPDATE orders SET points_awarded = ? WHERE id = ?').run(pointsToAdd, orderId);
        loyaltyPointsAdded = pointsToAdd;
        console.log(`[LOYALTY] Пользователю ${user_id} начислено ${pointsToAdd} баллов (заказ #${orderId})`);
      }
      // Обновляем loyalty_points в ответе, чтобы фронтенд мог обновить баланс
      const updatedUser = db.prepare('SELECT loyalty_points FROM users WHERE id = ?').get(user_id);
      return res.json({ id: orderId, message: 'Order created', loyalty_points: updatedUser?.loyalty_points, points_awarded: loyaltyPointsAdded });
    }

    res.json({ id: orderId, message: 'Order created' });
  } catch (e) {
    console.error('[ORDERS] Ошибка создания заказа:', e);
    res.status(500).json({ error: 'Ошибка при создании заказа' });
  }
});

// Заказы текущего клиента
router.get('/my', authenticate, (req, res) => {
  try {
    const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
    const ordersWithItems = orders.map(order => ({
      ...order,
      items: db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id)
    }));
    res.json(ordersWithItems);
  } catch (e) {
    console.error('Error fetching my orders:', e);
    res.status(500).json({ error: 'Ошибка получения списка заказов' });
  }
});

// Все заказы (для оператора / admin)
router.get('/', authenticate, (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'operator')
    return res.status(403).json({ error: 'Access denied' });

  const orders = db.prepare(`
    SELECT o.*, u.loyalty_points, c.username as courier_name
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    LEFT JOIN users c ON o.courier_id = c.id
    ORDER BY o.created_at DESC
  `).all();
  const ordersWithItems = orders.map(order => ({
    ...order,
    items: db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id)
  }));
  res.json(ordersWithItems);
});

// Получение заказов для конкретного курьера
router.get('/courier', authenticate, (req, res) => {
  if (req.user.role !== 'courier')
    return res.status(403).json({ error: 'Access denied' });

  try {
    const orders = db.prepare(`
      SELECT o.*, u.loyalty_points
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.courier_id = ?
      ORDER BY o.created_at DESC
    `).all(req.user.id);

    const ordersWithItems = orders.map(order => ({
      ...order,
      items: db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id)
    }));
    res.json(ordersWithItems);
  } catch (e) {
    console.error('Error fetching courier orders:', e);
    res.status(500).json({ error: 'Ошибка получения списка заказов' });
  }
});

// Назначение курьера заказу (оператор/admin)
router.patch('/:id/assign-courier', authenticate, (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'operator')
    return res.status(403).json({ error: 'Access denied' });
  
  const orderId = parseInt(req.params.id);
  if (isNaN(orderId)) return res.status(400).json({ error: 'Invalid order ID' });

  const { courier_id } = req.body;
  if (!courier_id) return res.status(400).json({ error: 'courier_id is required' });
  const courierId = parseInt(courier_id);
  if (isNaN(courierId)) return res.status(400).json({ error: 'Invalid courier_id' });

  try {
    db.prepare('UPDATE orders SET courier_id = ?, status = ? WHERE id = ?').run(courierId, 'delivery', orderId);
    
    // Получаем user_id заказа для пуш-уведомления
    const order = db.prepare('SELECT user_id FROM orders WHERE id = ?').get(orderId);
    if (order && order.user_id) {
      sendPushToUser(order.user_id, {
        title: 'Курьер назначен! 🚗',
        body: 'Ваш заказ передан курьеру и скоро будет доставлен.',
        url: '/'
      });
    }

    res.json({ message: 'Courier assigned and status updated to delivery' });
  } catch (e) {
    console.error('Assign courier error:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Обновление статуса заказа
router.patch('/:id/status', authenticate, (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'operator' && req.user.role !== 'courier')
    return res.status(403).json({ error: 'Access denied' });
  const { status } = req.body;

  // Курьер может менять статус только на 'done'
  if (req.user.role === 'courier' && status !== 'done') {
    return res.status(403).json({ error: 'Couriers can only mark orders as done' });
  }

  const orderId = parseInt(req.params.id);
  if (isNaN(orderId)) return res.status(400).json({ error: 'Invalid order ID' });

  try {
    db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, orderId);
    
    // Отправляем PUSH-уведомление клиенту
    const order = db.prepare('SELECT user_id FROM orders WHERE id = ?').get(orderId);
    if (order && order.user_id) {
      if (status === 'cooking') {
        sendPushToUser(order.user_id, {
          title: 'Ваша пицца в печи! 🍕',
          body: 'Мы начали готовить ваш заказ. Скоро будет вкусно!',
          url: '/'
        });
      } else if (status === 'delivery') {
        sendPushToUser(order.user_id, {
          title: 'Заказ в пути! 🚗',
          body: 'Курьер уже везет ваш заказ.',
          url: '/'
        });
      } else if (status === 'done') {
        sendPushToUser(order.user_id, {
          title: 'Приятного аппетита! 🍽️',
          body: 'Ваш заказ доставлен. Ждем вас снова!',
          url: '/'
        });
      }
    }

    res.json({ message: 'Status updated' });
  } catch (e) {
    console.error('[ORDERS] Ошибка обновления статуса:', e);
    res.status(500).json({ error: 'Ошибка обновления статуса' });
  }
});

// Выдача подарка оператором
router.post('/:id/claim-gift', authenticate, (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'operator')
    return res.status(403).json({ error: 'Access denied' });

  const orderId = req.params.id;
  const order = db.prepare('SELECT user_id, gift_issued, total_price FROM orders WHERE id = ?').get(orderId);
  if (!order) return res.status(404).json({ error: 'Заказ не найден' });

  if (order.gift_issued === 1 || order.gift_issued === '1')
    return res.status(400).json({ error: 'Подарок для этого заказа уже выдан' });

  const thresholdRow = db.prepare('SELECT value FROM settings WHERE key = ?').get('free_pizza_threshold');
  const threshold = thresholdRow ? parseInt(thresholdRow.value) : 5000;

  if (!order.user_id)
    return res.status(400).json({ error: 'Пользователь не найден (заказ без регистрации)' });

  if (order.total_price < threshold)
    return res.status(400).json({ error: 'Сумма заказа меньше порога для получения подарка' });
  
  db.prepare('UPDATE orders SET gift_issued = 1 WHERE id = ?').run(orderId);
  console.log(`[OPERATOR] Выдан подарок по заказу #${orderId}. Заказ на сумму ${order.total_price}, порог ${threshold}`);
  res.json({ message: 'Gift claimed successfully', gift_issued: 1 });
});

export default router;
