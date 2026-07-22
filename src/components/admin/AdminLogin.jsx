import React from 'react';

const AdminLogin = ({ username, password, onUsernameChange, onPasswordChange, onSubmit }) => {
  return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'var(--dark)', position: 'relative', overflow: 'hidden' }}>
      {/* Декоративные блюры */}
      <div style={{ position: 'absolute', top: '10%', left: '10%', width: '400px', height: '400px', background: 'rgba(255,102,0,0.15)', borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: '400px', height: '400px', background: 'rgba(74,144,226,0.1)', borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none' }} />
      
      <form className="glass" onSubmit={onSubmit} style={{ backgroundColor: 'rgba(20,20,25,0.8)', padding: '40px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.1)', width: '90%', maxWidth: '400px', position: 'relative', zIndex: 1 }}>
        <h2 style={{ marginBottom: '24px', textAlign: 'center', color: 'white' }}>Вход в систему</h2>
        <input
          type="text"
          placeholder="Логин"
          value={username}
          onChange={onUsernameChange}
          style={{ width: '100%', padding: '14px', marginBottom: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', boxSizing: 'border-box' }}
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={onPasswordChange}
          style={{ width: '100%', padding: '14px', marginBottom: '24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', boxSizing: 'border-box' }}
        />
        <button
          type="submit"
          style={{ width: '100%', padding: '14px', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '12px', fontWeight: 700, border: 'none', cursor: 'pointer' }}
        >
          Войти
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
