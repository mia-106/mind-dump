import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import NeoButton from '../components/NeoButton';

interface HistoryPageProps {
  onNavigate: (page: 'home' | 'history') => void;
}

interface TrashItem {
  id: string;
  content: string;
  color: string;
  timestamp: string; // Stored as string in localStorage
}

interface DailyAudit {
  summary: string;
  dailyColor: string;
}

const HistoryPage: React.FC<HistoryPageProps> = ({ onNavigate }) => {
  const [items, setItems] = useState<TrashItem[]>([]);
  const [dailyAudits, setDailyAudits] = useState<Record<string, DailyAudit>>({});
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isAuditing, setIsAuditing] = useState(false);

  useEffect(() => {
    const storedItems = localStorage.getItem('trashItems');
    if (storedItems) {
      try {
        setItems(JSON.parse(storedItems));
      } catch (e) {
        console.error("Failed to parse trash items", e);
      }
    }

    const storedAudits = localStorage.getItem('dailyAudits');
    if (storedAudits) {
      try {
        setDailyAudits(JSON.parse(storedAudits));
      } catch (e) {
        console.error("Failed to parse daily audits", e);
      }
    }
  }, []);

  const handleAudit = async (date: Date, dayItems: TrashItem[]) => {
    const dateKey = date.toDateString();

    // If already auditing or has data, skip (though logic below handles 'has data')
    if (isAuditing) return;

    setIsAuditing(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: dayItems.map(item => ({
            content: item.content,
            color: item.color,
            timestamp: item.timestamp
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Audit failed');
      }

      const result = await response.json();

      if (result.dailyColor && result.summary) {
        const newAudit = {
          dailyColor: result.dailyColor,
          summary: result.summary
        };

        const newAudits = { ...dailyAudits, [dateKey]: newAudit };
        setDailyAudits(newAudits);
        localStorage.setItem('dailyAudits', JSON.stringify(newAudits));
      }

    } catch (error) {
      console.error("Audit error:", error);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    const dateKey = date.toDateString();

    // If no audit yet, and we have items, trigger audit
    if (!dailyAudits[dateKey]) {
      const dayItems = items.filter(item => new Date(item.timestamp).toDateString() === dateKey);
      if (dayItems.length > 0) {
        handleAudit(date, dayItems);
      }
    }
  };

  // Stats Logic: Count items in current month (not used)

  // Calendar Logic
  const getCalendarData = () => {
    const now = selectedDate; // Use selected month for generation
    // Usually calendar shows current month or selected month. Let's stick to current month for now as per original code.
    // If user selects a date in another month, we might need to update this logic to show that month.
    // But original code just used `now`. Let's assume we view the month of `selectedDate` if we want to navigate, 
    // but the prompt implies clicking in the grid.

    // Let's use the year/month of the *selectedDate* to ensure we see what we clicked if we add navigation later.
    // But for now, let's keep it simple: Show current month (original behavior) or selected month.
    // Let's use `selectedDate` to determine which month to show.
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();

    // First day of current month
    const firstDay = new Date(year, month, 1);
    // Last day of current month
    const lastDay = new Date(year, month + 1, 0);

    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay(); // 0 (Sun) - 6 (Sat)

    // Adjust for Monday start (0=Mon, 6=Sun)
    const padding = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    const calendarDays = [];

    // Padding days
    for (let i = 0; i < padding; i++) {
      calendarDays.push({ date: null, color: null, hasData: false, isToday: false, fullDate: null });
    }

    // Real days
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i);
      const dateStr = currentDate.toDateString();
      const isToday = currentDate.toDateString() === new Date().toDateString();
      const isSelected = currentDate.toDateString() === selectedDate.toDateString();

      // Find items for this day
      const dayItems = items.filter(item => new Date(item.timestamp).toDateString() === dateStr);

      let color = null;
      // Priority: Daily Audit Color > Last Item Color
      if (dailyAudits[dateStr]) {
        color = dailyAudits[dateStr].dailyColor;
      } else if (dayItems.length > 0) {
        color = dayItems[dayItems.length - 1].color;
      } else {
        // Explicitly set to null if no items and no audit (handles delete case)
        color = null;
      }

      calendarDays.push({
        date: i,
        color,
        hasData: dayItems.length > 0,
        isToday,
        isSelected,
        fullDate: currentDate
      });
    }

    return { calendarDays, year, month: month + 1 };
  };

  const { calendarDays, month, year } = getCalendarData();

  // Daily List Logic: Items from selected date
  const selectedDayItems = items.filter(item => {
    return new Date(item.timestamp).toDateString() === selectedDate.toDateString();
  });

  const currentAudit = dailyAudits[selectedDate.toDateString()];
  // Fix: Add dependency on currentAudit to force re-render when audit changes

  const handleRefreshAudit = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent re-triggering day click
    const dateKey = selectedDate.toDateString();

    // Clear local audit state first
    const newAudits = { ...dailyAudits };
    delete newAudits[dateKey];
    setDailyAudits(newAudits);
    localStorage.setItem('dailyAudits', JSON.stringify(newAudits));

    // Trigger new audit with LATEST items
    const dayItems = items.filter(item => new Date(item.timestamp).toDateString() === dateKey);
    if (dayItems.length > 0) {
      handleAudit(selectedDate, dayItems);
    }
  };

  return (
    <div className="w-full h-screen bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between p-6 border-b-2 border-black">
        <NeoButton
          onClick={() => onNavigate('home')}
          className="p-3"
        >
          <ArrowLeft className="w-6 h-6" />
        </NeoButton>
        <h1 className="font-sans font-bold text-xl">日历本</h1>
        <div className="w-10" />
      </header>

      <main className="flex-1 overflow-y-auto p-6">

        {/* Unified Calendar Card */}
        <div className="bg-white border-2 border-black shadow-hard mb-8">
          {/* Calendar Header */}
          <div className="bg-brand-yellow/10 p-6 flex justify-between items-end rounded-t-3xl">
            <h2 className="font-quebec font-normal text-5xl text-soft-charcoal leading-none">
              {year}.{month}
            </h2>
            <p className="font-sans font-bold text-xs tracking-widest text-soft-charcoal/30 uppercase">
              {selectedDayItems.length > 0 ? `${selectedDate.getDate()}nd RECORD` : 'QUIET DAY'}
            </p>
          </div>

          {/* Calendar Grid */}
          <div className="p-4">
            {/* Week Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['一', '二', '三', '四', '五', '六', '日'].map(d => (
                <div key={d} className="text-center font-sans font-bold text-gray-500 text-sm">
                  {d}
                </div>
              ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => (
                <button
                  key={index}
                  disabled={!day.date}
                  onClick={() => day.fullDate && handleDayClick(day.fullDate)}
                  className={`
                    aspect-square relative flex items-center justify-center font-sans font-black text-xl transition-all cursor-pointer
                    ${day.isSelected ? 'ring-[3px] ring-black ring-offset-2 scale-95' : 'hover:scale-105'}
                    ${day.date ? 'border-2 border-black/10' : 'cursor-default'}
                  `}
                  style={{
                    backgroundColor: day.color || 'transparent',
                    color: day.hasData || day.color ? (['#38A169', '#3182CE', '#D53F8C', '#E0BBE4', '#A8D5BA', '#89C4F4', '#FFB7B2', '#F4D03F'].includes(day.color || '') ? 'black' : 'black') : 'black' // Simplify text color for now
                  }}
                >
                  {day.date}
                  {day.isToday && !day.isSelected && (
                    <div className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-brand-yellow rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Daily Audit Section */}
            {(currentAudit || isAuditing) && (
              <div className="mt-6 pt-4 border-t-2 border-dashed border-black/20 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-sans font-black text-sm tracking-widest text-gray-400">DAILY AUDIT</h3>
                  <button
                    onClick={handleRefreshAudit}
                    disabled={isAuditing}
                    className={`
                          p-1.5 border-2 border-black rounded bg-white hover:bg-black hover:text-white transition-all
                          ${isAuditing ? 'opacity-50 cursor-not-allowed' : 'active:translate-y-0.5'}
                        `}
                    title="重新审计"
                  >
                    <RefreshCw className={`w-3 h-3 ${isAuditing ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                {isAuditing ? (
                  <div className="flex items-center gap-3 text-gray-500 font-hand animate-pulse p-4">
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>正在分析这段时光的颜色...</span>
                  </div>
                ) : (
                  <div
                    className="p-6 rounded-none border-2 border-black bg-white shadow-hard-sm font-hand text-xl leading-relaxed relative overflow-hidden"
                  >
                    <div
                      className="absolute top-0 left-0 w-2 h-full"
                      style={{ backgroundColor: currentAudit?.dailyColor }}
                    />
                    <p className="pl-2">{currentAudit?.summary}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Daily List */}
        <div>
          <h2 className="font-bold text-lg mb-4">
            {selectedDate.getDate()}日记录
          </h2>
          {selectedDayItems.length === 0 ? (
            <div className="border-2 border-black shadow-hard p-8 flex items-center justify-center bg-white">
              <p className="font-hand text-gray-500 text-xl">今日无事发生</p>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedDayItems.map(item => (
                <div
                  key={item.id}
                  className="border-2 border-black shadow-hard p-4 bg-white"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 rounded-full border border-black" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-gray-500 font-sans">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="font-hand text-lg">{item.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HistoryPage;
