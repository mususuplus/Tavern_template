import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Clock,
  Feather,
  FolderOpen,
  Map as MapIcon,
  Maximize2,
  Minimize2,
  Scroll,
  Settings,
  Sparkles,
  User,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import type { HostPhase, LogEntry, StoryTickerItem } from '../types';
import type { ConversationFlowItem, Option } from '../utils/messageParser';
import { EquipmentSlotButton, Tooltip, StatBar } from './gamePrimitives';

type QuestSummaryItem = {
  name: string;
  description?: string;
  status?: string;
};

export function MainHeader({
  world,
  currentLocation,
  clockRoman,
  tickerItems,
  actSummary,
  actSummaryTags,
  harpIcon,
  isFullscreen,
  onOpenSettings,
  onOpenMusic,
  onOpenReading,
  onOpenSaveList,
  onToggleFullscreen,
  onOpenClock,
}: {
  world: { 末日时钟刻度: number; 纪元: string; 月: number; 日: number; 时段: string };
  currentLocation: string;
  clockRoman: string;
  tickerItems: StoryTickerItem[];
  actSummary: string;
  actSummaryTags: string[];
  harpIcon: string;
  isFullscreen: boolean;
  onOpenSettings: () => void;
  onOpenMusic: () => void;
  onOpenReading: () => void;
  onOpenSaveList: () => void;
  onToggleFullscreen: () => void;
  onOpenClock: () => void;
}) {
  const countdown = Math.max(0, 12 - world.末日时钟刻度);

  return (
    <header className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-5">
      <button type="button" onClick={onOpenClock} className="panel-shell manuscript-panel arcane-frame lg:col-span-3 p-4 sm:p-5 rounded-sm flex items-center gap-4 text-left hover:-translate-y-0.5 transition-transform">
        <div className="relative w-16 h-16 shrink-0 rounded-full border border-[color:var(--manuscript-edge)] bg-white/10 p-1">
          <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 36 36">
            <path
              d="M18 2.0845a 15.9155 15.9155 0 1 1 0 31.831a 15.9155 15.9155 0 1 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-ink-500/10"
            />
            <path
              d="M18 2.0845a 15.9155 15.9155 0 1 1 0 31.831a 15.9155 15.9155 0 1 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={`${(Math.min(world.末日时钟刻度, 12) / 12) * 100}, 100`}
              className="text-gold-500"
            />
          </svg>
          <div className="absolute inset-[0.4rem] rounded-full border border-white/15" />
          <div className="absolute inset-0 flex items-center justify-center font-display font-bold tracking-[0.18em] text-gold-600">{clockRoman}</div>
        </div>
        <div className="min-w-0">
          <div className="panel-subtle text-[10px] sm:text-xs">Astral Dial</div>
          <div className="panel-title text-sm">末日时钟</div>
          <div className="panel-subtle text-xs">{world.末日时钟刻度 >= 12 ? '末日降临' : `距离终焉还有 ${countdown} 个刻度`}</div>
        </div>
      </button>

      <div className="panel-shell manuscript-panel arcane-frame lg:col-span-9 p-4 sm:p-5 rounded-sm flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div className="flex-1 flex flex-col md:flex-row gap-4 md:items-center min-w-0">
          <div className="codex-tab px-3 py-2 flex items-center gap-3 min-w-0 md:pr-4">
            <Clock className="w-4 h-4 text-ink-400 shrink-0" />
            <div className="min-w-0">
              <div className="font-display text-base sm:text-lg truncate">{currentLocation || '未知地点'}</div>
              <div className="panel-subtle text-xs">
                {world.纪元} {world.月}月{world.日}日 {world.时段}
              </div>
            </div>
          </div>

          <div className="codex-tab relative overflow-hidden flex-1 min-w-0 px-4 py-3">
            <div className="panel-subtle text-[10px] mb-2">卷首注记</div>
            <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[var(--surface-1)] to-transparent pointer-events-none z-10" />
            <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[var(--surface-1)] to-transparent pointer-events-none z-10" />
            <div className="animate-marquee flex items-center gap-8 whitespace-nowrap text-sm italic text-ink-500/80">
              {(tickerItems.length
                ? tickerItems
                : [{ category: '地点变化', text: '档案流正在等待新的世界摘要。' }]).map((item, index) => (
                <span key={`${item.category}-${item.text}-${index}`} className="flex items-center gap-2">
                  <Feather className="w-3.5 h-3.5 shrink-0 text-ink-400" />
                  <span className="text-[10px] tracking-[0.24em] uppercase text-ink-400/70">{item.category}</span>
                  <span>{item.text}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 shrink-0 flex-wrap">
          <Tooltip text="设置">
            <button type="button" onClick={onOpenSettings} className="interactive-tile ritual-button p-2.5">
              <Settings className="w-4 h-4" />
            </button>
          </Tooltip>
          <Tooltip text="音乐">
            <button type="button" onClick={onOpenMusic} className="interactive-tile ritual-button p-2.5">
              <img src={harpIcon} alt="" className="w-4 h-4 object-contain" aria-hidden />
            </button>
          </Tooltip>
          <Tooltip text="阅读模式">
            <button type="button" onClick={onOpenReading} className="interactive-tile ritual-button p-2.5">
              <BookOpen className="w-4 h-4" />
            </button>
          </Tooltip>
          <Tooltip text="读档分支">
            <button type="button" onClick={onOpenSaveList} className="interactive-tile ritual-button p-2.5">
              <FolderOpen className="w-4 h-4" />
            </button>
          </Tooltip>
          <Tooltip text={isFullscreen ? '退出全屏' : '全屏'}>
            <button type="button" onClick={onToggleFullscreen} className="interactive-tile ritual-button p-2.5">
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </Tooltip>
        </div>
      </div>

      {actSummary ? (
        <div className="panel-shell manuscript-panel arcane-frame lg:col-span-12 p-4 sm:p-5 rounded-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="panel-subtle text-[10px]">Act Chronicle</div>
              <div className="panel-title mt-2 text-sm">本幕纪要</div>
              <p className="mt-3 text-sm leading-7 text-ink-500/85">{actSummary}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {actSummaryTags.slice(0, 4).map(tag => (
                <span key={tag} className="world-reactive-chip text-[10px] uppercase">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}

export function CharacterPanel({
  player,
  displayName,
  hostPhase,
  equipmentIconUrls,
  onOpenInventory,
}: {
  player: {
    称号?: string;
    生命: number;
    生命上限: number;
    法力: number;
    法力上限: number;
    奥法之灾觉醒度: number;
    奥法之灾觉醒度上限: number;
    职业: string;
    信仰: string;
    状态: string;
    货币: { 金狮?: number; 银辉币?: number; 铜叶币?: number; 以太结晶?: number };
  };
  displayName: string;
  hostPhase: HostPhase;
  equipmentIconUrls: Record<'主手' | '副手' | '服饰' | '饰品', string>;
  onOpenInventory: () => void;
}) {
  return (
    <div className="panel-shell manuscript-panel arcane-frame p-4 sm:p-5 rounded-sm flex flex-col gap-4 h-full">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-xl sm:text-2xl font-bold truncate">{displayName}</h2>
          <p className="panel-subtle text-sm truncate">{player.称号 || '流浪的守夜人'}</p>
        </div>
        <div className="w-11 h-11 rounded-full border border-[color:var(--manuscript-edge)] bg-white/10 flex items-center justify-center shrink-0 shadow-[0_0_20px_var(--world-glow)]">
          <User className="w-5 h-5 text-ink-400" />
        </div>
      </div>

      <div className="space-y-3">
        <StatBar label="生命" value={player.生命} max={player.生命上限} colorClass="bg-rust-500" />
        <StatBar label="法力" value={player.法力} max={player.法力上限} colorClass="bg-slate-500" />
        <StatBar
          label="觉醒"
          value={player.奥法之灾觉醒度}
          max={player.奥法之灾觉醒度上限}
          colorClass="bg-moss-500"
        />
      </div>

      <div className="rune-divider my-1" />
      <div className="grid grid-cols-2 gap-3">
        <div className="codex-tab p-3">
          <div className="panel-subtle text-xs">职业</div>
          <div className="font-display mt-1">{player.职业 || '普通冒险者'}</div>
        </div>
        <div className="codex-tab p-3">
          <div className="panel-subtle text-xs">信仰</div>
          <div className="font-display mt-1">{player.信仰 || '无'}</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="panel-subtle text-xs">装备槽</div>
        <div className="grid grid-cols-4 gap-2">
          {(['主手', '副手', '服饰', '饰品'] as const).map(slot => (
            <EquipmentSlotButton key={slot} label={slot} iconUrl={equipmentIconUrls[slot]} onOpenInventory={onOpenInventory} />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="panel-subtle text-xs flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          当前状态
        </div>
        <div className="inline-flex items-center gap-2 rounded-sm border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-700 shadow-[0_0_18px_rgba(16,185,129,0.12)]">
          <Sparkles className="w-3 h-3" />
          {player.状态 || '健康'}
        </div>
      </div>

      <div className={`relative overflow-hidden rounded-sm border border-[color:var(--manuscript-edge)] bg-white/35 p-4 ${hostPhase.intensityClass}`}>
        <div className="absolute inset-x-0 top-0 h-px bg-[var(--world-accent-strong)] opacity-80" />
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="panel-subtle text-[10px]">宿主征兆</div>
            <div className="mt-2 font-display text-lg" style={{ color: hostPhase.accentColor }}>
              {hostPhase.code} · {hostPhase.name}
            </div>
          </div>
          <span className="world-reactive-chip text-[10px] uppercase">{hostPhase.short}</span>
        </div>
        <p className="mt-3 text-sm leading-6 text-ink-500/85">{hostPhase.description}</p>
        <div className="mt-4 grid gap-3">
          <div className="interactive-tile p-3">
            <div className="panel-subtle text-[10px]">异象前兆</div>
            <p className="mt-2 text-xs leading-5 text-ink-500/80">{hostPhase.omen}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="interactive-tile p-3">
              <div className="panel-subtle text-[10px]">风险提示</div>
              <p className="mt-2 text-xs leading-5 text-ink-500/80">{hostPhase.risk}</p>
            </div>
            <div className="interactive-tile p-3">
              <div className="panel-subtle text-[10px]">下一阈值</div>
              <p className="mt-2 text-xs leading-5 text-ink-500/80">{hostPhase.nextTrigger}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="codex-tab px-3 py-2">金狮 {player.货币.金狮 ?? 0}</div>
        <div className="codex-tab px-3 py-2">银辉币 {player.货币.银辉币 ?? 0}</div>
        <div className="codex-tab px-3 py-2">铜叶币 {player.货币.铜叶币 ?? 0}</div>
        <div className="codex-tab px-3 py-2">以太结晶 {player.货币.以太结晶 ?? 0}</div>
      </div>
    </div>
  );
}

export function StoryPanel({
  displayMessages,
  logs,
  options,
  optionsExpanded,
  actSummary,
  actSummaryTags,
  onToggleOptions,
  currentMessageInfo,
  contextMenu,
  onLongPressStart,
  onLongPressEnd,
  onSelectOption,
}: {
  displayMessages: ConversationFlowItem[];
  logs: LogEntry[];
  options: Option[];
  optionsExpanded: boolean;
  actSummary: string;
  actSummaryTags: string[];
  onToggleOptions: () => void;
  currentMessageInfo: { messageId?: number | null };
  contextMenu: { x: number; y: number } | null;
  onLongPressStart: (event: import('react').MouseEvent | import('react').TouchEvent) => void;
  onLongPressEnd: () => void;
  onSelectOption: (text: string) => void;
}) {
  const content = displayMessages.length
    ? displayMessages.map((item, index) => (
        <motion.div
          key={`${item.type}-${index}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className={
            item.type === 'user'
              ? 'text-right pl-6 sm:pl-12'
              : 'text-left pr-4 sm:pr-8 whitespace-pre-wrap leading-8 text-[15px] sm:text-base text-ink-500'
          }
        >
          {item.type === 'user' ? (
            <span className="inline-block codex-tab rounded-2xl rounded-tr-sm px-4 py-2 italic">
              {item.text}
            </span>
          ) : (
            item.text
          )}
        </motion.div>
      ))
    : logs.map((log, index) => (
        <motion.div
          key={`${log.type}-${index}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={
            log.type === 'system'
              ? 'text-center text-xs text-ink-500/55 border-b border-ink-500/5 pb-2 panel-subtle'
              : log.type === 'user'
                ? 'text-right pl-6 sm:pl-12'
                : 'text-left pr-4 sm:pr-8 whitespace-pre-wrap leading-8 text-[15px] sm:text-base text-ink-500'
          }
        >
          {log.type === 'user' ? (
            <span className="inline-block codex-tab rounded-2xl rounded-tr-sm px-4 py-2 italic">
              {log.text}
            </span>
          ) : (
            log.text
          )}
        </motion.div>
      ));

  return (
    <div
      className={`story-surface manuscript-panel arcane-frame maintext-container min-h-0 flex-1 relative ${currentMessageInfo.messageId != null ? 'cursor-pointer' : ''}`}
      onMouseDown={event => {
        if (!contextMenu && currentMessageInfo.messageId != null) onLongPressStart(event);
      }}
      onMouseUp={onLongPressEnd}
      onMouseLeave={onLongPressEnd}
      onTouchStart={event => {
        if (!contextMenu && currentMessageInfo.messageId != null) onLongPressStart(event);
      }}
      onTouchEnd={onLongPressEnd}
      onTouchCancel={onLongPressEnd}
    >
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[var(--surface-1)] to-transparent pointer-events-none z-10" />
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[var(--surface-1)] to-transparent pointer-events-none z-10" />

      <div className="relative z-[1] flex flex-col gap-6 px-4 py-5 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="panel-subtle text-[10px]">Chronicle</span>
          <div className="rune-divider flex-1" />
        </div>
        {content}

        {actSummary ? (
          <div className="relative overflow-hidden rounded-sm border border-[color:var(--manuscript-edge)] bg-white/30 p-4">
            <div className="panel-subtle text-[10px]">Chronicle Anchor</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {actSummaryTags.slice(0, 4).map(tag => (
                <span key={tag} className="world-reactive-chip text-[10px] uppercase">
                  {tag}
                </span>
              ))}
            </div>
            <p className="mt-3 border-l-2 border-[var(--world-accent-strong)] pl-4 text-sm leading-7 text-ink-500/80">
              {actSummary}
            </p>
          </div>
        ) : null}

        {options.length > 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-5">
            <div className="rune-divider" />
            <button type="button" onClick={onToggleOptions} className="w-full flex items-center justify-between text-left py-3">
              <span className="panel-subtle text-xs">可选行动</span>
              {optionsExpanded ? <ChevronUp className="w-4 h-4 text-ink-400" /> : <ChevronDown className="w-4 h-4 text-ink-400" />}
            </button>
            <AnimatePresence>
              {optionsExpanded ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid gap-3 pt-3">
                    {options.map(option => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => onSelectOption(option.text)}
                        className="interactive-tile ritual-button flex items-center gap-4 w-full p-4 text-left"
                      >
                        <span className="w-8 h-8 shrink-0 rounded-full border border-gold-500/25 bg-gold-500/8 flex items-center justify-center font-display text-sm shadow-[0_0_18px_var(--world-glow)]">
                          {option.id}
                        </span>
                        <span className="flex-1">{option.text}</span>
                        <Feather className="w-4 h-4 text-ink-400" />
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}

export function ActionInputPanel({
  input,
  isSending,
  onInputChange,
  onSend,
}: {
  input: string;
  isSending: boolean;
  onInputChange: (value: string) => void;
  onSend: () => void;
}) {
  return (
    <div className="panel-shell manuscript-panel p-2 rounded-sm flex items-center gap-2">
      <div className="hidden sm:flex w-10 h-10 items-center justify-center rounded-sm border border-[color:var(--manuscript-edge)] bg-white/10 shrink-0">
        <Feather className="w-4 h-4 text-ink-400" />
      </div>
      <input
        type="text"
        value={input}
        onChange={event => onInputChange(event.target.value)}
        onKeyDown={event => {
          if (event.key === 'Enter' && !isSending) onSend();
        }}
        placeholder={isSending ? '正在生成...' : '输入行动，或直接点击上方选项...'}
        disabled={isSending}
        className="flex-1 min-w-0 bg-transparent px-3 py-3 outline-none text-base placeholder:text-ink-500/35 disabled:opacity-60"
      />
      <button
        type="button"
        onClick={onSend}
        disabled={isSending}
        className="interactive-tile ritual-button px-4 py-3 bg-gradient-to-b from-gold-600 to-gold-500 text-parchment-50 border-gold-400/40 disabled:opacity-60"
      >
        <Feather className="w-4 h-4" />
      </button>
    </div>
  );
}

export function WorldSidebar({
  world,
  questSummaries,
  currentRegion,
  hostPhase,
  focusedProphecy,
  theologyEcho,
  onOpenMap,
  onOpenQuests,
  onOpenSocial,
  onOpenArchives,
}: {
  world: { 委托等级?: string };
  questSummaries: QuestSummaryItem[];
  currentRegion: {
    dominantCrisis: string;
    recommendedFocus: string;
    signatureAnomaly: string;
    linkedProphecy: string;
    linkedGod: string;
  };
  hostPhase: HostPhase;
  focusedProphecy: { name: string; status: string; desc: string };
  theologyEcho: string;
  onOpenMap: () => void;
  onOpenQuests: () => void;
  onOpenSocial: () => void;
  onOpenArchives: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:gap-4 h-full">
      <button type="button" onClick={onOpenMap} className="sidebar-action manuscript-panel arcane-frame aspect-video min-h-[110px] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://img.freepik.com/free-vector/ancient-map-background_1284-15632.jpg')] bg-cover bg-center opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-500/70 via-transparent to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-full bg-parchment-50/85 p-3 border border-ink-500/20">
            <MapIcon className="w-6 h-6 text-ink-500" />
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 px-4 py-3 font-display tracking-widest text-parchment-50 text-sm">世界地图</div>
      </button>

      <div className="panel-shell manuscript-panel arcane-frame p-4 rounded-sm">
        <div className="panel-subtle text-[10px]">世界偏压</div>
        <div className="mt-2 font-display text-lg">{focusedProphecy.name}</div>
        <p className="mt-2 text-sm leading-6 text-ink-500/80">{focusedProphecy.desc}</p>
        <div className="mt-4 grid gap-3">
          <div className="interactive-tile p-3">
            <div className="panel-subtle text-[10px]">主导危机</div>
            <p className="mt-2 text-xs leading-5 text-ink-500/75">{currentRegion.dominantCrisis}</p>
          </div>
          <div className="interactive-tile p-3">
            <div className="panel-subtle text-[10px]">典型异象</div>
            <p className="mt-2 text-xs leading-5 text-ink-500/75">{currentRegion.signatureAnomaly}</p>
          </div>
          <div className="interactive-tile p-3">
            <div className="panel-subtle text-[10px]">神学回声</div>
            <p className="mt-2 text-xs leading-5 text-ink-500/75">{theologyEcho}</p>
          </div>
        </div>
      </div>

      <div className="panel-shell manuscript-panel arcane-frame p-4 rounded-sm flex-1 min-h-[240px]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="panel-title text-base flex items-center gap-2">
            <Scroll className="w-4 h-4" />
            委托板
          </h3>
          <span className="panel-subtle text-xs">{world.委托等级 || '铜牌'}</span>
        </div>
        <div className="rune-divider mb-4" />
        <div className="space-y-3">
          {(questSummaries.length ? questSummaries : [{ name: '暂无委托', description: '当前没有可追踪的委托。' }]).map(quest => (
            <button key={quest.name} type="button" onClick={onOpenQuests} className="interactive-tile ritual-button w-full p-3 text-left">
              <div className="flex items-start justify-between gap-3">
                <span className="font-display text-sm">{quest.name}</span>
                {quest.status ? <span className="panel-subtle text-[10px]">{quest.status}</span> : null}
              </div>
              {quest.description ? <p className="mt-2 text-xs text-ink-500/70 line-clamp-2">{quest.description}</p> : null}
            </button>
          ))}
        </div>
      </div>

      <button type="button" onClick={onOpenSocial} className="sidebar-action manuscript-panel p-4 flex items-center justify-center gap-3 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_36%),linear-gradient(180deg,rgba(249,243,229,0.92),rgba(233,219,187,0.84))]">
        <User className="w-4 h-4" />
        <span className="font-display tracking-widest text-sm">社交与队伍</span>
      </button>

      <button type="button" onClick={onOpenArchives} className="sidebar-action manuscript-panel ritual-button p-4 flex items-center justify-center gap-3 bg-ink-500 text-parchment-100 hover:bg-ink-400">
        <BookOpen className="w-4 h-4" />
        <div className="text-left">
          <div className="font-display tracking-widest text-sm">末日档案馆</div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-parchment-100/70">
            {hostPhase.code} · {currentRegion.linkedGod}
          </div>
        </div>
      </button>
    </div>
  );
}
