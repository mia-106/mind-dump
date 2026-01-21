import React from 'react';
import NeoButton from '../components/NeoButton';
import { SplashBinArt } from '../components/SplashBinArt';
import { ArrowRight } from 'lucide-react';

interface StartPageProps {
  onStart: () => void;
}

const StartPage: React.FC<StartPageProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col w-full h-screen overflow-hidden">
      {/* Top (Art) */}
      <main className="flex-1 flex items-center justify-center relative min-h-0 p-4">
        <div className="max-h-full max-w-full aspect-[350/400]">
          <SplashBinArt />
        </div>
      </main>

      {/* Middle (Header) */}
      <header className="flex-none pt-4 pb-12 text-center z-10">
        <h1 className="text-7xl font-quebec font-normal text-black drop-shadow-neo-text leading-[0.85] tracking-tighter">
          MIND<br />
          <span className="text-brand-yellow inline-block mt-2">DUMP</span>
        </h1>
        <p className="font-hand font-bold text-2xl mt-8 tracking-wider text-black/60">
          倾倒情绪，轻装上阵
        </p>
      </header>

      {/* Bottom (Action) */}
      <footer className="flex-none pb-16 px-6 flex justify-center z-10">
        <NeoButton
          onClick={onStart}
          className="hover:scale-105 active:scale-95 transition-transform"
        >
          开始记录
          <ArrowRight className="ml-3 w-8 h-8" />
        </NeoButton>
      </footer>
    </div>
  );
};

export default StartPage;
