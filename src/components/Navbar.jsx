import React, { useState, useEffect } from 'react';
import { Truck, User, PartyPopper, Gift, Search, Sun, Moon, ShoppingBag } from 'lucide-react';
import { API_HOST } from '../config';

const Navbar = ({ cartCount, cartItems, onCartOpen, searchQuery, onSearchChange, user, onAuthOpen, onLogout, freePizzaThreshold = 5000, settings = {}, onTrackerOpen, theme, toggleTheme }) => {
  const brandName = settings.brand_name || 'Магазин';
  const currencySymbol = settings.currency_symbol || 'm';
  const loyaltyProgressLabel = settings.loyalty_progress_label || 'До бесплатной пиццы:';
  const actualThreshold = settings.free_pizza_threshold || freePizzaThreshold;

  const cartSubtotal = cartItems?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;
  const loyaltyProgress = Math.min((cartSubtotal / actualThreshold) * 100, 100);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [scrolled, setScrolled] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  const [headerHeight, setHeaderHeight] = useState('auto');
  const navContainerRef = React.useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    const handleScroll = () => {
       setScrolled(window.scrollY > 50);
       if (navContainerRef.current) {
         document.documentElement.style.setProperty('--navbar-height', `${navContainerRef.current.offsetHeight}px`);
       }
    };
    
    // Initialize
    if (navContainerRef.current) {
      if (window.scrollY <= 50) {
        setHeaderHeight(navContainerRef.current.offsetHeight);
      }
      document.documentElement.style.setProperty('--navbar-height', `${navContainerRef.current.offsetHeight}px`);
    }

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [cartSubtotal, isMobile, settings]);

  const total = cartItems?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;

  const hexToRgba = (hex, opacity) => {
    if (!hex) return '';
    const r = parseInt(hex.slice(1, 3), 16) || 0;
    const g = parseInt(hex.slice(3, 5), 16) || 0;
    const b = parseInt(hex.slice(5, 7), 16) || 0;
    return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
  };

  const currentOpacity = settings.navbar_opacity !== undefined ? settings.navbar_opacity : (theme === 'light' ? 85 : 70);
  const baseColor = settings.navbar_color || (theme === 'light' ? '#FFFFFF' : '#181A20');
  const customNavbarBg = hexToRgba(baseColor, currentOpacity);

  return (
    <div style={{ height: headerHeight, zIndex: 1000, position: 'relative' }}>
      <div ref={navContainerRef} style={{
        position: 'fixed',
        left: 0,
        right: 0,
        top: 0,
        zIndex: 1000,
        padding: scrolled ? '10px 0' : '0',
        paddingTop: `calc(${scrolled ? '10px' : '0px'} + var(--safe-top))`,
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      <nav className="glass" style={{
        margin: scrolled ? (isMobile ? '0 10px' : '0 auto') : '0',
        maxWidth: scrolled ? '1200px' : '100%',
        borderRadius: scrolled ? 'var(--radius-lg)' : '0',
        padding: isMobile ? '8px 16px' : '12px 24px',
        boxShadow: scrolled ? '0 10px 30px rgba(0,0,0,0.1)' : 'none',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        borderBottom: scrolled ? 'none' : '1px solid var(--gray-light)',
        ...(customNavbarBg ? { background: customNavbarBg } : {})
      }}>
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '12px' : '0',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'center',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* Logo */}
            <div style={{ 
              fontSize: isMobile ? '20px' : '24px', 
              fontWeight: 800, 
              color: 'var(--white)',
              letterSpacing: '-1px',
              fontFamily: 'Outfit',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}>
              {settings.logo_url ? (
                <img 
                  src={settings.logo_url.startsWith('http') ? settings.logo_url : `${API_HOST}${settings.logo_url}`} 
                  alt={brandName} 
                  style={{ 
                    height: settings.logo_size 
                      ? `${isMobile ? Math.max(24, settings.logo_size * 0.8) : settings.logo_size}px` 
                      : (isMobile ? '32px' : '40px'), 
                    objectFit: 'contain' 
                  }} 
                />
              ) : (
                (() => {
                  const parts = brandName.split(' ');
                  if (parts.length > 1) {
                    return (
                      <>
                        <span style={{ color: 'var(--primary)' }}>{parts[0]}</span> {parts.slice(1).join(' ')}
                      </>
                    );
                  }
                  return <span style={{ color: 'var(--primary)' }}>{brandName}</span>;
                })()
              )}
            </div>

            {/* Mobile Actions */}
            {isMobile && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button onClick={toggleTheme} style={{ background: 'transparent', color: 'var(--white)', border: 'none', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </button>
                {user && (
                  <button 
                    onClick={onTrackerOpen}
                    style={{
                      background: 'transparent',
                      color: 'var(--white)',
                      border: 'none',
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <Truck size={22} />
                  </button>
                )}
                <button onClick={user ? onLogout : onAuthOpen} style={{ background: 'transparent', color: 'var(--white)', padding: '8px 4px', fontSize: '15px', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                  {user ? 'Выйти' : 'Войти'}
                </button>
                <button onClick={onCartOpen} style={{ position: 'relative', background: 'transparent', color: 'var(--white)', border: 'none', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <ShoppingBag size={22} />
                  {cartCount > 0 && (
                    <span style={{ position: 'absolute', top: '-2px', right: '-4px', background: 'var(--primary)', color: '#FFFFFF', width: '18px', height: '18px', borderRadius: '50%', fontSize: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {cartCount}
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Search */}
          <div style={{ position: 'relative', flex: isMobile ? '1' : '0 1 300px' }}>
            <input type="text" value={searchQuery || ''} placeholder="Поиск по меню..." onChange={(e) => {
              onSearchChange(e.target.value);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }} style={{ width: '100%', padding: '12px 16px 12px 45px', borderRadius: 'var(--radius-md)', border: 'none', backgroundColor: 'var(--gray-light)', fontSize: '14px', outline: 'none', color: 'var(--white)' }} />
            <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-text)' }} />
          </div>

          {/* Desktop Right Side */}
          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <button onClick={toggleTheme} style={{ background: 'var(--gray-light)', color: 'var(--white)', border: 'none', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>
              {/* User Profile / Login */}
              {user ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button 
                    onClick={onTrackerOpen}
                    style={{
                      background: 'transparent',
                      color: 'var(--white)',
                      border: 'none',
                      padding: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Truck size={22} />
                  </button>

                  <div style={{ width: '1px', height: '24px', backgroundColor: '#E2E2E9' }} />

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--white)' }}>{user.username}</div>
                    <div style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600 }}>{user.loyalty_points || 0} баллов</div>
                  </div>
                  <button onClick={onLogout} style={{ background: 'transparent', color: 'var(--white)', border: 'none', cursor: 'pointer', padding: '8px' }}>
                    <User size={22} />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={onAuthOpen}
                  style={{
                    backgroundColor: 'transparent',
                    color: 'var(--white)',
                    padding: '8px 12px',
                    fontWeight: 700,
                    fontSize: '15px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Войти
                </button>
              )}

              <div style={{ width: '1px', height: '30px', backgroundColor: '#E2E2E9' }} />

              {/* Cart */}
              <div 
                style={{ position: 'relative' }}
                onMouseEnter={() => setShowPreview(true)}
                onMouseLeave={() => setShowPreview(false)}
              >
                <button 
                  onClick={onCartOpen}
                  style={{
                    background: 'transparent',
                    color: 'var(--white)',
                    padding: '8px 12px',
                    fontWeight: 700,
                    fontSize: '15px',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer'
                  }}
                >
                  <ShoppingBag size={24} />
                  <span>Корзина</span>
                  <div style={{ background: 'var(--primary)', color: 'white', padding: '2px 10px', borderRadius: '12px', fontSize: '12px' }}>{cartCount}</div>
                </button>

                {showPreview && cartCount > 0 && (
                  <div className="glass" style={{ position: 'absolute', top: '100%', right: 0, width: '300px', marginTop: '10px', padding: '20px', borderRadius: 'var(--radius-md)', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', animation: 'fadeInUp 0.3s ease' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {cartItems.slice(-3).map(item => (
                        <div key={item.id} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <img src={item.image} alt="" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                          <div style={{ flex: 1, fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                          <div style={{ fontSize: '13px', fontWeight: 700 }}>{item.price} {currencySymbol}</div>
                        </div>
                      ))}
                      <div style={{ borderTop: '1px solid var(--gray-light)', paddingTop: '12px', marginTop: '4px', display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                        <span>Итого:</span>
                        <span>{total} {currencySymbol}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        {/* Loyalty Progress Bar */}
        <div style={{
          overflow: 'hidden',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          maxHeight: scrolled ? '0px' : '150px',
          opacity: scrolled ? 0 : 1,
          marginTop: scrolled ? '0px' : '12px',
          pointerEvents: scrolled ? 'none' : 'auto'
        }}>
          <div style={{
            fontSize: '11px',
            fontWeight: 700,
            paddingBottom: scrolled ? '0px' : '4px'
          }}>
            {loyaltyProgress >= 100 ? (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                background: 'linear-gradient(90deg, #FFD700, #FFA500, #FFD700)',
                backgroundSize: '200% auto',
                animation: 'shimmer 3s linear infinite',
                color: '#5C3A00',
                padding: '8px 16px', 
                borderRadius: '10px',
                boxShadow: '0 4px 10px rgba(255, 215, 0, 0.2)'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <PartyPopper size={20} />
                  <span>ПОЗДРАВЛЯЕМ! Вам доступен бесплатный подарок в корзине!</span>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>100% <Gift size={16} /></span>
              </div>
            ) : (
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '10px 14px',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.05)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--white)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                    <Gift size={16} style={{ color: 'var(--white)' }} />
                    <span style={{ opacity: 0.8 }}>{loyaltyProgressLabel}</span> 
                    <span style={{ fontWeight: 800 }}>{Math.max(0, actualThreshold - cartSubtotal)} {currencySymbol}</span>
                  </span>
                  <span style={{ color: 'var(--white)', fontWeight: 800, fontSize: '12px' }}>
                    {Math.round(loyaltyProgress)}%
                  </span>
                </div>
                <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ 
                    width: `${loyaltyProgress}%`, 
                    height: '100%', 
                    background: 'var(--primary-gradient)', 
                    borderRadius: '4px', 
                    transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative'
                  }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%)', animation: 'shimmer 2s infinite' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
      </div>
    </div>
  );
};

export default Navbar;
