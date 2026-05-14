import React, { useEffect } from 'react';

export const SkeletonLoader = ({ 
  variant = 'text', // 'text', 'avatar', 'rect', 'card'
  width = 'full', 
  height = '4', 
  className = '',
  count = 1
}) => {
  useEffect(() => {
    if (!document.getElementById('skeleton-shimmer-styles')) {
      const style = document.createElement('style');
      style.id = 'skeleton-shimmer-styles';
      style.textContent = `
        @keyframes shimmer-premium {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .shimmer-effect {
          background: linear-gradient(
            90deg, 
            #f8fafc 25%, 
            #f1f5f9 50%, 
            #f8fafc 75%
          );
          background-size: 200% 100%;
          animation: shimmer-premium 2s infinite linear;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const baseClass = "shimmer-effect overflow-hidden";
  
  const getVariantClasses = () => {
    switch (variant) {
      case 'avatar':
        return `rounded-full h-12 w-12 flex-shrink-0`;
      case 'card':
        return `rounded-3xl h-48 w-full`;
      case 'rect':
        return `rounded-2xl h-${height} w-${width}`;
      case 'text':
      default:
        return `rounded-full h-${height} w-${width}`;
    }
  };

  const items = Array.from({ length: count });

  return (
    <>
      {items.map((_, i) => (
        <div 
          key={i} 
          className={`${baseClass} ${getVariantClasses()} ${className}`}
        />
      ))}
    </>
  );
};

export default SkeletonLoader;