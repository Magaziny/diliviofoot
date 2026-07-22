import React, { useState, useEffect } from 'react';
import { Pizza, Sparkles, ChefHat, Users, Image as ImageIcon, Settings, LogOut, Ticket } from 'lucide-react';

const TABS = [
  { key: 'menu',      label: <span style={{display:'flex', alignItems:'center', gap:'8px'}}><Pizza size={18} /> Управление меню</span> },
  { key: 'modifiers', label: <span style={{display:'flex', alignItems:'center', gap:'8px'}}><Sparkles size={18} /> Добавки</span> },
  { key: 'staff',     label: <span style={{display:'flex', alignItems:'center', gap:'8px'}}><ChefHat size={18} /> Сотрудники</span> },
  { key: 'users',     label: <span style={{display:'flex', alignItems:'center', gap:'8px'}}><Users size={18} /> Клиенты</span> },
  { key: 'hero',      label: <span style={{display:'flex', alignItems:'center', gap:'8px'}}><ImageIcon size={18} /> Баннеры</span> },
  { key: 'promo',     label: <span style={{display:'flex', alignItems:'center', gap:'8px'}}><Ticket size={18} /> Промокоды</span> },
  { key: 'settings',  label: <span style={{display:'flex', alignItems:'center', gap:'8px'}}><Settings size={18} /> Настройки</span> },
];

const AdminSidebar = ({ currentTab, onTabChange, onLogout, brandName }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isMobile) {
    return (
      <div className="glass" style={{
        position: 'sticky', top: 0, zIndex: 100, width: '100%',
        padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '12px',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '18px', margin: 0, color: 'white' }}>
            <span style={{ color: 'var(--primary)' }}>{(brandName || 'EXPRESS').toUpperCase()}</span> ADMIN
          </h2>
          <button onClick={onLogout} style={{ color: '#FF4D4D', background: 'none', border: 'none', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <LogOut size={14} /> Выйти
          </button>
        </div>
        <div className="hide-scrollbar" style={{ display: 'flex', overflowX: 'auto', gap: '8px', paddingBottom: '4px' }}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              style={{
                flexShrink: 0,
                padding: '8px 16px',
                borderRadius: '12px',
                background: currentTab === tab.key ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                color: 'white',
                fontWeight: 700,
                border: currentTab === tab.key ? 'none' : '1px solid rgba(255,255,255,0.1)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass" style={{
      width: '260px',
      color: 'white',
      padding: '30px',
      position: 'sticky',
      top: 0,
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid rgba(255,255,255,0.1)',
      backgroundColor: 'rgba(20, 20, 25, 0.7)'
    }}>
      <h2 style={{ fontSize: '22px', marginBottom: '40px', letterSpacing: '-0.5px' }}>
        <span style={{ color: 'var(--primary)' }}>{(brandName || 'EXPRESS').toUpperCase()}</span> ADMIN
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            style={{
              textAlign: 'left',
              padding: '14px 18px',
              borderRadius: '14px',
              background: currentTab === tab.key ? 'var(--primary)' : 'transparent',
              color: 'white',
              fontWeight: currentTab === tab.key ? 800 : 600,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: currentTab === tab.key ? '0 10px 20px rgba(255,102,0,0.3)' : 'none'
            }}
            onMouseOver={e => { if (currentTab !== tab.key) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
            onMouseOut={e => { if (currentTab !== tab.key) e.currentTarget.style.background = 'transparent' }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <button
        onClick={onLogout}
        style={{ color: '#FF4D4D', background: 'rgba(255,77,77,0.1)', padding: '14px', borderRadius: '14px', textAlign: 'center', fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all 0.2s ease' }}
        onMouseOver={e => e.currentTarget.style.background = 'rgba(255,77,77,0.2)'}
        onMouseOut={e => e.currentTarget.style.background = 'rgba(255,77,77,0.1)'}
      >
        <span style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'}}><LogOut size={16} /> Выйти из системы</span>
      </button>
    </div>
  );
};

export default AdminSidebar;
