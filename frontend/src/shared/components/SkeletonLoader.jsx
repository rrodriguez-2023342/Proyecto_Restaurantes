import React, { useEffect } from 'react';

const SkeletonLoader = ({ 
  width = 'full', 
  height = '16', 
  borderRadius = 'md', 
  className = '',
  circle = false 
}) => {
  useEffect(() => {
    // Insert styles for shimmer effect only once
    if (!document.getElementById('skeleton-loader-styles')) {
      const style = document.createElement('style');
      style.id = 'skeleton-loader-styles';
      style.textContent = `
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        .skeleton-shimmer {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <div className={`
      ${circle ? 'h-[var(--height)] w-[var(--width)]' : `w-${width} h-${height}`} 
      bg-gray-200 
      rounded-${borderRadius} 
      overflow-hidden
      skeleton-shimmer
      ${className}
    `} style={{
      '--width': typeof width === 'string' && !width.includes('-') ? width : '100%',
      '--height': typeof height === 'string' && !height.includes('-') ? height : '1rem'
    }}></div>
  );
};

export default SkeletonLoader;