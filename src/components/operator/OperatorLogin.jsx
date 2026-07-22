import React from 'react';

const OperatorLogin = ({ loginData, onLoginDataChange, loginError, onSubmit }) => (
  <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'var(--dark)', position: 'relative', overflow: 'hidden' }}>
    {/* Decorative background blobs */}
    <div style={{ position: 'absolute', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(255,0,77,0.15) 0%, transparent 70%)', top: '-100px', right: '-100px', borderRadius: '50%' }} />
    <div style={{ position: 'absolute', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(255,122,0,0.1) 0%, transparent 70%)', bottom: '-150px', left: '-150px', borderRadius: '50%' }} />

    <form onSubmit={onSubmit} className="glass" style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '40px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', width: '400px', position: 'relative', zIndex: 1 }}>
      <h2 style={{ marginBottom: '8px', textAlign: 'center', color: 'white' }}>Вход для оператора</h2>
      <p style={{ textAlign: 'center', color: 'var(--gray-text)', marginBottom: '32px', fontSize: '14px' }}>Управляйте заказами в реальном времени</p>
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
      <button type="submit" style={{ width: '100%', padding: '16px', background: 'var(--primary-gradient)', color: 'white', borderRadius: '16px', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
        Войти в систему
      </button>
    </form>
  </div>
);

export default OperatorLogin;
