import React, { useState, useEffect } from 'react';
import { Ticket, Plus, Trash2, Edit, Calendar, X, HelpCircle } from 'lucide-react';
import { API_URL } from '../../config';

const PromoTab = () => {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percent',
    discount_value: '',
    min_order_amount: '0',
    max_uses: '',
    expires_at: '',
    is_active: true
  });

  const token = () => localStorage.getItem('adminToken');

  const fetchPromos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/promo`, {
        headers: { Authorization: `Bearer ${token()}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPromos(data);
      } else {
        setError('Не удалось загрузить список промокодов');
      }
    } catch (err) {
      setError('Ошибка подключения к серверу');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  const handleOpenCreate = () => {
    setEditingPromo(null);
    setFormData({
      code: '',
      discount_type: 'percent',
      discount_value: '',
      min_order_amount: '0',
      max_uses: '',
      expires_at: '',
      is_active: true
    });
    setError('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (promo) => {
    setEditingPromo(promo);
    // Приводим дату к формату YYYY-MM-DD для input type="date"
    let formattedDate = '';
    if (promo.expires_at) {
      formattedDate = promo.expires_at.split('T')[0];
    }
    
    setFormData({
      code: promo.code,
      discount_type: promo.discount_type,
      discount_value: String(promo.discount_value),
      min_order_amount: String(promo.min_order_amount),
      max_uses: promo.max_uses !== null ? String(promo.max_uses) : '',
      expires_at: formattedDate,
      is_active: promo.is_active === 1
    });
    setError('');
    setIsFormOpen(true);
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Вы действительно хотите удалить промокод "${code}"?`)) return;
    try {
      const res = await fetch(`${API_URL}/promo/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token()}` }
      });
      if (res.ok) {
        fetchPromos();
      } else {
        alert('Ошибка при удалении промокода');
      }
    } catch (err) {
      alert('Ошибка соединения с сервером');
    }
  };

  const handleToggleActive = async (promo) => {
    const nextStatus = promo.is_active === 1 ? 0 : 1;
    try {
      const res = await fetch(`${API_URL}/promo/${promo.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token()}`
        },
        body: JSON.stringify({
          ...promo,
          is_active: nextStatus
        })
      });
      if (res.ok) {
        fetchPromos();
      } else {
        alert('Не удалось изменить статус промокода');
      }
    } catch (err) {
      alert('Ошибка соединения с сервером');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.code.trim()) {
      setError('Укажите код промокода');
      return;
    }
    if (!formData.discount_value || Number(formData.discount_value) <= 0) {
      setError('Значение скидки должно быть больше 0');
      return;
    }
    if (formData.discount_type === 'percent' && Number(formData.discount_value) > 100) {
      setError('Скидка в процентах не может превышать 100%');
      return;
    }

    const payload = {
      code: formData.code.trim().toUpperCase(),
      discount_type: formData.discount_type,
      discount_value: Number(formData.discount_value),
      min_order_amount: Number(formData.min_order_amount) || 0,
      max_uses: formData.max_uses.trim() ? Number(formData.max_uses) : null,
      expires_at: formData.expires_at || null,
      is_active: formData.is_active ? 1 : 0
    };

    const url = editingPromo ? `${API_URL}/promo/${editingPromo.id}` : `${API_URL}/promo`;
    const method = editingPromo ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token()}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        setIsFormOpen(false);
        fetchPromos();
      } else {
        setError(data.error || 'Ошибка при сохранении промокода');
      }
    } catch (err) {
      setError('Ошибка соединения с сервером');
    }
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
        <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px', fontSize: '28px' }}>
          <Ticket size={28} style={{ color: 'var(--primary)' }} /> Управление промокодами
        </h1>
        <button
          onClick={handleOpenCreate}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            backgroundColor: 'var(--primary)',
            color: 'white',
            borderRadius: '16px',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 8px 20px rgba(255, 102, 0, 0.25)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Plus size={18} /> Создать промокод
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-text)' }}>Загрузка промокодов...</div>
      ) : (
        <div className="glass" style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '24px', overflowX: 'auto', border: '1px solid rgba(255,255,255,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px', color: 'white' }}>
            <thead style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
              <tr>
                <th style={{ padding: '20px', textAlign: 'left', fontWeight: 700 }}>Код</th>
                <th style={{ padding: '20px', textAlign: 'left', fontWeight: 700 }}>Тип скидки</th>
                <th style={{ padding: '20px', textAlign: 'left', fontWeight: 700 }}>Размер</th>
                <th style={{ padding: '20px', textAlign: 'left', fontWeight: 700 }}>Мин. заказ</th>
                <th style={{ padding: '20px', textAlign: 'left', fontWeight: 700 }}>Использования</th>
                <th style={{ padding: '20px', textAlign: 'left', fontWeight: 700 }}>Истекает</th>
                <th style={{ padding: '20px', textAlign: 'left', fontWeight: 700 }}>Статус</th>
                <th style={{ padding: '20px', textAlign: 'right', fontWeight: 700 }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {promos.map(promo => {
                const isExpired = promo.expires_at && new Date() > new Date(promo.expires_at);
                const isLimitReached = promo.max_uses !== null && promo.uses_count >= promo.max_uses;
                const statusColor = (promo.is_active === 1 && !isExpired && !isLimitReached) ? '#27AE60' : '#FF4D4D';
                let statusLabel = 'Активен';
                if (promo.is_active !== 1) statusLabel = 'Приостановлен';
                else if (isExpired) statusLabel = 'Истек срок';
                else if (isLimitReached) statusLabel = 'Использован';

                return (
                  <tr key={promo.id} style={{ borderTop: '1px solid rgba(255,255,255,0.07)', transition: 'background 0.2s' }} className="table-row-hover">
                    <td style={{ padding: '20px', fontWeight: 800, fontFamily: 'monospace', fontSize: '16px', letterSpacing: '0.5px' }}>
                      {promo.code}
                    </td>
                    <td style={{ padding: '20px' }}>
                      {promo.discount_type === 'percent' ? 'Процент (%)' : 'Фиксированная'}
                    </td>
                    <td style={{ padding: '20px', fontWeight: 700, color: 'var(--primary)' }}>
                      {promo.discount_value} {promo.discount_type === 'percent' ? '%' : 'm'}
                    </td>
                    <td style={{ padding: '20px' }}>
                      {promo.min_order_amount} m
                    </td>
                    <td style={{ padding: '20px' }}>
                      <span style={{ fontWeight: 600 }}>{promo.uses_count}</span>
                      <span style={{ color: 'rgba(255,255,255,0.4)' }}>
                        {' '}/ {promo.max_uses !== null ? promo.max_uses : '∞'}
                      </span>
                    </td>
                    <td style={{ padding: '20px', color: isExpired ? '#FF4D4D' : 'inherit' }}>
                      {promo.expires_at ? new Date(promo.expires_at).toLocaleDateString('ru-RU') : 'Бессрочно'}
                    </td>
                    <td style={{ padding: '20px' }}>
                      <button
                        onClick={() => handleToggleActive(promo)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: statusColor,
                          fontWeight: 700,
                          fontSize: '13px',
                          padding: '4px 8px',
                          borderRadius: '8px',
                          backgroundColor: `${statusColor}1A`
                        }}
                      >
                        <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: statusColor }} />
                        {statusLabel}
                      </button>
                    </td>
                    <td style={{ padding: '20px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleOpenEdit(promo)}
                          style={{
                            color: '#4A90E2',
                            background: 'rgba(74, 144, 226, 0.12)',
                            padding: '8px 14px',
                            borderRadius: '10px',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(74, 144, 226, 0.2)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'rgba(74, 144, 226, 0.12)'}
                        >
                          <Edit size={14} /> Ред.
                        </button>
                        <button
                          onClick={() => handleDelete(promo.id, promo.code)}
                          style={{
                            color: '#FF4D4D',
                            background: 'rgba(255, 77, 77, 0.12)',
                            padding: '8px 14px',
                            borderRadius: '10px',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 77, 77, 0.2)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 77, 77, 0.12)'}
                        >
                          <Trash2 size={14} /> Удалить
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {promos.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ padding: '60px', textAlign: 'center', color: 'var(--gray-text)' }}>
                    Промокодов пока не создано. Нажмите «Создать промокод», чтобы добавить первый.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Модальное окно формы (создание / редактирование) */}
      {isFormOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 3000,
          backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center',
          animation: 'fadeIn 0.2s ease'
        }}>
          <div className="glass" style={{
            width: '90%', maxWidth: '520px', padding: '30px', borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.1)', color: 'white', position: 'relative',
            backgroundColor: 'rgba(20, 20, 25, 0.85)', boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
          }}>
            <button
              onClick={() => setIsFormOpen(false)}
              style={{
                position: 'absolute', top: '24px', right: '24px',
                background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
                cursor: 'pointer', fontSize: '20px'
              }}
            >
              <X size={20} />
            </button>

            <h2 style={{ fontSize: '22px', marginBottom: '24px', fontWeight: 800 }}>
              {editingPromo ? `Редактирование промокода` : 'Создание нового промокода'}
            </h2>

            {error && (
              <div style={{ backgroundColor: 'rgba(255,77,77,0.1)', color: '#FF4D4D', padding: '14px', borderRadius: '14px', marginBottom: '20px', fontSize: '14px', fontWeight: 600, border: '1px solid rgba(255,77,77,0.2)' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'rgba(255,255,255,0.7)' }}>
                  Код промокода *
                </label>
                <input
                  type="text"
                  placeholder="Например, SALE20"
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  required
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: '12px',
                    border: '1.5px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)',
                    color: 'white', fontSize: '14px', textTransform: 'uppercase', outline: 'none', boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'rgba(255,255,255,0.7)' }}>
                    Тип скидки
                  </label>
                  <select
                    value={formData.discount_type}
                    onChange={e => setFormData({ ...formData, discount_type: e.target.value })}
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: '12px',
                      border: '1.5px solid rgba(255,255,255,0.1)', background: 'rgba(20, 20, 25, 1)',
                      color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box', height: '45px'
                    }}
                  >
                    <option value="percent">Процент (%)</option>
                    <option value="fixed">Фиксированная (валюта)</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'rgba(255,255,255,0.7)' }}>
                    Скидка *
                  </label>
                  <input
                    type="number"
                    placeholder={formData.discount_type === 'percent' ? 'Например, 15' : 'Например, 300'}
                    value={formData.discount_value}
                    onChange={e => setFormData({ ...formData, discount_value: e.target.value })}
                    required
                    min="1"
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: '12px',
                      border: '1.5px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)',
                      color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'rgba(255,255,255,0.7)' }}>
                    Мин. сумма заказа (m)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formData.min_order_amount}
                    onChange={e => setFormData({ ...formData, min_order_amount: e.target.value })}
                    min="0"
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: '12px',
                      border: '1.5px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)',
                      color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'rgba(255,255,255,0.7)' }}>
                    Лимит использований
                  </label>
                  <input
                    type="number"
                    placeholder="Безлимитно"
                    value={formData.max_uses}
                    onChange={e => setFormData({ ...formData, max_uses: e.target.value })}
                    min="1"
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: '12px',
                      border: '1.5px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)',
                      color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'rgba(255,255,255,0.7)' }}>
                  Истекает в (дата)
                </label>
                <input
                  type="date"
                  value={formData.expires_at}
                  onChange={e => setFormData({ ...formData, expires_at: e.target.value })}
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: '12px',
                    border: '1.5px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)',
                    color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box', height: '45px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                />
                <label htmlFor="is_active" style={{ fontSize: '14px', fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}>
                  Промокод активен (доступен для использования)
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  style={{
                    flex: 1, padding: '14px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.15)',
                    background: 'none', color: 'white', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1, padding: '14px', borderRadius: '14px', border: 'none',
                    background: 'var(--primary-gradient)', color: 'white', fontWeight: 700,
                    cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 8px 20px rgba(255,102,0,0.2)'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default PromoTab;
