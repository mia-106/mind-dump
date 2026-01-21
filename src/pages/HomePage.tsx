import React, { useRef, useState, useEffect } from 'react';
import { BinBack, BinFront } from '../components/BinSvgs';
import PhysicsCanvas, { type PhysicsCanvasHandle } from '../components/PhysicsCanvas';
import NeoButton from '../components/NeoButton';
import Modal from '../components/Modal';
import PaperBallSvg from '../components/PaperBallSvg';
import ReviewModal from '../components/ReviewModal';
import InspirationBubble from '../components/InspirationBubble';
import { Settings, Plus, Trash2, RefreshCw, List, Calendar, Edit2 } from 'lucide-react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';

import { fetchNudge } from '../services/ai';

interface TrashItem {
  id: string;
  content: string;
  color: string;
  timestamp: Date;
  aiReply?: string;
}

interface HomePageProps {
  onNavigate: (page: 'home' | 'history') => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const physicsRef = useRef<PhysicsCanvasHandle>(null);
  const binControls = useAnimation();
  const [isInputOpen, setIsInputOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingItem, setEditingItem] = useState<TrashItem | null>(null);
  const [reviewData, setReviewData] = useState<{ id: string, content: string, color: string, x: number, y: number, aiReply?: string } | null>(null);
  const [inputText, setInputText] = useState('');
  const [selectedColor, setSelectedColor] = useState('#A8D5BA'); // Default Green
  const [phase, setPhase] = useState<'input' | 'folding' | 'crumpling' | 'processing'>('input');
  // const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [nudgeText, setNudgeText] = useState<string | null>(null);
  const [isBubbleVisible, setIsBubbleVisible] = useState(false);

  // Helper: Read Full History
  const getFullHistory = (): TrashItem[] => {
    try {
      const stored = localStorage.getItem('trashItems');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Failed to parse history", e);
      return [];
    }
  };

  // Helper: Write Full History
  const saveFullHistory = (items: TrashItem[]) => {
    localStorage.setItem('trashItems', JSON.stringify(items));
  };

  // Initialize State (Today's Items Only)
  const [trashItems, setTrashItems] = useState<TrashItem[]>(() => {
    const allItems = getFullHistory();
    const todayStr = new Date().toDateString();
    return allItems.filter(item => new Date(item.timestamp).toDateString() === todayStr);
  });

  // Daily Reset Logic
  useEffect(() => {
    const checkDailyReset = () => {
      const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD (Local)
      const lastActive = localStorage.getItem('lastActiveDate');

      if (lastActive !== todayStr) {
        // New Day Detected
        if (lastActive) { // Only notify if not first run
          setToastMessage("新的一天开始了，垃圾桶已为你清空。");
          setTimeout(() => setToastMessage(null), 3000);
        }

        // Clear Physics World (Visuals)
        physicsRef.current?.clearTrash();

        // Clear State (Logic) - Implicitly handled by init if reloading, but if app is open:
        setTrashItems([]);

        // Update Flag
        localStorage.setItem('lastActiveDate', todayStr);
      }
    };

    checkDailyReset();

    // Expose for testing
    (window as any).setLastActiveDate = (date: string) => {
      localStorage.setItem('lastActiveDate', date);
      console.log(`lastActiveDate set to ${date}. Reload to test reset.`);
    };
  }, []);

  // Sync Logic: When State Changes, Update History (Targeted)
  // We NO LONGER sync the whole array blindly. We use specific handlers.
  // BUT: To keep code simple, we can't just use `useEffect` on `trashItems` anymore because `trashItems` is partial.
  // We must update History in the handlers (handleDump, handleUpdate, handleDelete).

  // Restore physics bodies on mount
  useEffect(() => {
    if (trashItems.length > 0 && physicsRef.current) {
      // Small delay to ensure physics engine is ready
      setTimeout(() => {
        physicsRef.current?.restoreTrash(trashItems);
      }, 100);
    }
  }, []); // Run once on mount

