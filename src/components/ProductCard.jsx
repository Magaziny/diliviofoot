import React, { useState } from 'react';

const ProductCard = ({ product, onAddToCart, onOpenModal, currencySymbol = 'm' }) => {
  const [isFlying, setIsFlying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isAvailable = product.is_available !== 0;
  const hasSale = product.sale_price && product.sale_price > 0;
  const hasVariants = Number(product.has_variants) === 1 || product.has_variants === true || product.has_variants === 'true';

  const handleAction = (e) => {
    e.stopPropagation();
    if (!isAvailable) return;
    if (hasVariants) {
      onOpenModal(product);
    } else {
      setIsFlying(true);
      setTimeout(() => setIsFlying(false), 800);
      onAddToCart(product);
    }
  };

  return (
    <div className="animate-slide-up" style={{
      backgroundColor: 'var(--dark-surface)',
      borderRadius: 'var(--radius-lg)',
      padding: isMobile ? '12px' : '24px',
      display: 'flex',
      flexDirection: 'column',
      transition: 'var(--transition)',
      cursor: 'pointer',
      height: '100%',
      border: '1px solid var(--gray-light)',
      boxShadow: isHovered ? 'var(--shadow-hover)' : 'var(--shadow)',
      transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
      position: 'relative',
      opacity: isAvailable ? 1 : 0.6,
      pointerEvents: isAvailable ? 'auto' : 'none'
    }}
    onClick={() => isAvailable && onOpenModal(product)}
    onMouseEnter={() => {
      setIsHovered(true);
    }}
    onMouseLeave={() => {
      setIsHovered(false);
    }}
    >
      {/* Fly Animation Element */}
      {isFlying && (
        <img 
          src={product.image} 
          alt="fly" 
          style={{
            position: 'fixed',
            width: '100px',
            zIndex: 5000,
            animation: 'flyToCart 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
            pointerEvents: 'none'
          }}
        />
      )}

      <style>
        {`
          @keyframes flyToCart {
            0% { top: 50%; left: 50%; transform: translate(-50%, -50%) scale(1); opacity: 1; }
            100% { top: 20px; left: 85%; transform: scale(0.1); opacity: 0; }
          }
        `}
      </style>

      <div style={{
        width: '100%',
        paddingBottom: '100%',
        position: 'relative',
        marginBottom: '16px',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden'
      }}>
        <img 
          src={product.image} 
          alt={product.name}
          className="product-card-image"
          style={{
            transform: isHovered ? 'scale(1.15)' : 'scale(1)'
          }}
        />
        {!isAvailable && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(15, 17, 21, 0.7)', color: 'var(--white)',
            backdropFilter: 'blur(4px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            fontWeight: 800, fontSize: '18px', textAlign: 'center'
          }}>
            НЕТ В НАЛИЧИИ
          </div>
        )}
        {hasSale && isAvailable && (
          <div style={{
            position: 'absolute', top: '12px', left: '12px',
            background: 'var(--primary-gradient)', color: 'var(--white)',
            padding: '6px 12px', borderRadius: '12px',
            fontWeight: 800, fontSize: '13px', zIndex: 1,
            boxShadow: '0 4px 10px rgba(255, 0, 77, 0.4)'
          }}>
            -{Math.round((1 - product.sale_price / product.price) * 100)}%
          </div>
        )}
      </div>
      
      <h3 style={{ fontSize: isMobile ? '16px' : '20px', marginBottom: '8px', lineHeight: 1.2 }}>{product.name}</h3>
      <p style={{ 
        color: 'var(--gray-text)', 
        fontSize: isMobile ? '12px' : '14px', 
        marginBottom: isMobile ? '12px' : '20px',
        flexGrow: 1,
        lineHeight: 1.4,
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
      }}>
        {product.description}
      </p>
      
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 'auto'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {hasSale ? (
            <>
              <span style={{ fontSize: isMobile ? '15px' : '18px', fontWeight: 700, color: 'var(--primary)' }}>{hasVariants ? 'от ' : ''}{product.sale_price} {currencySymbol}</span>
              <span style={{ fontSize: isMobile ? '12px' : '14px', textDecoration: 'line-through', color: 'var(--gray-text)' }}>{product.price} {currencySymbol}</span>
            </>
          ) : (
            <span style={{ fontSize: isMobile ? '15px' : '18px', fontWeight: 700 }}>{hasVariants ? 'от ' : ''}{product.price} {currencySymbol}</span>
          )}
        </div>
        <button 
          onClick={handleAction}
          disabled={!isAvailable}
          style={{
            background: !isAvailable ? 'var(--gray-light)' : (isHovered ? 'var(--primary-gradient)' : 'rgba(255, 51, 102, 0.1)'),
            color: !isAvailable ? 'var(--gray-text)' : (isHovered ? 'var(--white)' : 'var(--primary)'),
            padding: isMobile ? '8px 12px' : '8px 20px',
            borderRadius: 'var(--radius-md)',
            fontWeight: 700,
            fontSize: isMobile ? '13px' : '15px',
            transition: 'var(--transition)',
            cursor: isAvailable ? 'pointer' : 'default',
            border: 'none',
            boxShadow: isHovered ? '0 4px 12px rgba(255, 0, 77, 0.3)' : 'none'
          }}
        >
          {!isAvailable ? 'Закончился' : (hasVariants ? 'Выбрать' : 'В корзину')}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
