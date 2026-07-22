import React from 'react';
import { Edit, Sparkles, Star } from 'lucide-react';

const inputStyle = { width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', boxSizing: 'border-box' };
const labelStyle = { display: 'block', marginBottom: '8px', fontWeight: 600, color: 'rgba(255,255,255,0.9)' };

// Форма добавки (модификатора)
const ModifierForm = ({ isOpen, onClose, editingModifier, formData, onChange, onSubmit }) => {
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
      <div className="glass" style={{ backgroundColor: 'rgba(20,20,25,0.9)', padding: '40px', borderRadius: '32px', width: '100%', maxWidth: '400px', border: '1px solid rgba(255,255,255,0.1)' }}>
        <h2 style={{ marginBottom: '24px', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>{editingModifier ? <><Edit size={24} /> Редактировать</> : <><Sparkles size={24} /> Добавить</>} добавку</h2>
        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Название</label>
            <input type="text" value={formData.name} onChange={e => onChange('name', e.target.value)} style={inputStyle} required />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Цена (m)</label>
            <input type="number" value={formData.price} onChange={e => onChange('price', e.target.value)} style={inputStyle} required />
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

// Форма добавления сотрудника
export const StaffForm = ({ isOpen, onClose, formData, onChange, onSubmit }) => {
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
      <div className="glass" style={{ backgroundColor: 'rgba(20,20,25,0.9)', padding: '40px', borderRadius: '32px', width: '100%', maxWidth: '400px', border: '1px solid rgba(255,255,255,0.1)' }}>
        <h2 style={{ marginBottom: '8px', textAlign: 'center', color: 'white' }}>Новый сотрудник</h2>
        <p style={{ textAlign: 'center', color: '#BBB', marginBottom: '32px', fontSize: '14px' }}>Оператор сможет управлять заказами</p>
        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Логин</label>
            <input type="text" value={formData.username} onChange={e => onChange('username', e.target.value)} style={inputStyle} required placeholder="Напр: ivan_pizza" />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Пароль</label>
            <input type="password" value={formData.password} onChange={e => onChange('password', e.target.value)} style={inputStyle} required placeholder="Минимум 6 символов" />
          </div>
          <div style={{ marginBottom: '32px' }}>
            <label style={labelStyle}>Роль</label>
            <select value={formData.role || 'operator'} onChange={e => onChange('role', e.target.value)} style={{ ...inputStyle, outline: 'none' }}>
              <option value="operator" style={{ color: 'black' }}>Оператор (управление заказами)</option>
              <option value="courier" style={{ color: 'black' }}>Курьер (доставка)</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '14px', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: '12px', fontWeight: 700, border: 'none', cursor: 'pointer' }}>Отмена</button>
            <button type="submit" style={{ flex: 1, padding: '14px', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '12px', fontWeight: 700, border: 'none', cursor: 'pointer' }}>Создать</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Форма редактирования клиента
export const UserEditForm = ({ isOpen, onClose, formData, onChange, onSubmit }) => {
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
      <div className="glass" style={{ backgroundColor: 'rgba(20,20,25,0.9)', padding: '40px', borderRadius: '32px', width: '100%', maxWidth: '450px', border: '1px solid rgba(255,255,255,0.1)' }}>
        <h2 style={{ marginBottom: '8px', textAlign: 'center', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><Edit size={24} /> Редактировать клиента</h2>
        <p style={{ textAlign: 'center', color: '#BBB', marginBottom: '24px', fontSize: '14px' }}>Изменение данных зарегистрированного клиента</p>
        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Имя / Логин</label>
            <input type="text" value={formData.username} onChange={e => onChange('username', e.target.value)} style={inputStyle} required />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Телефон</label>
            <input type="text" value={formData.phone} onChange={e => onChange('phone', e.target.value)} style={inputStyle} required />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Адрес доставки</label>
            <textarea value={formData.address} onChange={e => onChange('address', e.target.value)} style={{ ...inputStyle, height: '80px', resize: 'none' }} />
          </div>
          <div style={{ marginBottom: '28px' }}>
            <label style={labelStyle}>Бонусные баллы (<Star size={14} style={{display: 'inline', verticalAlign: 'middle'}} />)</label>
            <input type="number" value={formData.loyalty_points} onChange={e => onChange('loyalty_points', e.target.value)} style={inputStyle} required />
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

// Форма редактирования hero-баннера
const FOOD_EMOJIS = ['🌿', '🍅', '🌶️', '🧀', '🍄', '🧅', '🧄', '🥓', '🥩', '🍤', '🍍', '🍗', '🐟'];

export const HeroForm = ({ isOpen, onClose, editingHero, formData, onChange, heroImageFile, setHeroImageFile, onSubmit }) => {
  if (!isOpen) return null;
  
  const currentParticles = formData.particles ? formData.particles.split(',').map(e => e.trim()).filter(Boolean) : [];
  
  const toggleEmoji = (emoji) => {
    if (currentParticles.includes(emoji)) {
      onChange('particles', currentParticles.filter(e => e !== emoji).join(', '));
    } else {
      onChange('particles', [...currentParticles, emoji].join(', '));
    }
  };
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      <div className="glass" style={{ backgroundColor: 'rgba(20,20,25,0.9)', width: '100%', maxWidth: '500px', borderRadius: '32px', padding: '40px', position: 'relative', maxHeight: '90vh', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.1)' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '25px', right: '25px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'white' }}>✕</button>
        <h2 style={{ marginBottom: '30px', color: 'white' }}>{editingHero ? 'Редактировать баннер' : 'Добавить баннер'}</h2>
        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Заголовок</label>
            <input type="text" value={formData.title} onChange={e => onChange('title', e.target.value)} style={inputStyle} required placeholder="Пепперони Фреш" />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Подзаголовок</label>
            <input type="text" value={formData.subtitle} onChange={e => onChange('subtitle', e.target.value)} style={inputStyle} placeholder="Описание товара" />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Цена (текст)</label>
            <input type="text" value={formData.price} onChange={e => onChange('price', e.target.value)} style={inputStyle} placeholder="от 499 m" />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Ингредиенты (летающие 3D-частицы)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '12px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
              {FOOD_EMOJIS.map(emoji => {
                const isSelected = currentParticles.includes(emoji);
                return (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => toggleEmoji(emoji)}
                    style={{
                      background: isSelected ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '20px',
                      padding: '8px 12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      opacity: isSelected ? 1 : 0.6,
                      boxShadow: isSelected ? '0 4px 10px rgba(255,0,77,0.3)' : 'none'
                    }}
                  >
                    {emoji}
                  </button>
                );
              })}
            </div>
            {currentParticles.length > 0 && (
               <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--primary)' }}>
                 Выбрано: {currentParticles.join(' ')}
               </div>
            )}
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Время окончания акции (Таймер)</label>
            <input type="datetime-local" value={formData.countdown_to || ''} onChange={e => onChange('countdown_to', e.target.value)} style={inputStyle} />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Изображение</label>
            <input type="file" accept="image/*" onChange={e => setHeroImageFile(e.target.files[0])} style={{ marginBottom: '10px', display: 'block', color: 'white' }} />
            <input type="text" value={formData.image} onChange={e => onChange('image', e.target.value)} style={inputStyle} placeholder="Или URL изображения" />
            {(heroImageFile || formData.image) && (
              <img src={heroImageFile ? URL.createObjectURL(heroImageFile) : formData.image} alt="Превью" style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '12px', marginTop: '10px', border: '1px solid rgba(255,255,255,0.1)' }} />
            )}
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

export default ModifierForm;