  // Sound configuration
  const soundPaths = {
    tear: '/sounds/tear.wav',
    crumple: '/sounds/crumple.wav',
    drop: '/sounds/drop.mp3'
  };

  // Preload sounds
  useEffect(() => {
    Object.values(soundPaths).forEach(path => {
      const audio = new Audio(path);
      audio.preload = 'auto';
    });
  }, []);

  // Fetch Inspiration Nudge
  useEffect(() => {
    const loadNudge = async () => {
      const allHistory = getFullHistory();
      // Filter last 3 days
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const recentMessages = allHistory
        .filter(item => new Date(item.timestamp) >= threeDaysAgo)
        .map(item => item.content);

      try {
        const { nudge } = await fetchNudge(recentMessages);
        if (nudge) {
          setNudgeText(nudge);
          setIsBubbleVisible(true);
        }
      } catch (e) {
        console.error("Failed to load nudge", e);
      }
    };

    // Slight delay to not block initial render and animations
    setTimeout(loadNudge, 1000);
  }, []);

  const playSound = (name: keyof typeof soundPaths) => {
    const audio = new Audio(soundPaths[name]);
    audio.volume = 0.6;
    audio.play().catch(e => console.warn(`Sound '${name}' failed to play:`, e));
  };

  // Colors for trash
  const colors = [
    '#A8D5BA', // Life/Trivia
    '#89C4F4', // Work/Study
    '#FFB7B2', // Anxiety/Venting
    '#F4D03F', // Happiness/Inspiration
    '#E0BBE4', // Emo/Overthinking
  ];

  // Theme mapping
  const colorThemes: Record<string, string> = {
    '#A8D5BA': '生活/琐事',
    '#89C4F4': '工作/学习',
    '#FFB7B2': '焦虑/发泄',
    '#F4D03F': '快乐/灵感',
    '#E0BBE4': 'Emo/胡思乱想'
  };

  const handleDump = async () => {
    // 0. Play tear sound
    playSound('tear');
    setIsProcessing(true); // Keep processing state for UI consistency, though it's much faster now

    // 1. Switch to folding immediately (Skip AI fetch phase)
    setPhase('folding');

    try {
      // 2. Wait for fold animation (0.4s) then switch to crumpling
      setTimeout(() => {
        setPhase('crumpling');
        playSound('crumple');

        // 3. Wait for crumple animation (0.6s) then physics handoff
        setTimeout(() => {
          const newId = Date.now().toString();

          // Add to physics world (AI reply is initially null)
          physicsRef.current?.addTrash(selectedColor, { x: 150, y: -50 }, newId, inputText, undefined);

          playSound('drop');

          // Add to history (State: Today Only)
          const newItem: TrashItem = {
            id: newId,
            content: inputText,
            color: selectedColor,
            timestamp: new Date(),
            aiReply: undefined
          };
          setTrashItems(prev => [newItem, ...prev]);

          // Add to history (Storage: Full)
          const history = getFullHistory();
          saveFullHistory([newItem, ...history]);

          // Reset
          setInputText('');
          setIsInputOpen(false);
          setPhase('input');
          setIsProcessing(false);
        }, 600);
      }, 400);

    } catch (error) {
      console.error("Dump failed:", error);
      setIsProcessing(false);
      setPhase('input'); // Revert on error
      setError(error instanceof Error ? error.message : 'Unexpected Error');
    }
  };

  const handleClearBin = () => {
    // 1. Clear Physics World
    physicsRef.current?.clearTrash();

    // 2. Identify affected dates (Today's items only)
    const affectedIds = new Set(trashItems.map(item => item.id));

    // 3. Clear from localStorage (Audits)
    // Only clear audit if we are deleting items from that day. 
    // Since trashItems is ONLY today, we only need to check today's audit.
    const todayStr = new Date().toDateString();
    const storedAudits = localStorage.getItem('dailyAudits');
    if (storedAudits) {
      const audits = JSON.parse(storedAudits);
      if (audits[todayStr]) {
        delete audits[todayStr];
        localStorage.setItem('dailyAudits', JSON.stringify(audits));
      }
    }

    // 4. Remove from Full History
    const history = getFullHistory();
    const newHistory = history.filter(item => !affectedIds.has(item.id));
    saveFullHistory(newHistory);

    // 5. Clear Items (State)
    setTrashItems([]);
  };

