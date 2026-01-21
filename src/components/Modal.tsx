import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../utils/cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  type?: 'center' | 'bottom'; // center for history, bottom for input
  className?: string;
  bgColor?: string; // custom bg color
  style?: React.CSSProperties; // Allow custom styles (e.g. dynamic background color)
  customVariants?: any; // Allow overriding animations
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  type = 'center',
  className,
  bgColor = 'bg-white',
  style,
  customVariants
}) => {
  const defaultVariants = {
    initial: type === 'bottom' ? { y: '100%' } : { scale: 0.9, opacity: 0 },
    animate: type === 'bottom' ? { y: 0 } : { scale: 1, opacity: 1 },
    exit: type === 'bottom' ? { y: '100%' } : { scale: 0.9, opacity: 0 },
  };

  const variants = customVariants || defaultVariants;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={variants.initial}
            animate={variants.animate}
            exit={variants.exit}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={style}
            className={cn(
              'fixed z-50 shadow-soft-lg flex flex-col overflow-hidden',
              bgColor,
              type === 'bottom'
                ? 'bottom-0 left-0 right-0 rounded-t-soft-xl min-h-[50vh] max-h-[90vh]'
                : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[320px] rounded-soft-xl max-h-[80vh]',
              className
            )}
          >
            {/* Header */}
            {(title || type === 'center') && (
              <div className={cn(
                "flex items-center justify-between shrink-0",
                "bg-brand-yellow/10 p-5"
              )}>
                {title && <h2 className="text-2xl font-black uppercase">{title}</h2>}
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-black/10 rounded-lg transition-colors border-2 border-transparent hover:border-black"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            )}

            {/* Body */}
            <div className={cn("flex-1 overflow-y-auto min-h-0", type === 'center' ? "p-4" : "p-6")}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;
