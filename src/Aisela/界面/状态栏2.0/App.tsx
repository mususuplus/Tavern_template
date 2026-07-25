import {
  Activity,
  Archive,
  BookMarked,
  BookOpenText,
  Clock3,
  Gauge,
  History,
  Map,
  Maximize2,
  Minimize2,
  Music2,
  Search,
  Settings,
  Sparkles,
  UserRound,
  Users,
  Volume2,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useMvu } from '../主界面/MvuContext';
import { PLAYLIST } from '../主界面/data/worldData';
import { useFullscreenAudio } from '../主界面/hooks/useFullscreenAudio';
import { OpeningRitual } from './components/OpeningRitual';
import { CurtainTransition, useCurtainTransition } from './components/CurtainTransition';
import { OrreryScene } from './components/OrreryScene';
import {
  AtlasView,
  ChronicleView,
  CoreView,
  FiguresView,
  HistoryView,
  ProphecyView,
  VaultView,
} from './components/ObservatoryViews';
import { StarChartScene } from './components/StarChartScene';
import { CORE_NPC_LORE, LOCATION_LORE, REGION_BY_NAME, REGION_LORE } from './data/loreData';
import { loreExcerpt, normalizeLoreTerm, resolveLocation, resolveRegion, searchLore } from './data/loreUtils';
import type { LoreSearchResult, ObservatoryMode, RenderQuality } from './types';

const modeItems: Array<{
  key: ObservatoryMode;
  label: string;
  hint: string;
  icon: typeof Activity;
}> = [
  { key: 'core', label: '观测核心', hint: '生命与宿主相位', icon: Activity },
  { key: 'atlas', label: '世界星盘', hint: '七域与六十四处坐标', icon: Map },
  { key: 'figures', label: '命运群像', hint: '传奇、关系与势力', icon: Users },
  { key: 'chronicle', label: '旅途编年', hint: '末日、情报与委托', icon: BookOpenText },
  { key: 'history', label: '历史', hint: '统一纪元与史诗事件', icon: History },
  { key: 'prophecy', label: '末日预言书', hint: '七大灭世要素', icon: BookMarked },
  { key: 'vault', label: '武装圣匣', hint: '装备、货币与行囊', icon: Archive },
];

const kindLabel: Record<LoreSearchResult['kind'], string> = {
  region: '区域卷宗',
  location: '地点坐标',
  npc: '传奇人物',
  faction: '势力记录',
  quest: '委托轨迹',
};

function getDisplayName() {
  return typeof SillyTavern !== 'undefined' && SillyTavern.name1 ? SillyTavern.name1 : '艾瑟兰旅人';
}

function hasMessageStatData() {
  try {
    return _.has(getVariables({ type: 'message', message_id: getLastMessageId() }), 'stat_data');
  } catch {
    return false;
  }
}

function isOpeningFloor() {
  try {
    return getLastMessageId() <= 0;
  } catch {
    return true;
  }
}

function readStoredQuality(): RenderQuality {
  try {
    const value = localStorage.getItem('aisela-status-v2-quality');
    return value === 'high' || value === 'low' || value === 'balanced' ? value : 'balanced';
  } catch {
    return 'balanced';
  }
}

function readReducedMotion() {
  try {
    const stored = localStorage.getItem('aisela-status-v2-reduced-motion');
    if (stored !== null) return stored === 'true';
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  } catch {
    return false;
  }
}

