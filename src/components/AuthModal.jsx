import React, { useState } from 'react';
import { API_URL as BASE_API_URL } from '../config';

const API_URL = `${BASE_API_URL}/auth`;

const AuthModal = ({ isOpen, onClose, onLogin }) => {
  const [step, setStep] = useState('phone'); // phone, login, register
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    phone: '+993',
    address: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const res = await fetch(`${API_URL}/check-phone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone })
      });
      
      if (!res.ok) throw new Error('Ошибка сервера');
      const data = await res.json();
      
      if (data.exists) {
        setStep('login');
      } else {
        setStep('register');
      }
    } catch (err) {
      setError('Ошибка соединения или сервера');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const endpoint = step === 'register' ? 'register' : 'login';
    
    try {
      const res = await fetch(`${API_URL}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok && res.status !== 401 && res.status !== 400) throw new Error('Ошибка сервера');
      const data = await res.json();
      
      if (data.token) {
        localStorage.setItem('userToken', data.token);
        localStorage.setItem('userData', JSON.stringify(data.user));
        onLogin(data.user);
        onClose();
        // Reset modal state for next time
        setStep('phone');
        setFormData({ username: '', password: '', phone: '', address: '' });
      } else {
        setError(data.error || 'Ошибка авторизации');
      }
    } catch (err) {
      setError('Ошибка соединения');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 4000,
      backdropFilter: 'blur(10px)', display: 'flex',
      justifyContent: 'center', alignItems: 'center',
    }} onClick={onClose}>
      <div className="glass" style={{
        padding: '40px',
        borderRadius: '32px',
        width: '400px',
        maxWidth: '90vw',
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        position: 'relative'
      }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', fontSize: '24px', background: 'none', color: 'var(--gray-text)' }}>×</button>
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>Вход на сайт</h2>
          <p style={{ color: 'var(--gray-text)', fontSize: '14px' }}>
            {step === 'phone' && 'Введите номер телефона для входа'}
            {step === 'login' && 'С возвращением! Введите пароль'}
            {step === 'register' && 'Похоже, вы у нас впервые! Давайте познакомимся'}
          </p>
        </div>

        {error && <div style={{ color: '#FF4D4D', fontSize: '13px', textAlign: 'center', backgroundColor: 'rgba(255, 77, 77, 0.1)', padding: '10px', borderRadius: '12px', marginBottom: '16px' }}>{error}</div>}

        {step === 'phone' && (
          <form onSubmit={handlePhoneSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700 }}>Номер телефона</label>
              <input 
                type="tel" 
                placeholder="+993 6X XX-XX-XX"
                value={formData.phone}
                onChange={e => {
                  const val = e.target.value;
                  if (val.startsWith('+993') || val === '+99' || val === '+9' || val === '+') {
                    setFormData({...formData, phone: val});
                  }
                }}
                style={{ padding: '14px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--white)', outline: 'none', fontSize: '16px' }}
                required 
              />
            </div>
            <button type="submit" disabled={loading} style={{
              background: 'var(--primary-gradient)', color: 'var(--white)', padding: '16px',
              borderRadius: '16px', fontWeight: 700, fontSize: '16px', marginTop: '10px', border: 'none', boxShadow: '0 10px 20px rgba(255, 0, 77, 0.3)'
            }}>
              {loading ? 'Проверка...' : 'Далее'}
            </button>
          </form>
        )}

        {(step === 'login' || step === 'register') && (
          <form onSubmit={handleFinalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {step === 'register' && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700 }}>Как вас зовут?</label>
                  <input 
                    type="text" 
                    placeholder="Иван"
                    value={formData.username}
                    onChange={e => setFormData({...formData, username: e.target.value})}
                    style={{ padding: '14px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--white)', outline: 'none' }}
                    required 
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700 }}>Адрес доставки</label>
                  <input 
                    type="text" 
                    placeholder="Улица, дом, квартира"
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                    style={{ padding: '14px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--white)', outline: 'none' }}
                    required 
                  />
                </div>
              </>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700 }}>Придумайте пароль</label>
              <input 
                type="password" 
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                style={{ padding: '14px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--white)', outline: 'none' }}
                required 
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button type="button" onClick={() => setStep('phone')} style={{
                flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', color: 'var(--white)', border: 'none', padding: '16px', borderRadius: '16px', fontWeight: 700
              }}>Назад</button>
              <button type="submit" disabled={loading} style={{
                flex: 2, background: 'var(--primary-gradient)', color: 'var(--white)', border: 'none', padding: '16px', borderRadius: '16px', fontWeight: 700, boxShadow: '0 10px 20px rgba(255, 0, 77, 0.3)'
              }}>
                {loading ? 'Секунду...' : (step === 'register' ? 'Готово!' : 'Войти')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
