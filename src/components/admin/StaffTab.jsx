import React from 'react';
import { Plus, User } from 'lucide-react';

const StaffTab = ({ staff, onAdd, onDelete }) => (
  <>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
      <h1>Управление сотрудниками</h1>
      <button
        onClick={onAdd}
        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '12px 24px', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '16px', fontWeight: 700, border: 'none', cursor: 'pointer' }}
      >
        <Plus size={16} /> Добавить сотрудника
      </button>
    </div>
    <div className="glass" style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '24px', overflowX: 'auto', border: '1px solid rgba(255,255,255,0.05)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '400px' }}>
        <thead style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
          <tr>
            <th style={{ padding: '20px', textAlign: 'left' }}>Имя / Логин</th>
            <th style={{ padding: '20px', textAlign: 'left' }}>Роль</th>
            <th style={{ padding: '20px', textAlign: 'left' }}>Действия</th>
          </tr>
        </thead>
        <tbody>
          {staff.map(s => (
            <tr key={s.id} style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <td style={{ padding: '20px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}><User size={14} /> {s.username}</td>
              <td style={{ padding: '20px' }}>
                <span style={{
                  padding: '4px 12px',
                  backgroundColor: s.role === 'admin' ? 'rgba(255,102,0,0.15)' : (s.role === 'courier' ? 'rgba(52, 152, 219, 0.15)' : 'rgba(74, 144, 226, 0.15)'),
                  color: s.role === 'admin' ? '#FF6600' : (s.role === 'courier' ? '#3498db' : '#4A90E2'),
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700
                }}>
                  {s.role === 'admin' ? 'АДМИНИСТРАТОР' : (s.role === 'courier' ? 'КУРЬЕР' : 'ОПЕРАТОР')}
                </span>
              </td>
              <td style={{ padding: '20px' }}>
                {s.role !== 'admin' ? (
                  <button
                    onClick={() => onDelete(s.id)}
                    style={{ color: '#FF4D4D', background: 'rgba(255,77,77,0.1)', padding: '6px 12px', borderRadius: '8px', fontWeight: 700, border: 'none', cursor: 'pointer' }}
                  >
                    Удалить
                  </button>
                ) : (
                  <span style={{ color: '#888', fontSize: '12px' }}>Нельзя удалить</span>
                )}
              </td>
            </tr>
          ))}
          {staff.length === 0 && (
            <tr>
              <td colSpan="3" style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
                Сотрудники пока не добавлены
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </>
);

export default StaffTab;
