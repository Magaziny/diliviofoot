import React from 'react';
import { Star, Edit } from 'lucide-react';

const UsersTab = ({ users, onEdit }) => (
  <>
    <h1>Зарегистрированные клиенты</h1>
    <div className="glass" style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '24px', overflowX: 'auto', border: '1px solid rgba(255,255,255,0.05)', marginTop: '40px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
        <thead style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
          <tr>
            <th style={{ padding: '20px', textAlign: 'left' }}>Имя</th>
            <th style={{ padding: '20px', textAlign: 'left' }}>Телефон</th>
            <th style={{ padding: '20px', textAlign: 'left' }}>Адрес</th>
            <th style={{ padding: '20px', textAlign: 'left' }}>Бонусы</th>
            <th style={{ padding: '20px', textAlign: 'left' }}>Действия</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <td style={{ padding: '20px', fontWeight: 600 }}>{u.username}</td>
              <td style={{ padding: '20px' }}>{u.phone}</td>
              <td style={{ padding: '20px' }}>{u.address || <span style={{ color: '#888', fontStyle: 'italic' }}>Не указан</span>}</td>
              <td style={{ padding: '20px', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Star size={14} fill="currentColor" /> {u.loyalty_points || 0}
              </td>
              <td style={{ padding: '20px' }}>
                <button
                  onClick={() => onEdit(u)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: 'rgba(74, 144, 226, 0.15)',
                    color: '#4A90E2',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '13px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={e => { e.currentTarget.style.backgroundColor = 'rgba(74, 144, 226, 0.25)'; }}
                  onMouseOut={e => { e.currentTarget.style.backgroundColor = 'rgba(74, 144, 226, 0.15)'; }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}><Edit size={13} /> Ред.</span>
                </button>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
                Зарегистрированных клиентов пока нет
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </>
);

export default UsersTab;
