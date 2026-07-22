import React, { useEffect, useState } from 'react';

const BackgroundDecoration = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: -1,
      overflow: 'hidden',
      pointerEvents: 'none'
    }}>
      {/* Large Blob 1 */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '-5%',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(255,102,0,0.05) 0%, rgba(255,255,255,0) 70%)',
        borderRadius: '50%',
        transform: `translateY(${scrollY * 0.15}px)`, // Двигается медленнее скролла
        transition: 'transform 0.1s linear'
      }} />

      {/* Large Blob 2 */}
      <div style={{
        position: 'absolute',
        top: '40%',
        right: '-10%',
        width: '800px',
        height: '800px',
        background: 'radial-gradient(circle, rgba(255,184,0,0.03) 0%, rgba(255,255,255,0) 70%)',
        borderRadius: '50%',
        transform: `translateY(${scrollY * -0.1}px)`, // Двигается в другую сторону
        transition: 'transform 0.1s linear'
      }} />

      {/* Smaller Accent 1 */}
      <div style={{
        position: 'absolute',
        top: '80%',
        left: '20%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(255,102,0,0.04) 0%, rgba(255,255,255,0) 70%)',
        borderRadius: '50%',
        transform: `translateY(${scrollY * 0.2}px)`,
        transition: 'transform 0.1s linear'
      }} />

      {/* Scattered particles/dots for texture */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: 'radial-gradient(rgba(0,0,0,0.01) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        opacity: 0.5
      }} />
    </div>
  );
};

export default BackgroundDecoration;
