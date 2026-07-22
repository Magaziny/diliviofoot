import React from 'react';
import { Star, CheckCircle, XCircle, Edit, Trash2, Plus } from 'lucide-react';
import { API_HOST } from '../../config';

const ProductCard = ({ product, onEdit, onToggleAvailability, onDelete }) => (
  <div className="glass" style={{
    display: 'flex', flexDirection: 'column', padding: '16px',
    borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(255,255,255,0.02)',
    opacity: product.is_available ? 1 : 0.5, position: 'relative',
    transition: 'all 0.3s ease'
  }}>
    <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
      <img
        src={product.image && product.image.startsWith('http') ? product.image : `${API_HOST}${product.image || ''}`}
        style={{ width: '80px', height: '80px', borderRadius: '16px', objectFit: 'cover' }}
        alt={product.name}
      />
      <div style={{ flex: 1 }}>
        <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', color: 'white', lineHeight: '1.2', display: 'flex', alignItems: 'center', gap: '4px' }}>{product.is_popular ? <Star size={14} fill="currentColor" color="#E67E22" /> : ''}{product.name}</h4>
        <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--primary)' }}>{product.price} m</div>
      </div>
    </div>
    
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
      {onToggleAvailability && (
        <button
          onClick={onToggleAvailability}
          style={{ gridColumn: '1 / -1', fontSize: '13px', background: product.is_available ? 'rgba(39, 174, 96, 0.15)' : 'rgba(255, 255, 255, 0.05)', color: product.is_available ? '#2ecc71' : '#888', border: '1px solid ' + (product.is_available ? 'rgba(39,174,96,0.3)' : 'rgba(255,255,255,0.1)'), padding: '10px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
        >
          {product.is_available ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}><CheckCircle size={14} /> В наличии</span> : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}><XCircle size={14} /> Скрыт</span>}
        </button>
      )}
      <button onClick={onEdit} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '13px', background: 'rgba(74, 144, 226, 0.15)', color: '#7DBBFF', border: '1px solid rgba(74,144,226,0.3)', padding: '10px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>
        <Edit size={14} /> Ред.
      </button>
      <button onClick={onDelete} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '13px', background: 'rgba(255, 77, 77, 0.15)', color: '#ff6b6b', border: '1px solid rgba(255,77,77,0.3)', padding: '10px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>
        <Trash2 size={14} /> Удалить
      </button>
    </div>
  </div>
);

const MenuTab = ({
  products,
  categories,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onAddProduct,
  onAddProductToCategory,
  onEditProduct,
  onToggleAvailability,
  onDeleteProduct,
}) => {
  const noCategoryProducts = products.filter(p => !p.category || p.category === '');

  return (
    <>
      {/* Заголовок и кнопки */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Управление меню</h1>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={onAddCategory}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '12px 20px', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: '14px', fontWeight: 700, border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer' }}
          >
            <Plus size={16} /> Новая категория
          </button>
          <button
            onClick={() => onAddProduct(null)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '12px 24px', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '14px', fontWeight: 700, border: 'none', cursor: 'pointer' }}
          >
            <Plus size={16} /> Добавить товар
          </button>
        </div>
      </div>

      {/* Товары без категории */}
      {noCategoryProducts.length > 0 && (
        <div className="glass" style={{ marginBottom: '40px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '24px', padding: '20px', border: '1px solid rgba(255,165,0,0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '20px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><Star size={20} fill="#E67E22" color="#E67E22" /> Только рекомендации</h2>
              <span style={{ fontSize: '12px', color: '#E67E22', backgroundColor: '#FFF5EB', padding: '4px 8px', borderRadius: '6px' }}>
                {noCategoryProducts.length} товаров
              </span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '15px' }}>
            {noCategoryProducts.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                onEdit={() => onEditProduct(p)}
                onDelete={() => onDeleteProduct(p.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Категории с товарами */}
      {categories.map(category => {
        const categoryProducts = products.filter(p => p.category === category.id);
        return (
          <div key={category.id} className="glass" style={{ marginBottom: '30px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '24px', padding: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', flexWrap: 'wrap', gap: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <h2 style={{ fontSize: '20px', margin: 0 }}>{category.name}</h2>
                <span style={{ fontSize: '12px', color: '#BBB', backgroundColor: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '6px' }}>
                  {categoryProducts.length} товаров
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => onEditCategory(category)}
                  style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: 'white', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Ред.
                </button>
                <button
                  onClick={() => onAddProductToCategory(category.id)}
                  style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', backgroundColor: 'rgba(39, 174, 96, 0.2)', color: '#2ecc71', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                >
                  <Plus size={14} /> Товар
                </button>
                <button
                  onClick={() => onDeleteCategory(category.id)}
                  style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', backgroundColor: 'rgba(255, 77, 77, 0.2)', color: '#ff6b6b', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Удалить
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '15px' }}>
              {categoryProducts.map(p => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onEdit={() => onEditProduct(p)}
                  onToggleAvailability={() => onToggleAvailability(p.id, p.is_available)}
                  onDelete={() => onDeleteProduct(p.id)}
                />
              ))}
              {categoryProducts.length === 0 && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '18px', color: '#888' }}>
                  В этой категории пока нет товаров
                </div>
              )}
            </div>
          </div>
        );
      })}

      {categories.length === 0 && (
        <div className="glass" style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h3>Меню пока пусто</h3>
          <p style={{ color: '#888' }}>Начните с создания первой категории</p>
          <button
            onClick={onAddCategory}
            style={{ padding: '12px 24px', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '14px', fontWeight: 700, border: 'none', marginTop: '20px', cursor: 'pointer' }}
          >
            Создать категорию
          </button>
        </div>
      )}
    </>
  );
};

export default MenuTab;
