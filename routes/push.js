import { Router } from 'express';
import webpush from 'web-push';
import { authenticate } from './auth.js';
import db from '../db.js';

const router = Router();

/**
 * VAPID ключи загружаются из .env.
 * Если не заданы — ищем в БД (settings), чтобы не сбрасывать подписки при рестарте.
 * Если и в БД нет — генерируем и сохраняем в БД.
 */
const getOrCreateVapidKeys = () => {
  if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    return {
      publicKey: process.env.VAPID_PUBLIC_KEY,
      privateKey: process.env.VAPID_PRIVATE_KEY
    };
  }

  // Попытка загрузить из БД
  try {
    const pubRow = db.prepare('SELECT value FROM settings WHERE key = ?').get('vapid_public_key');
    const privRow = db.prepare('SELECT value FROM settings WHERE key = ?').get('vapid_private_key');
    if (pubRow && privRow) {
      console.log('[PUSH] VAPID ключи загружены из БД.');
      return { publicKey: pubRow.value, privateKey: privRow.value };
    }
  } catch (e) { /* таблица settings может ещё не существовать */ }

  // Генерируем новые и сохраняем в БД
  const keys = webpush.generateVAPIDKeys();
  console.log('--- СГЕНЕРИРОВАНЫ НОВЫЕ VAPID КЛЮЧИ (добавьте в .env для надёжности) ---');
  console.log('VAPID_PUBLIC_KEY=' + keys.publicKey);
  console.log('VAPID_PRIVATE_KEY=' + keys.privateKey);
  console.log('------------------------------------------------------------------------');

  try {
    const upsert = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    upsert.run('vapid_public_key', keys.publicKey);
    upsert.run('vapid_private_key', keys.privateKey);
    console.log('[PUSH] VAPID ключи сохранены в БД.');
  } catch (e) {
    console.error('[PUSH] Не удалось сохранить VAPID ключи в БД:', e);
  }

  return keys;
};

const vapidKeys = getOrCreateVapidKeys();

webpush.setVapidDetails(
  'mailto:support@expresspizza.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// Возвращает публичный ключ для подписки на фронтенде
router.get('/public-key', (req, res) => {
  res.json({ publicKey: vapidKeys.publicKey });
});

// Сохраняет подписку в профиль авторизованного пользователя
router.post('/subscribe', authenticate, (req, res) => {
  const subscription = req.body;
  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ error: 'Invalid subscription object' });
  }

  try {
    db.prepare('UPDATE users SET push_subscription = ? WHERE id = ?')
      .run(JSON.stringify(subscription), req.user.id);
    res.status(201).json({ message: 'Subscription saved.' });
  } catch (err) {
    console.error('Error saving subscription:', err);
    res.status(500).json({ error: 'Failed to save subscription.' });
  }
});

// Удаление подписки при выходе из аккаунта
router.delete('/unsubscribe', authenticate, (req, res) => {
  try {
    db.prepare('UPDATE users SET push_subscription = NULL WHERE id = ?').run(req.user.id);
    console.log(`[PUSH] Подписка пользователя ${req.user.id} удалена (выход из аккаунта).`);
    res.json({ message: 'Subscription removed.' });
  } catch (err) {
    console.error('Error removing subscription:', err);
    res.status(500).json({ error: 'Failed to remove subscription.' });
  }
});


// Вспомогательная функция для отправки уведомления
export const sendPushToUser = async (userId, payload) => {
  try {
    const user = db.prepare('SELECT push_subscription FROM users WHERE id = ?').get(userId);
    if (user && user.push_subscription) {
      const subscription = JSON.parse(user.push_subscription);
      await webpush.sendNotification(subscription, JSON.stringify(payload));
      console.log(`[PUSH] Уведомление отправлено пользователю ${userId}`);
    } else {
      console.log(`[PUSH] У пользователя ${userId} нет подписки.`);
    }
  } catch (err) {
    console.error(`[PUSH ERROR] Ошибка отправки уведомления пользователю ${userId}:`, err);
    if (err.statusCode === 410) {
      // 410 Gone значит подписка больше не действительна, можно её удалить
      try {
        db.prepare('UPDATE users SET push_subscription = NULL WHERE id = ?').run(userId);
        console.log(`[PUSH] Подписка пользователя ${userId} удалена (истекла).`);
      } catch (dbErr) {
        console.error('Ошибка удаления устаревшей подписки:', dbErr);
      }
    }
  }
};

export default router;
