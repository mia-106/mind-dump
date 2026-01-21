import React from 'react';
import { motion } from 'framer-motion';

interface PaperBallSvgProps {
  color: string;
  className?: string;
}

const PaperBallSvg: React.FC<PaperBallSvgProps> = ({ color, className }) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={className}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <motion.path
        d="M50 5 
           L85 20 L95 50 L85 80 
           L50 95 
           L15 80 L5 50 L15 20 
           Z"
        fill={color}
        stroke="black"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* Internal Creases */}
      <motion.path
        d="M50 50 L85 20 M50 50 L15 80 M50 50 L95 50 M50 50 L5 50"
        stroke="black"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default PaperBallSvg;