  const handleDeleteItem = (id: string) => {
    const itemToDelete = trashItems.find(i => i.id === id);
    if (!itemToDelete) return;

    // 1. Remove from Physics World
    physicsRef.current?.removeTrash(id);

    // 2. Clear Daily Audit for this date
    const dateKey = new Date(itemToDelete.timestamp).toDateString();
    const storedAudits = localStorage.getItem('dailyAudits');
    if (storedAudits) {
      const audits = JSON.parse(storedAudits);
      if (audits[dateKey]) {
        delete audits[dateKey];
        localStorage.setItem('dailyAudits', JSON.stringify(audits));
      }
    }

    // 3. Remove from Full History
    const history = getFullHistory();
    const newHistory = history.filter(item => item.id !== id);
    saveFullHistory(newHistory);

    // 4. Update State
    setTrashItems(prev => prev.filter(item => item.id !== id));
  };

  const handleEditItem = (item: TrashItem) => {
    setEditingItem(item);
    setInputText(item.content);
    setSelectedColor(item.color);
    setIsHistoryOpen(false);
    setIsInputOpen(true);
  };

  const handleUpdateItem = () => {
    if (!editingItem) return;

    // 1. Update State
    setTrashItems(prev => prev.map(item =>
      item.id === editingItem.id
        ? { ...item, content: inputText, color: selectedColor }
        : item
    ));

    // 2. Update Full History
    const history = getFullHistory();
    const newHistory = history.map(item =>
      item.id === editingItem.id
        ? { ...item, content: inputText, color: selectedColor }
        : item
    );
    saveFullHistory(newHistory);

    // Update physics body
    physicsRef.current?.updateTrash(editingItem.id, selectedColor, inputText);

    setEditingItem(null);
    setInputText('');
    setIsInputOpen(false);
    setIsHistoryOpen(true); // Go back to list
  };

  const handleUpdateAiReply = (id: string, reply: string) => {
    // 1. Update React State
    setTrashItems(prev => prev.map(item =>
      item.id === id
        ? { ...item, aiReply: reply }
        : item
    ));

    // 2. Update Full History
    const history = getFullHistory();
    const newHistory = history.map(item =>
      item.id === id
        ? { ...item, aiReply: reply }
        : item
    );
    saveFullHistory(newHistory);

    // 3. Update Physics Body (so it persists in current session)
    // We pass the existing content/color because we only want to update aiReply
    const item = trashItems.find(i => i.id === id);
    if (item && physicsRef.current) {
      physicsRef.current.updateTrash(id, item.color, item.content, reply);
    }
  };

  const handleBallClick = (data: { id?: string, content: string, color: string, x: number, y: number, aiReply?: string }) => {
    // Ensure we have an ID. If not (shouldn't happen with correct PhysicsCanvas), fallback or ignore
    if (data.id) {
      setReviewData({
        id: data.id,
        content: data.content,
        color: data.color,
        x: data.x,
        y: data.y,
        aiReply: data.aiReply
      });
      physicsRef.current?.setPaused(true);
    }
  };

  const handleCloseReview = () => {
    setReviewData(null);
    physicsRef.current?.setPaused(false);
  };

  const noteVariants = {
    input: { scale: 1, opacity: 1, y: 0, scaleY: 1, transformOrigin: "bottom" },
    folding: {
      scaleY: 0.1, // Squeeze vertically
      scaleX: 0.9, // Slight horizontal shrink
      y: 200,      // Move down slightly
      opacity: 0.8,
      filter: "brightness(0.9)",
      transformOrigin: "bottom"
    },
    crumpling: { opacity: 0 } // Disappear
  };

