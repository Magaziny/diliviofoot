import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';

const ProductModal = ({ product, isOpen, onClose, onAddToCart, currencySymbol = 'm', allProducts = [], onOpenProduct }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [size, setSize] = useState('medium');
  const [dough, setDough] = useState('option1');
  const [availableModifiers, setAvailableModifiers] = useState([]);
  const [selectedModifiers, setSelectedModifiers] = useState([]);
  const [relatedItems, setRelatedItems] = useState([]);
  const [selectedRelatedItems, setSelectedRelatedItems] = useState([]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isOpen && product) {
      setSize('medium');
      setDough('option1');
      fetch(`${API_URL}/modifiers`)
        .then(res => res.json())
        .then(allMods => {
          fetch(`${API_URL}/products/${product.id}/modifiers`)
            .then(res => res.json())
            .then(prodMods => setAvailableModifiers(prodMods));
        });
      setSelectedModifiers([]);
      setSelectedRelatedItems([]);

      let relItems = [];
      try {
        if (typeof product.related_products === 'string') {
          relItems = JSON.parse(product.related_products);
        } else if (Array.isArray(product.related_products)) {
          relItems = product.related_products;
        }
      } catch (e) {
        relItems = [];
      }
      
      const processedRelated = relItems.map(item => {
        if (typeof item === 'object') {
          const baseProduct = allProducts.find(p => p.id === item.id);
          return { ...baseProduct, _configured: item };
        } else {
          return allProducts.find(p => p.id === item);
        }
      }).filter(Boolean);
      
      setRelatedItems(processedRelated);
    }
  }, [isOpen, product, allProducts]);

  const modifiersPrice = selectedModifiers.reduce((sum, m) => sum + m.price, 0);
  const hasVariants = product ? (Number(product.has_variants) === 1 || product.has_variants === true || product.has_variants === 'true') : false;

  const sizePrices = product ? { 
    small: Number(product.price_s) || 0, 
    medium: Number(product.price_m) || 0, 
    large: Number(product.price_l) || 0 
  } : { small: 0, medium: 0, large: 0 };
  
  const basePrice = product ? (hasVariants ? sizePrices[size] : (Number(product.sale_price) || Number(product.price))) : 0;
  
  const relatedPrice = selectedRelatedItems.reduce((sum, item) => {
    if (item._configured) return sum + Number(item._configured.configuredPrice);
    return sum + Number(item.sale_price || item.price);
  }, 0);
  
  const totalPrice = basePrice + modifiersPrice + relatedPrice;

  const availableSizes = [];
  if (product && (Number(product.has_s) === 1 || product.has_s === true || product.has_s === 'true')) availableSizes.push('small');
  if (product && (Number(product.has_m) === 1 || product.has_m === true || product.has_m === 'true')) availableSizes.push('medium');
  if (product && (Number(product.has_l) === 1 || product.has_l === true || product.has_l === 'true')) availableSizes.push('large');

  const availableDough = [];
  if (product && (Number(product.has_traditional) === 1 || product.has_traditional === true || product.has_traditional === 'true')) availableDough.push('option1');
  if (product && (Number(product.has_thin) === 1 || product.has_thin === true || product.has_thin === 'true')) availableDough.push('option2');

  useEffect(() => {
    if (product && hasVariants) {
      if (availableSizes.length > 0 && !availableSizes.includes(size)) {
        setSize(availableSizes[0]);
      }
      if (availableDough.length > 0 && !availableDough.includes(dough)) {
        setDough(availableDough[0]);
      }
    }
  }, [product?.id, hasVariants, availableSizes.length, availableDough.length]);

  if (!isOpen || !product) return null;

  const handleAdd = () => {
    const modNames = selectedModifiers.map(m => m.name).join(', ');
    let fullName = product.name;
    
    if (hasVariants) {
      const sizeName = size === 'small' ? product.size_s_name : size === 'medium' ? product.size_m_name : product.size_l_name;
      const optionName = dough === 'option1' ? product.option_1_name : product.option_2_name;
      
      let variantText = '';
      if (availableDough.length > 0) {
        variantText = `${sizeName}, ${optionName}`;
      } else {
        variantText = `${sizeName}`;
      }
      fullName = `${product.name} (${variantText}${modNames ? `, + ${modNames}` : ''})`;
    } else {
      if (modNames) fullName = `${product.name} (+ ${modNames})`;
    }
    
    onAddToCart({
      ...product,
      id: `${product.id}-${size}-${dough}-${selectedModifiers.map(m => m.id).join('-')}`,
      name: fullName,
      price: basePrice + modifiersPrice,
    });

    selectedRelatedItems.forEach(relItem => {
      if (relItem._configured) {
        const conf = relItem._configured;
        const modsId = (conf.modifiers || []).map(m => m.id).join('-');
        onAddToCart({
           ...relItem,
           id: `${relItem.id}-${conf.size || 'default'}-${conf.dough || 'default'}-${modsId}`,
           name: conf.configuredName,
           price: conf.configuredPrice
        });
      } else {
         onAddToCart({
           ...relItem,
           id: `${relItem.id}-default-default-`,
           name: relItem.name,
           price: relItem.sale_price || relItem.price
         });
      }
    });

    onClose();
  };

  return (
    <>
      <div 
        onClick={onClose}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 3000,
          backdropFilter: 'blur(8px)', display: 'flex',
          justifyContent: 'center', alignItems: isMobile ? 'flex-end' : 'center',
          animation: 'fadeIn 0.3s ease'
        }}
      >
        <div 
          onClick={(e) => e.stopPropagation()}
          className="glass"
          style={{
            width: isMobile ? '100%' : '900px',
            maxWidth: isMobile ? '100%' : '95vw',
            height: isMobile ? '92vh' : '640px',
            maxHeight: isMobile ? '92vh' : 'none',
            borderRadius: isMobile ? '32px 32px 0 0' : '40px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            position: 'relative',
            boxShadow: '0 30px 60px rgba(0,0,0,0.2)',
            animation: isMobile ? 'slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)' : 'scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        >
          {/* Кнопка закрытия для мобильных (всегда видна) */}
          {isMobile && (
            <button
              onClick={onClose}
              style={{
                position: 'absolute',
                top: '16px',
                right: '20px',
                zIndex: 20,
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                fontSize: '22px',
                color: 'var(--white)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 2px 12px rgba(0,0,0,0.2)'
              }}
            >×</button>
          )}

          {/* Индикатор свайпа (mobile bottom sheet handle) */}
          {isMobile && (
            <div style={{
              position: 'absolute',
              top: '12px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '40px',
              height: '4px',
              backgroundColor: '#E4E4EB',
              borderRadius: '2px',
              zIndex: 20
            }} />
          )}

          <div style={{
            flex: isMobile ? '0 0 38%' : '0 0 55%',
            position: 'relative',
            backgroundColor: 'rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}>
            <img 
              src={product.image} 
              alt={product.name} 
              style={{
                width: '80%',
                height: '80%',
                objectFit: 'contain',
                transition: 'transform 0.5s ease',
                filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.08))'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08) rotate(3deg)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1) rotate(0)'}
            />
            <div style={{
              position: 'absolute',
              width: '150%',
              height: '150%',
              background: 'radial-gradient(circle, rgba(255,102,0,0.03) 0%, transparent 60%)',
              zIndex: 1
            }} />
          </div>

          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            position: 'relative',
            backgroundColor: 'transparent'
          }}>
            <div style={{
              flex: 1,
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              padding: isMobile ? '20px 20px calc(100px + var(--safe-bottom)) 20px' : '40px 40px 100px 40px',
            }} className="no-scrollbar">
              <h2 style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: 800, marginBottom: '8px', color: 'var(--white)' }}>
                {product.name}
              </h2>
              <p style={{ color: 'var(--gray-text)', fontSize: '14px', lineHeight: '1.6', marginBottom: '32px' }}>
                {product.description}
              </p>

              <div>
                {hasVariants && availableSizes.length > 1 && (
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', color: 'var(--white)' }}>
                      {product.variants_label || 'Размер'}
                    </div>
                    <div style={{ display: 'flex', backgroundColor: 'rgba(255,255,255,0.05)', padding: '3px', borderRadius: '20px' }}>
                      {availableSizes.map(s => (
                        <button key={s} onClick={() => setSize(s)} style={{
                          flex: 1, padding: '10px', borderRadius: '18px', fontSize: '13px', fontWeight: 700,
                          background: size === s ? 'var(--primary-gradient)' : 'transparent',
                          color: size === s ? 'var(--white)' : 'var(--gray-text)',
                          border: 'none', cursor: 'pointer',
                          boxShadow: size === s ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                          transition: '0.2s'
                        }}>
                          {s === 'small' ? product.size_s_name : s === 'medium' ? product.size_m_name : product.size_l_name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {hasVariants && availableDough.length > 1 && (
                  <div style={{ marginBottom: '32px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', color: 'var(--white)' }}>
                      {product.option_label || 'Опция'}
                    </div>
                    <div style={{ display: 'flex', backgroundColor: 'rgba(255,255,255,0.05)', padding: '3px', borderRadius: '20px' }}>
                      {availableDough.map(d => (
                        <button key={d} onClick={() => setDough(d)} style={{
                          flex: 1, padding: '10px', borderRadius: '18px', fontSize: '13px', fontWeight: 700,
                          background: dough === d ? 'var(--primary-gradient)' : 'transparent',
                          color: dough === d ? 'var(--white)' : 'var(--gray-text)',
                          border: 'none', cursor: 'pointer',
                          boxShadow: dough === d ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                          transition: '0.2s'
                        }}>
                          {d === 'option1' ? product.option_1_name : product.option_2_name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {availableModifiers.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', color: 'var(--white)' }}>
                      Добавить ингредиенты
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '8px' }}>
                      {availableModifiers.map(m => (
                        <button 
                          key={m.id}
                          onClick={() => {
                            if (selectedModifiers.find(sm => sm.id === m.id)) {
                              setSelectedModifiers(selectedModifiers.filter(sm => sm.id !== m.id));
                            } else {
                              setSelectedModifiers([...selectedModifiers, m]);
                            }
                          }}
                          style={{
                            padding: '12px 8px',
                            borderRadius: '16px',
                            fontSize: '11px',
                            fontWeight: 700,
                            textAlign: 'center',
                            border: selectedModifiers.find(sm => sm.id === m.id) ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)',
                            background: selectedModifiers.find(sm => sm.id === m.id) ? 'rgba(255, 51, 102, 0.1)' : 'rgba(255,255,255,0.05)',
                            boxShadow: selectedModifiers.find(sm => sm.id === m.id) ? '0 4px 12px rgba(255, 105, 0, 0.15)' : 'none',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            cursor: 'pointer',
                            transition: '0.2s'
                          }}
                        >
                          <span style={{ color: 'var(--white)' }}>{m.name}</span>
                          <span style={{ color: 'var(--primary)' }}>{m.price} {currencySymbol}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {relatedItems.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', color: 'var(--white)' }}>
                      Добавить к заказу
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {relatedItems.map(item => {
                        const isSelected = selectedRelatedItems.some(i => i.id === item.id);
                        const itemName = item._configured ? item._configured.configuredName : item.name;
                        const itemPrice = item._configured ? item._configured.configuredPrice : (item.sale_price || item.price);
                        
                        return (
                          <label 
                            key={item.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              backgroundColor: isSelected ? 'rgba(255, 51, 102, 0.1)' : 'rgba(255,255,255,0.05)',
                              borderRadius: '16px',
                              padding: '12px',
                              cursor: 'pointer',
                              border: isSelected ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)',
                              transition: '0.2s'
                            }}
                          >
                            <input 
                              type="checkbox" 
                              checked={isSelected}
                              onChange={e => {
                                if (e.target.checked) setSelectedRelatedItems([...selectedRelatedItems, item]);
                                else setSelectedRelatedItems(selectedRelatedItems.filter(i => i.id !== item.id));
                              }}
                              style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }}
                            />
                            {item.image && (
                              <img 
                                src={item.image.startsWith('http') ? item.image : API_URL.replace('/api', '') + item.image} 
                                alt={itemName} 
                                style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '8px' }}
                              />
                            )}
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                               <span style={{ fontSize: '13px', fontWeight: 600, color: 'white', lineHeight: '1.2' }}>{itemName}</span>
                            </div>
                            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--primary)' }}>+{itemPrice} {currencySymbol}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div style={{ 
              position: 'absolute', bottom: 0, left: 0, right: 0,
              padding: '20px 20px calc(20px + var(--safe-bottom)) 20px',
              background: 'linear-gradient(to top, rgba(24, 26, 32, 1) 50%, rgba(24, 26, 32, 0))',
              borderTop: 'none',
              zIndex: 10
            }}>
              <button onClick={handleAdd} style={{
                width: '100%', background: 'var(--primary-gradient)', color: 'white',
                padding: '16px', borderRadius: '20px', fontWeight: 800, fontSize: '16px',
                border: 'none', cursor: 'pointer', boxShadow: '0 8px 20px rgba(255, 0, 77, 0.3)',
                transition: '0.2s transform'
              }}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                В корзину за {totalPrice} {currencySymbol}
              </button>
            </div>
          </div>
        </div>
        
        {!isMobile && (
          <button 
            onClick={onClose} 
            style={{ 
              position: 'absolute', top: '0', right: '-50px', 
              color: 'white', fontSize: '36px', background: 'none', 
              border: 'none', cursor: 'pointer', opacity: 0.8,
              transition: 'opacity 0.2s ease'
            }}
            onMouseOver={e => e.currentTarget.style.opacity = 1}
            onMouseOut={e => e.currentTarget.style.opacity = 0.8}
          >×</button>
        )}
      </div>
    </>
  );
};

export default ProductModal;
