import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, MapPin, Phone, User, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { API_URL } from '../config';

const CourierLogin = ({ loginData, onLoginDataChange, loginError, onSubmit }) => (
  <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'var(--dark)', position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(52, 152, 219, 0.15) 0%, transparent 70%)', top: '-100px', right: '-100px', borderRadius: '50%' }} />
    <div style={{ position: 'absolute', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(46, 204, 113, 0.1) 0%, transparent 70%)', bottom: '-150px', left: '-150px', borderRadius: '50%' }} />

    <form onSubmit={onSubmit} className="glass" style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '40px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', width: '90%', maxWidth: '400px', position: 'relative', zIndex: 1 }}>
      <h2 style={{ marginBottom: '8px', textAlign: 'center', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
        <Truck size={28} /> Приложение курьера
      </h2>
      <p style={{ textAlign: 'center', color: 'var(--gray-text)', marginBottom: '32px', fontSize: '14px' }}>Доставка заказов</p>
      {loginError && <div style={{ color: '#ff6b6b', marginBottom: '16px', textAlign: 'center', fontSize: '13px' }}>{loginError}</div>}
      <input
        type="text" placeholder="Логин" value={loginData.username}
        onChange={e => onLoginDataChange('username', e.target.value)}
        style={{ width: '100%', padding: '14px', marginBottom: '16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', outline: 'none', boxSizing: 'border-box', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white' }}
        required
      />
      <input
        type="password" placeholder="Пароль" value={loginData.password}
        onChange={e => onLoginDataChange('password', e.target.value)}
        style={{ width: '100%', padding: '14px', marginBottom: '24px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', outline: 'none', boxSizing: 'border-box', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white' }}
        required
      />
      <button type="submit" style={{ width: '100%', padding: '16px', background: 'linear-gradient(90deg, #3498db, #2ecc71)', color: 'white', borderRadius: '16px', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
        Войти
      </button>
    </form>
  </div>
);

const CourierCard = ({ order, onMarkAsDone, currencySymbol }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const itemsCount = order.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="glass" style={{
      backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '20px', padding: '20px',
      border: '1px solid rgba(255,255,255,0.05)', marginBottom: '20px',
      transition: 'all 0.3s ease'
    }}>
      {/* Шапка карточки (всегда видна) */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
      >
        <div style={{ flex: 1, overflow: 'hidden', paddingRight: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '16px', fontWeight: 800, color: 'white' }}>Заказ #{order.id}</span>
            <span style={{ padding: '4px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: 800, backgroundColor: order.status === 'delivery' ? 'rgba(155,81,224,0.15)' : 'rgba(39,174,96,0.15)', color: order.status === 'delivery' ? '#D29CFF' : '#2ecc71', textTransform: 'uppercase' }}>
              {order.status === 'delivery' ? 'В пути' : 'Доставлен'}
            </span>
          </div>
          <div style={{ fontSize: '13px', color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            <MapPin size={12} style={{ display: 'inline', marginRight: '4px', position: 'relative', top: '2px' }}/>
            {order.customer_address || 'Адрес не указан'}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary)' }}>{order.total_price} {currencySymbol}</div>
          <div style={{ padding: '4px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '50%', display: 'flex' }}>
            {isExpanded ? <ChevronUp size={20} color="#888" /> : <ChevronDown size={20} color="#888" />}
          </div>
        </div>
      </div>

      {/* Раскрывающееся тело */}
      {isExpanded && (
        <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', animation: 'fadeIn 0.3s ease' }}>
          <div style={{ display: 'grid', gap: '12px', marginBottom: '20px', padding: '16px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'white', fontSize: '14px' }}>
              <User size={16} color="#888" /> {order.customer_name}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'white', fontSize: '14px' }}>
              <Phone size={16} color="#888" /> <a href={`tel:${order.customer_phone}`} style={{ color: '#3498db', textDecoration: 'none' }}>{order.customer_phone}</a>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'white', fontSize: '14px', lineHeight: '1.4' }}>
              <MapPin size={16} color="#888" style={{ flexShrink: 0 }} /> 
              <a href={`https://yandex.ru/maps/?text=${encodeURIComponent(order.customer_address)}`} target="_blank" rel="noreferrer" style={{ color: 'white', textDecoration: 'underline' }}>
                {order.customer_address || <span style={{ color: '#ff6b6b' }}>Не указан</span>}
              </a>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'white', fontSize: '14px' }}>
              <Clock size={16} color="#888" /> {new Date(order.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 700 }}>Состав ({itemsCount}):</div>
            {order.items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--gray-text)', marginBottom: '4px' }}>
                <span><span style={{ color: 'white' }}>{item.product_name}</span> x{item.quantity}</span>
                <span style={{ color: 'white' }}>{item.price * item.quantity} {currencySymbol}</span>
              </div>
            ))}
          </div>

          {order.status === 'delivery' && (
            <button 
              onClick={(e) => { e.stopPropagation(); onMarkAsDone(order.id); }}
              style={{ width: '100%', padding: '16px', borderRadius: '16px', border: 'none', backgroundColor: 'rgba(39, 174, 96, 0.2)', color: '#2ecc71', fontSize: '15px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'background-color 0.2s' }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(39, 174, 96, 0.3)'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = 'rgba(39, 174, 96, 0.2)'}
            >
              <CheckCircle size={20} /> Завершить доставку
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const Courier = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('courierData') || 'null'));
  const [token, setToken] = useState(localStorage.getItem('courierToken'));
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('delivery');
  const [settings, setSettings] = useState({});

  const isLoggedIn = !!token && user?.role === 'courier';

  useEffect(() => {
    fetch(`${API_URL}/settings`)
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (settings.background_url) {
      const bgUrl = settings.background_url.startsWith('http') ? settings.background_url : API_URL.replace('/api', '') + settings.background_url;
      document.body.style.backgroundImage = `url('${bgUrl}')`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundAttachment = 'fixed';
      document.body.style.backgroundPosition = 'center';
    } else {
      document.body.style.backgroundImage = 'none';
    }
  }, [settings.background_url]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchOrders();
      const interval = setInterval(fetchOrders, 5000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, token]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/orders/courier`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
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
      if (data.token && data.user.role === 'courier') {
        localStorage.setItem('courierToken', data.token);
        localStorage.setItem('courierData', JSON.stringify(data.user));
        setToken(data.token); setUser(data.user);
      } else {
        setLoginError('Доступ запрещен или неверные данные');
      }
    } catch { setLoginError('Ошибка входа'); }
  };

  const handleLogout = () => {
    localStorage.removeItem('courierToken');
    localStorage.removeItem('courierData');
    window.location.reload();
  };

  const markAsDone = async (id) => {
    if (!window.confirm('Отметить заказ как доставленный?')) return;
    try {
      const res = await fetch(`${API_URL}/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: 'done' })
      });
      if (res.ok) fetchOrders();
    } catch (e) {
      alert('Ошибка при обновлении статуса');
    }
  };

  if (!isLoggedIn) {
    return (
      <CourierLogin
        loginData={loginData}
        onLoginDataChange={(key, value) => setLoginData(prev => ({ ...prev, [key]: value }))}
        loginError={loginError}
        onSubmit={handleLogin}
      />
    );
  }

  const activeOrders = orders.filter(o => o.status === 'delivery');
  const doneOrders = orders.filter(o => o.status === 'done');
  const displayedOrders = activeTab === 'delivery' ? activeOrders : doneOrders;
  const currencySymbol = settings.currency_symbol || 'm';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'transparent', padding: '20px 10px', fontFamily: 'Montserrat, sans-serif' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={{ fontSize: '24px', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <Truck size={24} /> {user.username}
            </h1>
          </div>
          <button onClick={handleLogout} style={{ background: 'rgba(255,77,77,0.1)', padding: '8px 16px', borderRadius: '12px', color: '#ff6b6b', fontWeight: 700, border: '1px solid rgba(255,77,77,0.2)', cursor: 'pointer' }}>
            Выйти
          </button>
        </header>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button 
            onClick={() => setActiveTab('delivery')}
            style={{ flex: 1, padding: '12px', borderRadius: '16px', border: '1px solid ' + (activeTab === 'delivery' ? 'rgba(155,81,224,0.5)' : 'rgba(255,255,255,0.1)'), backgroundColor: activeTab === 'delivery' ? 'rgba(155,81,224,0.15)' : 'rgba(255,255,255,0.02)', color: activeTab === 'delivery' ? '#D29CFF' : '#888', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
          >
            Активные ({activeOrders.length})
          </button>
          <button 
            onClick={() => setActiveTab('done')}
            style={{ flex: 1, padding: '12px', borderRadius: '16px', border: '1px solid ' + (activeTab === 'done' ? 'rgba(39,174,96,0.5)' : 'rgba(255,255,255,0.1)'), backgroundColor: activeTab === 'done' ? 'rgba(39,174,96,0.15)' : 'rgba(255,255,255,0.02)', color: activeTab === 'done' ? '#2ecc71' : '#888', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
          >
            Завершенные ({doneOrders.length})
          </button>
        </div>

        {loading && orders.length === 0 ? (
          <div style={{ color: 'white', textAlign: 'center', padding: '40px' }}>Загрузка заказов...</div>
        ) : displayedOrders.length === 0 ? (
          <div className="glass" style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <Package size={48} color="#888" style={{ marginBottom: '16px' }} />
            <h3 style={{ color: 'white', margin: 0 }}>Нет заказов</h3>
            <p style={{ color: '#888', fontSize: '14px', marginTop: '8px' }}>В этой вкладке пока пусто.</p>
          </div>
        ) : (
          displayedOrders.map(order => (
            <CourierCard key={order.id} order={order} onMarkAsDone={markAsDone} currencySymbol={currencySymbol} />
          ))
        )}
      </div>
    </div>
  );
};

export default Courier;
