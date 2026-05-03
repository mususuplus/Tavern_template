import { BookOpen, Box, Clock3, HeartPulse, Maximize2, Music2, Play, Settings, Shield, Users } from 'lucide-react';
import { useState } from 'react';

import type { SchemaType } from '../../schema';
import { useMvu } from '../主界面/MvuContext';
import { PLAYLIST, ROMAN } from '../主界面/data/worldData';
import { useFullscreenAudio } from '../主界面/hooks/useFullscreenAudio';

type PageKey = 'overview' | 'character' | 'world' | 'quests' | 'inventory';
type Quality = 'common' | 'rare' | 'epic' | 'legendary';
type OpeningStep = 'faith' | 'profession' | 'location' | 'assets';

type OpeningConfig = {
  profession: string;
  faith: string;
  location: string;
  status: string;
  currency: {
    gold: number;
    silver: number;
    copper: number;
  };
};

const pageItems: Array<{ key: PageKey; label: string; hint: string }> = [
  { key: 'overview', label: '概览', hint: '当前态势' },
  { key: 'character', label: '角色', hint: '队伍关系' },
  { key: 'world', label: '世界', hint: '时间势力' },
  { key: 'quests', label: '任务', hint: '委托追踪' },
  { key: 'inventory', label: '物品', hint: '装备库存' },
];

const qualityLabel: Record<Quality, string> = {
  common: '普通',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
};

const openingSteps: Array<{ key: OpeningStep; label: string; hint: string }> = [
  { key: 'faith', label: '信仰', hint: '诸神回望' },
  { key: 'profession', label: '职业', hint: '天职刻印' },
  { key: 'location', label: '地点', hint: '降临坐标' },
  { key: 'assets', label: '资产', hint: '初始状态' },
];

const professionGroups: Record<string, string[]> = {
  普通: ['普通冒险者'],
  魔法师体系: ['魔法学徒', '正式法师', '大法师', '传奇法师'],
  战士体系: ['见习战士', '正式战士', '精英战士', '英雄战士'],
  神职者体系: ['受感者', '祭司', '大祭司', '神使'],
};

const faithOptions = [
  '无',
  '索利昂(光明之神)',
  '诺克萨拉(黑暗之神)',
  '瓦尔坎(战争之神)',
  '莫尔甘(死亡之神)',
  '艾尔薇恩(自然之神)',
  '梅萨娜(魔法之神)',
  '图尔克(锻造之神)',
];

const locationOptions = ['中央翡翠平原', '北方凛冬山脉', '西方永夜森林', '东方赤砂荒漠', '南方枯萎之地', '浮空疆域'];

const defaultOpeningConfig: OpeningConfig = {
  profession: '普通冒险者',
  faith: '无',
  location: '中央翡翠平原',
  status: '健康',
  currency: { gold: 10, silver: 0, copper: 0 },
};

const defaultFactions: Record<string, { 声望: string; 描述: string }> = {
  神圣罗兰帝国: {
    声望: '中立',
    描述: '中央翡翠平原的人类与兽人共治帝国，冒险者公会与神权贵族在此交错。',
  },
  永夜森林议会: {
    声望: '中立',
    描述: '西方精灵长老议会，守望森林、月井与古老自然盟约。',
  },
  矮人地下城: {
    声望: '中立',
    描述: '凛冬山脉深处的工匠城邦，铸造、符文和军备贸易是其根基。',
  },
  观察者组织: {
    声望: '中立',
    描述: '监测末日时钟与灾世要素的第三方机构，记录各地异常。',
  },
  远方行歌: {
    声望: '中立',
    描述: '跨国冒险者互助联盟，以委托、认证和旅店网络维系大陆往来。',
  },
  魔国: {
    声望: '敌对',
    描述: '暗影裂谷深处的敌对国度，三百年来持续冲击文明边境。',
  },
};

