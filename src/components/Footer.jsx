import React from 'react';

const Footer = ({ brandName = 'Магазин' }) => {
  return (
    <footer style={{
      backgroundColor: 'var(--dark)',
      color: 'var(--white)',
      padding: '80px 0 40px',
      marginTop: '100px',
      borderTopLeftRadius: '60px',
      borderTopRightRadius: '60px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative element */}
      <div style={{
        position: 'absolute',
        top: '-100px',
        right: '-100px',
        width: '300px',
        height: '300px',
        background: 'rgba(255,102,0,0.05)',
        borderRadius: '50%',
        filter: 'blur(60px)'
      }} />

      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '40px',
          marginBottom: '60px'
        }}>
          {/* Brand */}
          <div style={{ gridColumn: 'span 1' }}>
            <div style={{ 
              fontSize: '28px', 
              fontWeight: 800, 
              marginBottom: '20px',
              fontFamily: 'Outfit'
            }}>
              {(() => {
                const parts = brandName.split(' ');
                if (parts.length > 1) {
                  return (
                    <>
                      <span style={{ color: 'var(--primary)' }}>{parts[0]}</span> {parts.slice(1).join(' ')}
                    </>
                  );
                }
                return <span style={{ color: 'var(--primary)' }}>{brandName}</span>;
              })()}
            </div>
            <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: '1.6', fontSize: '15px' }}>
              Самая быстрая доставка свежих блюд и горячих напитков в городе. Мы готовим с любовью и доставляем за 30 минут.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 style={{ marginBottom: '24px', fontSize: '18px' }}>Компания</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li><a href="#" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', transition: '0.3s' }}>О нас</a></li>
              <li><a href="#" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', transition: '0.3s' }}>Книга качества</a></li>
              <li><a href="#" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', transition: '0.3s' }}>Блог компании</a></li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <h4 style={{ marginBottom: '24px', fontSize: '18px' }}>Работа</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li><a href="#" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>В ресторане</a></li>
              <li><a href="#" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Водителем</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ marginBottom: '24px', fontSize: '18px' }}>Помощь</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li><a href="#" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Рестораны</a></li>
              <li><a href="#" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Контакты</a></li>
              <li style={{ marginTop: '10px' }}>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary)' }}>8 800 555-35-35</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Звонок бесплатный</div>
              </li>
            </ul>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.1)',
          paddingTop: '30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>
            © 2026 {brandName}. Все права защищены.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            {/* Telegram */}
            <a href="#" style={{ 
              color: 'rgba(255,255,255,0.5)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '44px', height: '44px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255,255,255,0.06)',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={e => { e.currentTarget.style.backgroundColor = 'rgba(255,107,0,0.2)'; e.currentTarget.style.color = '#FF6B00'; }}
            onMouseOut={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
            </a>
            {/* ВКонтакте */}
            <a href="#" style={{ 
              color: 'rgba(255,255,255,0.5)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '44px', height: '44px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255,255,255,0.06)',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={e => { e.currentTarget.style.backgroundColor = 'rgba(255,107,0,0.2)'; e.currentTarget.style.color = '#FF6B00'; }}
            onMouseOut={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.391 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4.03 8.57 4.03 8.096c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.677.863 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.203.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.254-1.406 2.151-3.574 2.151-3.574.119-.254.322-.491.762-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.49-.085.744-.576.744z"/>
              </svg>
            </a>
            {/* Instagram */}
            <a href="#" style={{ 
              color: 'rgba(255,255,255,0.5)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '44px', height: '44px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255,255,255,0.06)',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={e => { e.currentTarget.style.backgroundColor = 'rgba(255,107,0,0.2)'; e.currentTarget.style.color = '#FF6B00'; }}
            onMouseOut={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
