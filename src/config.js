// Адрес API берётся из VITE_API_HOST (задаётся при деплое, напр. на Vercel).
// Если переменная не задана — определяется динамически по хосту браузера
// (для локальной разработки и работы по локальной сети).
const hostname = window.location.hostname;
const isDev = hostname === 'localhost' || hostname.startsWith('192.168.') || hostname.startsWith('10.');

export const API_HOST = import.meta.env.VITE_API_HOST || (isDev ? `http://${hostname}:5000` : '');
export const API_URL = `${API_HOST}/api`;
