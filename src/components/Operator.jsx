import React, { useState, useEffect, useCallback } from 'react';
import { Package, Clock } from 'lucide-react';
import { API_URL } from '../config';

import OperatorLogin from './operator/OperatorLogin';
import ShiftPanel from './operator/ShiftPanel';
import OrderStatusTabs from './operator/OrderStatusTabs';
import OrderCard from './operator/OrderCard';

const Operator = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('userData') || 'null'));
  const [token, setToken] = useState(localStorage.getItem('userToken') || localStorage.getItem('adminToken'));
  const [orders, setOrders] = useState([]);
  const [couriers, setCouriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastOrderCount, setLastOrderCount] = useState(0);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [settings, setSettings] = useState({});
  const [activeTab, setActiveTab] = useState('all');
  const [expandedOrders, setExpandedOrders] = useState({});
  const [onlyCurrentShift, setOnlyCurrentShift] = useState(true);
  const [filterDate, setFilterDate] = useState('');

  const isLoggedIn = !!token && (user?.role === 'admin' || user?.role === 'operator');

  // Загрузка настроек
  useEffect(() => {
    fetch(`${API_URL}/settings`)
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(err => console.error(err));
  }, []);

  // Установка заднего фона
  useEffect(() => {
    if (settings.background_url) {
      const bgUrl = settings.background_url.startsWith('http') ? settings.background_url : API_URL.replace('/api', '') + settings.background_url;
      document.body.style.backgroundImage = `url('${bgUrl}')`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundAttachment = 'fixed';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundRepeat = 'no-repeat';
    } else {
      document.body.style.backgroundImage = 'none';
    }
  }, [settings.background_url]);

  // Функции опроса объявляются ниже, установка интервала — после них

  const fetchCouriers = useCallback(async () => {
    try {
      const currentToken = localStorage.getItem('userToken') || localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/users/couriers`, { headers: { Authorization: `Bearer ${currentToken}` } });
      if (res.status === 401) {
        localStorage.removeItem('userToken'); localStorage.removeItem('adminToken'); window.location.reload(); return;
      }
      if (res.ok) {
        const data = await res.json();
        setCouriers(data);
      }
    } catch (err) { console.error(err); }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const currentToken = localStorage.getItem('userToken') || localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/orders`, { headers: { Authorization: `Bearer ${currentToken}` } });
      if (res.status === 401) {
        localStorage.removeItem('userToken'); localStorage.removeItem('adminToken'); window.location.reload(); return;
      }
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
        if (data.length > lastOrderCount && lastOrderCount !== 0) playNotificationSound();
        setLastOrderCount(data.length);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [lastOrderCount]);

  // Периодический опрос заказов
  useEffect(() => {
    if (isLoggedIn) {
      fetchOrders();
      fetchCouriers();
      const interval = setInterval(fetchOrders, 3000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, fetchOrders, fetchCouriers]);

  const parseSQLiteDate = (dateStr) => {
    if (!dateStr) return new Date();
    return new Date(dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T') + 'Z');
  };

  const getAutoShiftStartTime = (transitionTimeStr) => {
    const [hours, minutes] = (transitionTimeStr || '08:00').split(':').map(Number);
    const now = new Date();
    const todayTransition = new Date(now);
    todayTransition.setHours(hours, minutes, 0, 0);
    if (now >= todayTransition) return todayTransition;
    const yesterday = new Date(todayTransition);
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday;
  };

  const handleToggleShift = async () => {
    const isOpening = settings.shift_status !== 'open';
    const msg = isOpening
      ? 'Открыть новую рабочую смену? Заказы предыдущих смен будут скрыты в текущем просмотре.'
      : 'Закрыть рабочую смену?';
    if (!window.confirm(msg)) return;

    const currentToken = localStorage.getItem('userToken') || localStorage.getItem('adminToken');
    const updatedSettings = {
      ...settings,
      shift_status: isOpening ? 'open' : 'closed',
      shift_start_time: isOpening ? new Date().toISOString() : '',
      shift_opened_by: isOpening ? (user?.username || 'Оператор') : ''
    };

    try {
      const res = await fetch(`${API_URL}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentToken}` },
        body: JSON.stringify(updatedSettings)
      });
      if (res.ok) { setSettings(updatedSettings); alert(isOpening ? 'Рабочая смена успешно открыта!' : 'Рабочая смена успешно закрыта!'); }
      else alert('Ошибка при изменении статуса смены');
    } catch (e) { console.error(e); alert('Ошибка соединения'); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      const data = await res.json();
      if (data.token && (data.user.role === 'admin' || data.user.role === 'operator')) {
        localStorage.setItem('userToken', data.token);
        localStorage.setItem('userData', JSON.stringify(data.user));
        setToken(data.token); setUser(data.user);
      } else setLoginError('Доступ запрещен или неверные данные');
    } catch { setLoginError('Ошибка входа'); }
  };

  const playNotificationSound = () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.play().catch(() => {});
  };

  const updateStatus = async (id, newStatus) => {
    const currentToken = localStorage.getItem('userToken') || localStorage.getItem('adminToken');
    const res = await fetch(`${API_URL}/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentToken}` },
      body: JSON.stringify({ status: newStatus })
    });
    if (res.ok) fetchOrders();
  };

  const handleClaimGift = async (orderId) => {
    if (!window.confirm('Выдать подарок клиенту и списать баллы лояльности?')) return;
    const currentToken = localStorage.getItem('userToken') || localStorage.getItem('adminToken');
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/claim-gift`, {
        method: 'POST', headers: { Authorization: `Bearer ${currentToken}` }
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, gift_issued: 1 } : o));
      } else {
        const err = await res.json();
        alert(err.error || 'Ошибка при выдаче подарка');
      }
    } catch { alert('Ошибка соединения'); }
  };

  // --- Render login form ---
  if (!isLoggedIn) {
    return (
      <OperatorLogin
        loginData={loginData}
        onLoginDataChange={(key, value) => setLoginData(prev => ({ ...prev, [key]: value }))}
        loginError={loginError}
        onSubmit={handleLogin}
      />
    );
  }

  // --- Фильтрация заказов ---
  const activeShiftStart = settings.shift_transition_type === 'auto'
    ? getAutoShiftStartTime(settings.auto_shift_time)
    : (settings.shift_status === 'open' && settings.shift_start_time ? parseSQLiteDate(settings.shift_start_time) : null);

  const shiftFilteredOrders = (onlyCurrentShift && activeShiftStart)
    ? orders.filter(o => parseSQLiteDate(o.created_at) >= activeShiftStart)
    : orders;

  const dateFilteredOrders = filterDate
    ? shiftFilteredOrders.filter(o => o.created_at && o.created_at.startsWith(filterDate))
    : shiftFilteredOrders;

  const filteredOrders = activeTab === 'all'
    ? dateFilteredOrders
    : dateFilteredOrders.filter(o => o.status === activeTab);

  return (
    <div style={{ padding: '40px', backgroundColor: 'transparent', color: 'white', minHeight: '100vh', fontFamily: 'Montserrat, sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Заголовок */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '32px', marginBottom: '8px', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>Панель оператора | {settings.brand_name || 'Магазин'} <Package size={32} /></h1>
            <p style={{ color: 'var(--gray-text)' }}>Заказы обновляются каждые 3 секунды</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {settings.active_shift_operator && (
              <div style={{ backgroundColor: 'rgba(74, 144, 226, 0.15)', padding: '12px 20px', borderRadius: '16px', border: '1px solid rgba(74,144,226,0.3)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ display: 'flex' }}><Clock size={16} /></span>
                <span style={{ fontWeight: 700, color: '#7DBBFF', fontSize: '13px' }}>Смена: {settings.active_shift_operator}</span>
              </div>
            )}
            <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '12px 20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#2ecc71', animation: 'pulse 2s infinite' }} />
              <span style={{ fontWeight: 600, color: 'white' }}>Онлайн: {user?.username}</span>
            </div>
            <button onClick={() => { localStorage.removeItem('userToken'); localStorage.removeItem('adminToken'); window.location.reload(); }} style={{ background: 'rgba(255,77,77,0.1)', padding: '12px 20px', borderRadius: '16px', color: '#ff6b6b', fontWeight: 700, border: '1px solid rgba(255,77,77,0.2)', cursor: 'pointer' }}>
              Выйти
            </button>
          </div>
        </header>

        {/* Панель смены */}
        <ShiftPanel
          settings={settings}
          activeShiftStart={activeShiftStart}
          onlyCurrentShift={onlyCurrentShift}
          setOnlyCurrentShift={setOnlyCurrentShift}
          filterDate={filterDate}
          setFilterDate={setFilterDate}
          onToggleShift={handleToggleShift}
        />

        {/* Вкладки статусов */}
        <OrderStatusTabs activeTab={activeTab} onTabChange={setActiveTab} orders={orders} />

        {/* Список заказов */}
        {loading && orders.length === 0 ? (
          <div>Загрузка заказов...</div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {filteredOrders.length === 0 ? (
              <div className="glass" style={{ textAlign: 'center', padding: '100px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center', color: '#888' }}><Package size={64} /></div>
                <h3 style={{ color: 'white' }}>Нет заказов в этом статусе</h3>
                <p style={{ color: 'var(--gray-text)' }}>Заказов со статусом «{activeTab}» пока нет.</p>
              </div>
            ) : (
              filteredOrders.map(order => {
                const isExpanded = expandedOrders[order.id] === undefined
                  ? order.status === 'pending'
                  : !!expandedOrders[order.id];
                return (
                  <OrderCard
                    key={order.id}
                    order={order}
                    isExpanded={isExpanded}
                    onToggleExpand={() => setExpandedOrders(prev => ({ ...prev, [order.id]: !isExpanded }))}
                    onUpdateStatus={updateStatus}
                    onClaimGift={handleClaimGift}
                    settings={settings}
                    couriers={couriers}
                    onAssignCourier={async (orderId, courierId) => {
                      const currentToken = localStorage.getItem('userToken') || localStorage.getItem('adminToken');
                      const res = await fetch(`${API_URL}/orders/${orderId}/assign-courier`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentToken}` },
                        body: JSON.stringify({ courier_id: courierId })
                      });
                      if (res.ok) fetchOrders();
                      else alert('Ошибка при назначении курьера');
                    }}
                  />
                );
              })
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.2); opacity: 0.7; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes newOrder { 0% { box-shadow: 0 0 0 0 rgba(255, 102, 0, 0.4); } 70% { box-shadow: 0 0 0 20px rgba(255, 102, 0, 0); } 100% { box-shadow: 0 0 0 0 rgba(255, 102, 0, 0); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        .order-card { transition: all 0.3s ease; }
        .order-card:hover { transform: translateY(-4px); box-shadow: 0 12px 30px rgba(0,0,0,0.08); }
      `}</style>
    </div>
  );
};

export default Operator;
