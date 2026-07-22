import React, { useState } from 'react';
import { User, Phone, MapPin, Clock, Package, Truck, Gift, ChefHat, XCircle, CheckCircle, Printer } from 'lucide-react';

const STATUS_INFO = {
  all:       { label: 'Все',       color: 'white',    bg: 'rgba(255,255,255,0.1)' },
  pending:   { label: 'Новый',     color: '#FFA366', bg: 'rgba(255,102,0,0.15)' },
  cooking:   { label: 'Готовится', color: '#7DBBFF', bg: 'rgba(74,144,226,0.15)' },
  delivery:  { label: 'В пути',    color: '#D29CFF', bg: 'rgba(155,81,224,0.15)' },
  done:      { label: 'Выполнен',  color: '#2ecc71', bg: 'rgba(39,174,96,0.15)' },
  cancelled: { label: 'Отменен',   color: '#ff6b6b', bg: 'rgba(235,87,87,0.15)' },
};

const getStatusInfo = (status) => STATUS_INFO[status] || { label: status, color: 'white', bg: 'rgba(255,255,255,0.1)' };

const btnBase = (bg, color, shadow, border) => ({
  width: '100%', padding: '10px 14px', borderRadius: '12px', fontSize: '13px', fontWeight: 700,
  border: border || 'none', backgroundColor: bg, color, cursor: 'pointer', transition: 'all 0.2s ease',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
  boxShadow: shadow || 'none'
});

