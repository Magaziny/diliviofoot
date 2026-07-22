import React, { useState, useEffect } from 'react';
import { API_URL, API_HOST } from '../config';

const Countdown = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const diff = new Date(targetDate) - new Date();
      return diff > 0 ? Math.floor(diff / 1000) : 0;
    };
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const h = Math.floor(timeLeft / 3600).toString().padStart(2, '0');
  const m = Math.floor((timeLeft % 3600) / 60).toString().padStart(2, '0');
  const s = (timeLeft % 60).toString().padStart(2, '0');

  return (
    <div className="countdown-badge">
      ⏳ Скидка сгорит через <span>{h}:{m}:{s}</span>
    </div>
  );
};

const Hero = () => {
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  // Безопасная инициализация для SSR-совместимости
  const [isMobile, setIsMobile] = useState(() => 
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const res = await fetch(`${API_URL}/hero-slides`);
        const data = await res.json();
        if (data.length > 0) {
          setSlides(data.map(s => ({
            ...s,
            image: s.image
              ? (s.image.startsWith('http') ? s.image : `${API_HOST}${s.image}`)
              : ''
          })));
        }
      } catch (e) {
        console.error('Ошибка загрузки слайдов:', e);
      }
    };
    fetchSlides();

    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    // Используем переменную для хранения ref на setTimeout, чтобы его очистить при размонтировании
    let slideTimeoutId = null;
    const timer = setInterval(() => {
      setIsExiting(true);
      slideTimeoutId = setTimeout(() => {
        setCurrentSlide(prev => (prev + 1) % slides.length);
        setIsExiting(false);
      }, 500);
    }, 6000);
    return () => {
      clearInterval(timer);
      if (slideTimeoutId) clearTimeout(slideTimeoutId); // Устраняем memory leak
    };
  }, [slides]);

  const handleMouseMove = (e) => {
    if (isMobile) return;
    const { clientX, clientY, currentTarget } = e;
    const rect = currentTarget.getBoundingClientRect();
    const x = ((clientX - rect.left) - rect.width / 2) / 40;
    const y = ((clientY - rect.top) - rect.height / 2) / 40;
    setMousePos({ x, y });
  };

  if (slides.length === 0) return null;
  const slide = slides[currentSlide];

  // Dynamic particles based on slide.particles text
  const presetPositions = [
    { size: 35, top: '15%', left: '45%', delay: '0s', px: 1.5, py: -1.2 },
    { size: 45, top: '75%', left: '50%', delay: '1s', px: -1.5, py: 1.5 },
    { size: 40, top: '25%', left: '85%', delay: '0.5s', px: 2, py: 1.2 },
    { size: 50, top: '80%', left: '80%', delay: '1.5s', px: -1.2, py: -1.8 },
    { size: 35, top: '50%', left: '92%', delay: '0.2s', px: 1.1, py: 1.1 },
    { size: 30, top: '35%', left: '60%', delay: '0.8s', px: 1.3, py: -1.3 },
    { size: 40, top: '65%', left: '35%', delay: '0.4s', px: -1.1, py: -1.1 },
  ];

  let particles = [];
  if (slide.particles) {
    const items = slide.particles.split(',').map(s => s.trim()).filter(Boolean);
    particles = items.map((item, idx) => ({
      emoji: item,
      ...presetPositions[idx % presetPositions.length]
    }));
  }

  return (
    <>
      <style>{`
        /* Свечение */
        @keyframes ambientGlow {
          0% { filter: blur(60px) opacity(0.4); transform: scale(1); }
          50% { filter: blur(80px) opacity(0.7); transform: scale(1.1); }
          100% { filter: blur(60px) opacity(0.4); transform: scale(1); }
        }

        /* Анимации входа и выхода текста */
        @keyframes textFadeUpIn {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes textFadeUpOut {
          0% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-30px); }
        }

        /* Анимации входа и выхода пиццы */
        @keyframes pizzaRollIn {
          0% { opacity: 0; transform: translateX(100%) rotate(45deg) scale(0.5); }
          100% { opacity: 1; transform: translateX(0) rotate(0deg) scale(1); }
        }
        @keyframes pizzaRollOut {
          0% { opacity: 1; transform: translateX(0) rotate(0deg) scale(1); }
          100% { opacity: 0; transform: translateX(-100%) rotate(-45deg) scale(0.5); }
        }

        /* Парящие частицы */
        @keyframes floatParticle {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(15deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        
        /* Свечение и магнитный эффект кнопки */
        .magnetic-btn {
          position: relative;
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .magnetic-btn:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 15px 30px rgba(255, 0, 77, 0.4);
        }
        .magnetic-btn::after {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 50%; height: 100%;
          background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%);
          transform: skewX(-25deg);
          animation: btnGlare 3s infinite;
        }
        @keyframes btnGlare {
          0% { left: -100%; }
          20% { left: 200%; }
          100% { left: 200%; }
        }

        /* Таймер акций */
        .countdown-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 0, 77, 0.1);
          border: 1px solid rgba(255, 0, 77, 0.3);
          padding: 8px 16px;
          border-radius: 12px;
          margin-bottom: 16px;
          color: var(--primary);
          font-weight: 800;
          font-size: 14px;
        }
        .countdown-badge span {
          font-family: monospace;
          font-size: 16px;
          background: var(--primary-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .anim-enter-text { animation: textFadeUpIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        .anim-exit-text { animation: textFadeUpOut 0.4s cubic-bezier(0.7, 0, 0.84, 0) forwards; }
        .anim-enter-img { animation: pizzaRollIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; opacity: 0; }
        .anim-exit-img { animation: pizzaRollOut 0.4s cubic-bezier(0.7, 0, 0.84, 0) forwards; }
      `}</style>

      <div 
        onMouseMove={handleMouseMove}
        style={{
          margin: isMobile ? '10px 0 20px' : '20px 0 40px',
          height: isMobile ? 'auto' : '480px',
          minHeight: isMobile ? '420px' : 'unset',
          background: 'var(--dark-surface)',
          borderRadius: isMobile ? '24px' : '40px',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: isMobile ? 'column-reverse' : 'row',
          alignItems: 'center',
          padding: isMobile ? '40px 20px' : '0'
        }}
      >
        {/* Floating Particles over the entire slide */}
        {!isMobile && particles.map((p, i) => (
          <div key={`particle-${i}`} style={{
            position: 'absolute',
            top: p.top, left: p.left,
            fontSize: `${p.size}px`,
            filter: 'blur(1.5px) drop-shadow(0 15px 25px rgba(0,0,0,0.3))',
            zIndex: 10,
            pointerEvents: 'none',
            transform: `translate(${mousePos.x * p.px}px, ${mousePos.y * p.py}px)`,
            transition: 'transform 0.1s ease-out'
          }}>
            <div style={{ animation: `floatParticle 3s infinite ease-in-out ${p.delay}` }}>
              {p.emoji}
            </div>
          </div>
        ))}

        {/* Dynamic Ambient Glow */}
        <div style={{
          position: 'absolute',
          top: '50%', right: isMobile ? '50%' : '25%',
          transform: 'translate(50%, -50%)',
          width: '350px', height: '350px',
          background: 'radial-gradient(circle, rgba(255,100,0,0.5) 0%, rgba(255,0,0,0) 70%)',
          borderRadius: '50%',
          zIndex: 0,
          animation: 'ambientGlow 4s infinite ease-in-out',
          pointerEvents: 'none'
        }} />

        <div className="container" style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          gap: isMobile ? '20px' : '0',
          zIndex: 1
        }}>
          {/* Text Side */}
          <div style={{ 
            flex: isMobile ? '1' : '0 0 50%', 
            textAlign: isMobile ? 'center' : 'left' 
          }}>
            <div key={`text-${currentSlide}`} className={isExiting ? 'anim-exit-text' : 'anim-enter-text'} style={{ animationDelay: isExiting ? '0s' : '0.1s' }}>
              
              {/* Показываем таймер, если задано время */}
              {slide.countdown_to && (
                <Countdown targetDate={slide.countdown_to} />
              )}

              <h1 style={{ 
                fontSize: isMobile ? '36px' : '64px', 
                lineHeight: '1.05', 
                marginBottom: '16px',
                fontFamily: 'Outfit',
                fontWeight: 900
              }}>
                {slide.title}
              </h1>
            </div>

            <div key={`sub-${currentSlide}`} className={isExiting ? 'anim-exit-text' : 'anim-enter-text'} style={{ animationDelay: isExiting ? '0s' : '0.2s' }}>
              <p style={{ 
                fontSize: isMobile ? '15px' : '20px', 
                color: 'var(--gray-text)', 
                marginBottom: isMobile ? '24px' : '36px',
                lineHeight: '1.4'
              }}>
                {slide.subtitle}
              </p>
            </div>

            <div key={`btn-${currentSlide}`} className={isExiting ? 'anim-exit-text' : 'anim-enter-text'} style={{ animationDelay: isExiting ? '0s' : '0.3s' }}>
              <button className="magnetic-btn" onClick={() => {
                // Скролл к секции меню
                const menuEl = document.querySelector('.category-bar-sticky');
                if (menuEl) {
                  menuEl.scrollIntoView({ behavior: 'smooth' });
                }
              }} style={{
                background: 'var(--primary-gradient)',
                color: 'var(--white)',
                padding: isMobile ? '14px 36px' : '18px 48px',
                borderRadius: '24px',
                fontWeight: 800,
                fontSize: isMobile ? '16px' : '20px',
                border: 'none',
                boxShadow: '0 10px 25px rgba(255, 0, 77, 0.3)',
                cursor: 'pointer'
              }}>
                Заказать {slide.price}
              </button>
            </div>
          </div>

          {/* Image Side */}
          <div style={{ 
            flex: isMobile ? '1' : '0 0 50%', 
            display: 'flex', 
            justifyContent: 'center',
            position: 'relative',
            width: '100%',
            height: isMobile ? '250px' : '450px'
          }}>
            {/* Main Pizza Image */}
            <div key={`img-${currentSlide}`} className={isExiting ? 'anim-exit-img' : 'anim-enter-img'} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 3
            }}>
              <img 
                src={slide.image} 
                alt={slide.title}
                style={{
                  width: isMobile ? '250px' : '450px',
                  height: isMobile ? '250px' : '450px',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 25px 40px rgba(0,0,0,0.4))',
                  transform: isMobile ? 'none' : `translate(${mousePos.x}px, ${mousePos.y}px)`,
                  transition: 'transform 0.1s ease-out'
                }}
              />
            </div>
          </div>
        </div>

        {/* Dots */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '8px',
          zIndex: 4
        }}>
          {slides.map((_, idx) => (
            <div
              key={idx}
              onClick={() => {
                // Кликабельные точки для переключения слайдов
                setIsExiting(true);
                setTimeout(() => {
                  setCurrentSlide(idx);
                  setIsExiting(false);
                }, 400);
              }}
              style={{
                width: currentSlide === idx ? '32px' : '8px',
                height: '8px',
                background: currentSlide === idx ? 'var(--primary)' : 'rgba(255,255,255,0.2)',
                borderRadius: '4px',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                cursor: 'pointer'
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default Hero;
