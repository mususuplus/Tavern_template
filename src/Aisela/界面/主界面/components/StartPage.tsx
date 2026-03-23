import { motion } from 'motion/react';
import React from 'react';
const mapImage = 'https://cdn.jsdelivr.net/gh/mususuplus/my-assets@main/封面.webp';

interface StartPageProps {
  onStart: () => void;
}

const StartPage: React.FC<StartPageProps> = ({ onStart }) => {
  const handleStart = () => {
    // 已在全屏：第二次点击，进入 CustomizationPage
    if (document.fullscreenElement) {
      onStart();
      return;
    }
    // 第一次点击：仅进入全屏，留在当前页
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      onStart(); // 不支持全屏时直接进入
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-cover bg-center overflow-hidden"
      style={{ backgroundImage: `url(${mapImage})` }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="relative z-10 text-center"
      >
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-7xl md:text-9xl font-display text-parchment-100 tracking-[0.6em] mb-16 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]"
        >
          Aisela
        </motion.h1>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStart}
          className="group relative px-16 py-5 overflow-hidden bg-amber-500 hover:bg-amber-600 text-ink-900 font-display text-3xl tracking-[0.3em] transition-all duration-300 shadow-[0_0_30px_rgba(245,158,11,0.5)] border border-amber-400/60"
        >
          <span className="relative z-10">开启游戏</span>
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-amber-400/80 transition-transform duration-500 ease-in-out"></div>
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 1.5 }}
          className="mt-12 text-parchment-200 font-serif italic tracking-widest"
        >
          "命运的轮盘已经开始转动"
        </motion.p>
      </motion.div>

      {/* Decorative corners */}
      <div className="absolute top-8 left-8 w-24 h-24 border-t-2 border-l-2 border-parchment-100/20"></div>
      <div className="absolute top-8 right-8 w-24 h-24 border-t-2 border-r-2 border-parchment-100/20"></div>
      <div className="absolute bottom-8 left-8 w-24 h-24 border-b-2 border-l-2 border-parchment-100/20"></div>
      <div className="absolute bottom-8 right-8 w-24 h-24 border-b-2 border-r-2 border-parchment-100/20"></div>
    </div>
  );
};

export default StartPage;
