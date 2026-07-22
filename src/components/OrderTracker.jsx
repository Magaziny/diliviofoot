import React, { useState, useEffect } from 'react';
import { Package, Pizza, Clock, XCircle, Lightbulb, RefreshCcw } from 'lucide-react';
import { API_URL } from '../config';

const OrderTracker = ({ isOpen, onClose, user, currencySymbol = 'm', onRepeatOrder }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchMyOrders = async () => {
    const token = localStorage.getItem('userToken');
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/orders/my`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (e) {
      console.error('Ошибка загрузки статуса заказов:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && user) {
      fetchMyOrders();
      const interval = setInterval(fetchMyOrders, 4000);
      return () => clearInterval(interval);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const getStatusStep = (status) => {
    switch (status) {
      case 'pending': return 1;
      case 'cooking': return 2;
      case 'delivery': return 3;
      case 'done': return 4;
      default: return 0;
    }
  };

  const steps = [
    { 
      label: 'Принят', 
      desc: 'Уже передан на нашу кухню',
      icon: (color) => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
          <path d="M9 14h6" />
          <path d="M9 18h6" />
        </svg>
      )
    },
    { 
      label: 'Готовится', 
      desc: 'Пицца выпекается в печи',
      icon: (color) => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 10a6 6 0 0 0-12 0v8h12v-8z" />
          <path d="M12 4a3 3 0 0 0-3 3" />
          <path d="M5 18h14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1z" />
        </svg>
      )
    },
    { 
      label: 'В пути', 
      desc: 'Курьер спешит к вашим дверям',
      icon: (color) => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="3" width="15" height="13" rx="2" ry="2" />
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
          <path d="M3 8h6" />
        </svg>
      )
    },
    { 
      label: 'Доставлен', 
      desc: 'Приятного аппетита и хорошего дня!',
      icon: (color) => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      )
    }
  ];

  return (
    <>
      {/* Подложка с размытием */}
      <div 
        onClick={onClose}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(10, 10, 18, 0.45)', zIndex: 3000,
          backdropFilter: 'blur(12px)',
          animation: 'trackerFadeIn 0.3s ease-out'
        }}
      />

      {/* Контент трекера в стиле Glassmorphism */}
      <div 
        className="glass-tracker"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: isMobile ? '95%' : '90%',
          maxWidth: '650px',
          maxHeight: '85vh',
          backgroundColor: 'rgba(24, 26, 32, 0.6)',
          backdropFilter: 'blur(30px) saturate(190%)',
          borderRadius: '36px',
          zIndex: 3001,
          boxShadow: '0 30px 70px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
          overflowY: 'auto',
          animation: 'trackerScaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid rgba(255, 255, 255, 0.5)'
        }}
      >
        <div style={{
          padding: isMobile ? '20px 24px' : '28px 36px',
          backgroundColor: 'transparent',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backdropFilter: 'blur(10px)',
          gap: '12px'
        }}>
          <div>
            <h2 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 900, color: 'var(--white)', fontFamily: 'Outfit, Inter, sans-serif', letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: isMobile ? '22px' : '26px', display: 'flex' }}><Package /></span> Отслеживание заказов
            </h2>
            <p style={{ fontSize: '12px', color: '#7E7E8F', marginTop: '4px', fontWeight: 500 }}>
              Статус обновляется {isMobile ? 'в реальном времени' : 'автоматически в реальном времени'}
            </p>
          </div>
          <button 
            onClick={onClose} 
            style={{ 
              background: 'rgba(255, 255, 255, 0.1)', 
              border: '1px solid rgba(255, 255, 255, 0.05)',
              flexShrink: 0,
              width: isMobile ? '34px' : '40px', 
              height: isMobile ? '34px' : '40px', 
              borderRadius: '50%', 
              fontSize: isMobile ? '18px' : '22px', 
              fontWeight: 500, 
              color: 'var(--white)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = '#FF6B00';
              e.currentTarget.style.color = '#FFF';
              e.currentTarget.style.transform = 'rotate(90deg) scale(1.05)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = 'rgba(240, 240, 245, 0.8)';
              e.currentTarget.style.color = '#4E4E61';
              e.currentTarget.style.transform = 'rotate(0deg) scale(1)';
            }}
          >
            ×
          </button>
        </div>

        {/* Список заказов */}
        <div style={{ padding: isMobile ? '20px' : '36px', flex: 1, paddingBottom: isMobile ? 'env(safe-area-inset-bottom, 20px)' : '36px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div className="premium-spinner" style={{ width: '48px', height: '48px', border: '4px solid rgba(255, 107, 0, 0.1)', borderTopColor: '#FF6B00', borderRadius: '50%', animation: 'trackerSpin 1s cubic-bezier(0.55, 0.085, 0.68, 0.53) infinite', margin: '0 auto 20px' }} />
              <span style={{ fontWeight: 700, color: '#4E4E61', fontSize: '15px', fontFamily: 'Inter, sans-serif' }}>Загрузка статуса заказов...</span>
            </div>
          ) : orders.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 30px', 
              backgroundColor: 'rgba(255, 255, 255, 0.05)', 
              borderRadius: '28px', 
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
            }}>
              <span style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', filter: 'drop-shadow(0 10px 20px rgba(255,107,0,0.2))', color: '#FF6B00' }}><Pizza size={72} /></span>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--white)', fontFamily: 'Outfit, sans-serif' }}>Активных заказов пока нет</h3>
              <p style={{ fontSize: '14px', color: '#7E7E8F', maxWidth: '340px', margin: '10px auto 0', lineHeight: 1.5, fontWeight: 500 }}>Сделайте свой первый заказ, и вы сможете отслеживать этапы его доставки в реальном времени!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              {orders.map((order, oIdx) => {
                const currentStep = getStatusStep(order.status);
                const isCancelled = order.status === 'cancelled';

                return (
                    <div 
                      key={order.id} 
                      className="order-track-card"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '28px',
                        padding: isMobile ? '20px' : '28px',
                        boxShadow: oIdx === 0 ? '0 20px 45px rgba(255, 107, 0, 0.08), inset 0 0 0 1px rgba(255, 107, 0, 0.15)' : '0 8px 24px rgba(0,0,0,0.2)',
                        border: oIdx === 0 ? '2.5px solid rgba(255, 107, 0, 0.35)' : '1px solid rgba(255, 255, 255, 0.1)',
                      position: 'relative',
                      transition: 'all 0.3s ease',
                      animation: oIdx === 0 ? 'glowingBorder 3s infinite alternate' : 'none'
                    }}
                  >
                    {/* Метка последнего активного заказа */}
                    {oIdx === 0 && (
                      <span className="glow-badge" style={{
                        position: 'absolute',
                        top: '-14px',
                        left: '28px',
                        background: 'linear-gradient(135deg, #FF6B00 0%, #FF8E3C 100%)',
                        color: 'white',
                        fontSize: '11px',
                        fontWeight: 900,
                        padding: '5px 16px',
                        borderRadius: '30px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.8px',
                        boxShadow: '0 4px 15px rgba(255, 107, 0, 0.4)'
                      }}>
                        Активный заказ
                      </span>
                    )}

                    {/* Верхняя инфо-строка */}
                    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '24px', borderBottom: '1px dashed rgba(255, 255, 255, 0.1)', paddingBottom: '20px' }}>
                      <div>
                        <h4 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--white)', fontFamily: 'Outfit, sans-serif' }}>Заказ №{order.id}</h4>
                        <span style={{ fontSize: '12px', color: '#7E7E8F', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                          <Clock size={12} /> {new Date(order.created_at).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div style={{ textAlign: isMobile ? 'left' : 'right' }}>
                        <span style={{ fontSize: '18px', fontWeight: 950, color: '#FF6B00', display: 'block', fontFamily: 'Outfit, sans-serif' }}>
                          {order.total_price} {currencySymbol}
                        </span>
                        <span style={{ fontSize: '12px', color: '#7E7E8F', fontWeight: 600 }}>Кол-во позиций: {order.items?.length || 0}</span>
                        
                        <button 
                          onClick={(e) => { e.stopPropagation(); if (onRepeatOrder) onRepeatOrder(order); }}
                          style={{ 
                            marginTop: '12px', 
                            padding: '8px 16px', 
                            background: 'rgba(255, 107, 0, 0.1)', 
                            border: '1px solid rgba(255, 107, 0, 0.3)', 
                            color: '#FF6B00', 
                            borderRadius: '12px', 
                            fontSize: '13px', 
                            fontWeight: 700, 
                            cursor: 'pointer', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '6px',
                            transition: 'all 0.2s ease',
                            width: isMobile ? '100%' : 'auto',
                            justifyContent: isMobile ? 'center' : 'flex-start'
                          }}
                          onMouseOver={e => {
                            e.currentTarget.style.background = 'rgba(255, 107, 0, 0.2)';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }}
                          onMouseOut={e => {
                            e.currentTarget.style.background = 'rgba(255, 107, 0, 0.1)';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          <RefreshCcw size={14} /> Повторить заказ
                        </button>
                      </div>
                    </div>

                    {/* Визуализация статуса */}
                    {isCancelled ? (
                      <div style={{
                        background: 'linear-gradient(135deg, rgba(255, 77, 77, 0.05) 0%, rgba(255, 77, 77, 0.08) 100%)',
                        border: '1.5px solid rgba(255, 77, 77, 0.25)',
                        padding: '20px',
                        borderRadius: '20px',
                        color: '#E53E3E',
                        fontWeight: 700,
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        boxShadow: '0 8px 20px rgba(255, 77, 77, 0.03)'
                      }}>
                        <XCircle size={24} />
                        <span style={{ lineHeight: 1.4 }}>Этот заказ был отменен оператором. Если у вас возникли вопросы, пожалуйста, свяжитесь с поддержкой.</span>
                      </div>
                    ) : (
                      <div>
                        {/* Полоса прогресса */}
                        <div className="no-scrollbar" style={{
                          position: 'relative',
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: isMobile ? '20px' : '40px',
                          marginTop: '25px',
                          padding: isMobile ? '10px 0 20px 0' : '10px 10px 20px 10px',
                          overflowX: isMobile ? 'auto' : 'visible',
                        }}>
                          <div style={{ minWidth: isMobile ? '300px' : '340px', position: 'relative', display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                          {/* Фоновый трек */}
                          <div style={{
                            position: 'absolute',
                            top: '22px',
                            left: isMobile ? '25px' : '40px',
                            right: isMobile ? '25px' : '40px',
                            height: '6px',
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            zIndex: 1,
                            borderRadius: '10px'
                          }} />

                          {/* Активный трек с жидким оранжевым неоновым градиентом */}
                          <div style={{
                            position: 'absolute',
                            top: '22px',
                            left: isMobile ? '25px' : '40px',
                            width: `calc(${Math.max(0, Math.min(100, ((currentStep - 1) / (steps.length - 1)) * 100))}% - ${isMobile ? '50px' : '80px'})`,
                            height: '6px',
                            background: 'linear-gradient(90deg, #FF6B00, #FF8E3C, #FF6B00)',
                            backgroundSize: '200% 100%',
                            zIndex: 2,
                            borderRadius: '10px',
                            boxShadow: '0 0 15px rgba(255, 107, 0, 0.6)',
                            transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                            animation: 'trackGradientMove 2.5s linear infinite'
                          }} />

                          {/* Шаги */}
                          {steps.map((step, idx) => {
                            const stepNum = idx + 1;
                            const isCompleted = currentStep >= stepNum;
                            const isActive = currentStep === stepNum;

                            return (
                              <div key={idx} style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                position: 'relative',
                                zIndex: 3,
                                flex: 1,
                                minWidth: 0
                              }}>
                                {/* Кружок статуса с многослойным свечением */}
                                <div style={{
                                  width: '50px',
                                  height: '50px',
                                  borderRadius: '50%',
                                  backgroundColor: isCompleted ? 'rgba(255, 107, 0, 0.08)' : 'rgba(228, 228, 235, 0.3)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'all 0.4s ease',
                                  boxShadow: isActive ? '0 0 20px rgba(255, 107, 0, 0.2)' : 'none'
                                }}>
                                  {/* Внутренний кружок */}
                                  <div style={{
                                    width: '38px',
                                    height: '38px',
                                    borderRadius: '50%',
                                    backgroundColor: isCompleted ? '#FF6B00' : 'rgba(255,255,255,0.1)',
                                    border: `2px solid ${isCompleted ? '#FF6B00' : 'rgba(255,255,255,0.2)'}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: isCompleted 
                                      ? '0 6px 15px rgba(255, 107, 0, 0.35)' 
                                      : '0 4px 10px rgba(0,0,0,0.2)',
                                    animation: isActive ? 'trackerPulseRing 2s infinite' : 'none',
                                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                                  }}>
                                    <span style={{ 
                                      transform: isActive ? 'scale(1.15)' : 'scale(1)',
                                      transition: 'transform 0.3s ease',
                                      display: 'inline-block' 
                                    }}>
                                      {step.icon(isCompleted ? '#FFF' : '#8E8E9F')}
                                    </span>
                                  </div>
                                </div>

                                {/* Название шага */}
                                <span style={{
                                  fontSize: '13px',
                                  fontWeight: isActive ? 900 : 700,
                                  color: isActive ? '#FF6B00' : (isCompleted ? 'var(--white)' : '#8E8E9F'),
                                  marginTop: '12px',
                                  textAlign: 'center',
                                  whiteSpace: 'nowrap',
                                  fontFamily: 'Outfit, sans-serif'
                                }}>
                                  {step.label}
                                </span>
                              </div>
                            );
                          })}
                          </div>
                        </div>

                        {/* Текущее пояснение в 3D/Glass стиле */}
                        <div style={{
                          background: 'linear-gradient(135deg, rgba(255, 107, 0, 0.1) 0%, rgba(255, 142, 60, 0.15) 100%)',
                          padding: isMobile ? '14px 16px' : '18px 24px',
                          borderRadius: '20px',
                          border: '1.5px solid rgba(255, 107, 0, 0.25)',
                          fontSize: isMobile ? '13px' : '14px',
                          fontWeight: 600,
                          color: 'var(--white)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          boxShadow: '0 8px 20px rgba(255, 107, 0, 0.02)'
                        }}>
                          <span style={{ display: 'flex', animation: 'trackerWiggle 2.5s infinite', color: '#FFD700' }}><Lightbulb size={24} /></span>
                          <span style={{ lineHeight: 1.4 }}>
                            Текущий статус: <strong style={{ color: '#FF6B00', fontWeight: 800 }}>{steps[currentStep - 1]?.label}</strong>. {steps[currentStep - 1]?.desc}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Детали заказа - Кастомный современный аккордеон */}
                    <details className="premium-details" style={{ marginTop: '20px' }}>
                      <summary style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '13px',
                        fontWeight: 800,
                        color: '#7E7E8F',
                        userSelect: 'none',
                        outline: 'none',
                        padding: '4px 0',
                        cursor: 'pointer',
                        transition: 'color 0.2s ease',
                        listStyle: 'none'
                      }}>
                        <svg 
                          className="chevron-icon" 
                          width="16" 
                          height="16" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="3" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                          style={{ transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)', color: '#FF6B00' }}
                        >
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                        <span>Детали заказа ({order.items?.length} поз.)</span>
                      </summary>
                      
                      <div className="accordion-content" style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        padding: '20px',
                        borderRadius: '20px',
                        marginTop: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        animation: 'trackerSlideDown 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
                      }}>
                        {order.items?.map((item, itemIdx) => (
                          <div key={itemIdx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600 }}>
                            <span style={{ color: 'var(--white)' }}>
                              {item.product_name} <span style={{ color: '#9E9EAF', fontWeight: 700 }}>× {item.quantity}</span>
                            </span>
                            <span style={{ fontWeight: 800, color: 'var(--white)', fontFamily: 'Outfit, sans-serif' }}>
                              {item.price * item.quantity} {currencySymbol}
                            </span>
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Внедренные глобальные премиум стили и анимации */}
      <style>{`
        summary::-webkit-details-marker {
          display: none !important;
        }
        
        .premium-details[open] .chevron-icon {
          transform: rotate(90deg);
        }

        .premium-details summary:hover {
          color: #FF6B00 !important;
        }

        @keyframes glowingBorder {
          from {
            border-color: rgba(255, 107, 0, 0.35);
            box-shadow: 0 20px 45px rgba(255, 107, 0, 0.08);
          }
          to {
            border-color: rgba(255, 107, 0, 0.6);
            box-shadow: 0 20px 45px rgba(255, 107, 0, 0.16);
          }
        }

        @keyframes trackerPulseRing {
          0% { box-shadow: 0 0 0 0 rgba(255, 107, 0, 0.45); }
          70% { box-shadow: 0 0 0 10px rgba(255, 107, 0, 0); }
          100% { box-shadow: 0 0 0 0 rgba(255, 107, 0, 0); }
        }

        @keyframes trackerSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes trackerFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes trackerScaleIn {
          from { opacity: 0; transform: translate(-50%, -46%) scale(0.96); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }

        @keyframes trackerSlideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes trackerWiggle {
          0%, 100% { transform: rotate(0deg); }
          10%, 30% { transform: rotate(-8deg); }
          20%, 40% { transform: rotate(8deg); }
          50% { transform: rotate(0deg); }
        }

        @keyframes trackGradientMove {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
      `}</style>
    </>
  );
};

export default OrderTracker;

