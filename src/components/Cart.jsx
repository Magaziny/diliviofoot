import React, { useState, useEffect } from 'react';
import { Package, Truck, Gift, X, Minus, Plus, Trash2, MapPin } from 'lucide-react';

import { API_URL, API_HOST } from '../config';

const Cart = ({ isOpen, onClose, items, updateQuantity, removeItem, onAddToCart, user, onAuthOpen, clearCart, settings = {}, onUserUpdate, onCheckoutSuccess }) => {
  const [isMobile, setIsMobile] = useState(() => 
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );

  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [giftApplied, setGiftApplied] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');

  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setDeliveryAddress(user.address || '');
    }
  }, [user]);

  const currencySymbol = settings.currency_symbol || 'm';
  const freeDeliveryThreshold = Number(settings.free_delivery_threshold) || 1000;
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const loyaltyThreshold = Number(settings.free_pizza_threshold) || 5000;
  const hasGiftAvailable = total >= loyaltyThreshold;

  useEffect(() => {
    if (!hasGiftAvailable) {
      setGiftApplied(false);
    }
  }, [hasGiftAvailable]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    
    // Fetch recommendations (drinks, snacks, etc.)
    fetch(`${API_URL}/products`)
      .then(res => res.json())
      .then(data => {
        let relatedIds = new Set();
        items.forEach(item => {
          if (item.related_products) {
             try {
                let rels = typeof item.related_products === 'string' ? JSON.parse(item.related_products) : item.related_products;
                if (Array.isArray(rels)) {
                  rels.forEach(r => {
                    if (typeof r === 'object' && r.id) relatedIds.add(Number(r.id));
                    else if (r) relatedIds.add(Number(r));
                  });
                }
             } catch (e) {}
          }
        });

        const inCart = (productId) => items.some(item => item.id === productId || String(item.id).startsWith(`${productId}-`));

        let recs = [];
        if (relatedIds.size > 0) {
          recs = data.filter(p => relatedIds.has(Number(p.id)) && !inCart(p.id));
        } else {
          // Fallback to popular if no related products defined
          recs = data.filter(p => (p.is_popular === 1 || p.is_popular === true) && !inCart(p.id));
        }

        setRecommendations(recs.map(p => ({
          ...p,
          image: p.image.startsWith('http') ? p.image : `${API_HOST}${p.image}`
        })).slice(0, 8));
      });

    return () => window.removeEventListener('resize', handleResize);
  }, [items]);

  // Находим самый дешевый товар в корзине для применения в качестве подарка
  const giftItem = giftApplied && items.length > 0 && hasGiftAvailable
    ? [...items].sort((a, b) => a.price - b.price)[0]
    : null;

  const giftDiscount = giftItem ? giftItem.price : 0;
  const finalTotal = Math.max(0, total - giftDiscount);
  const finalTotalWithPromo = Math.max(0, finalTotal - (appliedPromo ? appliedPromo.discount_amount : 0));

  // Автоматический пересчет промокода при изменении корзины
  useEffect(() => {
    if (appliedPromo && isOpen) {
      fetch(`${API_URL}/promo/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: appliedPromo.code, total: finalTotal })
      })
        .then(res => res.json())
        .then(data => {
          if (data.valid) {
            setAppliedPromo(data);
            setPromoError('');
          } else {
            setAppliedPromo(null);
            setPromoError(data.message);
          }
        })
        .catch(() => {
          setAppliedPromo(null);
        });
    }
  }, [finalTotal, isOpen]);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoError('');
    try {
      const res = await fetch(`${API_URL}/promo/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode, total: finalTotal })
      });
      const data = await res.json();
      if (data.valid) {
        setAppliedPromo(data);
        setPromoError('');
      } else {
        setPromoError(data.message);
        setAppliedPromo(null);
      }
    } catch (err) {
      setPromoError('Ошибка при проверке промокода');
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCode('');
    setPromoError('');
  };

  const progress = Math.min((finalTotal / freeDeliveryThreshold) * 100, 100);
  const remainingForFree = freeDeliveryThreshold - finalTotal;
  const deliveryPrice = finalTotal >= freeDeliveryThreshold ? 0 : (Number(settings.delivery_price) || 150);

  const handleCheckout = async () => {
    if (!user) {
      onAuthOpen();
      return;
    }

    if (!deliveryAddress.trim()) {
      alert('Пожалуйста, укажите адрес доставки!');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          customer_name: user.username,
          customer_phone: user.phone,
          customer_address: deliveryAddress,
          items: items,
          total_price: finalTotalWithPromo + deliveryPrice,
          gift_applied: giftApplied,
          promo_code: appliedPromo ? appliedPromo.code : null
        })
      });

      if (res.ok) {
        const resData = await res.json();
        if (resData.loyalty_points !== undefined && onUserUpdate) {
          const updatedUser = { ...user, loyalty_points: resData.loyalty_points };
          localStorage.setItem('userData', JSON.stringify(updatedUser));
          onUserUpdate(updatedUser);
        }
        setGiftApplied(false);
        setAppliedPromo(null);
        setPromoCode('');
        setPromoError('');
        setOrderSuccess(true);
        clearCart();
        setTimeout(() => {
          setOrderSuccess(false);
          onClose();
          if (onCheckoutSuccess) {
            onCheckoutSuccess();
          }
        }, 3000);
      }
    } catch (err) {
      alert('Ошибка при оформлении заказа');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        onClick={onClose}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000,
          backdropFilter: 'blur(4px)', animation: 'fadeIn 0.3s ease'
        }}
      />
      
      <div className="glass" style={{
        position: 'fixed', top: 0, right: 0,
        width: isMobile ? '100%' : '440px',
        height: '100%',
        zIndex: 2001,
        borderLeft: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex', flexDirection: 'column',
        animation: isMobile ? 'fadeIn 0.3s ease' : 'slideInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        {orderSuccess ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px', textAlign: 'center', backgroundColor: 'transparent' }}>
            <div style={{ marginBottom: '20px' }}><Package size={80} /></div>
            <h2 style={{ fontSize: '32px', marginBottom: '16px' }}>Заказ принят!</h2>
            <p style={{ color: 'var(--gray-text)', fontSize: '18px' }}>Спасибо за заказ, {user?.username}! Мы уже начали готовить ваш заказ.</p>
            <div style={{ marginTop: '32px', padding: '20px', backgroundColor: '#F0FFF0', borderRadius: '24px', color: '#27AE60', fontWeight: 700 }}>
              Оператор свяжется с вами в ближайшее время.
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ 
              padding: '20px', 
              backgroundColor: 'transparent',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <h2 style={{ fontSize: isMobile ? '20px' : '24px' }}>{items.length} товара на {finalTotal} {currencySymbol}</h2>
              <button onClick={onClose} style={{ background: 'none', fontSize: '32px', color: 'var(--gray-text)' }}>×</button>
            </div>

            {/* Progress */}
            <div style={{ padding: '16px 20px', backgroundColor: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px', fontWeight: 600 }}>
                {remainingForFree > 0 
                  ? <span>До бесплатной доставки {remainingForFree} {currencySymbol}</span>
                  : <span style={{ color: '#00A650', display: 'flex', alignItems: 'center', gap: '4px' }}>Бесплатная доставка! <Truck size={14} /></span>
                }
              </div>
              <div style={{ height: '4px', backgroundColor: 'var(--gray-light)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progress}%`, backgroundColor: progress >= 100 ? '#00A650' : 'var(--primary)', transition: 'width 0.5s ease' }} />
              </div>
            </div>

            {/* Loyalty Gift Notification */}
            {hasGiftAvailable && items.length > 0 && (
              <div style={{
                margin: '12px 20px 0',
                padding: '16px',
                background: 'rgba(255, 215, 0, 0.1)',
                border: '1px solid rgba(255, 215, 0, 0.3)',
                borderRadius: '20px',
                boxShadow: '0 4px 15px rgba(255, 215, 0, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Gift size={24} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, color: '#855E00', fontSize: '14px' }}>Подарок по программе лояльности!</div>
                    <div style={{ fontSize: '11px', color: '#B37D00', fontWeight: 600, marginTop: '2px' }}>
                      Вам доступен любой бесплатный товар из текущей корзины!
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setGiftApplied(!giftApplied)}
                  style={{
                    backgroundColor: giftApplied ? '#FF4D4D' : '#FFD700',
                    color: giftApplied ? 'white' : '#5C3A00',
                    border: 'none',
                    padding: '10px 16px',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '12px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                    transition: 'all 0.2s ease',
                    textAlign: 'center'
                  }}
                >
                  {giftApplied ? <span style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'}}><X size={16} /> Отменить подарок</span> : <span style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'}}><Gift size={16} /> Забрать самый дешевый бесплатно!</span>}
                </button>
              </div>
            )}

            {/* Items */}
            <div style={{ flex: '1 1 0%', minHeight: 0, overflowY: 'auto', padding: '12px' }}>
              {items.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: '60px', backgroundColor: 'var(--white)', padding: '40px', borderRadius: '24px' }}>
                  <p style={{ color: 'var(--gray-text)' }}>В корзине пока пусто</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {items.map(item => {
                    const isThisGift = giftItem && giftItem.id === item.id;
                    return (
                      <div key={item.id} style={{ 
                        backgroundColor: 'var(--dark-surface)', 
                        borderRadius: '16px', 
                        padding: '12px', 
                        display: 'flex', 
                        gap: '12px',
                        border: isThisGift ? '1.5px solid #27AE60' : '1.5px solid transparent',
                        boxShadow: isThisGift ? '0 4px 15px rgba(39, 174, 96, 0.08)' : 'none',
                        transition: 'all 0.3s ease'
                      }}>
                        <img src={item.image} alt={item.name} style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover' }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontWeight: 600, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>{item.name}</span>
                              {isThisGift && <span style={{ fontSize: '10px', color: '#27AE60', backgroundColor: '#E8F8F0', padding: '2px 6px', borderRadius: '6px', fontWeight: 700 }}>Подарок</span>}
                            </div>
                            <button onClick={() => removeItem(item.id)} style={{ background: 'none', color: '#D2D2D2' }}><Trash2 size={20} /></button>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                            <div style={{ fontWeight: 700 }}>
                              {isThisGift ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <span style={{ textDecoration: 'line-through', color: '#888', fontSize: '13px', marginRight: '4px' }}>{item.price * item.quantity} {currencySymbol}</span>
                                  <span style={{ color: '#27AE60', display: 'flex', alignItems: 'center', gap: '4px' }}>0 {currencySymbol} <Gift size={14} /></span>
                                </div>
                              ) : (
                                <span>{item.price * item.quantity} {currencySymbol}</span>
                              )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '12px' }}>
                              <button onClick={() => updateQuantity(item.id, -1)} style={{ background: 'none', color: 'var(--white)', fontWeight: 600, display: 'flex' }}><Minus size={16} /></button>
                              <span style={{ fontWeight: 600, fontSize: '14px' }}>{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, 1)} style={{ background: 'none', color: 'var(--white)', fontWeight: 600, display: 'flex' }}><Plus size={16} /></button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Recommendations Section */}
              {items.length > 0 && recommendations.length > 0 && (
                <div style={{ marginTop: '24px', padding: '0 8px 12px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '12px', paddingLeft: '8px' }}>Часто заказывают</h3>
                  <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '12px', scrollbarWidth: 'none' }} className="no-scrollbar">
                    {recommendations.map(p => (
                      <div key={p.id} onClick={() => onAddToCart({...p, quantity: 1})} style={{ 
                        flex: '0 0 120px', 
                        backgroundColor: 'var(--dark-surface)', 
                        borderRadius: '16px', 
                        padding: '12px', 
                        textAlign: 'center', 
                        cursor: 'pointer',
                        border: '1px solid rgba(255,255,255,0.05)',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                        transition: 'transform 0.2s ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                      >
                        <img src={p.image} alt={p.name} style={{ width: '80px', height: '80px', objectFit: 'contain', marginBottom: '8px' }} />
                        <div style={{ fontSize: '12px', fontWeight: 600, height: '32px', overflow: 'hidden', marginBottom: '8px' }}>{p.name}</div>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--primary)' }}>{p.price} {currencySymbol}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Checkout details inside scrollable area */}
              {items.length > 0 && (
                <div style={{ padding: '8px 12px 24px', backgroundColor: 'transparent' }}>
                  {user && (
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 800, marginBottom: '8px', color: 'white', textAlign: 'left' }}>
                        <MapPin size={16} /> Адрес доставки
                      </label>
                      <input 
                        type="text" 
                        placeholder="Укажите улицу, дом, подъезд, квартиру" 
                        value={deliveryAddress} 
                        onChange={e => setDeliveryAddress(e.target.value)} 
                        style={{
                          width: '100%',
                          padding: '14px 16px',
                          borderRadius: '16px',
                          border: '1.5px solid #E2E2E9',
                          fontSize: '14px',
                          outline: 'none',
                          transition: 'border-color 0.2s ease',
                          boxSizing: 'border-box'
                        }}
                        onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                        onBlur={e => e.target.style.borderColor = '#E2E2E9'}
                      />
                    </div>
                  )}

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 800, marginBottom: '8px', color: 'white', textAlign: 'left' }}>
                      Промокод
                    </label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input 
                        type="text" 
                        placeholder="Введите промокод" 
                        value={promoCode} 
                        onChange={e => setPromoCode(e.target.value.toUpperCase())}
                        disabled={appliedPromo || promoLoading}
                        style={{
                          flex: 1, padding: '14px 16px', borderRadius: '16px',
                          border: '1.5px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)',
                          color: 'white', fontSize: '14px', textTransform: 'uppercase',
                          outline: 'none', transition: 'all 0.2s ease', boxSizing: 'border-box'
                        }}
                      />
                      {appliedPromo ? (
                        <button
                          onClick={handleRemovePromo}
                          style={{
                            padding: '14px 20px', borderRadius: '16px', border: 'none',
                            background: 'rgba(255, 77, 77, 0.15)', color: '#FF4D4D',
                            fontWeight: 700, fontSize: '14px', cursor: 'pointer'
                          }}
                        >
                          Сбросить
                        </button>
                      ) : (
                        <button
                          onClick={handleApplyPromo}
                          disabled={promoLoading || !promoCode.trim()}
                          style={{
                            padding: '14px 20px', borderRadius: '16px', border: 'none',
                            background: promoCode.trim() ? 'var(--primary-gradient)' : 'rgba(255,255,255,0.1)',
                            color: 'white', fontWeight: 700, fontSize: '14px',
                            cursor: promoCode.trim() ? 'pointer' : 'not-allowed',
                            boxShadow: promoCode.trim() ? '0 4px 15px rgba(255, 0, 77, 0.2)' : 'none'
                          }}
                        >
                          {promoLoading ? '...' : 'Применить'}
                        </button>
                      )}
                    </div>
                    {promoError && (
                      <div style={{ color: '#FF4D4D', fontSize: '12px', marginTop: '6px', fontWeight: 600, textAlign: 'left' }}>{promoError}</div>
                    )}
                    {appliedPromo && (
                      <div style={{ color: '#27AE60', fontSize: '12px', marginTop: '6px', fontWeight: 600, textAlign: 'left' }}>Промокод успешно применен!</div>
                    )}
                  </div>

                  <div style={{ padding: '16px', backgroundColor: 'var(--dark-surface)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--gray-text)', fontSize: '14px' }}>
                      <span>Товары</span>
                      <span>{total} {currencySymbol}</span>
                    </div>
                    {giftDiscount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#27AE60', fontSize: '14px', fontWeight: 600 }}>
                        <span>Скидка лояльности</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>-{giftDiscount} {currencySymbol}</span>
                      </div>
                    )}
                    {appliedPromo && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#27AE60', fontSize: '14px', fontWeight: 600 }}>
                        <span>Скидка ({appliedPromo.code})</span>
                        <span>-{appliedPromo.discount_amount} {currencySymbol}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--gray-text)', fontSize: '14px' }}>
                      <span>Доставка</span>
                      <span>{deliveryPrice === 0 ? 'Бесплатно' : `${deliveryPrice} ${currencySymbol}`}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div style={{ padding: '16px 20px calc(16px + var(--safe-bottom)) 20px', backgroundColor: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'var(--gray-text)', fontSize: '12px', fontWeight: 600, marginBottom: '2px' }}>К оплате</div>
                  <div style={{ fontWeight: 800, fontSize: '20px', color: 'var(--primary)' }}>{finalTotalWithPromo + deliveryPrice} {currencySymbol}</div>
                </div>
                <button 
                  onClick={handleCheckout}
                  disabled={loading}
                  style={{
                    flex: 1.2, background: 'var(--primary-gradient)', color: 'var(--white)',
                    padding: '16px', borderRadius: '16px', fontWeight: 700, fontSize: '16px',
                    boxShadow: '0 4px 15px rgba(255, 0, 77, 0.3)', cursor: 'pointer',
                    transition: 'transform 0.2s ease', border: 'none'
                  }}
                  onMouseDown={(e) => e.target.style.transform = 'scale(0.98)'}
                  onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
                >
                  {loading ? 'Оформляем...' : user ? 'Заказать' : 'Войти'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Cart;
