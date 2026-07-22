import React, { useState } from 'react';
import { Edit, Sparkles, Star } from 'lucide-react';
import { API_URL } from '../../config';

const ModalWrapper = ({ children, onClose }) => (
  <div style={{
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', display: 'flex',
    justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px'
  }}>
    <div className="glass" style={{
      backgroundColor: 'rgba(20,20,25,0.9)', padding: '40px', borderRadius: '32px',
      width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', position: 'relative',
      border: '1px solid rgba(255,255,255,0.1)', color: 'white'
    }}>
      {children}
    </div>
  </div>
);

const formInput = { width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', boxSizing: 'border-box' };
const labelStyle = { display: 'block', marginBottom: '8px', fontWeight: 600, color: 'rgba(255,255,255,0.9)' };

const ProductForm = ({
  isOpen,
  onClose,
  editingProduct,
  formData,
  setFormData,
  formTab,
  setFormTab,
  imageFile,
  setImageFile,
  modifiers,
  productModifiers,
  setProductModifiers,
  quickModData,
  setQuickModData,
  onQuickAddModifier,
  onSubmit,
  categories,
  allProducts = [],
}) => {
  const [configModals, setConfigModals] = useState({ isOpen: false, product: null, size: 'medium', dough: 'option1', selectedModifiers: [], availableModifiers: [], sizes: [], doughs: [] });

  const handleCheckRelated = async (p, checked) => {
    const current = formData.related_products || [];
    if (!checked) {
      setFormData({ ...formData, related_products: current.filter(item => (typeof item === 'object' ? item.id !== p.id : item !== p.id)) });
      return;
    }
    
    let availableModifiers = [];
    try {
      const res = await fetch(`${API_URL}/products/${p.id}/modifiers`);
      if (res.ok) availableModifiers = await res.json();
    } catch (e) {}

    const hasVariants = !!p.has_variants;
    if (!hasVariants && availableModifiers.length === 0) {
      const basePrice = p.sale_price || p.price;
      const newRec = { id: p.id, configured: true, size: null, dough: null, modifiers: [], configuredName: p.name, configuredPrice: Number(basePrice) };
      setFormData(prev => ({ ...prev, related_products: [...(prev.related_products || []), newRec] }));
    } else {
      const sizes = [];
      if (p.has_s) sizes.push('small');
      if (p.has_m) sizes.push('medium');
      if (p.has_l) sizes.push('large');
      const doughs = [];
      if (p.has_traditional) doughs.push('option1');
      if (p.has_thin) doughs.push('option2');

      setConfigModals({
        isOpen: true, product: p,
        size: sizes.length > 0 ? sizes[0] : 'medium',
        dough: doughs.length > 0 ? doughs[0] : 'option1',
        selectedModifiers: [], availableModifiers, sizes, doughs
      });
    }
  };

  const saveConfig = () => {
    const p = configModals.product;
    const hasVariants = !!p.has_variants;
    let basePrice = p.sale_price || p.price;
    let variantText = '';
    
    if (hasVariants) {
       const sizePrices = { small: p.price_s || 0, medium: p.price_m || 0, large: p.price_l || 0 };
       basePrice = sizePrices[configModals.size] || 0;
       
       const sizeName = configModals.size === 'small' ? p.size_s_name : configModals.size === 'medium' ? p.size_m_name : p.size_l_name;
       const doughName = configModals.dough === 'option1' ? p.option_1_name : p.option_2_name;
       
       if (configModals.doughs.length > 0) {
         variantText = `${sizeName}, ${doughName}`;
       } else {
         variantText = `${sizeName}`;
       }
    }
    
    const modsPrice = configModals.selectedModifiers.reduce((sum, m) => sum + m.price, 0);
    const configuredPrice = Number(basePrice) + modsPrice;
    const modNames = configModals.selectedModifiers.map(m => m.name).join(', ');
    
    let configuredName = p.name;
    if (hasVariants) {
      configuredName = `${p.name} (${variantText}${modNames ? `, + ${modNames}` : ''})`;
    } else if (modNames) {
      configuredName = `${p.name} (+ ${modNames})`;
    }

    const newRec = {
      id: p.id, configured: true, size: configModals.size, dough: configModals.dough,
      modifiers: configModals.selectedModifiers, configuredName, configuredPrice
    };

    const current = formData.related_products || [];
    setFormData({ ...formData, related_products: [...current, newRec] });
    setConfigModals({ ...configModals, isOpen: false });
  };

  if (!isOpen) return null;

  return (
    <ModalWrapper onClose={onClose}>
      <h2 style={{ marginBottom: '24px', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>{editingProduct ? <><Edit size={24} /> Редактировать</> : <><Sparkles size={24} /> Добавить</>} товар</h2>

      {/* Табы формы */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '25px', overflowX: 'auto' }}>
        {[
          { key: 'general', label: 'Общее' },
          { key: 'variants', label: 'Варианты и цены' },
          { key: 'modifiers', label: 'Добавки' },
          { key: 'related', label: 'Рекомендации' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFormTab(tab.key)}
            style={{
              padding: '10px 20px', border: 'none', background: 'none',
              borderBottom: formTab === tab.key ? '3px solid var(--primary)' : '3px solid transparent',
              fontWeight: 700, color: formTab === tab.key ? 'var(--primary)' : '#888', cursor: 'pointer'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit}>
        <div className="hide-scrollbar" style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '10px' }}>

          {/* --- Общее --- */}
          {formTab === 'general' && (
            <>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Название</label>
                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={formInput} required />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Категория</label>
                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} style={{ ...formInput, outline: 'none' }}>
                  <option value="" style={{ color: 'black' }}>— Без категории —</option>
                  {categories.map(c => <option key={c.id} value={c.id} style={{ color: 'black' }}>{c.name}</option>)}
                </select>
                {!formData.category && <p style={{ fontSize: '12px', color: '#BBB', marginTop: '6px' }}>Товар без категории не отображается в ленте, но может появляться в «Часто заказывают»</p>}
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Описание</label>
                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} style={{ ...formInput, height: '100px', resize: 'none' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={labelStyle}>Базовая цена (m)</label>
                  <input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} style={formInput} required />
                </div>
                <div>
                  <label style={labelStyle}>Цена по акции (m)</label>
                  <input type="number" value={formData.sale_price} onChange={e => setFormData({ ...formData, sale_price: e.target.value })} style={formInput} placeholder="Оставьте пустым" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {[
                  { key: 'is_available', label: 'В наличии' },
                  { key: 'show_in_stories', label: 'В сторис' },
                ].map(({ key, label }) => (
                  <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}>
                    <input type="checkbox" checked={formData[key]} onChange={e => setFormData({ ...formData, [key]: e.target.checked })} />
                    {label}
                  </label>
                ))}
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, color: '#E67E22' }}>
                  <input type="checkbox" checked={formData.is_popular} onChange={e => setFormData({ ...formData, is_popular: e.target.checked })} />
                  <Star size={14} fill="currentColor" /> Часто заказывают
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, color: 'var(--primary)' }}>
                  <input type="checkbox" checked={formData.has_variants} onChange={e => setFormData({ ...formData, has_variants: e.target.checked })} />
                  Включить варианты (размеры/тесто)
                </label>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={labelStyle}>Изображение</label>
                <input type="file" onChange={e => setImageFile(e.target.files[0])} style={{ marginBottom: '10px', display: 'block', color: 'white' }} />
                <input type="text" placeholder="Или URL картинки" value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} style={formInput} />
              </div>
            </>
          )}

          {/* --- Варианты --- */}
          {formTab === 'variants' && (
            <>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '16px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <h3 style={{ marginTop: 0, fontSize: '16px', marginBottom: '15px' }}>Настройка вариантов</h3>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: 'rgba(255,255,255,0.9)' }}>Заголовок секции (напр: Размер, Объем, Вкус)</label>
                  <input type="text" value={formData.variants_label} onChange={e => setFormData({ ...formData, variants_label: e.target.value })} placeholder="Размер" style={formInput} />
                </div>
                <div style={{ display: 'grid', gap: '15px' }}>
                  {[
                    { checkKey: 'has_s', priceKey: 'price_s', nameKey: 'size_s_name', label: 'Вариант 1', placeholder: '25 см' },
                    { checkKey: 'has_m', priceKey: 'price_m', nameKey: 'size_m_name', label: 'Вариант 2', placeholder: '30 см' },
                    { checkKey: 'has_l', priceKey: 'price_l', nameKey: 'size_l_name', label: 'Вариант 3', placeholder: '35 см' },
                  ].map(({ checkKey, priceKey, nameKey, label, placeholder }) => (
                    <div key={checkKey} style={{ display: 'grid', gridTemplateColumns: '1fr', alignItems: 'center', gap: '10px', padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600 }}>
                        <input type="checkbox" checked={formData[checkKey]} onChange={e => setFormData({ ...formData, [checkKey]: e.target.checked })} />
                        {label}
                      </label>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <input type="number" placeholder="Цена" value={formData[priceKey]} disabled={!formData[checkKey]} onChange={e => setFormData({ ...formData, [priceKey]: e.target.value })} style={{ ...formInput, flex: 1, padding: '10px', opacity: formData[checkKey] ? 1 : 0.5 }} />
                        <input type="text" placeholder={`Название (${placeholder})`} value={formData[nameKey]} disabled={!formData[checkKey]} onChange={e => setFormData({ ...formData, [nameKey]: e.target.value })} style={{ ...formInput, flex: 2, padding: '10px', opacity: formData[checkKey] ? 1 : 0.5 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '16px', marginTop: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <h3 style={{ marginTop: 0, fontSize: '16px', marginBottom: '15px' }}>Дополнительные опции (подвыбор)</h3>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: 'rgba(255,255,255,0.9)' }}>Заголовок секции опций (напр: Тесто, Молоко, Помол)</label>
                  <input type="text" value={formData.option_label} onChange={e => setFormData({ ...formData, option_label: e.target.value })} placeholder="Тесто" style={formInput} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {[
                    { checkKey: 'has_traditional', nameKey: 'option_1_name', optLabel: 'Включить Опцию 1', placeholder: 'Традиционное' },
                    { checkKey: 'has_thin', nameKey: 'option_2_name', optLabel: 'Включить Опцию 2', placeholder: 'Тонкое' },
                  ].map(({ checkKey, nameKey, optLabel, placeholder }) => (
                    <div key={checkKey}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600, cursor: 'pointer', marginBottom: '8px' }}>
                        <input type="checkbox" checked={formData[checkKey]} onChange={e => setFormData({ ...formData, [checkKey]: e.target.checked })} />
                        {optLabel}
                      </label>
                      <input type="text" placeholder={`Название (${placeholder})`} value={formData[nameKey]} disabled={!formData[checkKey]} onChange={e => setFormData({ ...formData, [nameKey]: e.target.value })} style={{ ...formInput, opacity: formData[checkKey] ? 1 : 0.5 }} />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* --- Добавки --- */}
          {formTab === 'modifiers' && (
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontWeight: 600, display: 'block', marginBottom: '12px' }}>Доступные добавки для этого товара</label>

              {/* Быстрое создание */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', padding: '12px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px dashed var(--primary)', flexWrap: 'wrap' }}>
                <input type="text" placeholder="Название добавки" value={quickModData.name} onChange={e => setQuickModData({ ...quickModData, name: e.target.value })} style={{ flex: '1 1 120px', ...formInput, padding: '8px', fontSize: '13px' }} />
                <input type="number" placeholder="Цена" value={quickModData.price} onChange={e => setQuickModData({ ...quickModData, price: e.target.value })} style={{ flex: '0 0 80px', ...formInput, padding: '8px', fontSize: '13px' }} />
                <button type="button" onClick={onQuickAddModifier} style={{ padding: '8px 12px', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '8px', fontSize: '13px', fontWeight: 700, border: 'none', cursor: 'pointer' }}>+ Создать</button>
              </div>

              <div className="hide-scrollbar" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', maxHeight: '300px', overflowY: 'auto', padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                {modifiers.map(m => (
                  <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', backgroundColor: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <input
                      type="checkbox"
                      checked={productModifiers.includes(m.id)}
                      onChange={e => {
                        if (e.target.checked) setProductModifiers([...productModifiers, m.id]);
                        else setProductModifiers(productModifiers.filter(id => id !== m.id));
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      <span style={{ fontWeight: 600 }}>{m.name}</span>
                      <span style={{ color: 'var(--primary)', fontWeight: 700 }}>+{m.price} m</span>
                    </div>
                  </label>
                ))}
                {modifiers.length === 0 && <p style={{ textAlign: 'center', color: '#888', padding: '20px' }}>Сначала создайте добавки во вкладке "Добавки"</p>}
              </div>
            </div>
          )}

          {/* --- Рекомендации --- */}
          {formTab === 'related' && (
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontWeight: 600, display: 'block', marginBottom: '12px' }}>Часто заказывают с этим</label>
              <p style={{ fontSize: '13px', color: '#888', marginBottom: '16px' }}>Выберите товары, которые будут предлагаться к этому блюду перед добавлением в корзину.</p>

              <div className="hide-scrollbar" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', maxHeight: '400px', overflowY: 'auto', padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                {allProducts.filter(p => p.id !== editingProduct?.id).map(p => {
                  const current = formData.related_products || [];
                  const isChecked = current.some(item => (typeof item === 'object' ? item.id === p.id : item === p.id));
                  const configuredItem = current.find(item => typeof item === 'object' && item.id === p.id);
                  
                  return (
                    <div key={p.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={e => handleCheckRelated(p, e.target.checked)}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                          {p.image && <img src={p.image.startsWith('http') ? p.image : API_URL.replace('/api', '') + p.image} alt="" style={{ width: '30px', height: '30px', objectFit: 'cover', borderRadius: '6px' }} />}
                          <span style={{ fontWeight: 600 }}>{p.name}</span>
                          <span style={{ color: 'var(--primary)', fontWeight: 700, marginLeft: 'auto' }}>
                            от {p.sale_price || p.price} m
                          </span>
                        </div>
                      </label>
                      {configuredItem && (
                        <div style={{ paddingLeft: '24px', fontSize: '12px', color: '#BBB' }}>
                          <span style={{ display: 'block', color: 'var(--primary)' }}>Настроено: {configuredItem.configuredName}</span>
                          <span>Итоговая цена: {configuredItem.configuredPrice} m</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
          <button type="button" onClick={() => { onClose(); setFormTab('general'); }} style={{ flex: 1, padding: '14px', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: '12px', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
            Отмена
          </button>
          <button type="submit" style={{ flex: 1, padding: '14px', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '12px', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
            Сохранить
          </button>
        </div>
      </form>

      {/* Модалка настройки рекомендации */}
      {configModals.isOpen && configModals.product && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(20,20,25,0.95)', borderRadius: '32px', zIndex: 1100,
          display: 'flex', flexDirection: 'column', padding: '30px'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Настройка рекомендации</h3>
          <p style={{ fontWeight: 700, marginBottom: '16px' }}>{configModals.product.name}</p>
          
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '10px' }} className="hide-scrollbar">
            {configModals.sizes.length > 1 && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>{configModals.product.variants_label || 'Размер'}</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {configModals.sizes.map(s => (
                    <button key={s} type="button" onClick={() => setConfigModals({...configModals, size: s})} style={{
                      padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                      background: configModals.size === s ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                      color: 'white', fontWeight: 700
                    }}>
                      {s === 'small' ? configModals.product.size_s_name : s === 'medium' ? configModals.product.size_m_name : configModals.product.size_l_name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {configModals.doughs.length > 1 && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>{configModals.product.option_label || 'Опция'}</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {configModals.doughs.map(d => (
                    <button key={d} type="button" onClick={() => setConfigModals({...configModals, dough: d})} style={{
                      padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                      background: configModals.dough === d ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                      color: 'white', fontWeight: 700
                    }}>
                      {d === 'option1' ? configModals.product.option_1_name : configModals.product.option_2_name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {configModals.availableModifiers.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Добавки</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                  {configModals.availableModifiers.map(m => {
                    const isSelected = configModals.selectedModifiers.find(sm => sm.id === m.id);
                    return (
                      <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px', cursor: 'pointer' }}>
                        <input type="checkbox" checked={!!isSelected} onChange={e => {
                          if (e.target.checked) setConfigModals({...configModals, selectedModifiers: [...configModals.selectedModifiers, m]});
                          else setConfigModals({...configModals, selectedModifiers: configModals.selectedModifiers.filter(sm => sm.id !== m.id)});
                        }} />
                        <span style={{ flex: 1 }}>{m.name}</span>
                        <span style={{ color: 'var(--primary)', fontWeight: 700 }}>+{m.price} m</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
             <button type="button" onClick={() => {
               // If canceled, we also should remove it from related_products if it was just added
               const current = formData.related_products || [];
               setFormData({ ...formData, related_products: current.filter(item => (typeof item === 'object' ? item.id !== configModals.product.id : item !== configModals.product.id)) });
               setConfigModals({...configModals, isOpen: false});
             }} style={{ flex: 1, padding: '12px', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: '12px', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
               Отмена
             </button>
             <button type="button" onClick={saveConfig} style={{ flex: 1, padding: '12px', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '12px', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
               Сохранить
             </button>
          </div>
        </div>
      )}
    </ModalWrapper>
  );
};

export default ProductForm;
