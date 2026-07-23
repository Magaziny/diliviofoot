import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import StoryBar from './components/StoryBar';
import Hero from './components/Hero';
import CategoryBar from './components/CategoryBar';
import ProductCard from './components/ProductCard';
import SkeletonCard from './components/SkeletonCard';
import Cart from './components/Cart';
import ProductModal from './components/ProductModal';
import BackgroundDecoration from './components/BackgroundDecoration';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import OrderTracker from './components/OrderTracker';

import { API_URL, API_HOST } from './config';

const subscribeUserToPush = async (token) => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
  try {
    const swRegistration = await navigator.serviceWorker.register('/sw.js');
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const keyRes = await fetch(`${API_URL}/push/public-key`);
      if (!keyRes.ok) return;
      const { publicKey } = await keyRes.json();
      
      const padding = '='.repeat((4 - publicKey.length % 4) % 4);
      const base64 = (publicKey + padding).replace(/\-/g, '+').replace(/_/g, '/');
      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);
      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }

      const subscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: outputArray
      });

      await fetch(`${API_URL}/push/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(subscription)
      });
    }
  } catch (e) {
    console.error('Push setup error:', e);
  }
};

function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('pizza');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      try {
        return JSON.parse(savedCart);
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });
  
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('userData');
    if (savedUser && savedUser !== "undefined") {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [settings, setSettings] = useState({
    free_pizza_threshold: 5000,
    brand_name: 'Магазин',
    currency_symbol: 'm',
    free_delivery_threshold: 1000,
    delivery_price: 150,
    loyalty_progress_label: 'До бесплатной пиццы:'
  });
  
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    // Проверка авторизации и синхронизация баллов лояльности при загрузке
    const token = localStorage.getItem('userToken');
    if (token) {
      fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => {
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            localStorage.removeItem('userToken');
            localStorage.removeItem('userData');
            setUser(null);
            return null;
          }
          throw new Error();
        }
        return res.json();
      })
      .then(data => {
        if (data) {
          if (!data.error) {
            setUser(data);
            localStorage.setItem('userData', JSON.stringify(data));
            subscribeUserToPush(token);
          } else {
            localStorage.removeItem('userToken');
            localStorage.removeItem('userData');
            setUser(null);
          }
        }
      })
      .catch(() => {
        const savedUser = localStorage.getItem('userData');
        if (savedUser && savedUser !== "undefined") {
          try {
            setUser(JSON.parse(savedUser));
            subscribeUserToPush(token);
          } catch (e) {
            localStorage.removeItem('userData');
          }
        }
      });
    } else {
      localStorage.removeItem('userData');
    }

    const fetchData = async () => {
      try {
        const [prodRes, catRes, settingsRes] = await Promise.all([
          fetch(`${API_URL}/products`),
          fetch(`${API_URL}/categories`),
          fetch(`${API_URL}/settings`).catch(() => null)
        ]);

        // Проверяем успешность ответов перед парсингом
        if (!prodRes.ok) throw new Error(`Products fetch failed: ${prodRes.status}`);
        if (!catRes.ok) throw new Error(`Categories fetch failed: ${catRes.status}`);

        const prodData = await prodRes.json();
        const catData = await catRes.json();
        
        if (settingsRes && settingsRes.ok) {
          const settingsData = await settingsRes.json();
          if (settingsData) {
            const loadedBrandName = settingsData.brand_name || 'Магазин';
            setSettings({
              free_pizza_threshold: parseInt(settingsData.free_pizza_threshold) || 5000,
              brand_name: loadedBrandName,
              currency_symbol: settingsData.currency_symbol || 'm',
              free_delivery_threshold: parseInt(settingsData.free_delivery_threshold) || 1000,
              delivery_price: parseInt(settingsData.delivery_price) || 150,
              loyalty_progress_label: settingsData.loyalty_progress_label || 'До бесплатной пиццы:',
              logo_url: settingsData.logo_url || '',
              logo_size: parseInt(settingsData.logo_size) || 40,
              background_url: settingsData.background_url || '',
              navbar_color: settingsData.navbar_color || '',
              navbar_opacity: settingsData.navbar_opacity !== undefined ? parseInt(settingsData.navbar_opacity) : 70
            });
            document.title = `${loadedBrandName} | Доставка вкусной еды`;
          }
        }
        
        const processedProducts = prodData.map(p => ({
          ...p,
          image: p.image
            ? (p.image.startsWith('http') ? p.image : `${API_HOST}${p.image}`)
            : ''
        }));

        setProducts(processedProducts);
        setCategories(catData);
        setTimeout(() => setLoading(false), 1000);
      } catch (error) {
        console.error("Fetch error:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Установка заднего фона
  useEffect(() => {
    if (settings.background_url) {
      const bgUrl = settings.background_url.startsWith('http') ? settings.background_url : API_HOST + settings.background_url;
      document.body.style.backgroundImage = `url('${bgUrl}')`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundAttachment = 'fixed';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundRepeat = 'no-repeat';
    } else {
      document.body.style.backgroundImage = 'none';
    }
  }, [settings.background_url]);

  // IntersectionObserver: автоматически обновляем activeCategory при скролле
  useEffect(() => {
    if (categories.length === 0 || loading) return;
    const observers = [];
    categories.forEach(cat => {
      const el = document.getElementById(cat.id);
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveCategory(cat.id);
          }
        },
        { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
      );
      observer.observe(el);
      observers.push(observer);
    });
    return () => observers.forEach(o => o.disconnect());
  }, [categories, loading]);

  // Фоновая синхронизация профиля пользователя для обновления бонусного баланса в реальном времени.
  // Зависимость [user?.id] — чтобы интервал НЕ пересоздавался при каждом обновлении данных профиля.
  const userId = user?.id;
  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (!token || !userId) return;

    const syncProfile = () => {
      fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error();
      })
      .then(data => {
        if (data && !data.error) {
          setUser(prev => {
            if (prev && prev.loyalty_points !== data.loyalty_points) {
              localStorage.setItem('userData', JSON.stringify(data));
              console.log(`[SYNC] Обновлен баланс лояльности: ${data.loyalty_points}`);
              return data;
            }
            return prev;
          });
        }
      })
      .catch(() => {});
    };

    // Периодический опрос раз в 30 секунд (вместо 10)
    const interval = setInterval(syncProfile, 30000);

    // Мгновенное обновление при возвращении на вкладку или получении фокуса
    const handleActivity = () => {
      if (document.visibilityState === 'visible') {
        syncProfile();
      }
    };

    document.addEventListener('visibilitychange', handleActivity);
    window.addEventListener('focus', handleActivity);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleActivity);
      window.removeEventListener('focus', handleActivity);
    };
  }, [userId]);

  const handleLogout = () => {
    const token = localStorage.getItem('userToken');
    const currentUser = user;
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    setUser(null);
    // Отписка Push-подписки на сервере при выходе из аккаунта
    if (token && currentUser) {
      fetch(`${API_URL}/push/unsubscribe`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(() => {});
    }
  };

  const scrollToCategory = (id) => {
    setSearchQuery('');
    const element = document.getElementById(id);
    if (element) {
      const offset = 140;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const addToCart = (product) => {
    setCartItems(prev => {
      // Нормализуем ID добавляемого товара для точного сравнения
      const targetId = String(product.id);
      const isCompoundId = targetId.includes('-');

      if (isCompoundId) {
        // Составной ID из модального окна — ищем точное совпадение
        const existing = prev.find(item => String(item.id) === targetId);
        if (existing) {
          return prev.map(item =>
            String(item.id) === targetId ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
        return [...prev, { ...product, quantity: product.quantity || 1 }];
      } else {
        // Простой ID — добавление прямо из карточки, ищем по product_id
        const existing = prev.find(item => String(item.id).startsWith(`${targetId}-`));
        if (existing) {
          return prev.map(item =>
            String(item.id).startsWith(`${targetId}-`) ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
        // Добавляем товар с чистым ID (без хардкода размера)
        return [...prev, { ...product, id: `${targetId}-direct`, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (id, delta) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeItem = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const handleRepeatOrder = (order) => {
    setCartItems(prev => {
      const newCart = [...prev];
      order.items.forEach(orderItem => {
        // Матчинг по product_id, а не по названию
        const baseProduct = products.find(p => p.id === orderItem.product_id);
        if (baseProduct) {
          const cartId = `${baseProduct.id}-repeat-${Date.now()}-${Math.random()}`;
          // Проверяем наличие в корзине по product_id
          const existingIdx = newCart.findIndex(i => {
            const itemProductId = String(i.id).split('-')[0];
            return itemProductId === String(orderItem.product_id);
          });
          if (existingIdx >= 0) {
            // Иммутабельное обновление: создаём новый объект вместо мутации
            newCart[existingIdx] = { ...newCart[existingIdx], quantity: newCart[existingIdx].quantity + orderItem.quantity };
          } else {
            newCart.push({
              ...baseProduct,
              id: cartId,
              name: orderItem.product_name,
              price: orderItem.price,
              quantity: orderItem.quantity
            });
          }
        }
      });
      return newCart;
    });
    setIsTrackerOpen(false);
    setIsCartOpen(true);
  };

  const searchedProducts = searchQuery 
    ? products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (p.description || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null;

  return (
    <div className="app">
      <BackgroundDecoration />
      <Navbar 
        cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)} 
        cartItems={cartItems}
        onCartOpen={() => setIsCartOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        user={user}
        onAuthOpen={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        freePizzaThreshold={settings.free_pizza_threshold}
        settings={settings}
        onTrackerOpen={() => setIsTrackerOpen(true)}
        theme={theme}
        toggleTheme={toggleTheme}
      />
      
      <main style={{ paddingBottom: 'calc(100px + var(--safe-bottom))' }}>
        {!searchQuery && (
          <>
            <div className="container">
              <Hero />
            </div>
            
            <StoryBar products={products} onStoryClick={(id) => {
              const product = products.find(p => p.id === id);
              if (product) setSelectedProduct(product);
            }} />
            
            <CategoryBar 
              categories={categories}
              activeCategory={activeCategory} 
              setActiveCategory={scrollToCategory} 
            />
          </>
        )}

        <div className="container">
          {loading ? (
            <div className="products-grid">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : (
            searchQuery ? (
              <section>
                <h2 className="section-title">Результаты поиска: «{searchQuery}»</h2>
                <div className="products-grid">
                  {searchedProducts.map(product => (
                    <ProductCard key={product.id} product={product} onAddToCart={() => addToCart(product)} onOpenModal={setSelectedProduct} currencySymbol={settings.currency_symbol} />
                  ))}
                </div>
              </section>
            ) : (
              categories.map(category => {
                const categoryProducts = products.filter(p => p.category === category.id && (p.is_available === 1 || p.is_available === true));
                if (categoryProducts.length === 0) return null;
                return (
                  <section key={category.id} id={category.id} style={{ scrollMarginTop: '150px' }}>
                    <h2 className="section-title">{category.name}</h2>
                    <div className="products-grid" style={{ marginBottom: '60px' }}>
                      {categoryProducts.map(product => (
                        <ProductCard key={product.id} product={product} onAddToCart={() => addToCart(product)} onOpenModal={setSelectedProduct} currencySymbol={settings.currency_symbol} />
                      ))}
                    </div>
                  </section>
                );
              })
            )
          )}
        </div>
      </main>

      <Cart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cartItems} 
        updateQuantity={updateQuantity} 
        removeItem={removeItem} 
        onAddToCart={addToCart} 
        user={user}
        onAuthOpen={() => { setIsCartOpen(false); setIsAuthOpen(true); }}
        clearCart={() => setCartItems([])}
        settings={settings}
        onUserUpdate={setUser}
        onCheckoutSuccess={() => setIsTrackerOpen(true)}
      />
      <ProductModal product={selectedProduct} isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={addToCart} currencySymbol={settings.currency_symbol} allProducts={products} onOpenProduct={setSelectedProduct} />
      
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onLogin={(userData) => {
          setUser(userData);
          const token = localStorage.getItem('userToken');
          if (token) subscribeUserToPush(token);
        }} 
      />

      <OrderTracker 
        isOpen={isTrackerOpen} 
        onClose={() => setIsTrackerOpen(false)} 
        user={user} 
        currencySymbol={settings.currency_symbol}
        onRepeatOrder={handleRepeatOrder}
      />

      <Footer brandName={settings.brand_name} />
    </div>
  );
}

export default App;
