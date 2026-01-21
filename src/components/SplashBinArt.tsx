/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { motion } from 'framer-motion';

export const SplashBinArt = () => {
  // Common stroke styles for decorations
  const decStroke = {
    strokeWidth: '2px',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
    transformBox: 'fill-box' as const,
    transformOrigin: 'center' as const,
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg
        viewBox="0 0 350 450"
        className="w-full h-full overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Thick hand-drawn stroke for the main bin */}
          <style>{`.lil-stroke { stroke: #000; stroke-width: 4px; stroke-linecap: round; stroke-linejoin: round; }`}</style>
          {/* Dashed line style */}
          <style>{`.dashed-stroke { stroke: #000; stroke-width: 2px; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 12 12; }`}</style>
          {/* Blue guide line style */}
          <style>{`.blue-line { stroke: #dbeafe; stroke-width: 3px; stroke-linecap: round; }`}</style>
          {/* Trash item stroke */}
          <style>{`.trash-stroke { stroke: #000; stroke-width: 2px; stroke-linecap: round; stroke-linejoin: round; }`}</style>
        </defs>

        {/* 1. 背景装饰 (New Dynamic Elements based on Reference) */}

        {/* Large Yellow Circle (Left) */}
        <motion.circle
          cx="10"
          cy="130"
          r="55"
          fill="#F4D03F"
          stroke="#000000"
          strokeWidth="2"
          animate={{ y: [0, -10, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Small Black Circle (Right) */}
        <motion.circle
          cx="350"
          cy="400"
          r="30"
          fill="#000000"
          animate={{ y: [0, 8, 0], x: [0, -5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />

        {/* 2. 垃圾桶硬阴影 (Hard Shadow) - Behind everything */}
        <path
          d="M84 184 L274 184 L254 424 L104 424 Z"
          fill="#000000"
        />

        {/* 3. 溢出的垃圾堆 (Overflowing Trash Pile) - Flat & Wide Layer */}
        <g id="trash-pile">
          {/* Row 1: Spanning the entire top width (approx x=90 to x=260) */}

          {/* Left Corner - Pink Triangle */}
          <path d="M90 180 L115 135 L140 180 Z" fill="#FFB7B2" className="trash-stroke" transform="rotate(-15 115 160)" />

          {/* Left-Mid - Green Square (Rotated) */}
          <rect x="125" y="145" width="50" height="40" fill="#A8D5BA" className="trash-stroke" transform="rotate(15 145 165)" />

          {/* Center - Blue Circle */}
          <circle cx="175" cy="155" r="30" fill="#89C4F4" className="trash-stroke" />

          {/* Right-Mid - Yellow Triangle (Inverted-ish) */}
          <path d="M190 180 L215 130 L240 180 Z" fill="#F4D03F" className="trash-stroke" transform="rotate(10 215 155)" />

          {/* Right Corner - Pink Polygon */}
          <path d="M235 180 L255 140 L285 150 L275 180 Z" fill="#FFB7B2" className="trash-stroke" transform="rotate(-5 260 160)" />
        </g>

        {/* 4. 垃圾桶主体 (Bin Body) - Opaque White covers bottom of trash */}
        <path
          d="M80 180 L270 180 L250 420 L100 420 Z"
          fill="#FFFFFF"
          className="lil-stroke"
        />

        {/* 5. 桶身细节 (Details on top of white body) */}
        {/* Vertical Blue Lines */}
        <line x1="115" y1="200" x2="125" y2="400" className="blue-line" />
        <line x1="235" y1="200" x2="225" y2="400" className="blue-line" />

        {/* Horizontal Dashed Lines */}
        <line x1="108" y1="260" x2="242" y2="260" className="dashed-stroke" />
        <line x1="118" y1="340" x2="232" y2="340" className="dashed-stroke" />
      </svg>
    </div>
  );
};