function entriesOf<T>(record: Record<string, T> | undefined) {
  return Object.entries(record ?? {});
}

function percent(value: number, max: number) {
  if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((value / max) * 100)));
}

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

function getFaithName(faith: string) {
  return faith === '无' ? '无' : faith.split('(')[0] || faith;
}

function clampMoney(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(999999, Math.floor(value)));
}

function buildOpeningStatData(config: OpeningConfig): SchemaType {
  return {
    主角: {
      职业: config.profession,
      信仰: getFaithName(config.faith),
      当前地点: config.location,
      称号: '你好世界',
      状态: config.status || '健康',
      临时状态: {},
      货币: {
        金狮: clampMoney(config.currency.gold),
        银辉币: clampMoney(config.currency.silver),
        铜叶币: clampMoney(config.currency.copper),
        以太结晶: 0,
      },
      生命: 450,
      生命上限: 450,
      法力: 200,
      法力上限: 200,
      奥法之灾觉醒度: 0,
      奥法之灾觉醒度上限: 100,
      装备栏: {
        主手: { 装备名: '空置', 描述: '', 品质: 'common' },
        副手: { 装备名: '空置', 描述: '', 品质: 'common' },
        服饰: { 装备名: '旅行外衣', 描述: '足以遮风，却挡不住命运的注视。', 品质: 'common' },
        饰品: { 装备名: '空置', 描述: '', 品质: 'common' },
      },
      物品栏: {
        干粮: { 描述: '几日份的旅途口粮。', 数量: 3, 品质: 'common' },
        火折子: { 描述: '潮湿夜路里仍能点亮的一点火。', 数量: 1, 品质: 'common' },
      },
    },
    世界: {
      纪元: '暗影纪元',
      月: 1,
      日: 1,
      时段: '上午',
      末日时钟刻度: 3,
      委托等级: '铜牌',
    },
    小队: {},
    人际关系: {},
    势力: defaultFactions,
    委托列表: {
      初始旅程: {
        类型: '主线',
        说明: `${config.profession}在${config.location}踏入艾瑟兰的灾世阴影。`,
        目标: '确认眼前局势，并选择第一步行动。',
        奖励: '命运的入口',
        惩罚: '迟疑会让危机先一步抵达',
        状态: '进行中',
      },
    },
  } as SchemaType;
}

function buildOpeningPrompt(config: OpeningConfig) {
  const faith = getFaithName(config.faith);
  return `
开始旅程。

请根据以下开局档案，为我生成 Aisela 的第一段正式剧情。让故事从我当前所在地点自然展开

我的开局档案：
- 职业：${config.profession}
- 信仰：${faith}
- 初始地点：${config.location}
- 当前状态：${config.status || '健康'}
- 初始资产：金狮 ${clampMoney(config.currency.gold)}，银辉币 ${clampMoney(config.currency.silver)}，铜叶币 ${clampMoney(config.currency.copper)}

世界背景参考：
诸神黄昏的灰烬落定已逾三千年。幸存的新神在废墟上立下沉默誓约：永不主动干涉凡间因果，只回应祈祷。今日的艾瑟兰仍在七大灭世要素的阴影下维持脆弱秩序，魔王、无名荒芜、噬根之蛇、奥法之灾、寂静圣画、盲目之光与钢铁神子共同指向末日预言。

当前纪元为暗影纪元第三百年的初春。神圣罗兰帝国、永夜森林议会、矮人地下城、星语协会、远方行歌与观测者学会仍在各自的秩序中抵抗灾变。末日时钟此刻指向刻度三。

请从我的视角开始，不要把以上档案当作旁白复述；把它们自然融入场景、遭遇中。
`.trim();
}

async function startStatusOpening(config: OpeningConfig) {
  const statData = buildOpeningStatData(config);
  const openingMessage = buildOpeningPrompt(config);

  await updateVariablesWith(
    variables => ({
      ...variables,
      stat_data: klona(statData),
    }),
    { type: 'message', message_id: 0 },
  );

  await createChatMessages([{ role: 'user', message: openingMessage }], { refresh: 'affected' });
  await triggerSlash('/trigger');
}

