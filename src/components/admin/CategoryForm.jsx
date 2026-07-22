import React from 'react';

const inputStyle = { width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', boxSizing: 'border-box' };
const labelStyle = { display: 'block', marginBottom: '8px', fontWeight: 600, color: 'rgba(255,255,255,0.9)' };

const CategoryForm = ({ isOpen, onClose, editingCategory, formData, onChange, onSubmit }) => {
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
      <div className="glass" style={{ backgroundColor: 'rgba(20,20,25,0.9)', padding: '40px', borderRadius: '32px', width: '100%', maxWidth: '450px', border: '1px solid rgba(255,255,255,0.1)' }}>
        <h2 style={{ marginBottom: '24px', color: 'white' }}>{editingCategory ? '📝 Редактировать' : '📁 Добавить'} категорию</h2>
        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>ID (латиницей, например: pizza)</label>
            <input
              type="text"
              value={formData.id}
              onChange={e => onChange('id', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
              style={inputStyle}
              required
              placeholder="slug"
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Название</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => onChange('name', e.target.value)}
              style={inputStyle}
              required
              placeholder="Название категории"
            />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '14px', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: '12px', fontWeight: 700, border: 'none', cursor: 'pointer' }}>Отмена</button>
            <button type="submit" style={{ flex: 1, padding: '14px', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '12px', fontWeight: 700, border: 'none', cursor: 'pointer' }}>Сохранить</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryForm;