const OrderCard = ({ order, isExpanded, onToggleExpand, onUpdateStatus, onClaimGift, settings, couriers = [], onAssignCourier }) => {
  const [selectedCourier, setSelectedCourier] = useState('');
  const itemsCount = order.items.reduce((sum, i) => sum + i.quantity, 0);
  const { color } = getStatusInfo(order.status);
  const currencySymbol = settings.currency_symbol || 'm';
  const freeDeliveryThreshold = Number(settings.free_delivery_threshold) || 1000;
  const freePizzaThreshold = Number(settings.free_pizza_threshold) || 5000;
  const orderSubtotal = order.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const remainingForFreeDelivery = Math.max(0, freeDeliveryThreshold - orderSubtotal);
  const currentOrderPoints = orderSubtotal;
  const remainingForFreeGift = Math.max(0, freePizzaThreshold - currentOrderPoints);
  const giftIssued = order.gift_issued === 1 || order.gift_issued === '1';

  return (
    <div className="glass order-card" style={{
      backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '20px', boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
      borderLeft: `6px solid ${color}`,
      borderTop: '1px solid rgba(255,255,255,0.05)',
      borderRight: '1px solid rgba(255,255,255,0.05)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      animation: order.status === 'pending' ? 'newOrder 2s infinite' : 'none',
      overflow: 'hidden', display: 'flex', flexDirection: 'column'
    }}>
      {/* Заголовок */}
      <div
        onClick={onToggleExpand}
        style={{
          padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          cursor: 'pointer', userSelect: 'none',
          backgroundColor: isExpanded ? 'rgba(255,255,255,0.05)' : 'transparent',
          transition: 'background-color 0.2s ease',
          borderBottom: isExpanded ? '1px solid rgba(255,255,255,0.05)' : 'none'
        }}
        onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
        onMouseOut={e => { if (!isExpanded) e.currentTarget.style.backgroundColor = 'transparent'; }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--gray-text)' }}>Заказ #{order.id}</span>
          <span style={{ fontSize: '15px', fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: '4px' }}><User size={15} /> {order.customer_name}</span>
          <span style={{ fontSize: '13px', color: '#CCC', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={13} /> {order.customer_phone}</span>
          <span style={{ fontSize: '13px', color: 'white', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={13} /> {order.customer_address || <span style={{ color: '#ff6b6b', fontStyle: 'italic' }}>Адрес не указан</span>}</span>
          <span style={{ fontSize: '12px', color: 'var(--gray-text)', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {new Date(order.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
          <span style={{ fontSize: '12px', color: 'white', backgroundColor: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '8px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Package size={12} /> {itemsCount} {itemsCount === 1 ? 'товар' : itemsCount > 1 && itemsCount < 5 ? 'товара' : 'товаров'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--primary)' }}>{order.total_price} {currencySymbol}</span>
          <span style={{ padding: '6px 12px', borderRadius: '10px', fontSize: '11px', fontWeight: 800, backgroundColor: getStatusInfo(order.status).bg, color: getStatusInfo(order.status).color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {getStatusInfo(order.status).label}
          </span>
          <span style={{ fontSize: '16px', color: '#888', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', display: 'inline-block' }}>▼</span>
        </div>
      </div>

      {/* Развёрнутый контент */}
      {isExpanded && (
        <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: '1.2fr 1.6fr 1.2fr', gap: '20px', alignItems: 'start', animation: 'slideDown 0.2s ease-out' }}>
          {/* Клиент + прогресс */}
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'white', marginBottom: '8px' }}>
              <span style={{ color: 'var(--gray-text)' }}>Адрес доставки:</span><br />
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={13} /> {order.customer_address || <span style={{ color: '#ff6b6b', fontStyle: 'italic' }}>Адрес не указан</span>}</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--gray-text)' }}>
              Полная дата: {new Date(order.created_at).toLocaleString('ru-RU')}
            </div>

            {/* Прогресс доставки и подарка */}
            <div style={{ marginTop: '10px', padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Доставка */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 700, marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <span style={{ color: '#AAA', display: 'flex', alignItems: 'center', gap: '4px' }}><Truck size={12} /> Доставка</span>
                  {remainingForFreeDelivery > 0
                    ? <span style={{ color: '#FFA366' }}>Еще {remainingForFreeDelivery} {currencySymbol}</span>
                    : <span style={{ color: '#2ecc71' }}>Бесплатно!</span>}
                </div>
                <div style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min((orderSubtotal / freeDeliveryThreshold) * 100, 100)}%`, backgroundColor: remainingForFreeDelivery > 0 ? '#FFA366' : '#2ecc71', borderRadius: '2px', transition: 'width 0.5s ease' }} />
                </div>
              </div>

              {/* Подарок */}
              {order.user_id && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 700, marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <span style={{ color: '#AAA', display: 'flex', alignItems: 'center', gap: '4px' }}><Gift size={12} /> Подарок</span>
                    {giftIssued ? <span style={{ color: '#2ecc71', display: 'flex', alignItems: 'center', gap: '4px' }}>Выдан! <Gift size={12} /></span>
                      : remainingForFreeGift > 0 ? <span style={{ color: '#D29CFF' }}>Еще {remainingForFreeGift} {currencySymbol}</span>
                      : <span style={{ color: '#2ecc71' }}>Готов к выдаче!</span>}
                  </div>
                  {giftIssued ? (
                    <div style={{ height: '20px', background: 'linear-gradient(90deg, #2ecc71, #27AE60)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '2px' }}>
                      Выдан клиенту
                    </div>
                  ) : (
                    <>
                      <div style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden', marginBottom: remainingForFreeGift === 0 ? '4px' : '0' }}>
                        <div style={{ height: '100%', width: `${Math.min((currentOrderPoints / freePizzaThreshold) * 100, 100)}%`, backgroundColor: remainingForFreeGift > 0 ? '#D29CFF' : '#2ecc71', borderRadius: '2px', transition: 'width 0.5s ease' }} />
                      </div>
                      {remainingForFreeGift === 0 && (
                        <button onClick={() => onClaimGift(order.id, order.user_id)} style={{ ...btnBase('rgba(39, 174, 96, 0.2)', '#2ecc71', 'none', '1px solid rgba(39,174,96,0.3)'), fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '2px' }}
                          onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(39, 174, 96, 0.3)'}
                          onMouseOut={e => e.currentTarget.style.backgroundColor = 'rgba(39, 174, 96, 0.2)'}
                        >
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Gift size={12} /> Выдать подарок</span>
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Состав заказа */}
          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.05)', borderRight: '1px solid rgba(255,255,255,0.05)', padding: '0 16px' }}>
            <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '8px', color: 'white' }}>Состав заказа:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {order.items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--gray-text)' }}>
                  <span><span style={{ color: 'white' }}>{item.product_name}</span> x{item.quantity}</span>
                  <span style={{ fontWeight: 600, color: 'white' }}>{item.price * item.quantity} {currencySymbol}</span>
                </div>
              ))}
              <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '15px', color: 'white' }}>
                <span>Итого:</span>
                <span style={{ color: 'var(--primary)' }}>{order.total_price} {currencySymbol}</span>
              </div>
            </div>
          </div>

          {/* Действия */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '160px' }}>
            <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--gray-text)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Действия с заказом:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {order.status === 'pending' && (
                <>
                  <button onClick={() => onUpdateStatus(order.id, 'cooking')} style={btnBase('rgba(74, 144, 226, 0.15)', '#7DBBFF', 'none', '1px solid rgba(74,144,226,0.3)')}
                    onMouseOver={e => { e.currentTarget.style.backgroundColor = 'rgba(74, 144, 226, 0.25)'; }}
                    onMouseOut={e => { e.currentTarget.style.backgroundColor = 'rgba(74, 144, 226, 0.15)'; }}>
                    <span><ChefHat size={14} /></span><span>Начать готовку</span>
                  </button>
                  <button onClick={() => onUpdateStatus(order.id, 'cancelled')} style={btnBase('rgba(235, 87, 87, 0.1)', '#ff6b6b', 'none', '1px solid rgba(235, 87, 87, 0.2)')}
                    onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(235, 87, 87, 0.2)'}
                    onMouseOut={e => e.currentTarget.style.backgroundColor = 'rgba(235, 87, 87, 0.1)'}>
                    <span><XCircle size={14} /></span><span>Отменить заказ</span>
                  </button>
                </>
              )}
              {order.status === 'cooking' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <select 
                    value={selectedCourier} 
                    onChange={e => setSelectedCourier(e.target.value)} 
                    style={{ width: '100%', padding: '8px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', outline: 'none', fontSize: '12px' }}
                  >
                    <option value="" style={{ color: 'black' }}>-- Выберите курьера --</option>
                    {couriers.map(c => (
                      <option key={c.id} value={c.id} style={{ color: 'black' }}>{c.username}</option>
                    ))}
                  </select>
                  <button 
                    disabled={!selectedCourier}
                    onClick={() => onAssignCourier(order.id, selectedCourier)} 
                    style={{ ...btnBase('rgba(155, 81, 224, 0.15)', '#D29CFF', 'none', '1px solid rgba(155,81,224,0.3)'), opacity: selectedCourier ? 1 : 0.5, cursor: selectedCourier ? 'pointer' : 'not-allowed' }}
                    onMouseOver={e => { if (selectedCourier) e.currentTarget.style.backgroundColor = 'rgba(155, 81, 224, 0.25)'; }}
                    onMouseOut={e => { if (selectedCourier) e.currentTarget.style.backgroundColor = 'rgba(155, 81, 224, 0.15)'; }}
                  >
                    <span><Truck size={14} /></span><span>Выдать курьеру</span>
                  </button>
                </div>
              )}
              {order.status === 'delivery' && (
                <>
                  <div style={{ padding: '8px', fontSize: '11px', color: '#D29CFF', textAlign: 'center', backgroundColor: 'rgba(155,81,224,0.1)', borderRadius: '10px' }}>
                    Курьер: {order.courier_name || `ID: ${order.courier_id}`}
                  </div>
                  <button onClick={() => onUpdateStatus(order.id, 'done')} style={btnBase('rgba(39, 174, 96, 0.15)', '#2ecc71', 'none', '1px solid rgba(39,174,96,0.3)')}
                    onMouseOver={e => { e.currentTarget.style.backgroundColor = 'rgba(39, 174, 96, 0.25)'; }}
                    onMouseOut={e => { e.currentTarget.style.backgroundColor = 'rgba(39, 174, 96, 0.15)'; }}>
                    <span><CheckCircle size={14} /></span><span>Доставлен</span>
                  </button>
                </>
              )}
              {order.status === 'done' && (
                <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: 'rgba(39, 174, 96, 0.1)', color: '#2ecc71', fontWeight: 700, fontSize: '12px', textAlign: 'center', border: '1px solid rgba(39, 174, 96, 0.2)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}><CheckCircle size={14} /> Заказ выполнен</span>
                </div>
              )}
              {order.status === 'cancelled' && (
                <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: 'rgba(235, 87, 87, 0.1)', color: '#ff6b6b', fontWeight: 700, fontSize: '12px', textAlign: 'center', border: '1px solid rgba(235, 87, 87, 0.2)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}><XCircle size={14} /> Заказ отменен</span>
                </div>
              )}
            </div>
            <button onClick={() => window.print()} style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', fontWeight: 700, border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', marginTop: '6px', fontSize: '11px', transition: 'background-color 0.2s ease' }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}>
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}><Printer size={12} /> Печать чека</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderCard;
