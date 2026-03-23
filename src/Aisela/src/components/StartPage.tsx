import React from 'react';
import { motion } from 'motion/react';
const mapImage = 'https://cdn.jsdelivr.net/gh/mususuplus/my-assets@main/地图.webp';


interface StartPageProps {
  onStart: () => void;
}

const StartPage: React.FC<StartPageProps> = ({ onStart }) => {
  const handleStart = () => {
    // Request full screen
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    }
    onStart();
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
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative z-10 text-center"
      >
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-7xl md:text-9xl font-display text-parchment-100 tracking-[0.6em] mb-16 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]"
        >
          神话纪元
        </motion.h1>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStart}
          className="group relative px-16 py-5 overflow-hidden bg-rust-700 hover:bg-rust-800 text-parchment-50 font-display text-3xl tracking-[0.3em] transition-all duration-300 shadow-[0_0_30px_rgba(138,75,56,0.4)] border border-rust-500/50"
        >
          <span className="relative z-10">开启游戏</span>
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-rust-600 transition-transform duration-500 ease-in-out"></div>
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