export default function App() {
  const { data } = useMvu();
  const player = data.主角;
  const world = data.世界;
  const displayName = getDisplayName();
  const hasStatData = hasMessageStatData();
  const [openingDone, setOpeningDone] = useState(false);
  const shouldShowOpening = !openingDone && isOpeningFloor();
  const [mode, setMode] = useState<ObservatoryMode>('core');
  const [atlasPresentation, setAtlasPresentation] = useState<'orrery' | 'chart'>('orrery');
  const currentLocationMatch = resolveLocation(player.当前地点);
  const currentRegionMatch = resolveRegion(player.当前地点);
  const [selectedRegionName, setSelectedRegionName] = useState(currentRegionMatch?.name ?? REGION_LORE[0].name);
  const [selectedLocationId, setSelectedLocationId] = useState(currentLocationMatch?.id ?? '');
  const [selectedNpcId, setSelectedNpcId] = useState(CORE_NPC_LORE[0].id);
  const [quality, setQuality] = useState<RenderQuality>(readStoredQuality);
  const [reducedMotion, setReducedMotion] = useState(readReducedMotion);
  const {
    isTransitioning,
    phase: curtainPhase,
    transitionTo: requestPageTransition,
  } = useCurtainTransition(reducedMotion);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [musicOpen, setMusicOpen] = useState(false);
  const previousLocationRef = useRef(player.当前地点);
  const readingRef = useRef<HTMLElement>(null);
  const {
    audioRef,
    mainContainerRef,
    currentTrackIndex,
    isMusicPlaying,
    isFullscreen,
    toggleFullscreen,
    handleTrackClick,
    setIsMusicPlaying,
  } = useFullscreenAudio(PLAYLIST);

  const selectedRegion = REGION_BY_NAME.get(selectedRegionName) ?? REGION_LORE[0];
  const selectedLocation = LOCATION_LORE.find(location => location.id === selectedLocationId);
  const selectedNpc = CORE_NPC_LORE.find(npc => npc.id === selectedNpcId) ?? CORE_NPC_LORE[0];
  const showStarChart = mode === 'atlas' && atlasPresentation === 'chart';

  useEffect(() => {
    if (player.当前地点 === previousLocationRef.current) return;
    previousLocationRef.current = player.当前地点;
    const nextRegion = resolveRegion(player.当前地点);
    const nextLocation = resolveLocation(player.当前地点);
    if (nextRegion) setSelectedRegionName(nextRegion.name);
    if (nextLocation) setSelectedLocationId(nextLocation.id);
  }, [player.当前地点]);

  useEffect(() => {
    try {
      localStorage.setItem('aisela-status-v2-quality', quality);
    } catch {
      // iframe storage may be unavailable; the active setting still applies for this mount.
    }
  }, [quality]);

  useEffect(() => {
    try {
      localStorage.setItem('aisela-status-v2-reduced-motion', String(reducedMotion));
    } catch {
      // iframe storage may be unavailable; the active setting still applies for this mount.
    }
  }, [reducedMotion]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (event.key === '/' && !target?.closest('input, textarea, select')) {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === 'Escape') {
        setSearchOpen(false);
        setSettingsOpen(false);
        setMusicOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const searchResults = useMemo(() => {
    const staticResults = searchLore(searchQuery);
    const normalized = normalizeLoreTerm(searchQuery);
    if (!normalized) return staticResults;
    const factions: LoreSearchResult[] = Object.entries(data.势力)
      .filter(([name, faction]) => normalizeLoreTerm(`${name}${faction.描述}${faction.声望}`).includes(normalized))
      .map(([name, faction]) => ({
        kind: 'faction',
        id: `faction-${name}`,
        name,
        eyebrow: faction.声望,
        excerpt: faction.描述,
      }));
    const quests: LoreSearchResult[] = Object.entries(data.委托列表)
      .filter(([name, quest]) =>
        normalizeLoreTerm(`${name}${quest.说明}${quest.目标}${quest.危机关联}`).includes(normalized),
      )
      .map(([name, quest]) => ({
        kind: 'quest',
        id: `quest-${name}`,
        name,
        eyebrow: `${quest.类型} · ${quest.状态}`,
        excerpt: quest.说明 || quest.目标,
      }));
    return [...staticResults, ...factions, ...quests].slice(0, 24);
  }, [data.势力, data.委托列表, searchQuery]);

  const chooseRegion = (name: string) => {
    setSelectedRegionName(name);
    const first = LOCATION_LORE.find(location => location.region === name);
    setSelectedLocationId(first?.id ?? '');
  };

  const changeMode = (nextMode: ObservatoryMode) => {
    if (nextMode === mode) return;
    setMode(nextMode);
    if (!isFullscreen) return;
    requestAnimationFrame(() => {
      readingRef.current?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    });
  };

  const changeAtlasPresentation = (nextPresentation: 'orrery' | 'chart') => {
    if (nextPresentation === atlasPresentation) return;
    setAtlasPresentation(nextPresentation);
  };

  const chooseSearchResult = (result: LoreSearchResult) => {
    if (result.kind === 'region') {
      const region = REGION_LORE.find(item => item.id === result.id);
      if (region) chooseRegion(region.name);
      setMode('atlas');
    } else if (result.kind === 'location') {
      const location = LOCATION_LORE.find(item => item.id === result.id);
      if (location) {
        setSelectedRegionName(location.region);
        setSelectedLocationId(location.id);
      }
      setMode('atlas');
    } else if (result.kind === 'npc') {
      const npc = CORE_NPC_LORE.find(item => item.id === result.id);
      if (npc) setSelectedNpcId(npc.id);
      setMode('figures');
    } else if (result.kind === 'faction') {
      setMode('figures');
    } else {
      setMode('chronicle');
    }
    setSearchOpen(false);
    setSearchQuery('');
  };

  if (shouldShowOpening) {
    return (
      <div className="observatory-shell opening-shell" ref={mainContainerRef}>
        <CurtainTransition phase={curtainPhase} reducedMotion={reducedMotion} />
        <OpeningRitual
          isTransitioning={isTransitioning}
          onComplete={() => requestPageTransition(() => setOpeningDone(true))}
          requestPageChange={requestPageTransition}
        />
      </div>
    );
  }

  const centerLabel =
    mode === 'atlas'
      ? {
          eyebrow: 'SELECTED REGION',
          title: selectedRegion.name,
          detail: `${selectedRegion.shortName} · ${selectedRegion.accent.toUpperCase()}`,
        }
      : mode === 'figures'
        ? { eyebrow: 'SELECTED PERSON', title: selectedNpc.name, detail: loreExcerpt(selectedNpc.content, 60) }
        : mode === 'chronicle'
          ? { eyebrow: 'DOOM OBSERVATION', title: `${world.末日时钟刻度} / XII`, detail: world.当前聚焦预言 }
          : mode === 'history'
            ? { eyebrow: 'HISTORICAL ARCHIVE', title: '统一纪元', detail: '盟约、王冠与漫长的共同秩序' }
            : mode === 'prophecy'
              ? { eyebrow: 'BOOK OF LAST THINGS', title: '七大灭世要素', detail: world.当前聚焦预言 }
              : mode === 'vault'
                ? {
                    eyebrow: 'RELIQUARY',
                    title: player.职业,
                    detail: `${Object.keys(player.物品栏).length} 类物品 · ${Object.keys(player.装备栏).length} 个装备方位`,
                  }
                : {
                    eyebrow: 'CURRENT COORDINATE',
                    title: player.当前地点,
                    detail: `${player.状态} · ${player.宿主档案.阶段称谓}`,
                  };

  return (
    <div className={`observatory-shell mode-${mode}${isFullscreen ? ' is-fullscreen' : ''}`} ref={mainContainerRef}>
      {isTransitioning && <CurtainTransition phase={curtainPhase} reducedMotion={reducedMotion} />}
      <audio onEnded={() => setIsMusicPlaying(false)} ref={audioRef} />
      <header className="observatory-rail">
        <div className="observatory-identity">
          <Sparkles aria-hidden="true" />
          <div>
            <span>AISELA · ARCANE ORRERY II</span>
            <strong>{displayName}</strong>
            <small>{player.称号}</small>
          </div>
        </div>

        <div className="rail-worldline">
          <Clock3 aria-hidden="true" />
          <div>
            <span>{world.纪元}</span>
            <strong>
              {world.月}月{world.日}日 · {world.时段}
            </strong>
          </div>
          <i>{world.末日时钟刻度}</i>
        </div>

        <div className="rail-actions">
          <button aria-label="星语检索" onClick={() => setSearchOpen(true)} title="星语检索（/）" type="button">
            <Search />
          </button>
          <button
            aria-label="音乐"
            className={isMusicPlaying ? 'is-active' : ''}
            onClick={() => {
              setMusicOpen(open => !open);
              setSettingsOpen(false);
            }}
            type="button"
          >
            <Music2 />
          </button>
          <button
            aria-label="设置"
            className={settingsOpen ? 'is-active' : ''}
            onClick={() => {
              setSettingsOpen(open => !open);
              setMusicOpen(false);
            }}
            type="button"
          >
            <Settings />
          </button>
          <button aria-label={isFullscreen ? '退出全屏' : '进入全屏'} onClick={toggleFullscreen} type="button">
            {isFullscreen ? <Minimize2 /> : <Maximize2 />}
          </button>
        </div>

        {musicOpen && (
          <div className="utility-popover music-popover">
            <div className="popover-title">
              <Volume2 />
              <span>天象室乐匣</span>
              <button aria-label="关闭音乐面板" onClick={() => setMusicOpen(false)} type="button">
                <X />
              </button>
            </div>
            {PLAYLIST.map((track, index) => (
              <button
                className={currentTrackIndex === index ? 'is-current' : ''}
                key={track.url}
                onClick={() => handleTrackClick(index)}
                type="button"
              >
                <i>{String(index + 1).padStart(2, '0')}</i>
                <span>{track.name}</span>
                <small>{currentTrackIndex === index && isMusicPlaying ? '正在回响' : '播放'}</small>
              </button>
            ))}
          </div>
        )}

        {settingsOpen && (
          <div className="utility-popover settings-popover">
            <div className="popover-title">
              <Gauge />
              <span>天仪校准</span>
              <button aria-label="关闭设置" onClick={() => setSettingsOpen(false)} type="button">
                <X />
              </button>
            </div>
            <fieldset>
              <legend>星尘精度</legend>
              {(['high', 'balanced', 'low'] as RenderQuality[]).map(value => (
                <button
                  className={quality === value ? 'is-current' : ''}
                  key={value}
                  onClick={() => setQuality(value)}
                  type="button"
                >
                  <strong>{value === 'high' ? '辉耀' : value === 'balanced' ? '均衡' : '静谧'}</strong>
                  <small>{value === 'high' ? '2600 星尘' : value === 'balanced' ? '760 星尘' : '90 星尘'}</small>
                </button>
              ))}
            </fieldset>
            <label className="motion-switch">
              <input
                checked={reducedMotion}
                onChange={event => setReducedMotion(event.target.checked)}
                type="checkbox"
              />
              <span>减少星轨运动</span>
            </label>
          </div>
        )}
      </header>

      {!hasStatData && (
        <div className="uninitialized-notice" role="status">
          <span>当前楼层没有读取到 stat_data，天体仪正以 schema 默认档案显现。</span>
        </div>
      )}

      <section className={`observatory-stage${showStarChart ? ' is-star-chart' : ''}`} aria-label="奥法天体仪">
        {showStarChart ? (
          <StarChartScene
            onSelectRegion={chooseRegion}
            quality={quality}
            reducedMotion={reducedMotion}
            regions={REGION_LORE}
            selectedRegionName={selectedRegion.name}
          />
        ) : (
          <OrreryScene
            mode={mode}
            onSelectRegion={chooseRegion}
            quality={quality}
            reducedMotion={reducedMotion}
            regions={REGION_LORE}
            selectedRegionName={selectedRegion.name}
          />
        )}
        <div className="center-inscription">
          <span>{centerLabel.eyebrow}</span>
          <h1>{centerLabel.title}</h1>
          <p>{centerLabel.detail}</p>
        </div>

        {mode === 'atlas' && (
          <div className="atlas-presentation-switch" aria-label="世界星盘呈现方式">
            <button
              aria-pressed={atlasPresentation === 'orrery'}
              className={atlasPresentation === 'orrery' ? 'is-active' : ''}
              onClick={() => changeAtlasPresentation('orrery')}
              type="button"
            >
              星环观测
            </button>
            <button
              aria-pressed={atlasPresentation === 'chart'}
              className={atlasPresentation === 'chart' ? 'is-active' : ''}
              onClick={() => changeAtlasPresentation('chart')}
              type="button"
            >
              星图观测
            </button>
          </div>
        )}

        <nav className="mode-orbit" aria-label="天体仪观测模式">
          {modeItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                aria-current={mode === item.key ? 'page' : undefined}
                className={mode === item.key ? 'is-active' : ''}
                key={item.key}
                onClick={() => changeMode(item.key)}
                type="button"
              >
                <Icon />
                <span>{item.label}</span>
                <small>{item.hint}</small>
              </button>
            );
          })}
        </nav>
      </section>

      <main className="observatory-reading" ref={readingRef}>
        {mode === 'core' && <CoreView data={data} displayName={displayName} />}
        {mode === 'atlas' && (
          <AtlasView
            currentLocation={player.当前地点}
            location={selectedLocation}
            onSelectLocation={location => setSelectedLocationId(location.id)}
            region={selectedRegion}
          />
        )}
        {mode === 'figures' && (
          <FiguresView data={data} onSelectNpc={npc => setSelectedNpcId(npc.id)} selectedNpc={selectedNpc} />
        )}
        {mode === 'chronicle' && <ChronicleView data={data} />}
        {mode === 'history' && <HistoryView />}
        {mode === 'prophecy' && <ProphecyView data={data} />}
        {mode === 'vault' && <VaultView data={data} />}
      </main>

      {searchOpen && (
        <div className="search-veil" role="dialog" aria-label="星语检索" aria-modal="true">
          <button className="veil-dismiss" aria-label="关闭检索" onClick={() => setSearchOpen(false)} type="button" />
          <section className="search-plane">
            <header>
              <Search />
              <div>
                <span>ASTRAL INDEX</span>
                <h2>星语检索</h2>
              </div>
              <button aria-label="关闭检索" onClick={() => setSearchOpen(false)} type="button">
                <X />
              </button>
            </header>
            <label>
              <Search />
              <input
                autoFocus
                onChange={event => setSearchQuery(event.target.value)}
                placeholder="输入地点、人物、势力、委托或设定关键词…"
                value={searchQuery}
              />
              <kbd>/</kbd>
            </label>
            <div className="search-results">
              {!searchQuery && (
                <p className="search-guidance">七域卷宗已全部开放。试着检索“圣罗兰城”“魔王”“月亮井”或某个势力。</p>
              )}
              {searchQuery && !searchResults.length && (
                <p className="search-guidance">星盘中没有找到与“{searchQuery}”相合的铭文。</p>
              )}
              {searchResults.map(result => (
                <button key={`${result.kind}-${result.id}`} onClick={() => chooseSearchResult(result)} type="button">
                  <i>{result.kind === 'npc' ? <UserRound /> : result.kind === 'quest' ? <BookOpenText /> : <Map />}</i>
                  <span>
                    <small>
                      {kindLabel[result.kind]} · {result.eyebrow}
                    </small>
                    <strong>{result.name}</strong>
                    <p>{result.excerpt}</p>
                  </span>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