  const ballVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: {
      opacity: 1,
      scale: [1.5, 1], // Pop in slightly larger
      rotate: [0, 360],
      y: -window.innerHeight * 0.5 // Move up towards bin
    }
  };

  const today = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-start p-8 z-30">
        <div className="group cursor-default">
          <div
            className="bg-white p-4 inline-block shadow-soft rounded-2xl mb-4 cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300"
            onClick={() => onNavigate('history')}
          >
            <Calendar className="w-6 h-6 text-soft-charcoal/60" />
          </div>
          <h1 className="text-6xl font-black text-soft-charcoal leading-none tracking-tighter">今日</h1>
          <p className="font-sans font-bold text-sm text-soft-charcoal/20 mt-2 uppercase tracking-[0.2em]">{today}</p>
        </div>
        <button className="p-5 bg-white shadow-soft rounded-2xl hover:bg-brand-yellow/10 transition-colors duration-300 active:scale-95 cursor-pointer">
          <Settings className="w-6 h-6 text-soft-charcoal/60" />
        </button>
      </header>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="absolute top-24 left-0 right-0 z-50 flex justify-center pointer-events-none"
          >
            <div className="bg-brand-yellow border-neo border-black px-6 py-3 shadow-hard rounded-full">
              <p className="font-hand font-bold text-xl">{toastMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content - Sandwich Architecture */}
      <main className="flex-1 flex items-center justify-center relative">
        <motion.div
          className="relative w-[300px] h-[250px]"
          animate={binControls}
        >
          {/* Inspiration Bubble */}
          <div className="absolute top-0 left-0 w-full h-0 z-50 pointer-events-none">
            {/* This container sits at the top of the bin area. Bubble will float up from here (bottom-full mb-8). 
                 Wait, if we use bottom-full on the bubble, we need to place this container at the TOP of the visual bin.
                 The bin is 250px high. Let's position this anchor relative to the bin.
             */}
            <div className="absolute top-0 left-0 w-full">
              <InspirationBubble
                text={nudgeText || ''}
                isVisible={!!nudgeText && isBubbleVisible && !isInputOpen}
                onClose={() => setIsBubbleVisible(false)}
                onClick={() => {
                  setIsBubbleVisible(false);
                  setIsInputOpen(true);
                }}
              />
            </div>
          </div>

          {/* Layer 0: Back Wall */}
          <BinBack className="absolute inset-0 z-0 w-full h-full drop-shadow-hard" />

          {/* Layer 1: Physics World */}
          <div className="absolute inset-0 z-10">
            <PhysicsCanvas
              ref={physicsRef}
              onEmptyClick={() => setIsHistoryOpen(true)}
              onBallClick={handleBallClick}
            />
          </div>

          {/* Layer 2: Front Wall (Transparent) */}
          <div className="absolute inset-0 z-20 pointer-events-none">
            <BinFront className="w-full h-full" />
          </div>
        </motion.div>
      </main>

      {/* History Button (Bottom Left) */}
      <div className="absolute bottom-8 left-8 z-30">
        <NeoButton
          onClick={(e) => {
            e.stopPropagation();
            setIsHistoryOpen(true);
          }}
          className="w-16 h-16 rounded-2xl p-0 flex items-center justify-center bg-brand-yellow shadow-hard hover:bg-white transition-colors"
        >
          <List className="w-8 h-8" />
        </NeoButton>
      </div>

      {/* FAB (Bottom Right) */}
      <div className="absolute bottom-8 right-8 z-30">
        <NeoButton
          onClick={() => setIsInputOpen(true)}
          className="w-16 h-16 rounded-2xl p-0 flex items-center justify-center shadow-hard-lg"
        >
          <Plus className="w-8 h-8" />
        </NeoButton>
      </div>

      {/* Input Modal */}
      <Modal
        isOpen={isInputOpen}
        onClose={() => {
          if (phase === 'input') {
            setIsInputOpen(false);
            setError(null);
          }
        }}
        type="bottom"
        style={{ backgroundColor: 'transparent' }} // Always transparent wrapper
        title="" // Hide default title to handle it inside
        className="shadow-none border-none bg-transparent p-0" // Remove wrapper styles
        customVariants={{
          initial: { y: '100%' },
          animate: { y: 0 },
          exit: { y: '100%' }
        }}
      >
        <AnimatePresence mode="wait">
          {phase !== 'crumpling' && (
            <motion.div
              key="input-form"
              className="flex flex-col h-full p-6 rounded-t-2xl border-neo border-black shadow-hard"
              style={{ backgroundColor: selectedColor }}
              variants={noteVariants}
              initial="input"
              animate={phase}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold uppercase font-hand">
                  {editingItem ? '修改记录' : '记录今天做了什么'}
                </h2>
                <button
                  onClick={() => setIsInputOpen(false)}
                  className="p-2 hover:bg-black/10 rounded-lg transition-colors border-2 border-transparent hover:border-black"
                >
                  <Settings className="w-6 h-6 opacity-0" /> {/* Hidden placeholder for layout */}
                </button>
              </div>

              <textarea
                className="w-full flex-1 bg-transparent border-none outline-none resize-none font-hand text-2xl placeholder-black/50"
                placeholder={`写下今天的 "${colorThemes[selectedColor] || 'thoughts'}"...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                autoFocus
              />

              <div className="mt-6 border-t-2 border-black pt-4">
                <div className="flex gap-4 mb-6 justify-center">
                  {colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-12 h-12 rounded-full border-2 border-black transition-all hover:scale-110 cursor-pointer shadow-hard-sm active:translate-y-0.5 active:shadow-none ${selectedColor === color ? 'scale-110 border-[3px] ring-2 ring-black ring-offset-2' : ''}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>

                <NeoButton
                  onClick={editingItem ? handleUpdateItem : handleDump}
                  className="w-full justify-center font-sans font-bold bg-white text-soft-charcoal shadow-soft hover:bg-warm-cream"
                  disabled={!inputText.trim() || isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      处理中...
                    </>
                  ) : editingItem ? (
                    <>
                      <Edit2 className="w-5 h-5" />
                      修改完成
                    </>
                  ) : (
                    <>
                      撕掉它
                    </>
                  )}
                </NeoButton>
              </div>
            </motion.div>
          )}

          {phase === 'crumpling' && (
            <motion.div
              key="paper-ball"
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              variants={ballVariants}
              initial="hidden"
              animate="visible"
            >
              <PaperBallSvg
                color={selectedColor}
                className="w-[200px] h-[200px] drop-shadow-hard"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </Modal>

      <ReviewModal
        isOpen={!!reviewData}
        onClose={handleCloseReview}
        data={reviewData}
        onUpdateAiReply={handleUpdateAiReply}
      />

      {/* History Modal */}
      <Modal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        title="今日纸团"
        type="bottom"
      >
        <div className="flex justify-end mb-4">
          <button className="flex items-center gap-1 font-bold text-sm hover:underline" onClick={handleClearBin}>
            <RefreshCw className="w-4 h-4" /> Clear Bin
          </button>
        </div>
        <div className="space-y-3">
          {trashItems.length === 0 ? (
            <div className="text-center py-10 opacity-50">
              <p className="font-hand text-xl">The bin is empty!</p>
            </div>
          ) : (
            trashItems.map((item) => (
              <div key={item.id} className="border-neo border-black p-4 shadow-hard-sm" style={{ backgroundColor: item.color }}>
                <div className="flex items-start gap-3">
                  <div className="flex flex-col gap-2 mt-1 shrink-0">
                    <button
                      onClick={() => handleEditItem(item)}
                      className="hover:scale-110 transition-transform group"
                      title="Edit"
                    >
                      <Edit2 className="w-5 h-5 opacity-50 group-hover:opacity-100 group-hover:text-blue-800 transition-colors" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="hover:scale-110 transition-transform group"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5 opacity-50 group-hover:opacity-100 group-hover:text-red-800 transition-colors" />
                    </button>
                  </div>
                  <div>
                    <p className="break-words font-hand text-lg">{item.content}</p>
                    <p className="text-xs opacity-60 mt-1">
                      {item.timestamp.toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                        hour12: true
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
};

export default HomePage;
