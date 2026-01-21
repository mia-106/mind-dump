import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface InspirationBubbleProps {
  text: string;
  isVisible: boolean;
  onClose: () => void;
  onClick?: () => void;
}

const InspirationBubble: React.FC<InspirationBubbleProps> = ({ 
  text, 
  isVisible, 
  onClose,
  onClick
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10, x: "-50%" }}
          animate={{ 
            opacity: 1, 
            y: [0, -6, 0],
            x: "-50%"
          }}
          exit={{ opacity: 0, scale: 0.9, x: "-50%" }}
          transition={{
            y: {
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            },
            opacity: { duration: 0.5 }
          }}
          className="absolute left-1/2 bottom-full mb-8 w-max max-w-[80vw] z-40 pointer-events-auto cursor-pointer"
          onClick={onClick}
        >
          <div className="relative bg-white border-2 border-black px-4 py-2 shadow-[4px_4px_0px_0px_#000000] group">
            {/* Close Button */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="absolute -top-3 -right-3 bg-white border-2 border-black rounded-full p-1 hover:bg-black hover:text-white transition-colors shadow-[2px_2px_0px_0px_#000000]"
            >
              <X className="w-3 h-3" />
            </button>

            {/* Content */}
            <p className="font-hand text-lg text-center leading-tight">
              {text}
            </p>

            {/* Patch to hide border seam */}
            <div className="absolute -bottom-[2px] left-1/2 -translate-x-1/2 w-4 h-[4px] bg-white z-20" />

            {/* Rounded Tail (Hand-drawn style) */}
            <div className="absolute -bottom-[9px] left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b-2 border-r-2 border-black rotate-45 rounded-br-[2px] z-10" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InspirationBubble;
