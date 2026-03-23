import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React, { useState } from 'react';

const pixelSvgStyle = { imageRendering: 'pixelated' as const };

const PIXEL_EQUIP_ICONS: Record<'主手' | '副手' | '服饰' | '饰品', React.ReactNode> = {
  主手: (
    <svg viewBox="0 0 32 32" className="w-5 h-5" style={pixelSvgStyle}>
      <rect x="14" y="4" width="4" height="20" fill="currentColor" opacity={0.9} />
      <rect x="10" y="22" width="12" height="4" fill="currentColor" opacity={0.9} />
      <rect x="12" y="2" width="8" height="4" fill="currentColor" opacity={0.7} />
    </svg>
  ),
  副手: (
    <svg viewBox="0 0 32 32" className="w-5 h-5" style={pixelSvgStyle}>
      <rect x="6" y="8" width="20" height="18" rx="2" fill="currentColor" opacity={0.9} />
      <rect x="10" y="4" width="12" height="6" fill="currentColor" opacity={0.7} />
      <rect x="14" y="12" width="4" height="10" fill="currentColor" opacity={0.3} />
    </svg>
  ),
  服饰: (
    <svg viewBox="0 0 32 32" className="w-5 h-5" style={pixelSvgStyle}>
      <rect x="8" y="6" width="16" height="6" fill="currentColor" opacity={0.9} />
      <rect x="10" y="12" width="12" height="14" fill="currentColor" opacity={0.9} />
      <rect x="6" y="14" width="4" height="10" fill="currentColor" opacity={0.7} />
      <rect x="22" y="14" width="4" height="10" fill="currentColor" opacity={0.7} />
    </svg>
  ),
  饰品: (
    <svg viewBox="0 0 32 32" className="w-5 h-5" style={pixelSvgStyle}>
      <rect x="12" y="12" width="8" height="8" fill="currentColor" opacity={0.95} />
      <rect x="14" y="14" width="4" height="4" fill="currentColor" opacity={0.5} />
      <rect x="10" y="14" width="2" height="4" fill="currentColor" opacity={0.8} />
      <rect x="20" y="14" width="2" height="4" fill="currentColor" opacity={0.8} />
      <rect x="14" y="10" width="4" height="2" fill="currentColor" opacity={0.8} />
      <rect x="14" y="20" width="4" height="2" fill="currentColor" opacity={0.8} />
    </svg>
  ),
};

export function FullscreenScrollWrap({
  isFullscreen,
  children,
}: {
  isFullscreen: boolean;
  children: React.ReactNode;
}) {
  if (!isFullscreen) return <>{children}</>;
  return (
    <div
      className="fullscreen-scroll-root fixed inset-0 z-[9999] overflow-y-auto overflow-x-hidden bg-[var(--surface-1)] custom-scrollbar"
      style={{ height: '100dvh', maxHeight: '100dvh' }}
    >
      {children}
    </div>
  );
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-4xl',
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}) => {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-ink-500/68 backdrop-blur-md p-2 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className={`panel-shell manuscript-panel arcane-frame w-full max-w-[calc(100vw-1rem)] sm:max-w-none ${maxWidth} max-h-[90vh] sm:max-h-[85vh] overflow-hidden rounded-sm flex flex-col shadow-2xl`}
          onClick={event => event.stopPropagation()}
        >
          <div className="relative flex items-center justify-between p-3 sm:p-6 border-b border-[color:var(--manuscript-edge)] bg-[color:var(--surface-1)] shrink-0">
            <div className="absolute inset-x-6 bottom-0 rune-divider" />
            <div className="min-w-0 pr-3">
              <div className="panel-subtle text-[10px] sm:text-xs">Codex Entry</div>
              <h2 className="panel-title text-xl sm:text-2xl md:text-3xl truncate pr-2">{title}</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="interactive-tile ritual-button p-2 rounded-full transition-colors text-ink-400 hover:text-rust-500 shrink-0"
            >
              <X size={24} />
            </button>
          </div>
          <div className="relative p-4 sm:p-6 md:p-8 overflow-y-auto custom-scrollbar bg-[color:var(--surface-1)] min-h-0">
            <div className="pointer-events-none absolute inset-0 opacity-45" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/paper-fibers.png')" }} />
            <div className="pointer-events-none absolute inset-x-8 top-0 rune-divider opacity-40" />
            <div className="relative z-[1]">{children}</div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => (
  <div className="group relative flex items-center">
    {children}
    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 text-xs text-parchment-100 bg-ink-500/92 border border-[color:var(--world-accent-strong)] rounded-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap font-sans tracking-[0.16em] z-10 shadow-lg">
      {text}
    </span>
  </div>
);

export const StatBar = ({
  label,
  value,
  max,
  colorClass,
}: {
  label: string;
  value: number;
  max: number;
  colorClass: string;
}) => (
  <div className="mb-2 rounded-sm border border-[color:var(--manuscript-edge)] bg-[color:var(--surface-1)] p-2">
    <div className="flex justify-between text-[11px] font-display tracking-[0.18em] mb-2 opacity-80 uppercase">
      <span>{label}</span>
      <span>
        {value}/{max}
      </span>
    </div>
    <div className="relative h-2.5 w-full overflow-hidden border border-[color:var(--manuscript-edge)] bg-ink-500/10">
      <div className="absolute inset-0 opacity-45" style={{ backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0.1) 0 1px, transparent 1px 12px)' }} />
      <div className={`h-full ${colorClass} transition-all duration-500 ease-out`} style={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }} />
    </div>
  </div>
);

export const EquipmentSlotButton = ({
  label,
  iconUrl,
  onOpenInventory,
}: {
  label: '主手' | '副手' | '服饰' | '饰品';
  iconUrl: string;
  onOpenInventory: () => void;
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  return (
    <Tooltip text={label}>
      <button
        type="button"
        onClick={onOpenInventory}
        className="interactive-tile ritual-button aspect-square flex items-center justify-center group text-ink-400 group-hover:text-ink-500 [&_svg]:shrink-0"
      >
        {!imgFailed ? (
          <img
            src={iconUrl}
            alt={label}
            className="w-5 h-5 object-contain"
            style={{ imageRendering: 'pixelated' }}
            onError={() => setImgFailed(true)}
          />
        ) : (
          PIXEL_EQUIP_ICONS[label]
        )}
      </button>
    </Tooltip>
  );
};

export const EquipmentSlotThumbnail = ({
  slot,
  iconUrl,
}: {
  slot: '主手' | '副手' | '服饰' | '饰品';
  iconUrl: string;
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  if (imgFailed) {
    return (
      <span className="w-full h-full flex items-center justify-center [&_svg]:w-10 [&_svg]:h-10">
        {PIXEL_EQUIP_ICONS[slot]}
      </span>
    );
  }
  return (
    <img
      src={iconUrl}
      alt={slot}
      className="w-full h-full object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.18)]"
      style={{ imageRendering: 'pixelated' }}
      onError={() => setImgFailed(true)}
    />
  );
};
