import { Clock, Compass, Shield, User, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type React from 'react';

import type { EditingMessage, HostPhase, InventoryItem, NPC, RegionMeta, ReputationLevel, StorySummaryMeta, Teammate } from '../types';
import { EquipmentSlotThumbnail, Modal, StatBar } from './gamePrimitives';

type QuestDetail = {
  name: string;
  description?: string;
  target?: string;
  reward?: string;
  penalty?: string;
  status?: string;
};

type StatusDetail = { label: string; short: string; desc: string };
type TheologyPair = { element: string; god: string; desc: string };
type Prophecy = { name: string; status: string; desc: string };
type FactionEntry = { name: string; reputation: ReputationLevel; description: string };
type ArchiveView = 'menu' | 'prophecies' | 'theology' | 'pantheon' | 'host';

function reputationTone(value: ReputationLevel) {
  switch (value) {
    case '崇拜':
      return 'text-fuchsia-500';
    case '盟友':
      return 'text-cyan-500';
    case '友善':
      return 'text-emerald-600';
    case '中立':
      return 'text-slate-500';
    case '冷淡':
      return 'text-amber-700';
    case '敌对':
      return 'text-rose-600';
    case '通缉':
      return 'text-red-600';
    default:
      return 'text-slate-500';
  }
}

export function ReadingModal({
  isOpen,
  onClose,
  readingFloors,
}: {
  isOpen: boolean;
  onClose: () => void;
  readingFloors: Array<{ messageId: number; maintext: string; summaryMeta: StorySummaryMeta | null }>;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="阅读模式" maxWidth="max-w-4xl">
      <div className="space-y-5">
        {readingFloors.length === 0 ? (
          <p className="panel-subtle italic">暂无包含正文的楼层。</p>
        ) : (
          readingFloors.map(floor => (
            <section key={floor.messageId} className="panel-shell manuscript-panel arcane-frame p-5 rounded-sm">
              <div className="panel-subtle text-xs">楼层 #{floor.messageId}</div>
              {floor.summaryMeta?.worldTags?.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {floor.summaryMeta.worldTags.slice(0, 4).map(tag => (
                    <span key={tag} className="world-reactive-chip text-[10px] uppercase">
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
              <div className="mt-3 whitespace-pre-wrap leading-7 text-ink-500">{floor.maintext}</div>
            </section>
          ))
        )}
      </div>
    </Modal>
  );
}

export function SaveListModal({
  isOpen,
  onClose,
  saveListFloors,
  onBranchCreate,
}: {
  isOpen: boolean;
  onClose: () => void;
  saveListFloors: Array<{ messageId: number; sum: string; summaryMeta: StorySummaryMeta | null }>;
  onBranchCreate: (messageId: number) => void;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="读档分支" maxWidth="max-w-2xl">
      <div className="space-y-3">
        {saveListFloors.length === 0 ? (
          <p className="panel-subtle italic">暂无可用于创建分支的摘要楼层。</p>
        ) : (
          saveListFloors.map(floor => (
            <button key={floor.messageId} type="button" onClick={() => onBranchCreate(floor.messageId)} className="interactive-tile ritual-button w-full p-4 text-left">
              <div className="panel-subtle text-xs">楼层 #{floor.messageId}</div>
              {floor.summaryMeta?.tags?.length ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {floor.summaryMeta.tags.slice(0, 4).map(tag => (
                    <span key={tag} className="world-reactive-chip text-[10px] uppercase">
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
              <p className="mt-2 text-sm leading-6 text-ink-500">{floor.sum}</p>
            </button>
          ))
        )}
      </div>
    </Modal>
  );
}

export function MusicModal({
  isOpen,
  onClose,
  playlist,
  currentTrackIndex,
  isMusicPlaying,
  onTrackClick,
}: {
  isOpen: boolean;
  onClose: () => void;
  playlist: Array<{ name: string; url: string }>;
  currentTrackIndex: number | null;
  isMusicPlaying: boolean;
  onTrackClick: (index: number) => void;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="歌单" maxWidth="max-w-md">
      <div className="space-y-2">
        {playlist.map((track, index) => {
          const active = currentTrackIndex === index;
          return (
            <button
              key={track.url}
              type="button"
              onClick={() => onTrackClick(index)}
              className={`interactive-tile ritual-button w-full p-4 text-left ${active ? 'border-rust-500/45 bg-rust-500/10 text-rust-700' : ''}`}
            >
              <div className="flex items-center justify-between gap-3">
                <span>{track.name}</span>
                {active ? <span className="text-xs">{isMusicPlaying ? '播放中' : '已暂停'}</span> : null}
              </div>
            </button>
          );
        })}
      </div>
    </Modal>
  );
}

export function SocialModal({
  isOpen,
  onClose,
  socialTab,
  onSocialTabChange,
  teammates,
  npcs,
  focusedProphecyName,
  squadCommandMemberIndex,
  onSquadCommandToggle,
  appendToInput,
  clearSquadCommand,
}: {
  isOpen: boolean;
  onClose: () => void;
  socialTab: 'squad' | 'npcs';
  onSocialTabChange: (tab: 'squad' | 'npcs') => void;
  teammates: Teammate[];
  npcs: NPC[];
  focusedProphecyName: string;
  squadCommandMemberIndex: number | null;
  onSquadCommandToggle: (index: number) => void;
  appendToInput: (text: string) => void;
  clearSquadCommand: () => void;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="社交与队伍" maxWidth="max-w-5xl">
      <div className="space-y-5" onClick={clearSquadCommand}>
        <div className="flex border-b border-ink-500/10">
          <button
            type="button"
            onClick={() => onSocialTabChange('squad')}
            className={`px-4 py-2 font-display text-sm tracking-widest border-b-2 ${socialTab === 'squad' ? 'border-rust-500 text-rust-600' : 'border-transparent text-ink-500/50'}`}
          >
            小队成员
          </button>
          <button
            type="button"
            onClick={() => onSocialTabChange('npcs')}
            className={`px-4 py-2 font-display text-sm tracking-widest border-b-2 ${socialTab === 'npcs' ? 'border-rust-500 text-rust-600' : 'border-transparent text-ink-500/50'}`}
          >
            人际关系
          </button>
        </div>

        {socialTab === 'squad' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teammates.map((member, index) => (
              <div key={`${member.name}-${index}`} className="panel-shell manuscript-panel arcane-frame p-4 rounded-sm relative" onClick={event => event.stopPropagation()}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-lg">{member.name}</h3>
                    <p className="panel-subtle text-xs mt-1">{member.profession}</p>
                  </div>
                  <span className="panel-subtle text-xs">{member.status}</span>
                </div>
                <div className="mt-4">
                  <StatBar label="生命" value={member.hp} max={member.maxHp} colorClass="bg-rust-500" />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <div className="relative">
                    <button type="button" onClick={() => onSquadCommandToggle(index)} className="interactive-tile ritual-button px-3 py-2 text-xs">
                      指令
                    </button>
                    {squadCommandMemberIndex === index ? (
                      <div className="panel-shell manuscript-panel absolute top-full left-0 mt-1 min-w-[10rem] rounded-sm shadow-lg z-20">
                        <button type="button" onClick={() => appendToInput(`让${member.name}发起攻击`)} className="w-full text-left px-3 py-2 hover:bg-ink-500/5">
                          发起攻击
                        </button>
                        <button type="button" onClick={() => appendToInput(`让${member.name}掩护我`)} className="w-full text-left px-3 py-2 hover:bg-ink-500/5">
                          掩护我
                        </button>
                        <button type="button" onClick={() => appendToInput(`让${member.name}暂时撤离`)} className="w-full text-left px-3 py-2 hover:bg-ink-500/5">
                          暂时撤离
                        </button>
                      </div>
                    ) : null}
                  </div>
                  <button type="button" onClick={() => appendToInput(`和${member.name}交换物品`)} className="interactive-tile ritual-button px-3 py-2 text-xs">
                    交换物品
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {npcs.map((npc, index) => (
              <div key={`${npc.name}-${index}`} className="panel-shell manuscript-panel arcane-frame p-4 rounded-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border border-ink-500/10 bg-ink-500/5 flex items-center justify-center">
                      <User className="w-4 h-4 text-ink-400" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg">{npc.name}</h3>
                      <div className="panel-subtle text-xs">{npc.relation}</div>
                    </div>
                  </div>
                  <div className="w-full md:w-48">
                    <div className="flex justify-between text-xs mb-1">
                      <span>好感度</span>
                      <span>{npc.affinity}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-ink-500/10 overflow-hidden">
                      <div className="h-full bg-rust-500" style={{ width: `${npc.affinity}%` }} />
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-sm italic text-ink-500/75">“{npc.description}”</p>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                  <div className="interactive-tile p-3">
                    <div className="panel-subtle text-[10px]">态度温度</div>
                    <div className="mt-2">{npc.temperature || '未定'}</div>
                  </div>
                  <div className="interactive-tile p-3">
                    <div className="panel-subtle text-[10px]">阵营牵引</div>
                    <div className="mt-2">{npc.stance || '地方侧'}</div>
                  </div>
                  <div className="interactive-tile p-3">
                    <div className="panel-subtle text-[10px]">当前偏压</div>
                    <div className="mt-2 line-clamp-2">{npc.factionPull || `对 ${focusedProphecyName} 暂无明确表态。`}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

export function MapModal({
  isOpen,
  onClose,
  emblems,
  worldRegions,
  player,
  currentRegion,
  selectedRegion,
  selectedRegionFactions,
  doomPressure,
  awakeningState,
  theologyEcho,
  appendToInput,
  setSelectedMapRegion,
}: {
  isOpen: boolean;
  onClose: () => void;
  emblems: { map: string };
  worldRegions: RegionMeta[];
  player: { 当前地点: string };
  currentRegion: RegionMeta;
  selectedRegion: RegionMeta;
  selectedRegionFactions: FactionEntry[];
  doomPressure: StatusDetail;
  awakeningState: StatusDetail;
  theologyEcho: string;
  appendToInput: (text: string) => void;
  setSelectedMapRegion: (name: string) => void;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="世界地图" maxWidth="max-w-6xl">
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_22rem] gap-6">
        <div className="space-y-4">
          <div className="world-reactive-panel manuscript-panel arcane-frame relative aspect-[16/9] rounded-sm overflow-hidden border border-white/10">
            <img src={emblems.map} alt="世界地图" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-500/30 via-transparent to-transparent" />

            {worldRegions.map(region => {
              const isSelected = selectedRegion.name === region.name;
              const isCurrent = player.当前地点 === region.name;
              return (
                <button
                  key={region.name}
                  type="button"
                  onClick={() => setSelectedMapRegion(region.name)}
                  style={region.marker}
                  className="absolute z-10"
                >
                  <div className={`w-4 h-4 rounded-full border-2 shadow-lg ${region.markerTone} ${isSelected ? 'scale-125 ring-4 ring-white/50' : ''} ${isCurrent ? 'animate-pulse' : ''}`} />
                </button>
              );
            })}

            <div className="absolute left-4 top-4 flex flex-wrap gap-2">
              <span className="world-reactive-chip text-[10px] uppercase">当前地点 · {player.当前地点}</span>
              <span className="world-reactive-chip text-[10px] uppercase">末日 · {doomPressure.short}</span>
              <span className="world-reactive-chip text-[10px] uppercase">觉醒 · {awakeningState.short}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {worldRegions.map(region => (
              <button
                key={region.name}
                type="button"
                onClick={() => setSelectedMapRegion(region.name)}
                className={`archive-status-card codex-tab rounded-sm border p-4 text-left transition-all ${selectedRegion.name === region.name ? 'world-reactive-glow bg-white/70 border-white/20' : 'hover:bg-white/50'}`}
              >
                <div className="font-display text-sm">{region.short}</div>
                <p className="mt-2 text-xs leading-5 text-ink-500/75">{region.summary}</p>
                {currentRegion.name === region.name ? <div className="mt-3 panel-subtle text-[10px]">主角当前位置</div> : null}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <section className="panel-shell manuscript-panel arcane-frame p-5 rounded-sm">
            <div className="panel-subtle text-xs">Region Dossier</div>
            <h3 className="mt-2 font-display text-2xl">{selectedRegion.title}</h3>
            <p className="mt-3 text-sm leading-6 text-ink-500/80">{selectedRegion.summary}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="world-reactive-chip text-[10px] uppercase">{selectedRegion.linkedProphecy}</span>
              <span className="world-reactive-chip text-[10px] uppercase">{selectedRegion.linkedGod}</span>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-3">
            <div className="interactive-tile p-4">
              <div className="panel-subtle text-xs flex items-center gap-2">
                <Compass className="w-3.5 h-3.5" />
                地貌气质
              </div>
              <p className="mt-2 text-sm leading-6 text-ink-500/80">{selectedRegion.atmosphere}</p>
            </div>
            <div className="interactive-tile p-4">
              <div className="panel-subtle text-xs flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                灭世风险
              </div>
              <p className="mt-2 text-sm leading-6 text-ink-500/80">{selectedRegion.dominantCrisis}</p>
              <p className="mt-3 text-xs leading-5 text-ink-500/70">{selectedRegion.signatureAnomaly}</p>
            </div>
            <div className="interactive-tile p-4">
              <div className="panel-subtle text-xs flex items-center gap-2">
                <Shield className="w-3.5 h-3.5" />
                势力拉扯
              </div>
              <p className="mt-2 text-sm leading-6 text-ink-500/80">{selectedRegion.factionTension}</p>
              <p className="mt-3 text-xs leading-5 text-ink-500/70">{selectedRegion.recommendedFocus}</p>
            </div>
          </section>

          <section className="panel-shell manuscript-panel arcane-frame p-5 rounded-sm space-y-4">
            <div className="panel-subtle text-xs">主导势力</div>
            <div className="space-y-2">
              {selectedRegionFactions.map(faction => (
                <div key={faction.name} className="interactive-tile p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-display text-sm">{faction.name}</span>
                    <span className={`text-xs ${reputationTone(faction.reputation)}`}>{faction.reputation}</span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-ink-500/70">{faction.description}</p>
                </div>
              ))}
            </div>
            <div className="interactive-tile p-3">
              <div className="panel-subtle text-[10px]">神学回声</div>
              <p className="mt-2 text-xs leading-5 text-ink-500/75">{theologyEcho}</p>
            </div>
          </section>

          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => appendToInput(`前往${selectedRegion.name}调查`)} className="interactive-tile p-4 text-left">
              <div className="panel-subtle text-xs">写入行动</div>
              <div className="mt-2 font-display text-sm">前往调查</div>
            </button>
            <button type="button" onClick={() => appendToInput(`追查${selectedRegion.linkedProphecy}的线索`)} className="interactive-tile p-4 text-left">
              <div className="panel-subtle text-xs">写入行动</div>
              <div className="mt-2 font-display text-sm">追踪异象</div>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export function ArchivesModal({
  isOpen,
  onClose,
  archiveView,
  setArchiveView,
  archiveIndex,
  setArchiveIndex,
  player,
  currentRegion,
  focusedProphecy,
  focusedProphecyIndex,
  focusedProphecyReason,
  focusedTheology,
  doomPressure,
  awakeningState,
  hostPhase,
  theologyEcho,
  theologyPairs,
  prophecies,
  pantheonKeys,
  gods,
  godLore,
  godTabLabels,
  currentFaithIndex,
  currentFaithLabel,
}: {
  isOpen: boolean;
  onClose: () => void;
  archiveView: ArchiveView;
  setArchiveView: (view: ArchiveView) => void;
  archiveIndex: number;
  setArchiveIndex: React.Dispatch<React.SetStateAction<number>>;
  player: { 信仰: string };
  currentRegion: RegionMeta;
  focusedProphecy: Prophecy;
  focusedProphecyIndex: number;
  focusedProphecyReason: string;
  focusedTheology: TheologyPair | null;
  doomPressure: StatusDetail;
  awakeningState: StatusDetail;
  hostPhase: HostPhase;
  theologyEcho: string;
  theologyPairs: TheologyPair[];
  prophecies: Prophecy[];
  pantheonKeys: string[];
  gods: Record<string, { name: string; role: string; symbol: string; icon: string }>;
  godLore: Partial<Record<string, string>>;
  godTabLabels: Record<string, string>;
  currentFaithIndex: number;
  currentFaithLabel: string;
}) {
  const activeProphecy = prophecies[Math.min(archiveIndex, prophecies.length - 1)] ?? prophecies[0];
  const activeTheology = theologyPairs[Math.min(archiveIndex, theologyPairs.length - 1)] ?? theologyPairs[0];
  const activeGodKey = pantheonKeys[Math.min(archiveIndex, pantheonKeys.length - 1)] ?? pantheonKeys[0];
  const activeGod = activeGodKey ? gods[activeGodKey] : undefined;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        setArchiveView('menu');
      }}
      title="末日档案馆"
      maxWidth="max-w-[92vw]"
    >
      {archiveView === 'menu' ? (
        <div className="space-y-5">
          <div className="archive-bookshelf panel-shell manuscript-panel arcane-frame rounded-sm p-4 sm:p-6">
            <div className="archive-shelf-board" aria-hidden />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              <button
                type="button"
                onClick={() => {
                  setArchiveView('prophecies');
                  setArchiveIndex(focusedProphecyIndex);
                }}
                className="archive-book archive-book-prophecy"
              >
                <span className="archive-book-aura" aria-hidden />
                <span className="archive-book-spine" aria-hidden />
                <span className="archive-book-cover">
                  <span className="archive-book-title">末日预言书</span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setArchiveView('theology');
                  setArchiveIndex(Math.max(0, theologyPairs.findIndex(item => item.element === focusedProphecy.name)));
                }}
                className="archive-book archive-book-theology"
              >
                <span className="archive-book-aura" aria-hidden />
                <span className="archive-book-spine" aria-hidden />
                <span className="archive-book-cover">
                  <span className="archive-book-title">神学对位</span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => setArchiveView('host')}
                className="archive-book archive-book-theology"
              >
                <span className="archive-book-aura" aria-hidden />
                <span className="archive-book-spine" aria-hidden />
                <span className="archive-book-cover">
                  <span className="archive-book-title">宿主记录</span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setArchiveView('pantheon');
                  setArchiveIndex(currentFaithIndex);
                }}
                className="archive-book archive-book-pantheon"
              >
                <span className="archive-book-aura" aria-hidden />
                <span className="archive-book-spine" aria-hidden />
                <span className="archive-book-cover">
                  <span className="archive-book-title">诸神列传</span>
                </span>
              </button>
            </div>
          </div>

          <div className="hidden grid grid-cols-1 lg:grid-cols-3 gap-4">
            <button type="button" onClick={() => { setArchiveView('prophecies'); setArchiveIndex(focusedProphecyIndex); }} className="interactive-tile p-4 text-left">
              <div className="panel-subtle text-xs">当前卷宗</div>
              <h3 className="mt-2 font-display text-lg">{focusedProphecy.name}</h3>
              <p className="mt-2 text-sm leading-6 text-ink-500/80">{focusedProphecyReason}</p>
            </button>
            <button type="button" onClick={() => { setArchiveView('theology'); setArchiveIndex(Math.max(0, theologyPairs.findIndex(item => item.element === focusedProphecy.name))); }} className="interactive-tile p-4 text-left">
              <div className="panel-subtle text-xs">神学对位</div>
              <h3 className="mt-2 font-display text-lg">{focusedTheology ? `${focusedTheology.element} / ${focusedTheology.god}` : '待校准'}</h3>
              <p className="mt-2 text-sm leading-6 text-ink-500/80">{focusedTheology?.desc || '当前卷宗尚未找到稳定的对位解释。'}</p>
            </button>
            <button type="button" onClick={() => { setArchiveView('pantheon'); setArchiveIndex(currentFaithIndex); }} className="interactive-tile p-4 text-left">
              <div className="panel-subtle text-xs">信仰索引</div>
              <h3 className="mt-2 font-display text-lg">{currentFaithLabel}</h3>
              <p className="mt-2 text-sm leading-6 text-ink-500/80">
                {player.信仰 === '无' ? '当前角色没有信仰锚点，档案馆会更多参考地点与危机阶段。' : `当前主角信仰为 ${player.信仰}，对应神系卷册已提升展示优先级。`}
              </p>
            </button>
          </div>

          <div className="panel-shell manuscript-panel arcane-frame p-5 rounded-sm grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="codex-tab p-4">
              <div className="panel-subtle text-xs">当前位置</div>
              <div className="mt-2 font-display text-lg">{currentRegion.short}</div>
            </div>
            <div className="codex-tab p-4">
              <div className="panel-subtle text-xs">末日时钟</div>
              <div className="mt-2 font-display text-lg">{doomPressure.label}</div>
              <p className="mt-2 text-xs leading-5 text-ink-500/75">{doomPressure.desc}</p>
            </div>
            <button type="button" onClick={() => setArchiveView('host')} className="codex-tab p-4 text-left">
              <div className="panel-subtle text-xs">宿主阶段</div>
              <div className="mt-2 font-display text-lg">{hostPhase.code} · {hostPhase.name}</div>
              <p className="mt-2 text-xs leading-5 text-ink-500/75">{hostPhase.risk}</p>
            </button>
            <div className="codex-tab p-4">
              <div className="panel-subtle text-xs">奥法觉醒</div>
              <div className="mt-2 font-display text-lg">{awakeningState.label}</div>
              <p className="mt-2 text-xs leading-5 text-ink-500/75">{awakeningState.desc}</p>
            </div>
          </div>
        </div>
      ) : null}

      {archiveView === 'host' ? (
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <button type="button" onClick={() => setArchiveView('menu')} className="interactive-tile ritual-button px-3 py-2 text-sm">返回目录</button>
            <div className="panel-subtle text-xs">{hostPhase.code} / 宿主记录</div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[18rem_minmax(0,1fr)] gap-5">
            <div className="panel-shell manuscript-panel arcane-frame p-5 rounded-sm">
              <div className="panel-subtle text-xs">当前阶段</div>
              <h3 className="mt-2 font-display text-2xl">{hostPhase.name}</h3>
              <div className="mt-3 inline-flex rounded-full bg-rust-500/10 px-3 py-1 text-xs text-rust-700">{hostPhase.label}</div>
              <p className="mt-4 text-sm leading-7 text-ink-500/80">{hostPhase.description}</p>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="interactive-tile p-4">
                  <div className="panel-subtle text-xs">异象前兆</div>
                  <p className="mt-2 text-sm leading-6 text-ink-500/80">{hostPhase.omen}</p>
                </div>
                <div className="interactive-tile p-4">
                  <div className="panel-subtle text-xs">风险提示</div>
                  <p className="mt-2 text-sm leading-6 text-ink-500/80">{hostPhase.risk}</p>
                </div>
                <div className="interactive-tile p-4">
                  <div className="panel-subtle text-xs">下一触发节点</div>
                  <p className="mt-2 text-sm leading-6 text-ink-500/80">{hostPhase.nextTrigger}</p>
                </div>
                <div className="interactive-tile p-4">
                  <div className="panel-subtle text-xs">可能代价</div>
                  <p className="mt-2 text-sm leading-6 text-ink-500/80">{hostPhase.cost}</p>
                </div>
              </div>
              <div className="panel-shell manuscript-panel arcane-frame p-4 rounded-sm">
                <div className="panel-subtle text-xs">神学回声</div>
                <p className="mt-3 text-sm leading-7 text-ink-500/80">{theologyEcho}</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {archiveView === 'prophecies' ? (
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <button type="button" onClick={() => setArchiveView('menu')} className="interactive-tile ritual-button px-3 py-2 text-sm">返回目录</button>
            <div className="panel-subtle text-xs">卷宗 {archiveIndex + 1} / {prophecies.length}</div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[16rem_minmax(0,1fr)] gap-5">
            <div className="panel-shell manuscript-panel arcane-frame p-5 rounded-sm">
              <div className="panel-subtle text-xs">焦点卷宗</div>
              <h3 className="mt-2 font-display text-2xl">{activeProphecy?.name}</h3>
              <div className="mt-3 inline-flex rounded-full bg-rust-500/10 px-3 py-1 text-xs text-rust-700">{activeProphecy?.status}</div>
              <p className="mt-4 leading-7 text-ink-500/80">{activeProphecy?.desc}</p>
              <button type="button" onClick={() => setArchiveIndex(prev => (prev > 0 ? prev - 1 : prophecies.length - 1))} className="interactive-tile w-full mt-5 px-4 py-3 text-left">
                上一卷
              </button>
              <button type="button" onClick={() => setArchiveIndex(prev => (prev < prophecies.length - 1 ? prev + 1 : 0))} className="interactive-tile w-full mt-2 px-4 py-3 text-left">
                下一卷
              </button>
            </div>
            <div className="panel-shell manuscript-panel arcane-frame p-5 rounded-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="interactive-tile p-4">
                  <div className="panel-subtle text-xs">当前聚焦</div>
                  <div className="mt-2 font-display text-sm">{focusedProphecy.name}</div>
                  <p className="mt-2 text-xs leading-5 text-ink-500/75">{focusedProphecyReason}</p>
                </div>
                <div className="interactive-tile p-4">
                  <div className="panel-subtle text-xs">末日时钟</div>
                  <div className="mt-2 font-display text-sm">{doomPressure.label}</div>
                  <p className="mt-2 text-xs leading-5 text-ink-500/75">{doomPressure.desc}</p>
                </div>
                <div className="interactive-tile p-4">
                  <div className="panel-subtle text-xs">奥法觉醒</div>
                  <div className="mt-2 font-display text-sm">{awakeningState.label}</div>
                  <p className="mt-2 text-xs leading-5 text-ink-500/75">{awakeningState.desc}</p>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                {prophecies.map((item, index) => (
                  <button key={item.name} type="button" onClick={() => setArchiveIndex(index)} className={`interactive-tile ritual-button w-full p-4 text-left ${archiveIndex === index ? 'border-rust-500/45 bg-rust-500/10' : ''}`}>
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-display">{item.name}</span>
                      <span className="panel-subtle text-[10px]">{item.status}</span>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-ink-500/75">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {archiveView === 'theology' ? (
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <button type="button" onClick={() => setArchiveView('menu')} className="interactive-tile ritual-button px-3 py-2 text-sm">返回目录</button>
            <div className="panel-subtle text-xs">对位 {archiveIndex + 1} / {theologyPairs.length}</div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[16rem_minmax(0,1fr)] gap-5">
            <div className="panel-shell manuscript-panel arcane-frame p-5 rounded-sm">
              <div className="panel-subtle text-xs">当前对位</div>
              <h3 className="mt-2 font-display text-xl">{activeTheology?.element}</h3>
              <p className="mt-1 panel-subtle text-sm">{activeTheology?.god}</p>
              <p className="mt-4 text-sm leading-7 text-ink-500/80">{activeTheology?.desc}</p>
              <div className="mt-5 space-y-3">
                <div className="interactive-tile p-3">
                  <div className="panel-subtle text-[10px]">区域镜像</div>
                  <p className="mt-2 text-xs leading-5 text-ink-500/75">{currentRegion.title} / {currentRegion.linkedProphecy} / {currentRegion.linkedGod}</p>
                </div>
                <div className="interactive-tile p-3">
                  <div className="panel-subtle text-[10px]">轻量关系图谱</div>
                  <p className="mt-2 text-xs leading-5 text-ink-500/75">
                    {currentRegion.linkedGod} 守护 {currentRegion.title}，而 {currentRegion.linkedProphecy} 正在该区域投下最强阴影。
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {theologyPairs.map((pair, index) => (
                <button key={`${pair.element}-${pair.god}`} type="button" onClick={() => setArchiveIndex(index)} className={`interactive-tile ritual-button w-full p-4 text-left ${archiveIndex === index ? 'border-rust-500/45 bg-rust-500/10' : ''}`}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-display">{pair.element} / {pair.god}</span>
                    {focusedTheology?.element === pair.element ? <span className="panel-subtle text-[10px]">聚焦中</span> : null}
                  </div>
                  <p className="mt-2 text-xs leading-5 text-ink-500/75">{pair.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {archiveView === 'pantheon' ? (
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <button type="button" onClick={() => setArchiveView('menu')} className="interactive-tile ritual-button px-3 py-2 text-sm">返回目录</button>
            <div className="panel-subtle text-xs">神系 {archiveIndex + 1} / {pantheonKeys.length}</div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[16rem_minmax(0,1fr)] gap-5">
            <div className="space-y-3">
              {pantheonKeys.map((key, index) => (
                <button key={key} type="button" onClick={() => setArchiveIndex(index)} className={`interactive-tile ritual-button w-full p-4 text-left ${archiveIndex === index ? 'border-rust-500/45 bg-rust-500/10' : ''}`}>
                  <div className="font-display">{godTabLabels[key] || key}</div>
                  {currentFaithIndex === index ? <div className="panel-subtle text-[10px] mt-1">主角信仰高亮</div> : null}
                </button>
              ))}
            </div>
            <div className="panel-shell manuscript-panel arcane-frame p-5 rounded-sm">
              {activeGod ? (
                <>
                  <div className="flex items-start gap-4">
                    <img src={activeGod.icon} alt={activeGod.name} className="w-20 h-20 object-contain shrink-0" />
                    <div>
                      <h3 className="font-display text-2xl">{activeGod.name}</h3>
                      <p className="panel-subtle text-sm mt-1">{activeGod.role}</p>
                      <p className="mt-3 text-sm leading-7 text-ink-500/80">{activeGod.symbol}</p>
                    </div>
                  </div>
                  <div className="mt-5 rounded-sm border border-ink-500/10 bg-white/35 p-4 whitespace-pre-wrap leading-7 text-sm text-ink-500/85">
                    {godLore[activeGodKey] || '该神系卷册尚未写入详细档案。'}
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="panel-subtle text-xs">{currentFaithLabel}</div>
                    <div className="interactive-tile p-3">
                      <div className="panel-subtle text-[10px]">为何当前要关注此神</div>
                      <p className="mt-2 text-xs leading-5 text-ink-500/75">
                        {player.信仰 === activeGod.name
                          ? `主角当前信仰 ${player.信仰}，因此此卷宗拥有最高解释优先级。`
                          : `当前位置 ${currentRegion.short} 与 ${currentRegion.linkedGod} / ${currentRegion.linkedProphecy} 的联动，使该神系卷册具备现实参考价值。`}
                      </p>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}

export function InventoryModal({
  isOpen,
  onClose,
  equipmentSlots,
  equipmentIconUrls,
  inventoryItems,
  appendToInput,
}: {
  isOpen: boolean;
  onClose: () => void;
  equipmentSlots: Array<{ slot: '主手' | '副手' | '服饰' | '饰品'; name?: string; desc?: string; quality?: string }>;
  equipmentIconUrls: Record<'主手' | '副手' | '服饰' | '饰品', string>;
  inventoryItems: InventoryItem[];
  appendToInput: (text: string) => void;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="背包与装备" maxWidth="max-w-5xl">
      <div className="grid grid-cols-1 lg:grid-cols-[18rem_minmax(0,1fr)] gap-6">
        <section className="panel-shell manuscript-panel arcane-frame p-5 rounded-sm">
          <h3 className="panel-title text-lg">装备栏</h3>
          <div className="mt-4 space-y-3">
            {equipmentSlots.map(item => (
              <div key={item.slot} className="interactive-tile p-3 flex items-center gap-3">
                <div className="w-14 h-14 rounded-sm border border-ink-500/10 bg-ink-500/5 p-2 shrink-0">
                  <EquipmentSlotThumbnail slot={item.slot} iconUrl={equipmentIconUrls[item.slot]} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="panel-subtle text-xs">{item.slot}</div>
                  <div className="font-display truncate mt-1">{item.name || '未装备'}</div>
                  <p className="mt-1 text-xs leading-5 text-ink-500/70 line-clamp-2">{item.desc || '当前槽位暂无装备。'}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel-shell manuscript-panel arcane-frame p-5 rounded-sm">
          <h3 className="panel-title text-lg">背包物品</h3>
          <div className="mt-4 space-y-3 max-h-[56vh] overflow-y-auto custom-scrollbar pr-2">
            {inventoryItems.length === 0 ? (
              <p className="panel-subtle italic">背包里还没有可展示的物品。</p>
            ) : (
              inventoryItems.map(item => (
                <div key={item.name} className="interactive-tile p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <span className="font-display">{item.name}</span>
                      <span className="panel-subtle text-xs">x{item.quantity}</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-ink-500/75">{item.description}</p>
                  </div>
                  <button type="button" onClick={() => appendToInput(`使用${item.name}`)} className="interactive-tile ritual-button px-3 py-2 text-xs self-start sm:self-center">
                    使用
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </Modal>
  );
}

export function QuestsModal({
  isOpen,
  onClose,
  level,
  currentRegion,
  focusedProphecyName,
  quests,
}: {
  isOpen: boolean;
  onClose: () => void;
  level?: string;
  currentRegion: RegionMeta;
  focusedProphecyName: string;
  quests: QuestDetail[];
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="委托板" maxWidth="max-w-4xl">
      <div className="space-y-5">
        <div className="panel-shell manuscript-panel arcane-frame p-4 rounded-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-sm border border-ink-500/10 bg-ink-500/5 flex items-center justify-center">
            <Shield className="w-7 h-7 text-ink-500" />
          </div>
          <div>
            <div className="font-display text-lg">等级认证：{level || '铜牌'}</div>
            <p className="panel-subtle text-sm mt-1">当前显示的是最新楼层同步到 MVU 的委托列表。</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="interactive-tile p-4">
            <div className="panel-subtle text-xs">排序逻辑</div>
            <p className="mt-2 text-xs leading-5 text-ink-500/75">主线风险优先，其次是与 {currentRegion.short} 和 {focusedProphecyName} 相关的委托。</p>
          </div>
          <div className="interactive-tile p-4">
            <div className="panel-subtle text-xs">区域提示</div>
            <p className="mt-2 text-xs leading-5 text-ink-500/75">{currentRegion.recommendedFocus}</p>
          </div>
          <div className="interactive-tile p-4">
            <div className="panel-subtle text-xs">当前异象</div>
            <p className="mt-2 text-xs leading-5 text-ink-500/75">{currentRegion.signatureAnomaly}</p>
          </div>
        </div>

        {quests.length === 0 ? (
          <p className="panel-subtle italic">暂无委托。</p>
        ) : (
          quests.map(quest => (
            <div key={quest.name} className="panel-shell manuscript-panel arcane-frame p-4 rounded-sm">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-display text-lg">{quest.name}</h3>
                  {quest.description ? <p className="mt-2 text-sm leading-6 text-ink-500/80">{quest.description}</p> : null}
                </div>
                {quest.status ? <span className="interactive-tile ritual-button px-3 py-2 text-xs self-start">{quest.status}</span> : null}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 text-sm">
                {quest.target ? <div className="interactive-tile p-3"><div className="panel-subtle text-xs">目标</div><div className="mt-2">{quest.target}</div></div> : null}
                {quest.reward ? <div className="interactive-tile p-3"><div className="panel-subtle text-xs">奖励</div><div className="mt-2">{quest.reward}</div></div> : null}
                {quest.penalty ? <div className="interactive-tile p-3"><div className="panel-subtle text-xs">惩罚</div><div className="mt-2">{quest.penalty}</div></div> : null}
              </div>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
}

export function StoryContextMenu({
  contextMenu,
  isSending,
  showRollVariableAction,
  onClose,
  onRegenerate,
  onRollVariable,
  onEdit,
}: {
  contextMenu: { x: number; y: number } | null;
  isSending: boolean;
  showRollVariableAction: boolean;
  onClose: () => void;
  onRegenerate: () => void;
  onRollVariable: () => void;
  onEdit: () => void;
}) {
  if (!contextMenu) return null;

  return (
    <div
      className="maintext-context-menu panel-shell manuscript-panel arcane-frame fixed z-[1000] min-w-[220px] rounded-sm shadow-xl"
      style={{
        left: `${Math.min(contextMenu.x, window.innerWidth - 240)}px`,
        top: `${Math.min(contextMenu.y, window.innerHeight - 180)}px`,
      }}
      onClick={event => {
        event.stopPropagation();
        event.preventDefault();
      }}
    >
      <div className="flex items-center justify-between border-b border-ink-500/10 px-4 py-2">
        <span className="panel-subtle text-xs">正文操作</span>
        <button type="button" onClick={onClose} className="interactive-tile ritual-button p-1 rounded">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="p-2 space-y-1">
        <button type="button" onClick={onRegenerate} disabled={isSending} className="interactive-tile ritual-button w-full text-left rounded-sm px-3 py-2 disabled:opacity-50">
          {isSending ? '处理中...' : '重掷正文'}
        </button>
        {showRollVariableAction ? (
          <button type="button" onClick={onRollVariable} disabled={isSending} className="interactive-tile ritual-button w-full text-left rounded-sm px-3 py-2 disabled:opacity-50">
            仅重掷变量
          </button>
        ) : null}
        <button type="button" onClick={onEdit} disabled={isSending} className="interactive-tile ritual-button w-full text-left rounded-sm px-3 py-2 disabled:opacity-50">
          编辑正文
        </button>
      </div>
    </div>
  );
}

export function EditMessageModal({
  editingMessage,
  setEditingMessage,
  onSave,
}: {
  editingMessage: EditingMessage | null;
  setEditingMessage: React.Dispatch<React.SetStateAction<EditingMessage | null>>;
  onSave: () => void;
}) {
  if (!editingMessage) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setEditingMessage(null)}>
      <div className="panel-shell manuscript-panel arcane-frame w-full max-w-3xl rounded-sm flex flex-col max-h-[90vh]" onClick={event => event.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-ink-500/10 px-5 py-4">
          <h2 className="panel-title text-lg">编辑正文</h2>
          <button type="button" onClick={() => setEditingMessage(null)} className="interactive-tile ritual-button p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 flex flex-col gap-4 min-h-0">
          <textarea
            value={editingMessage.currentText}
            onChange={event => setEditingMessage(prev => (prev ? { ...prev, currentText: event.target.value } : null))}
            className="min-h-[320px] w-full resize-none rounded-sm border border-ink-500/15 bg-parchment-100/80 px-4 py-3 outline-none focus:border-rust-500/35"
          />
          <div className="flex gap-3">
            <button type="button" onClick={onSave} className="interactive-tile ritual-button px-4 py-2 bg-rust-500 text-parchment-50 border-rust-500/50">
              保存
            </button>
            <button type="button" onClick={() => setEditingMessage(null)} className="interactive-tile ritual-button px-4 py-2">
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FullClockOverlay({
  isOpen,
  onClose,
  clockRoman,
  doomValue,
}: {
  isOpen: boolean;
  onClose: () => void;
  clockRoman: string;
  doomValue: number;
}) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] bg-black/88 backdrop-blur-xl flex items-center justify-center p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            className="text-center max-w-3xl manuscript-panel"
            onClick={event => event.stopPropagation()}
          >
            <div className="mx-auto relative w-[280px] h-[280px] md:w-[420px] md:h-[420px] rounded-full border-[14px] md:border-[24px] border-amber-900 bg-parchment-100 shadow-[0_0_60px_rgba(146,64,14,0.28)] flex items-center justify-center">
              <div className="absolute inset-3 rounded-full border border-amber-900/10" />
              <div className="absolute inset-6 rounded-full border border-amber-900/25" />
              <div className="absolute inset-[18%] rounded-full border border-amber-900/20" />
              <div className="font-display text-6xl md:text-8xl text-amber-950">{clockRoman}</div>
            </div>
            <h2 className="mt-10 font-display text-3xl md:text-5xl tracking-[0.35em] text-rust-500 uppercase">末日审判之时</h2>
            <p className="mt-4 text-parchment-100/80 text-lg">当前刻度：{clockRoman}{doomValue >= 12 ? ' · 末日降临' : ''}</p>
            <p className="mt-3 text-parchment-100/60 italic">“时间是诸神最后的怜悯，当它指向十二，世界将听见自己的晚钟。”</p>
            <button type="button" onClick={onClose} className="mt-8 interactive-tile ritual-button px-6 py-3 bg-amber-900/45 text-parchment-100 border-amber-900/45">
              返回现实
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
