import React from 'react';

const CategoryBar = ({ categories = [], activeCategory, setActiveCategory }) => {
  return (
    <>
      <style>{`
        .category-bar-sticky {
          position: -webkit-sticky;
          position: sticky;
          top: calc(var(--navbar-height, 85px) - 20px);
          z-index: 998;
          padding: 10px 0;
          margin-bottom: 30px;
        }
      `}</style>
      <div className="category-bar-sticky">
        <div className="container">
          <div className="glass" style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            padding: '8px',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow)',
            scrollbarWidth: 'none',
          }}>
            <style>
              {`
                .glass::-webkit-scrollbar { display: none; }
              `}
            </style>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  padding: '10px 24px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '15px',
                  fontWeight: 700,
                  background: activeCategory === cat.id ? 'var(--primary-gradient)' : 'transparent',
                  color: activeCategory === cat.id ? 'var(--white)' : 'var(--gray-text)',
                  border: 'none',
                  whiteSpace: 'nowrap',
                  transition: 'var(--transition)'
                }}
                onMouseEnter={(e) => {
                  if (activeCategory !== cat.id) {
                    e.currentTarget.style.background = 'var(--gray-light)';
                    e.currentTarget.style.color = 'var(--white)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeCategory !== cat.id) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--gray-text)';
                  }
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default CategoryBar;
