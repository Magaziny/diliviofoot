import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';

// Субкомпоненты
import AdminLogin from './admin/AdminLogin';
import AdminSidebar from './admin/AdminSidebar';
import MenuTab from './admin/MenuTab';
import ModifiersTab from './admin/ModifiersTab';
import StaffTab from './admin/StaffTab';
import UsersTab from './admin/UsersTab';
import HeroTab from './admin/HeroTab';
import SettingsTab from './admin/SettingsTab';
import ProductForm from './admin/ProductForm';
import CategoryForm from './admin/CategoryForm';
import ModifierForm, { StaffForm, UserEditForm, HeroForm } from './admin/AdminForms';
import PromoTab from './admin/PromoTab';

// Дефолтное состояние формы товара
const DEFAULT_PRODUCT_FORM = {
  name: '', description: '', price: '', category: '', image: '',
  sale_price: '', is_available: false, show_in_stories: false,
  has_variants: true, price_s: 0, price_m: 0, price_l: 0,
  has_s: true, has_m: true, has_l: true, has_traditional: true, has_thin: true,
  size_s_name: '25 см', size_m_name: '30 см', size_l_name: '35 см',
  variants_label: 'Размер', option_label: 'Тесто',
  option_1_name: 'Традиционное', option_2_name: 'Тонкое', is_popular: false, related_products: []
};