function StatMeter({ label, value, max, tone }: { label: string; value: number; max: number; tone: string }) {
  return (
    <div className="status-meter">
      <div className="meter-head">
        <span>{label}</span>
        <strong>
          {value}/{max}
        </strong>
      </div>
      <div className="meter-track">
        <span className={tone} style={{ width: `${percent(value, max)}%` }} />
      </div>
    </div>
  );
}

function InfoTile({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className={accent ? 'info-tile accent' : 'info-tile'}>
      <span>{label}</span>
      <strong>{value || '未记录'}</strong>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="status-section">
      <div className="section-title">
        {icon}
        <span>{title}</span>
      </div>
      {children}
    </section>
  );
}

function EmptyBlock({ text }: { text: string }) {
  return <div className="empty-block">{text}</div>;
}

function OverviewPage({ data }: { data: SchemaType }) {
  const player = data.主角;
  const world = data.世界;

  return (
    <div className="page-grid overview-grid">
      <Section title="核心状态" icon={<HeartPulse />}>
        <div className="meters">
          <StatMeter label="生命" value={player.生命} max={player.生命上限} tone="hp" />
          <StatMeter label="法力" value={player.法力} max={player.法力上限} tone="mp" />
          <StatMeter label="觉醒" value={player.奥法之灾觉醒度} max={player.奥法之灾觉醒度上限} tone="awaken" />
        </div>
      </Section>

      <Section title="当前记录" icon={<BookOpen />}>
        <div className="tile-grid">
          <InfoTile label="地点" value={player.当前地点} accent />
          <InfoTile label="时段" value={`${world.纪元} ${world.月}月${world.日}日 ${world.时段}`} />
          <InfoTile label="状态" value={player.状态} />
          <InfoTile label="委托等级" value={world.委托等级} />
        </div>
      </Section>

      <Section title="末日压力" icon={<Clock3 />}>
        <div className="doom-card">
          <div className="doom-number">{ROMAN[Math.min(Math.max(world.末日时钟刻度, 1), 12) - 1] ?? 'I'}</div>
          <div>
            <strong>末日时钟 {world.末日时钟刻度}/12</strong>
            <span>旧变量结构仅记录刻度值</span>
            <p>状态栏只展示酒馆变量中存在的数据，不再补充新版状态说明。</p>
          </div>
        </div>
      </Section>
    </div>
  );
}

function CharacterPage({ data, displayName }: { data: SchemaType; displayName: string }) {
  const player = data.主角;
  const teammates = entriesOf(data.小队);
  const npcs = entriesOf(data.人际关系);

  return (
    <div className="page-grid">
      <Section title="角色档案" icon={<Shield />}>
        <div className="identity-card">
          <div>
            <span>当前角色</span>
            <strong>{displayName}</strong>
            <p>{player.称号}</p>
          </div>
          <div className="tile-grid compact">
            <InfoTile label="职业" value={player.职业} />
            <InfoTile label="信仰" value={player.信仰} />
            <InfoTile label="状态" value={player.状态} />
            <InfoTile label="金币" value={player.货币.金狮 ?? 0} />
          </div>
        </div>
      </Section>

      <Section title="小队" icon={<Users />}>
        {teammates.length ? (
          <div className="list-grid">
            {teammates.map(([name, member]) => (
              <article key={name} className="list-card">
                <strong>{name}</strong>
                <span>{member.职业 || '未记录职业'}</span>
                <StatMeter label={member.状态 || '生命'} value={member.生命} max={member.生命上限} tone="hp" />
              </article>
            ))}
          </div>
        ) : (
          <EmptyBlock text="当前没有记录小队成员。" />
        )}
      </Section>

      <Section title="人际关系" icon={<Users />}>
        {npcs.length ? (
          <div className="list-grid">
            {npcs.slice(0, 6).map(([name, npc]) => (
              <article key={name} className="list-card">
                <strong>{name}</strong>
                <span>
                  {npc.关系 || '关系未明'} · 好感 {npc.好感度}
                </span>
                <p>{npc.描述 || '暂无记录。'}</p>
              </article>
            ))}
          </div>
        ) : (
          <EmptyBlock text="当前没有记录 NPC 关系。" />
        )}
      </Section>
    </div>
  );
}

