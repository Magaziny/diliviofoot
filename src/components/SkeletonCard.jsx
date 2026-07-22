import React from 'react';

const SkeletonCard = () => {
  return (
    <div style={{
      backgroundColor: 'var(--white)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      border: '1px solid var(--gray-light)',
      overflow: 'hidden'
    }}>
      <div className="skeleton-pulse" style={{
        width: '100%',
        paddingBottom: '100%',
        backgroundColor: 'var(--dark-surface)',
        borderRadius: 'var(--radius-md)',
        marginBottom: '16px'
      }} />
      <div className="skeleton-pulse" style={{ width: '70%', height: '24px', backgroundColor: 'var(--gray-light)', borderRadius: '4px', marginBottom: '12px' }} />
      <div className="skeleton-pulse" style={{ width: '100%', height: '16px', backgroundColor: 'var(--gray-light)', borderRadius: '4px', marginBottom: '8px' }} />
      <div className="skeleton-pulse" style={{ width: '100%', height: '16px', backgroundColor: 'var(--gray-light)', borderRadius: '4px', marginBottom: '24px' }} />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
        <div className="skeleton-pulse" style={{ width: '80px', height: '24px', backgroundColor: 'var(--gray-light)', borderRadius: '4px' }} />
        <div className="skeleton-pulse" style={{ width: '100px', height: '36px', backgroundColor: 'var(--gray-light)', borderRadius: 'var(--radius-md)' }} />
      </div>

      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
          .skeleton-pulse {
            animation: pulse 1.5s ease-in-out infinite;
          }
        `}
      </style>
    </div>
  );
};

export default SkeletonCard;