const Admin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('adminToken'));
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [currentTab, setCurrentTab] = useState('menu');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Данные
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [staff, setStaff] = useState([]);
  const [modifiers, setModifiers] = useState([]);
  const [heroSlides, setHeroSlides] = useState([]);

  // Форма товара
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(DEFAULT_PRODUCT_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [formTab, setFormTab] = useState('general');
  const [productModifiers, setProductModifiers] = useState([]);
  const [quickModData, setQuickModData] = useState({ name: '', price: '' });

  // Форма категории
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryFormData, setCategoryFormData] = useState({ id: '', name: '' });

  // Форма добавки
  const [isModFormOpen, setIsModFormOpen] = useState(false);
  const [editingModifier, setEditingModifier] = useState(null);
  const [modFormData, setModFormData] = useState({ name: '', price: '' });

  // Форма сотрудника
  const [isStaffFormOpen, setIsStaffFormOpen] = useState(false);
  const [operatorData, setOperatorData] = useState({ username: '', password: '', role: 'operator' });

  // Форма клиента
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userFormData, setUserFormData] = useState({ username: '', phone: '', address: '', loyalty_points: 0 });

  // Форма hero-баннера
  const [isHeroFormOpen, setIsHeroFormOpen] = useState(false);
  const [editingHero, setEditingHero] = useState(null);
  const [heroFormData, setHeroFormData] = useState({ title: '', subtitle: '', price: '', image: '', particles: '', countdown_to: '' });
  const [heroImageFile, setHeroImageFile] = useState(null);

  // Настройки
  const [settingsData, setSettingsData] = useState({ username: 'admin', newPassword: '' });
  const [settingsMessage, setSettingsMessage] = useState('');
  const [generalSettings, setGeneralSettings] = useState({
    free_pizza_threshold: 5000, brand_name: 'Магазин', currency_symbol: 'm',
    free_delivery_threshold: 1000, delivery_price: 150,
    loyalty_progress_label: 'До бесплатной пиццы:', active_shift_operator: '',
    shift_transition_type: 'manual', auto_shift_time: '08:00'
  });

  const token = () => localStorage.getItem('adminToken');

  useEffect(() => {
    if (isLoggedIn) {
      fetchProducts(); fetchCategories(); fetchModifiers();
      fetchUsers(); fetchHeroSlides(); fetchSettings();
    }
  }, [isLoggedIn]);

  // Установка заднего фона
  useEffect(() => {
    if (generalSettings.background_url) {
      const bgUrl = generalSettings.background_url.startsWith('http') ? generalSettings.background_url : API_URL.replace('/api', '') + generalSettings.background_url;
      document.body.style.backgroundImage = `url('${bgUrl}')`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundAttachment = 'fixed';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundRepeat = 'no-repeat';
    } else {
      document.body.style.backgroundImage = 'none';
    }
  }, [generalSettings.background_url]);

  // --- Fetch helpers ---
  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_URL}/settings`);
      if (res.ok) {
        const data = await res.json();
        const loadedBrandName = data.brand_name || 'Магазин';
        setGeneralSettings(prev => ({ ...prev, ...Object.fromEntries(
          Object.entries(data).map(([k, v]) => [k, ['free_pizza_threshold','free_delivery_threshold','delivery_price'].includes(k) ? parseInt(v)||0 : v])
        )}));
        document.title = `Панель Управления | ${loadedBrandName}`;
      }
    } catch (e) { console.error('Ошибка загрузки настроек:', e); }
  };

  const fetchHeroSlides = async () => {
    const res = await fetch(`${API_URL}/hero-slides`);
    if (res.ok) setHeroSlides(await res.json());
  };

  const fetchModifiers = async () => {
    const res = await fetch(`${API_URL}/modifiers`);
    if (res.ok) setModifiers(await res.json());
  };

  const fetchProducts = async () => {
    const res = await fetch(`${API_URL}/products`);
    setProducts(await res.json());
  };

  const fetchCategories = async () => {
    const res = await fetch(`${API_URL}/categories`);
    setCategories(await res.json());
  };

  const fetchUsers = async () => {
    const res = await fetch(`${API_URL}/users`, { headers: { Authorization: `Bearer ${token()}` } });
    if (res.status === 401) { localStorage.removeItem('adminToken'); setIsLoggedIn(false); return; }
    if (res.ok) {
      const data = await res.json();
      setUsers(data.filter(u => u.role === 'customer'));
      setStaff(data.filter(u => u.role === 'operator' || u.role === 'admin' || u.role === 'courier'));
    }
  };

  // --- Auth ---
  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.token) { localStorage.setItem('adminToken', data.token); setIsLoggedIn(true); }
    else alert('Ошибка входа');
  };

  // --- Product CRUD ---
  const openEditProduct = async (p) => {
    setEditingProduct(p);
    setFormData({
      ...p, sale_price: p.sale_price || '',
      has_variants: p.has_variants !== undefined ? !!p.has_variants : true,
      price_s: p.price_s || 0, price_m: p.price_m || 0, price_l: p.price_l || 0,
      has_s: !!p.has_s, has_m: !!p.has_m, has_l: !!p.has_l,
      has_traditional: p.has_traditional !== undefined ? !!p.has_traditional : true,
      has_thin: p.has_thin !== undefined ? !!p.has_thin : true,
      size_s_name: p.size_s_name || '25 см', size_m_name: p.size_m_name || '30 см', size_l_name: p.size_l_name || '35 см',
      variants_label: p.variants_label || 'Размер', option_label: p.option_label || 'Тесто',
      option_1_name: p.option_1_name || 'Традиционное', option_2_name: p.option_2_name || 'Тонкое',
      is_popular: !!p.is_popular,
      related_products: p.related_products ? JSON.parse(p.related_products) : []
    });
    setFormTab('general');
    setIsFormOpen(true);
    const res = await fetch(`${API_URL}/products/${p.id}/modifiers`);
    const data = await res.json();
    setProductModifiers(data.map(m => m.id));
  };

  const openNewProduct = (categoryId = null) => {
    setEditingProduct(null);
    setFormData({ ...DEFAULT_PRODUCT_FORM, category: categoryId || '', is_available: !!categoryId });
    setProductModifiers([]);
    setFormTab('general');
    setIsFormOpen(true);
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(formData).forEach(([k, v]) => {
      if (k === 'related_products') {
        fd.append(k, JSON.stringify(v));
      } else {
        fd.append(k, v);
      }
    });
    if (imageFile) fd.append('image', imageFile);

    const url = editingProduct ? `${API_URL}/products/${editingProduct.id}` : `${API_URL}/products`;
    const method = editingProduct ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { Authorization: `Bearer ${token()}` }, body: fd });

    if (res.ok) {
      const prodId = editingProduct ? editingProduct.id : (await res.json()).id;
      await fetch(`${API_URL}/products/${prodId}/modifiers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ modifierIds: productModifiers })
      });
      setIsFormOpen(false); setEditingProduct(null);
      setFormData(DEFAULT_PRODUCT_FORM); setImageFile(null);
      fetchProducts();
    } else alert('Ошибка при сохранении');
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Удалить этот товар?')) return;
    const res = await fetch(`${API_URL}/products/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
    if (res.ok) fetchProducts();
  };

  const handleToggleAvailability = async (id, currentStatus) => {
    await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ is_available: !currentStatus })
    });
    fetchProducts();
  };

  const handleQuickAddModifier = async () => {
    if (!quickModData.name || !quickModData.price) return;
    const res = await fetch(`${API_URL}/modifiers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify(quickModData)
    });
    if (res.ok) {
      const newMod = await res.json();
      setModifiers([...modifiers, newMod]);
      setProductModifiers([...productModifiers, newMod.id]);
      setQuickModData({ name: '', price: '' });
    }
  };

  // --- Category CRUD ---
  const handleSubmitCategory = async (e) => {
    e.preventDefault();
    const url = editingCategory ? `${API_URL}/categories/${editingCategory.id}` : `${API_URL}/categories`;
    const method = editingCategory ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify(categoryFormData)
    });
    if (res.ok) {
      setIsCategoryFormOpen(false); setEditingCategory(null); setCategoryFormData({ id: '', name: '' });
      fetchCategories();
    } else {
      try { const d = await res.json(); alert(d.error || 'Ошибка при сохранении'); }
      catch { alert('Ошибка при сохранении'); }
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Удалить эту категорию? (Только если в ней нет товаров)')) return;
    const res = await fetch(`${API_URL}/categories/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
    if (res.ok) fetchCategories();
    else { try { const d = await res.json(); alert(d.error || 'Ошибка удаления'); } catch { alert('Ошибка удаления'); } }
  };

  // --- Modifier CRUD ---
  const handleSubmitModifier = async (e) => {
    e.preventDefault();
    const url = editingModifier ? `${API_URL}/modifiers/${editingModifier.id}` : `${API_URL}/modifiers`;
    const method = editingModifier ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify(modFormData)
    });
    if (res.ok) {
      setIsModFormOpen(false); setEditingModifier(null); setModFormData({ name: '', price: '' });
      fetchModifiers();
    }
  };

  const handleDeleteModifier = async (id) => {
    if (!window.confirm('Удалить эту добавку?')) return;
    await fetch(`${API_URL}/modifiers/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
    fetchModifiers();
  };

  // --- Staff CRUD ---
  const handleAddOperator = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/auth/add-staff`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify(operatorData)
    });
    if (res.ok) {
      setIsStaffFormOpen(false); setOperatorData({ username: '', password: '', role: 'operator' });
      showMessage('Сотрудник успешно добавлен!'); fetchUsers();
    } else alert('Ошибка при добавлении сотрудника');
  };

  const handleDeleteStaff = async (id) => {
    if (!window.confirm('Удалить этого сотрудника?')) return;
    await fetch(`${API_URL}/users/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
    fetchUsers();
  };

  // --- User CRUD ---
  const handleSubmitUser = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/users/${editingUser.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify(userFormData)
    });
    if (res.ok) { setIsUserFormOpen(false); setEditingUser(null); fetchUsers(); }
    else { try { const d = await res.json(); alert(d.error || 'Ошибка при сохранении'); } catch { alert('Ошибка при сохранении'); } }
  };

  // --- Hero CRUD ---
  const handleSubmitHero = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('title', heroFormData.title);
    fd.append('subtitle', heroFormData.subtitle || '');
    fd.append('price', heroFormData.price || '');
    fd.append('particles', heroFormData.particles || '');
    fd.append('countdown_to', heroFormData.countdown_to || '');
    if (heroImageFile) fd.append('image', heroImageFile);
    else fd.append('image', heroFormData.image || '');
    const url = editingHero ? `${API_URL}/hero-slides/${editingHero.id}` : `${API_URL}/hero-slides`;
    const method = editingHero ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { Authorization: `Bearer ${token()}` }, body: fd });
    if (res.ok) {
      setIsHeroFormOpen(false); setEditingHero(null);
      setHeroFormData({ title: '', subtitle: '', price: '', image: '', particles: '', countdown_to: '' }); setHeroImageFile(null);
      fetchHeroSlides();
    } else {
      alert('Ошибка при сохранении. Возможно, база данных еще не обновилась. Пожалуйста, перезапустите сервер (закройте консоль и запустите start.bat заново).');
    }
  };

  const handleDeleteHero = async (id) => {
    if (!confirm('Удалить этот баннер?')) return;
    const res = await fetch(`${API_URL}/hero-slides/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
    if (res.ok) fetchHeroSlides();
  };

  // --- Settings ---
  const showMessage = (msg) => { setSettingsMessage(msg); setTimeout(() => setSettingsMessage(''), 3000); };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/auth/update-admin`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ username: settingsData.username, password: settingsData.newPassword })
    });
    if (res.ok) { showMessage('Профиль обновлен!'); setSettingsData(d => ({ ...d, newPassword: '' })); }
  };

  const handleUpdateGeneralSettings = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/settings`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify(generalSettings)
    });
    if (res.status === 401) { localStorage.removeItem('adminToken'); setIsLoggedIn(false); alert('Сессия истекла.'); return; }
    if (res.ok) showMessage('Настройки обновлены!');
    else alert('Ошибка при обновлении настроек');
  };

  // --- Render ---
  if (!isLoggedIn) {
    return (
      <AdminLogin
        username={username} password={password}
        onUsernameChange={e => setUsername(e.target.value)}
        onPasswordChange={e => setPassword(e.target.value)}
        onSubmit={handleLogin}
      />
    );
  }

  const handleTabChange = (tab) => {
    setCurrentTab(tab);
    if (tab === 'menu') { fetchCategories(); fetchProducts(); }
    if (tab === 'modifiers') fetchModifiers();
    if (tab === 'staff' || tab === 'users') fetchUsers();
    if (tab === 'hero') fetchHeroSlides();
  };

  return (
    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', minHeight: '100vh', backgroundColor: 'transparent', color: 'white', position: 'relative' }}>
      {/* Декоративные блюры */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'rgba(255,102,0,0.15)', borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '40%', height: '40%', background: 'rgba(255,102,0,0.1)', borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none' }} />

      <AdminSidebar
        currentTab={currentTab}
        onTabChange={handleTabChange}
        onLogout={() => { localStorage.removeItem('adminToken'); setIsLoggedIn(false); }}
        brandName={generalSettings.brand_name}
      />

      <div style={{ flex: 1, padding: isMobile ? '20px 10px' : '40px', position: 'relative', zIndex: 1, overflowY: 'auto', height: isMobile ? 'auto' : '100vh', boxSizing: 'border-box' }}>
        {currentTab === 'menu' && (
          <MenuTab
            products={products} categories={categories}
            onAddCategory={() => { setEditingCategory(null); setCategoryFormData({ id: '', name: '' }); setIsCategoryFormOpen(true); }}
            onEditCategory={cat => { setEditingCategory(cat); setCategoryFormData(cat); setIsCategoryFormOpen(true); }}
            onDeleteCategory={handleDeleteCategory}
            onAddProduct={() => openNewProduct()}
            onAddProductToCategory={categoryId => openNewProduct(categoryId)}
            onEditProduct={openEditProduct}
            onToggleAvailability={handleToggleAvailability}
            onDeleteProduct={handleDeleteProduct}
          />
        )}
        {currentTab === 'modifiers' && (
          <ModifiersTab
            modifiers={modifiers}
            onAdd={() => { setEditingModifier(null); setModFormData({ name: '', price: '' }); setIsModFormOpen(true); }}
            onEdit={m => { setEditingModifier(m); setModFormData(m); setIsModFormOpen(true); }}
            onDelete={handleDeleteModifier}
          />
        )}
        {currentTab === 'staff' && (
          <StaffTab
            staff={staff}
            onAdd={() => { setOperatorData({ username: '', password: '', role: 'operator' }); setIsStaffFormOpen(true); }}
            onDelete={handleDeleteStaff}
          />
        )}
        {currentTab === 'users' && (
          <UsersTab
            users={users}
            onEdit={u => { setEditingUser(u); setUserFormData({ username: u.username || '', phone: u.phone || '', address: u.address || '', loyalty_points: u.loyalty_points || 0 }); setIsUserFormOpen(true); }}
          />
        )}
        {currentTab === 'hero' && (
          <HeroTab
            heroSlides={heroSlides}
            onAdd={() => { setEditingHero(null); setHeroFormData({ title: '', subtitle: '', price: '', image: '', particles: '', countdown_to: '' }); setIsHeroFormOpen(true); }}
            onEdit={slide => { setEditingHero(slide); setHeroFormData(slide); setIsHeroFormOpen(true); }}
            onDelete={handleDeleteHero}
          />
        )}
        {currentTab === 'settings' && (
          <SettingsTab
            generalSettings={generalSettings}
            onGeneralChange={(key, value) => setGeneralSettings(prev => ({ ...prev, [key]: value }))}
            onGeneralSubmit={handleUpdateGeneralSettings}
            settingsData={settingsData}
            onSettingsDataChange={(key, value) => setSettingsData(prev => ({ ...prev, [key]: value }))}
            onAdminProfileSubmit={handleUpdateSettings}
            settingsMessage={settingsMessage}
            staff={staff}
          />
        )}
        {currentTab === 'promo' && (
          <PromoTab />
        )}
      </div>

      {/* Модальные окна */}
      <ProductForm
        isOpen={isFormOpen} onClose={() => setIsFormOpen(false)}
        editingProduct={editingProduct}
        formData={formData} setFormData={setFormData}
        formTab={formTab} setFormTab={setFormTab}
        imageFile={imageFile} setImageFile={setImageFile}
        modifiers={modifiers}
        productModifiers={productModifiers} setProductModifiers={setProductModifiers}
        quickModData={quickModData} setQuickModData={setQuickModData}
        onQuickAddModifier={handleQuickAddModifier}
        onSubmit={handleSubmitProduct}
        categories={categories}
        allProducts={products}
      />
      <CategoryForm
        isOpen={isCategoryFormOpen} onClose={() => setIsCategoryFormOpen(false)}
        editingCategory={editingCategory}
        formData={categoryFormData}
        onChange={(key, value) => setCategoryFormData(prev => ({ ...prev, [key]: value }))}
        onSubmit={handleSubmitCategory}
      />
      <ModifierForm
        isOpen={isModFormOpen} onClose={() => setIsModFormOpen(false)}
        editingModifier={editingModifier}
        formData={modFormData}
        onChange={(key, value) => setModFormData(prev => ({ ...prev, [key]: value }))}
        onSubmit={handleSubmitModifier}
      />
      <StaffForm
        isOpen={isStaffFormOpen} onClose={() => setIsStaffFormOpen(false)}
        formData={operatorData}
        onChange={(key, value) => setOperatorData(prev => ({ ...prev, [key]: value }))}
        onSubmit={handleAddOperator}
      />
      <UserEditForm
        isOpen={isUserFormOpen} onClose={() => { setIsUserFormOpen(false); setEditingUser(null); }}
        formData={userFormData}
        onChange={(key, value) => setUserFormData(prev => ({ ...prev, [key]: value }))}
        onSubmit={handleSubmitUser}
      />
      <HeroForm
        isOpen={isHeroFormOpen} onClose={() => setIsHeroFormOpen(false)}
        editingHero={editingHero}
        formData={heroFormData}
        onChange={(key, value) => setHeroFormData(prev => ({ ...prev, [key]: value }))}
        heroImageFile={heroImageFile} setHeroImageFile={setHeroImageFile}
        onSubmit={handleSubmitHero}
      />
    </div>
  );
};

export default Admin;
