import React from 'react';
import { cn } from '../utils/cn';

interface NeoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  // Keeping it simple as requested
}

const NeoButton: React.FC<NeoButtonProps> = ({
  children,
  className,
  onClick,
  ...props
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        // Layout
        'flex items-center justify-center cursor-pointer select-none',
        // Visuals
        'bg-brand-yellow border-2 border-black rounded-lg',
        // Shadow (Neo-Brutalism)
        'shadow-neo transition-all duration-200',
        // Hover State
        'hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]',
        // Active State (Physical press effect)
        'active:shadow-none active:translate-x-[4px] active:translate-y-[4px]',
        // Typography & Spacing
        'px-8 py-4 font-bold text-xl uppercase tracking-wider',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default NeoButton;
