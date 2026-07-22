import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { UPLOADS_DIR } from './paths.js';

// Роуты
import authRouter from './routes/auth.js';
import usersRouter from './routes/users.js';
import productsRouter from './routes/products.js';
import categoriesRouter from './routes/categories.js';
import modifiersRouter from './routes/modifiers.js';
import ordersRouter from './routes/orders.js';
import heroRouter from './routes/hero.js';
import settingsRouter from './routes/settings.js';
import pushRouter from './routes/push.js';
import promoRouter from './routes/promo.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors({
  origin: function (origin, callback) {
    // Разрешаем любые запросы с локальной сети и localhost
    callback(null, true);
  },
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(UPLOADS_DIR));

// Гарантируем существование папки uploads
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Кастомный логгер запросов
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const color = status >= 400 ? '\x1b[31m' : '\x1b[32m';
    console.log(`[API] ${req.method} ${req.url} - ${color}${status}\x1b[0m (${duration}ms)`);
  });
  next();
});

// --- Подключение роутеров ---
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/modifiers', modifiersRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/hero-slides', heroRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/push', pushRouter);
app.use('/api/promo', promoRouter);

app.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`));

// SPA fallback: отдавать index.html для не-API маршрутов (при продакшен-режиме)
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api/')) {
      res.sendFile(path.join(distPath, 'index.html'));
    } else {
      next();
    }
  });
}
