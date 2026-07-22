import React from 'react';
import { API_URL, API_HOST } from '../../config';

const inputStyle = { width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', boxSizing: 'border-box' };
const labelStyle = { display: 'block', marginBottom: '8px', fontWeight: 600, color: 'rgba(255,255,255,0.9)' };

const SettingsTab = ({
  generalSettings,
  onGeneralChange,
  onGeneralSubmit,
  settingsData,
  onSettingsDataChange,
  onAdminProfileSubmit,
  settingsMessage,
  staff,
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%', maxWidth: '600px' }}>

    {/* Глобальные настройки */}
    <div className="glass" style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '40px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)' }}>
      <h2 style={{ marginBottom: '24px' }}>Глобальные параметры бренда и доставки</h2>
      <form onSubmit={onGeneralSubmit}>

        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Название бренда</label>
          <input type="text" value={generalSettings.brand_name || ''} onChange={e => onGeneralChange('brand_name', e.target.value)} style={inputStyle} required />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Логотип</label>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            {generalSettings.logo_url && (
              <img src={generalSettings.logo_url.startsWith('http') ? generalSettings.logo_url : `${API_HOST}${generalSettings.logo_url}`} alt="Logo" style={{ height: '50px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', objectFit: 'contain', backgroundColor: 'rgba(255,255,255,0.1)' }} />
            )}
            <input 
              type="file" 
              accept="image/*" 
              onChange={async (e) => {
                if (e.target.files && e.target.files[0]) {
                  const formData = new FormData();
                  formData.append('logo', e.target.files[0]);
                  try {
                    // API_URL in admin is usually on the same host, but we can rely on relative /api/settings/logo
                    const res = await fetch(`${API_URL}/settings/logo`, {
                      method: 'POST',
                      headers: {
                        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                      },
                      body: formData
                    });
                    if (res.ok) {
                      const data = await res.json();
                      onGeneralChange('logo_url', data.logo_url);
                    } else {
                      alert('Ошибка загрузки логотипа');
                    }
                  } catch(err) {
                    alert('Ошибка соединения при загрузке');
                  }
                }
              }} 
            />
          </div>
          <p style={{ fontSize: '12px', color: '#888', marginTop: '6px' }}>Выберите файл с устройства. Он будет загружен на сервер и сразу заменен.</p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Базовый размер логотипа (высота, px)</label>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <input 
              type="range" 
              min="20" 
              max="150" 
              value={generalSettings.logo_size || 40} 
              onChange={e => onGeneralChange('logo_size', parseInt(e.target.value) || 40)} 
              style={{ flex: 1, accentColor: 'var(--primary)' }} 
            />
            <span style={{ fontWeight: 600, width: '40px', textAlign: 'right' }}>{generalSettings.logo_size || 40}</span>
          </div>
          <p style={{ fontSize: '12px', color: '#888', marginTop: '6px' }}>Размер для компьютеров. На телефонах он будет немного уменьшаться автоматически.</p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Фон приложения</label>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            {generalSettings.background_url && (
              <img src={generalSettings.background_url.startsWith('http') ? generalSettings.background_url : `${API_HOST}${generalSettings.background_url}`} alt="Background" style={{ height: '50px', width: '80px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', objectFit: 'cover', backgroundColor: 'rgba(255,255,255,0.1)' }} />
            )}
            <input 
              type="file" 
              accept="image/*" 
              onChange={async (e) => {
                if (e.target.files && e.target.files[0]) {
                  const formData = new FormData();
                  formData.append('background', e.target.files[0]);
                  try {
                    const res = await fetch(`${API_URL}/settings/background`, {
                      method: 'POST',
                      headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
                      body: formData
                    });
                    if (res.ok) {
                      const data = await res.json();
                      onGeneralChange('background_url', data.background_url);
                    } else {
                      alert('Ошибка загрузки фона');
                    }
                  } catch(err) {
                    alert('Ошибка соединения при загрузке');
                  }
                }
              }} 
            />
            {generalSettings.background_url && (
              <button type="button" onClick={() => onGeneralChange('background_url', '')} style={{ padding: '8px 12px', background: 'rgba(255,77,77,0.1)', color: '#ff6b6b', border: '1px solid rgba(255,77,77,0.3)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Удалить фон</button>
            )}
          </div>
          <p style={{ fontSize: '12px', color: '#888', marginTop: '6px' }}>Загрузите изображение для заднего фона всего приложения.</p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Символ валюты</label>
          <input type="text" value={generalSettings.currency_symbol || ''} onChange={e => onGeneralChange('currency_symbol', e.target.value)} style={inputStyle} required />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Порог бесплатной доставки</label>
          <input type="number" value={generalSettings.free_delivery_threshold || 0} onChange={e => onGeneralChange('free_delivery_threshold', parseInt(e.target.value) || 0)} style={inputStyle} required />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Стоимость доставки</label>
          <input type="number" value={generalSettings.delivery_price || 0} onChange={e => onGeneralChange('delivery_price', parseInt(e.target.value) || 0)} style={inputStyle} required />
        </div>

        <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '16px', color: 'white' }}>Цвет шапки (Navbar)</h3>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label style={labelStyle}>Цвет</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="color" 
                  value={generalSettings.navbar_color || '#181A20'} 
                  onChange={e => onGeneralChange('navbar_color', e.target.value)} 
                  style={{ width: '50px', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer', background: 'none' }} 
                />
                <button type="button" onClick={() => { onGeneralChange('navbar_color', ''); onGeneralChange('navbar_opacity', ''); }} style={{ padding: '0 12px', background: 'rgba(255,77,77,0.1)', color: '#ff6b6b', border: '1px solid rgba(255,77,77,0.3)', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>Сбросить</button>
              </div>
            </div>
            <div style={{ flex: 2, minWidth: '200px' }}>
              <label style={labelStyle}>Прозрачность (для эффекта стекла)</label>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={generalSettings.navbar_opacity !== undefined ? generalSettings.navbar_opacity : 70} 
                  onChange={e => onGeneralChange('navbar_opacity', parseInt(e.target.value))} 
                  style={{ flex: 1, accentColor: 'var(--primary)' }} 
                />
                <span style={{ fontWeight: 600, width: '40px', textAlign: 'right' }}>{generalSettings.navbar_opacity !== undefined ? generalSettings.navbar_opacity : 70}%</span>
              </div>
            </div>
          </div>
          <p style={{ fontSize: '12px', color: '#888', marginTop: '12px' }}>Оставьте настройки по умолчанию или нажмите "Сбросить", чтобы цвета подстраивались под светлую/темную темы автоматически.</p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Текст шкалы лояльности</label>
          <input type="text" value={generalSettings.loyalty_progress_label || ''} onChange={e => onGeneralChange('loyalty_progress_label', e.target.value)} style={inputStyle} required />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={labelStyle}>Порог баллов для бесплатного подарка</label>
          <input type="number" value={generalSettings.free_pizza_threshold || 0} onChange={e => onGeneralChange('free_pizza_threshold', parseInt(e.target.value) || 0)} style={inputStyle} required />
          <p style={{ fontSize: '12px', color: '#888', marginTop: '6px' }}>Сумма покупок, после которой клиент получает бесплатный подарок.</p>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={labelStyle}>Назначение смены (Оператор на смене)</label>
          <select
            value={generalSettings.active_shift_operator || ''}
            onChange={e => onGeneralChange('active_shift_operator', e.target.value)}
            style={{ ...inputStyle, outline: 'none' }}
          >
            <option value="" style={{ color: 'black' }}>— Смена не назначена —</option>
            {staff.map(member => (
              <option key={member.id} value={member.username} style={{ color: 'black' }}>
                {member.username} ({member.role === 'admin' ? 'Администратор' : 'Оператор'})
              </option>
            ))}
          </select>
          <p style={{ fontSize: '12px', color: '#888', marginTop: '6px' }}>Выберите сотрудника, который в данный момент находится на смене.</p>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={labelStyle}>Режим перехода рабочих смен</label>
          <select
            value={generalSettings.shift_transition_type || 'manual'}
            onChange={e => onGeneralChange('shift_transition_type', e.target.value)}
            style={{ ...inputStyle, outline: 'none' }}
          >
            <option value="manual" style={{ color: 'black' }}>Вручную (оператор открывает и закрывает смену)</option>
            <option value="auto" style={{ color: 'black' }}>Автоматически (по времени суток)</option>
          </select>
          <p style={{ fontSize: '12px', color: '#888', marginTop: '6px' }}>Выберите, как сменяются рабочие сутки операторов.</p>
        </div>

        {generalSettings.shift_transition_type === 'auto' && (
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Время автоматического перехода смены</label>
            <input type="time" value={generalSettings.auto_shift_time || '08:00'} onChange={e => onGeneralChange('auto_shift_time', e.target.value)} style={{ ...inputStyle, outline: 'none' }} required />
            <p style={{ fontSize: '12px', color: '#888', marginTop: '6px' }}>
              Например, 08:00. Раз в сутки в это время смена будет переходить автоматически.
            </p>
          </div>
        )}

        <button type="submit" style={{ width: '100%', padding: '14px', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '12px', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
          Сохранить настройки
        </button>
      </form>
    </div>

    {/* Профиль администратора */}
    <div className="glass" style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '40px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)' }}>
      <h2 style={{ marginBottom: '24px' }}>Профиль администратора</h2>
      <form onSubmit={onAdminProfileSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Логин</label>
          <input type="text" value={settingsData.username} onChange={e => onSettingsDataChange('username', e.target.value)} style={inputStyle} />
        </div>
        <div style={{ marginBottom: '24px' }}>
          <label style={labelStyle}>Новый пароль</label>
          <input type="password" value={settingsData.newPassword} onChange={e => onSettingsDataChange('newPassword', e.target.value)} style={inputStyle} placeholder="Введите новый пароль" />
        </div>
        <button type="submit" style={{ width: '100%', padding: '14px', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '12px', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
          Обновить профиль
        </button>
      </form>
    </div>

    {settingsMessage && (
      <div style={{ padding: '16px', backgroundColor: 'rgba(39, 174, 96, 0.2)', color: '#2ecc71', borderRadius: '16px', textAlign: 'center', fontWeight: 700, border: '1px solid rgba(39, 174, 96, 0.3)' }}>
        {settingsMessage}
      </div>
    )}
  </div>
);

export default SettingsTab;
