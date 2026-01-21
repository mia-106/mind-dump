import StartPage from './pages/StartPage';
import HomePage from './pages/HomePage';
import HistoryPage from './pages/HistoryPage';
import { useState } from 'react';

function App() {
  const [currentPage, setCurrentPage] = useState<'start' | 'home' | 'history'>('start');

  return (
    <div className="w-full h-screen overflow-hidden flex flex-col items-center justify-center">
      {currentPage === 'start' && <StartPage onStart={() => setCurrentPage('home')} />}
      {currentPage === 'home' && <HomePage onNavigate={setCurrentPage} />}
      {currentPage === 'history' && <HistoryPage onNavigate={setCurrentPage} />}
    </div>
  );
}

export default App;
