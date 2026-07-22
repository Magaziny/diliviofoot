import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import Admin from './components/Admin'
import Operator from './components/Operator'
import Courier from './components/Courier'
import './index.css'

// Функция для перехода в полноэкранный режим
const enableFullscreen = () => {
  const elem = document.documentElement;
  if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(err => console.log(err));
    } else if (elem.webkitRequestFullscreen) { /* Safari */
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE11 */
      elem.msRequestFullscreen();
    }
  }
};

// Автоматический переход в полноэкранный режим при первом взаимодействии (аналог F11)
document.addEventListener('click', enableFullscreen);
document.addEventListener('touchend', enableFullscreen);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/operator" element={<Operator />} />
        <Route path="/courier" element={<Courier />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
