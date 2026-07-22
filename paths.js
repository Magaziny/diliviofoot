import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// DATA_DIR указывает на постоянное хранилище (например, примонтированный volume
// на Railway/Render). Если не задан — используется папка проекта, как раньше.
export const DATA_DIR = process.env.DATA_DIR || __dirname;
export const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
export const DB_PATH = path.join(DATA_DIR, 'database.sqlite');
