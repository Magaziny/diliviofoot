import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, 'database.sqlite'));

// Инициализация таблиц
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    sale_price INTEGER,
    is_available INTEGER DEFAULT 0,
    show_in_stories INTEGER DEFAULT 0,
    has_variants INTEGER DEFAULT 1,
    image TEXT,
    FOREIGN KEY (category) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS modifiers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS product_modifiers (
    product_id INTEGER,
    modifier_id INTEGER,
    PRIMARY KEY (product_id, modifier_id),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (modifier_id) REFERENCES modifiers(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'customer',
    phone TEXT,
    address TEXT
  );

  CREATE TABLE IF NOT EXISTS hero_slides (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    subtitle TEXT,
    price TEXT,
    image TEXT
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS promo_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL DEFAULT 'percent',
    discount_value INTEGER NOT NULL,
    min_order_amount INTEGER DEFAULT 0,
    max_uses INTEGER DEFAULT NULL,
    uses_count INTEGER DEFAULT 0,
    expires_at TEXT DEFAULT NULL,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Инициализация начальных слайдов
const slidesCount = db.prepare('SELECT COUNT(*) as count FROM hero_slides').get().count;
if (slidesCount === 0) {
  db.prepare('INSERT INTO hero_slides (title, subtitle, price, image) VALUES (?, ?, ?, ?)').run(
    'Пепперони Фреш',
    'Классика, которая не стареет. Теперь еще сочнее!',
    'от 499 m',
    'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=800&auto=format&fit=crop'
  );
  db.prepare('INSERT INTO hero_slides (title, subtitle, price, image) VALUES (?, ?, ?, ?)').run(
    'Мясное комбо',
    'Для тех, кто ценит сытость. 4 вида мяса в одной пицце.',
    'от 649 m',
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800&auto=format&fit=crop'
  );
}


// Миграция: Добавление колонки has_variants, если её нет
const tableInfo = db.prepare("PRAGMA table_info(products)").all();
const columnsToAdd = [
  { name: 'has_variants', type: 'INTEGER DEFAULT 1' },
  { name: 'price_s', type: 'INTEGER DEFAULT 0' },
  { name: 'price_m', type: 'INTEGER DEFAULT 0' },
  { name: 'price_l', type: 'INTEGER DEFAULT 0' },
  { name: 'has_s', type: 'INTEGER DEFAULT 0' },
  { name: 'has_m', type: 'INTEGER DEFAULT 0' },
  { name: 'has_l', type: 'INTEGER DEFAULT 0' },
  { name: 'has_traditional', type: 'INTEGER DEFAULT 1' },
  { name: 'has_thin', type: 'INTEGER DEFAULT 1' },
  { name: 'size_s_name', type: 'TEXT DEFAULT "25 см"' },
  { name: 'size_m_name', type: 'TEXT DEFAULT "30 см"' },
  { name: 'size_l_name', type: 'TEXT DEFAULT "35 см"' },
  { name: 'variants_label', type: 'TEXT DEFAULT "Размер"' },
  { name: 'is_popular', type: 'INTEGER DEFAULT 0' },
  { name: 'option_label', type: 'TEXT DEFAULT "Тесто"' },
  { name: 'option_1_name', type: 'TEXT DEFAULT "Традиционное"' },
  { name: 'option_2_name', type: 'TEXT DEFAULT "Тонкое"' },
  { name: 'related_products', type: 'TEXT DEFAULT "[]"' }
];



columnsToAdd.forEach(col => {
  if (!tableInfo.find(c => c.name === col.name)) {
    try {
      db.exec(`ALTER TABLE products ADD COLUMN ${col.name} ${col.type}`);
      console.log(`[DB] Добавлена колонка ${col.name}`);
    } catch (e) {
      console.error(`Migration error (${col.name}):`, e);
    }
  }
});



const usersTableInfo = db.prepare("PRAGMA table_info(users)").all();
if (!usersTableInfo.find(c => c.name === 'loyalty_points')) {
  try {
    db.exec(`ALTER TABLE users ADD COLUMN loyalty_points INTEGER DEFAULT 0`);
    console.log(`[DB] Добавлена колонка loyalty_points в таблицу users`);
  } catch (e) {
    console.error(`Migration error (loyalty_points):`, e);
  }
}

// Таблица заказов (создаётся после продуктов, но до специфичных миграций orders)
db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    customer_name TEXT,
    customer_phone TEXT,
    customer_address TEXT,
    total_price REAL,
    status TEXT DEFAULT 'pending',
    gift_issued INTEGER DEFAULT 0,
    courier_id INTEGER,
    points_awarded INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    product_id INTEGER,
    product_name TEXT,
    quantity INTEGER,
    price REAL,
    FOREIGN KEY(order_id) REFERENCES orders(id)
  );
`);


const ordersTableInfo = db.prepare("PRAGMA table_info(orders)").all();

if (!ordersTableInfo.find(c => c.name === 'gift_issued')) {
  try {
    db.exec(`ALTER TABLE orders ADD COLUMN gift_issued INTEGER DEFAULT 0`);
    console.log(`[DB] Добавлена колонка gift_issued в таблицу orders`);
  } catch (e) {
    console.error(`Migration error (gift_issued):`, e);
  }
}

const heroSlidesTableInfo = db.prepare("PRAGMA table_info(hero_slides)").all();
if (!heroSlidesTableInfo.find(c => c.name === 'particles')) {
  try {
    db.exec(`ALTER TABLE hero_slides ADD COLUMN particles TEXT`);
    console.log(`[DB] Добавлена колонка particles в таблицу hero_slides`);
  } catch (e) {
    console.error(`Migration error (particles):`, e);
  }
}

if (!heroSlidesTableInfo.find(c => c.name === 'countdown_to')) {
  try {
    db.exec(`ALTER TABLE hero_slides ADD COLUMN countdown_to TEXT`);
    console.log(`[DB] Добавлена колонка countdown_to в таблицу hero_slides`);
  } catch (e) {
    console.error(`Migration error (countdown_to):`, e);
  }
}

// We already fetched usersTableInfo above (line 124), but let's refresh it if needed
const usersTableInfoFresh = db.prepare("PRAGMA table_info(users)").all();
if (!usersTableInfoFresh.find(c => c.name === 'push_subscription')) {
  try {
    db.exec(`ALTER TABLE users ADD COLUMN push_subscription TEXT`);
    console.log(`[DB] Добавлена колонка push_subscription в таблицу users`);
  } catch (e) {
    console.error(`Migration error (push_subscription):`, e);
  }
}

if (!ordersTableInfo.find(c => c.name === 'courier_id')) {
  try {
    db.exec(`ALTER TABLE orders ADD COLUMN courier_id INTEGER`);
    console.log(`[DB] Добавлена колонка courier_id в таблицу orders`);
  } catch (e) {
    console.error(`Migration error (courier_id):`, e);
  }
}

if (!ordersTableInfo.find(c => c.name === 'points_awarded')) {
  try {
    db.exec(`ALTER TABLE orders ADD COLUMN points_awarded INTEGER DEFAULT 0`);
    console.log(`[DB] Добавлена колонка points_awarded в таблицу orders`);
  } catch (e) {
    console.error(`Migration error (points_awarded):`, e);
  }
}

if (!ordersTableInfo.find(c => c.name === 'promo_code')) {
  try {
    db.exec(`ALTER TABLE orders ADD COLUMN promo_code TEXT`);
    console.log(`[DB] Добавлена колонка promo_code в таблицу orders`);
  } catch (e) {
    console.error(`Migration error (promo_code):`, e);
  }
}

if (!ordersTableInfo.find(c => c.name === 'discount_amount')) {
  try {
    db.exec(`ALTER TABLE orders ADD COLUMN discount_amount REAL DEFAULT 0`);
    console.log(`[DB] Добавлена колонка discount_amount в таблицу orders`);
  } catch (e) {
    console.error(`Migration error (discount_amount):`, e);
  }
}

// Наполнение начальными данными
const categoriesCount = db.prepare('SELECT count(*) as count FROM categories').get();
if (categoriesCount.count === 0) {
  const insertCategory = db.prepare('INSERT INTO categories (id, name) VALUES (?, ?)');
  const initialCategories = [
    ['pizza', 'Пицца'],
    ['snacks', 'Закуски'],
    ['drinks', 'Напитки'],
    ['desserts', 'Десерты'],
    ['sauces', 'Соусы']
  ];
  initialCategories.forEach(cat => insertCategory.run(cat));
}

const productsCount = db.prepare('SELECT count(*) as count FROM products').get();
if (productsCount.count === 0) {
  const insertProduct = db.prepare('INSERT INTO products (category, name, description, price, image) VALUES (?, ?, ?, ?, ?)');
  insertProduct.run('pizza', 'Пепперони Фреш', 'Классика с пепперони, моцареллой и соусом', 499, 'https://images.unsplash.com/photo-1593504049359-74330189a345?q=80&w=300&auto=format&fit=crop');
}

// Начальные модификаторы
const modifiersCount = db.prepare('SELECT count(*) as count FROM modifiers').get();
if (modifiersCount.count === 0) {
  const insertMod = db.prepare('INSERT INTO modifiers (name, price) VALUES (?, ?)');
  const initialMods = [
    ['Сырный бортик', 150],
    ['Острый халапеньо', 50],
    ['Сыр моцарелла', 70],
    ['Маринованные огурчики', 40],
    ['Бекон', 80]
  ];
  initialMods.forEach(mod => insertMod.run(...mod));
}

// Начальные настройки
const defaultSettings = [
  ['free_pizza_threshold', '5000'],
  ['brand_name', 'Наш Магазин'],
  ['currency_symbol', 'm'],
  ['free_delivery_threshold', '1000'],
  ['delivery_price', '150'],
  ['loyalty_progress_label', 'До бесплатной пиццы:']
];

defaultSettings.forEach(([key, val]) => {
  const exists = db.prepare('SELECT count(*) as count FROM settings WHERE key = ?').get(key).count;
  if (exists === 0) {
    db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run(key, val);
    console.log(`[DB] Добавлена настройка по умолчанию ${key} = ${val}`);
  }
});

export default db;