function WorldPage({ data }: { data: SchemaType }) {
  const world = data.世界;
  const factions = entriesOf(data.势力);

  return (
    <div className="page-grid">
      <Section title="世界时间" icon={<Clock3 />}>
        <div className="tile-grid">
          <InfoTile label="纪元" value={world.纪元} />
          <InfoTile label="日期" value={`${world.月}月${world.日}日`} />
          <InfoTile label="时段" value={world.时段} />
          <InfoTile label="末日刻度" value={`${world.末日时钟刻度}/12`} accent />
        </div>
      </Section>

      <Section title="势力声望" icon={<Shield />}>
        {factions.length ? (
          <div className="list-grid">
            {factions.map(([name, faction]) => (
              <article key={name} className="list-card">
                <strong>{name}</strong>
                <span>{faction.声望}</span>
                <p>{faction.描述 || '暂无势力描述。'}</p>
              </article>
            ))}
          </div>
        ) : (
          <EmptyBlock text="当前没有记录势力声望。" />
        )}
      </Section>
    </div>
  );
}

function QuestsPage({ data }: { data: SchemaType }) {
  const quests = entriesOf(data.委托列表);

  return (
    <div className="page-grid single">
      <Section title="委托列表" icon={<BookOpen />}>
        {quests.length ? (
          <div className="quest-list">
            {quests.map(([name, quest]) => (
              <article key={name} className="quest-card">
                <div>
                  <strong>{name}</strong>
                  <span>
                    {quest.类型} · {quest.状态}
                  </span>
                </div>
                <p>{quest.说明 || '暂无说明。'}</p>
                <div className="quest-meta">
                  <span>目标：{quest.目标 || '未记录'}</span>
                  <span>奖励：{quest.奖励 || '未记录'}</span>
                  <span>惩罚：{quest.惩罚 || '未记录'}</span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyBlock text="当前没有可追踪委托。" />
        )}
      </Section>
    </div>
  );
}

function InventoryPage({ data }: { data: SchemaType }) {
  const player = data.主角;
  const equipment = entriesOf(player.装备栏);
  const items = entriesOf(player.物品栏);

  return (
    <div className="page-grid">
      <Section title="货币" icon={<Box />}>
        <div className="tile-grid">
          <InfoTile label="金狮" value={player.货币.金狮 ?? 0} accent />
          <InfoTile label="银辉币" value={player.货币.银辉币 ?? 0} />
          <InfoTile label="铜叶币" value={player.货币.铜叶币 ?? 0} />
          <InfoTile label="以太结晶" value={player.货币.以太结晶 ?? 0} />
        </div>
      </Section>

      <Section title="装备栏" icon={<Shield />}>
        <div className="list-grid">
          {equipment.map(([slot, gear]) => (
            <article key={slot} className="list-card">
              <strong>{slot}</strong>
              <span>{gear.装备名 || '空置'}</span>
              <p>{gear.描述 || qualityLabel[(gear.品质 ?? 'common') as Quality]}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section title="物品栏" icon={<Box />}>
        {items.length ? (
          <div className="list-grid">
            {items.map(([name, item]) => (
              <article key={name} className="list-card">
                <strong>
                  {name} × {item.数量}
                </strong>
                <span>{qualityLabel[item.品质 as Quality] ?? item.品质}</span>
                <p>{item.描述 || '暂无物品描述。'}</p>
              </article>
            ))}
          </div>
        ) : (
          <EmptyBlock text="当前没有记录物品。" />
        )}
      </Section>
    </div>
  );
}

function OptionButton({
  active,
  title,
  detail,
  onClick,
}: {
  active: boolean;
  title: string;
  detail?: string;
  onClick: () => void;
}) {
  return (
    <button type="button" className={active ? 'opening-option active' : 'opening-option'} onClick={onClick}>
      <strong>{title}</strong>
      {detail ? <span>{detail}</span> : null}
    </button>
  );
}

function OpeningNumberInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="opening-input">
      <span>{label}</span>
      <input type="number" min="0" value={value} onChange={event => onChange(clampMoney(Number(event.target.value)))} />
    </label>
  );
}

function OpeningPanel({ onComplete }: { onComplete: () => void }) {
  const [activeStep, setActiveStep] = useState<OpeningStep>('faith');
  const [config, setConfig] = useState<OpeningConfig>(defaultOpeningConfig);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState('');
  const activeStepIndex = openingSteps.findIndex(step => step.key === activeStep);

  const goNext = () => {
    const next = openingSteps[Math.min(activeStepIndex + 1, openingSteps.length - 1)];
    if (next) setActiveStep(next.key);
  };

  const goPrev = () => {
    const prev = openingSteps[Math.max(activeStepIndex - 1, 0)];
    if (prev) setActiveStep(prev.key);
  };

  const handleStart = async () => {
    setIsStarting(true);
    setError('');
    try {
      await startStatusOpening(config);
      onComplete();
    } catch (err) {
      console.error('[Aisela Status] 开局失败', err);
      setError('开局写入失败，请检查酒馆接口是否可用。');
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <main className="opening-shell">
      <section className="opening-hero">
        <div>
          <span>Aisela Opening</span>
          <h1>开局档案</h1>
          <p>以状态栏的密度完成开局：选择信仰、职业、降临地点和初始资产，然后写入旧变量结构并创建第一条楼层。</p>
        </div>
        <div className="opening-preview">
          <InfoTile label="职业" value={config.profession} accent />
          <InfoTile label="信仰" value={getFaithName(config.faith)} />
          <InfoTile label="地点" value={config.location} />
          <InfoTile label="状态" value={config.status || '健康'} />
        </div>
      </section>

      <nav className="opening-nav" aria-label="开局步骤">
        {openingSteps.map((step, index) => (
          <button
            key={step.key}
            type="button"
            className={activeStep === step.key ? 'active' : ''}
            onClick={() => setActiveStep(step.key)}
          >
            <span>{index + 1}</span>
            <strong>{step.label}</strong>
            <small>{step.hint}</small>
          </button>
        ))}
      </nav>

      <section className="opening-panel">
        {activeStep === 'faith' ? (
          <div className="opening-options two-col">
            {faithOptions.map(faith => (
              <OptionButton
                key={faith}
                active={config.faith === faith}
                title={faith}
                detail={faith === '无' ? '不向任何神明宣誓' : `确认${getFaithName(faith)}的注视`}
                onClick={() => setConfig(prev => ({ ...prev, faith }))}
              />
            ))}
          </div>
        ) : null}

        {activeStep === 'profession' ? (
          <div className="profession-grid">
            {Object.entries(professionGroups).map(([group, professions]) => (
              <div key={group} className="profession-column">
                <span>{group}</span>
                {professions.map(profession => (
                  <OptionButton
                    key={profession}
                    active={config.profession === profession}
                    title={profession}
                    onClick={() => setConfig(prev => ({ ...prev, profession }))}
                  />
                ))}
              </div>
            ))}
          </div>
        ) : null}

        {activeStep === 'location' ? (
          <div className="opening-options">
            {locationOptions.map(location => (
              <OptionButton
                key={location}
                active={config.location === location}
                title={location}
                detail={config.location === location ? '当前降临坐标' : '切换开局地点'}
                onClick={() => setConfig(prev => ({ ...prev, location }))}
              />
            ))}
          </div>
        ) : null}

        {activeStep === 'assets' ? (
          <div className="opening-assets">
            <label className="opening-input wide">
              <span>当前状态</span>
              <input
                type="text"
                value={config.status}
                onChange={event => setConfig(prev => ({ ...prev, status: event.target.value }))}
              />
            </label>
            <OpeningNumberInput
              label="金狮"
              value={config.currency.gold}
              onChange={gold => setConfig(prev => ({ ...prev, currency: { ...prev.currency, gold } }))}
            />
            <OpeningNumberInput
              label="银辉币"
              value={config.currency.silver}
              onChange={silver => setConfig(prev => ({ ...prev, currency: { ...prev.currency, silver } }))}
            />
            <OpeningNumberInput
              label="铜叶币"
              value={config.currency.copper}
              onChange={copper => setConfig(prev => ({ ...prev, currency: { ...prev.currency, copper } }))}
            />
          </div>
        ) : null}
      </section>

      <footer className="opening-actions">
        <button type="button" onClick={goPrev} disabled={activeStepIndex === 0}>
          上一步
        </button>
        <div>
          {error ? <span className="opening-error">{error}</span> : null}
          {activeStepIndex < openingSteps.length - 1 ? (
            <button type="button" className="primary" onClick={goNext}>
              继续
            </button>
          ) : (
            <button type="button" className="primary" onClick={handleStart} disabled={isStarting}>
              <Play />
              {isStarting ? '写入中' : '开启旅程'}
            </button>
          )}
        </div>
      </footer>
    </main>
  );
}

function MusicPanel({
  isOpen,
  currentTrackIndex,
  isMusicPlaying,
  onClose,
  onTrackClick,
}: {
  isOpen: boolean;
  currentTrackIndex: number | null;
  isMusicPlaying: boolean;
  onClose: () => void;
  onTrackClick: (index: number) => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="compact-modal" onMouseDown={event => event.stopPropagation()}>
        <div className="modal-head">
          <strong>音乐</strong>
          <button type="button" onClick={onClose}>
            关闭
          </button>
        </div>
        <div className="track-list">
          {PLAYLIST.map((track, index) => (
            <button key={track.url} type="button" onClick={() => onTrackClick(index)}>
              <span>{track.name}</span>
              <strong>{currentTrackIndex === index && isMusicPlaying ? '播放中' : '播放'}</strong>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SettingsPanel({
  isOpen,
  compact,
  onClose,
  onCompactChange,
}: {
  isOpen: boolean;
  compact: boolean;
  onClose: () => void;
  onCompactChange: (value: boolean) => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="compact-modal" onMouseDown={event => event.stopPropagation()}>
        <div className="modal-head">
          <strong>设置</strong>
          <button type="button" onClick={onClose}>
            关闭
          </button>
        </div>
        <label className="setting-row">
          <span>
            <strong>紧凑显示</strong>
            <small>减少分页内容留白，适合更窄的楼层 iframe。</small>
          </span>
          <input type="checkbox" checked={compact} onChange={event => onCompactChange(event.target.checked)} />
        </label>
      </div>
    </div>
  );
}

function ClockPanel({ isOpen, value, onClose }: { isOpen: boolean; value: number; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="clock-modal" onMouseDown={event => event.stopPropagation()}>
        <button type="button" onClick={onClose}>
          关闭
        </button>
        <div>{ROMAN[Math.min(Math.max(value, 1), 12) - 1] ?? 'I'}</div>
        <span>末日时钟 {value}/12</span>
      </div>
    </div>
  );
}

export default function App() {
  const { data } = useMvu();
  const [activePage, setActivePage] = useState<PageKey>('overview');
  const [musicOpen, setMusicOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const [openingDone, setOpeningDone] = useState(false);
  const [openingLocked, setOpeningLocked] = useState(isOpeningFloor);
  const mediaState = useFullscreenAudio(PLAYLIST);

  const player = data.主角;
  const world = data.世界;
  const displayName = getDisplayName();
  const hasStatData = openingDone || hasMessageStatData();
  const shouldShowOpening = !openingDone && (openingLocked || isOpeningFloor());

  const pageContent = {
    overview: <OverviewPage data={data} />,
    character: <CharacterPage data={data} displayName={displayName} />,
    world: <WorldPage data={data} />,
    quests: <QuestsPage data={data} />,
    inventory: <InventoryPage data={data} />,
  } satisfies Record<PageKey, React.ReactNode>;

  return (
    <div ref={mediaState.mainContainerRef} className={`aisela-status-root ${compact ? 'compact' : ''}`}>
      <audio
        ref={mediaState.audioRef}
        onEnded={() => mediaState.setIsMusicPlaying(false)}
        className="sr-only"
        aria-hidden
      />

      <header className="status-bar">
        <div className="identity">
          <span>
            {shouldShowOpening ? 'Aisela Opening' : hasStatData ? 'Aisela Status' : 'Aisela Status · 默认档案'}
          </span>
          <strong>{displayName}</strong>
          <small>{player.称号}</small>
        </div>

        <div className="quick-stats">
          <InfoTile label="地点" value={player.当前地点} accent />
          <InfoTile label="时间" value={`${world.月}/${world.日} ${world.时段}`} />
          <InfoTile label="状态" value={player.状态} />
          <InfoTile label="末日" value={`${world.末日时钟刻度}/12`} />
        </div>

        <div className="bar-meters">
          <StatMeter label="生命" value={player.生命} max={player.生命上限} tone="hp" />
          <StatMeter label="法力" value={player.法力} max={player.法力上限} tone="mp" />
          <StatMeter label="觉醒" value={player.奥法之灾觉醒度} max={player.奥法之灾觉醒度上限} tone="awaken" />
        </div>

        <div className="toolbar">
          <button type="button" title="末日时钟" onClick={() => mediaState.setShowFullClock(true)}>
            <Clock3 />
          </button>
          <button type="button" title="音乐" onClick={() => setMusicOpen(true)}>
            <Music2 />
          </button>
          <button type="button" title="设置" onClick={() => setSettingsOpen(true)}>
            <Settings />
          </button>
          <button type="button" title="全屏" onClick={mediaState.toggleFullscreen}>
            <Maximize2 />
          </button>
        </div>
      </header>

      {!shouldShowOpening ? (
        <>
          <nav className="page-nav" aria-label="状态分页">
            {pageItems.map(page => (
              <button
                key={page.key}
                type="button"
                className={activePage === page.key ? 'active' : ''}
                onClick={() => setActivePage(page.key)}
              >
                <span>{page.label}</span>
                <small>{page.hint}</small>
              </button>
            ))}
          </nav>

          <main className="page-shell">{pageContent[activePage]}</main>
        </>
      ) : (
        <OpeningPanel
          onComplete={() => {
            setOpeningDone(true);
            setOpeningLocked(false);
          }}
        />
      )}

      <MusicPanel
        isOpen={musicOpen}
        currentTrackIndex={mediaState.currentTrackIndex}
        isMusicPlaying={mediaState.isMusicPlaying}
        onClose={() => setMusicOpen(false)}
        onTrackClick={mediaState.handleTrackClick}
      />
      <SettingsPanel
        isOpen={settingsOpen}
        compact={compact}
        onClose={() => setSettingsOpen(false)}
        onCompactChange={setCompact}
      />
      <ClockPanel
        isOpen={mediaState.showFullClock}
        value={world.末日时钟刻度}
        onClose={() => mediaState.setShowFullClock(false)}
      />
    </div>
  );
}
