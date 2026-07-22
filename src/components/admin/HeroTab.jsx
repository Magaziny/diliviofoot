import React from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { API_HOST } from '../../config';

const HeroTab = ({ heroSlides, onAdd, onEdit, onDelete }) => (
  <>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
      <h1>Управление баннерами</h1>
      <button
        onClick={onAdd}
        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '12px 24px', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '14px', fontWeight: 700, border: 'none', cursor: 'pointer' }}
      >
        <Plus size={16} /> Добавить баннер
      </button>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
      {heroSlides.map(slide => (
        <div key={slide.id} className="glass" style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ height: '200px', backgroundColor: 'rgba(0,0,0,0.2)', position: 'relative' }}>
            <img
              src={slide.image.startsWith('http') ? slide.image : `${API_HOST}${slide.image}`}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '5px' }}>
              <button
                onClick={() => onEdit(slide)}
                style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => onDelete(slide.id)}
                style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'rgba(255,77,77,0.8)', color: 'white', border: '1px solid rgba(255,77,77,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          <div style={{ padding: '20px' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: 'white' }}>{slide.title}</h3>
            <p style={{ fontSize: '14px', color: '#BBB', margin: '0 0 15px 0', lineHeight: '1.4' }}>{slide.subtitle}</p>
            <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{slide.price}</div>
          </div>
        </div>
      ))}
      {heroSlides.length === 0 && (
        <div className="glass" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '24px', color: '#888', border: '1px solid rgba(255,255,255,0.05)' }}>
          Баннеры пока не добавлены
        </div>
      )}
    </div>
  </>
);

export default HeroTab;
