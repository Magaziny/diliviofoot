import React from 'react';

const ModifiersTab = ({ modifiers, onAdd, onEdit, onDelete }) => (
  <>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
      <h1>Управление добавками</h1>
      <button
        onClick={onAdd}
        style={{ padding: '12px 24px', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '16px', fontWeight: 700, border: 'none', cursor: 'pointer' }}
      >
        + Добавить добавку
      </button>
    </div>
    <div className="glass" style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '24px', overflowX: 'auto', border: '1px solid rgba(255,255,255,0.05)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '400px' }}>
        <thead style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
          <tr>
            <th style={{ padding: '20px', textAlign: 'left' }}>Название</th>
            <th style={{ padding: '20px', textAlign: 'left' }}>Цена</th>
            <th style={{ padding: '20px', textAlign: 'left' }}>Действия</th>
          </tr>
        </thead>
        <tbody>
          {modifiers.map(m => (
            <tr key={m.id} style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <td style={{ padding: '20px', fontWeight: 600 }}>{m.name}</td>
              <td style={{ padding: '20px' }}>{m.price} m</td>
              <td style={{ padding: '20px' }}>
                <button
                  onClick={() => onEdit(m)}
                  style={{ color: '#4A90E2', background: 'rgba(74, 144, 226, 0.15)', padding: '6px 12px', borderRadius: '8px', marginRight: '10px', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                >
                  Ред.
                </button>
                <button
                  onClick={() => onDelete(m.id)}
                  style={{ color: '#FF4D4D', background: 'rgba(255, 77, 77, 0.15)', padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                >
                  Удалить
                </button>
              </td>
            </tr>
          ))}
          {modifiers.length === 0 && (
            <tr>
              <td colSpan="3" style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
                Добавки пока не созданы
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </>
);

export default ModifiersTab;
