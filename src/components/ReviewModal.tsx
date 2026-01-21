import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw, Trash2 } from 'lucide-react';
import { fetchAIReply } from '../services/ai';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    id: string;
    content: string;
    color: string;
    x: number;
    y: number;
    aiReply?: string;
  } | null;
  onUpdateAiReply?: (id: string, reply: string) => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, data, onUpdateAiReply }) => {
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [localReply, setLocalReply] = useState<string | undefined>(data?.aiReply);

  // Sync local state when data changes (e.g. opening a different item)
  useEffect(() => {
    setLocalReply(data?.aiReply);
  }, [data?.id, data?.aiReply]);

  useEffect(() => {
    // Lazy Load: Only fetch if we have data, no existing reply (local or prop), and not currently loading
    const hasReply = localReply || data?.aiReply;

    if (isOpen && data && !hasReply && !isLoadingAI) {
      const fetchReply = async () => {
        setIsLoadingAI(true);
        try {
          const result = await fetchAIReply(data.content);
          setLocalReply(result.reply); // Immediate local update
          if (onUpdateAiReply) {
            onUpdateAiReply(data.id, result.reply);
          }
        } catch (error) {
          console.error("Failed to fetch AI reply:", error);
        } finally {
          setIsLoadingAI(false);
        }
      };
      fetchReply();
    }
  }, [isOpen, data?.id, localReply, data?.aiReply]); // Removed isLoadingAI from deps to avoid double-trigger, though guard clause handles it. Added localReply to prevent re-fetch if set locally.

  if (!data) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal Card */}
          <motion.div
            className="fixed z-50 w-full max-w-sm px-6 pointer-events-none"
            style={{
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <motion.div
              className="relative w-full max-w-sm shadow-soft-lg p-6 pointer-events-auto rounded-soft-xl"
              style={{ backgroundColor: data.color }}
              initial={{
                x: data.x - window.innerWidth / 2,
                y: data.y - window.innerHeight / 2,
                scale: 0.1,
                opacity: 0
              }}
              animate={{
                x: 0,
                y: 0,
                scale: 1,
                opacity: 1
              }}
              exit={{
                x: data.x - window.innerWidth / 2,
                y: data.y - window.innerHeight / 2,
                scale: 0.1,
                opacity: 0
              }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1 hover:bg-black/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Content */}
              <div className="mt-8 space-y-6">
                <div className="font-hand text-2xl leading-relaxed whitespace-pre-wrap break-words min-h-[60px]">
                  {data.content}
                </div>

                {/* AI Reply Section */}
                <div className="pt-4 border-t-2 border-dashed border-black/30 min-h-[100px]">
                  <div className="flex items-center gap-2 mb-2 opacity-50">
                    <Trash2 className="w-4 h-4" />
                    <p className="text-sm font-bold font-hand">纸团的余温：</p>
                  </div>

                  {isLoadingAI ? (
                    <div className="flex items-center gap-2 opacity-50 font-hand animate-pulse mt-4">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>正在感知这一刻...</span>
                    </div>
                  ) : localReply ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="bg-black/5 p-3 rounded-lg"
                    >
                      <p className="font-hand text-lg leading-relaxed text-black/80">
                        {localReply}
                      </p>
                    </motion.div>
                  ) : (
                    <div className="opacity-30 font-hand text-sm mt-4">
                      (似乎没有什么回音...)
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ReviewModal;
