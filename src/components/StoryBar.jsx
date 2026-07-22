import React from 'react';

const StoryBar = ({ products = [], onStoryClick }) => {
  let stories = products
    .filter(p => (p.show_in_stories === 1 || p.show_in_stories === true) && (p.is_available === 1 || p.is_available === true))
    .map(p => ({
      id: p.id,
      productId: p.id,
      title: p.name,
      image: p.image
    }));

  if (stories.length === 0) return null;

  // Повторяем список 6 раз, чтобы лента была очень длинной и бесшовной
  const repeatFactor = 6;
  const displayStories = [];
  for (let i = 0; i < repeatFactor; i++) {
    displayStories.push(...stories);
  }

  return (
    <div style={{ 
      margin: '30px 0', 
      overflow: 'hidden',
      padding: '10px 0'
    }}>
      <div className="marquee-container">
        {displayStories.map((story, index) => (
          <div
            key={`${story.id}-${index}`}
            onClick={() => onStoryClick(story.productId)}
            style={{
              flex: '0 0 200px',
              height: '260px',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              position: 'relative',
              cursor: 'pointer',
              transition: 'var(--transition)',
              boxShadow: 'var(--shadow)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.03)';
              e.currentTarget.style.zIndex = '10';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.zIndex = '1';
            }}
          >
            <img
              src={story.image}
              alt={story.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '16px',
              background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
              color: 'var(--white)',
              fontSize: '16px',
              fontWeight: 700,
            }}>
              {story.title}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoryBar;
