import React from 'react';

export const BinBack: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg 
      viewBox="0 0 300 250" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Back Wall - filled white to hide background elements behind it */}
      <path 
        d="M50 0 L250 0 L230 250 L70 250 Z" 
        fill="white" 
        stroke="black" 
        strokeWidth="2"
      />
      {/* Internal lines for depth suggestion (dashed) */}
      <line x1="60" y1="85" x2="240" y2="85" stroke="black" strokeWidth="1" strokeDasharray="6 6" opacity="0.5" />
      <line x1="65" y1="170" x2="235" y2="170" stroke="black" strokeWidth="1" strokeDasharray="6 6" opacity="0.5" />
    </svg>
  );
};

export const BinFront: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg 
      viewBox="0 0 300 250" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ pointerEvents: 'none' }} // Allow clicks to pass through to items inside if needed
    >
      {/* Front Outline - transparent fill to see inside */}
      <path 
        d="M50 0 L250 0 L230 250 L70 250 Z" 
        fill="transparent" 
        stroke="black" 
        strokeWidth="2"
      />
      {/* Optional: Vertical highlights to suggest glass/plastic */}
      <line x1="80" y1="20" x2="90" y2="230" stroke="#E0F7FA" strokeWidth="3" opacity="0.6" strokeLinecap="round" />
      <line x1="220" y1="20" x2="210" y2="230" stroke="#E0F7FA" strokeWidth="3" opacity="0.6" strokeLinecap="round" />
    </svg>
  );
};
