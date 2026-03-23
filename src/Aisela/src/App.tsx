import React, { useState } from 'react';
import {
  Map as MapIcon,
  Scroll,
  BookOpen,
  Shield,
  Sword,
  Coins,
  Clock,
  AlertTriangle,
  User,
  Sparkles,
  Feather,
  Compass,
  Skull,
  History,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Import Components
import StartPage from './components/StartPage';
import CustomizationPage from './components/CustomizationPage';

// Import Emblems
// 基础路径（建议提取出来，方便以后修改）
const ASSET_BASE_URL = 'https://raw.githubusercontent.com/mususuplus/my-assets/main/';

// 使用对象管理你的圣徽和地图
const emblems = {
  light: `${ASSET_BASE_URL}光明之神圣徽.webp`,
  dark: `${ASSET_BASE_URL}黑暗之神圣徽.webp`,
  war: `${ASSET_BASE_URL}战争之神圣徽.webp`,
  death: `${ASSET_BASE_URL}死亡之神圣徽.webp`,
  nature: `${ASSET_BASE_URL}自然之神圣徽.webp`,
  forging: `${ASSET_BASE_URL}锻造之神圣徽.webp`,
  magic: `${ASSET_BASE_URL}魔法之神圣徽.webp`,
  map: `${ASSET_BASE_URL}地图.webp`, // 你提到已经转成 webp 了
};
type Currency = {
  gold: number;
  silver: number;
  copper: number;
  aether: number;
};

type ModalType = 'map' | 'archives' | 'inventory' | 'quests' | 'social' | null;
type ViewState = 'start' | 'customize' | 'game';

type PlayerConfig = {
  profession: string;
  faith: string;
  location: string;
  title?: string;
  status: string;
  currency: Currency;
};

type Teammate = {
  name: string;
  profession: string;
  hp: number;
  maxHp: number;
  status: string;
  avatar?: string;
};

type NPC = {
  name: string;
  affinity: number; // 0 - 100
  relation: string;
  description: string;
};

const TEAMMATES: Teammate[] = [
  { name: '莉莉丝 · 晨星', profession: '占星术士', hp: 210, maxHp: 210, status: '专注冥想' },
  { name: '凯恩 · 碎石', profession: '重装盾卫', hp: 450, maxHp: 580, status: '轻伤/警戒' },
];

const NPCS: NPC[] = [
  { name: '大工匠泰德', affinity: 65, relation: '慷慨的赞助人', description: '虽然他总是抱怨你的装备磨损太快，但每次都会为你留下最好的材料。' },
  { name: '露娜议长', affinity: 20, relation: '傲慢的观察者', description: '这位月精灵对人类的短促寿命感到怜悯，却对你的行动保持着近乎冷酷的关注。' },
  { name: '先知维克多', affinity: 85, relation: '命运引路人', description: '他在阴影中低语的预言，至今未曾落空。你是他棋盘上最重要的那一枚棋子。' },
];

type InventoryItem = {
  name: string;
  quantity: number;
  description: string;
  quality: 'common' | 'rare' | 'epic' | 'legendary';
};

type StatusEffect = {
  name: string;
  type: 'buff' | 'debuff';
  description: string;
  icon: React.ElementType;
};

const INVENTORY_ITEMS: InventoryItem[] = [
  { name: '止血草', quantity: 5, description: '平凡但有效的止血药草，恢复少量生命值。', quality: 'common' },
  { name: '以太药剂', quantity: 2, description: '充满不稳定能量的蓝色液体，恢复中量法力。', quality: 'rare' },
  { name: '古神碎屑', quantity: 12, description: '散发着不详气息的结晶体，似乎是某种古老祭仪的残留。', quality: 'epic' },
  { name: '磨刀石', quantity: 1, description: '粗糙的石块，能暂时提升物理武器的锋利度。', quality: 'common' },
  { name: '奇怪的眼球', quantity: 1, description: '它在你的掌心微微转动，直视着你的灵魂。', quality: 'rare' },
];

const STATUS_EFFECTS: StatusEffect[] = [
  { name: '以太过敏', type: 'debuff', description: '法力消耗增加 20%，理智降低速度加快。', icon: Sparkles },
  { name: '守夜人庇护', type: 'buff', description: '在黑暗环境下全属性提升 5%。', icon: Shield },
];

// --- Components ---

const Modal = ({ isOpen, onClose, title, children, maxWidth = "max-w-4xl" }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode, maxWidth?: string }) => {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-ink-500/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className={`bg-parchment-100 w-full ${maxWidth} max-h-[85vh] overflow-hidden rounded-sm box-sketch flex flex-col shadow-2xl`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-ink-500/10 bg-parchment-50/50">
            <h2 className="text-3xl font-display tracking-widest text-ink-500">{title}</h2>
            <button onClick={onClose} className="p-2 hover:bg-ink-500/5 rounded-full transition-colors text-ink-400 hover:text-rust-500">
              <X size={24} />
            </button>
          </div>
          <div className="p-8 overflow-y-auto custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]">
            {children}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => (
  <div className="group relative flex items-center">
    {children}
    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-parchment-50 bg-ink-500 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap font-sans tracking-wide z-10">
      {text}
    </span>
  </div>
);

const StatBar = ({ label, value, max, colorClass }: { label: string; value: number; max: number; colorClass: string }) => (
  <div className="mb-2">
    <div className="flex justify-between text-xs font-display tracking-wider mb-1 opacity-80">
      <span>{label}</span>
      <span>{value}/{max}</span>
    </div>
    <div className="h-1.5 w-full bg-ink-500/10 rounded-full overflow-hidden border border-ink-500/5">
      <div
        className={`h-full ${colorClass} transition-all duration-500 ease-out`}
        style={{ width: `${(value / max) * 100}%` }}
      />
    </div>
  </div>
);

const PROPHECIES = [
  { name: "魔王", status: "活跃", desc: "从诸神的倒影中站起，以阴影加冕，将万物纳入永恒的阴影。" },
  { name: "奥法之灾", status: "沉睡", desc: "脆弱的容器承载着群星的愤怒，一次呼吸便能焚毁真理的根基。" },
  { name: "噬根之蛇", status: "沉睡", desc: "它在万物的根基之下游走，以时间为食。当它终于咬住自己的尾巴，因果将忘记自己从何处开始。" },
  { name: "寂静圣画", status: "遗失", desc: "完美的艺术是不动的，它邀请所有灵魂进入那永恒不灭的美梦。" },
  { name: "无名荒芜", status: "扩散中", desc: "终结意味着曾经有过开始。它只是让一切从未发生过。" },
  { name: "盲目之光", status: "未生成", desc: "当光明不再有边界，一切轮廓都将在白昼中溶解，直到世间只剩一个声音、一个念头、一个‘我们’。" },
  { name: "钢铁神子", status: "封印", desc: "它的铭文里没有宽恕，它的使命里没有终止。当它睁开眼睛，生命将按名单被逐一清算。" },
];

const THEOLOGY_PAIRS = [
  { element: "魔王", god: "黑暗之神", desc: "意志/自由的极端扭曲" },
  { element: "盲目之光", god: "光明之神", desc: "意识/善的极端同化" },
  { element: "钢铁神子", god: "战争之神", desc: "秩序/力量的极端清算" },
  { element: "无名荒芜", god: "死亡之神", desc: "存在/终结的极端虚无" },
  { element: "噬根之蛇", god: "自然之神", desc: "根基/因果的极端吞噬" },
  { element: "寂静圣画", god: "锻造之神", desc: "造物/变化的极端凝固" },
  { element: "奥法之灾", god: "魔法之神", desc: "魔力/法则的极端失控" },
];

const GODS = {
  light: { name: "索利昂 光明之神", role: "光明、秩序、律法", symbol: "正午太阳中嵌入一只睁开的眼睛，外圈环绕麦穗与锁链", icon: emblems.light },
  dark: { name: "诺克萨拉 黑暗之神", role: "黑暗、秘密、夜晚", symbol: "残月轮廓内嵌一只闭合的眼睛，月牙尖端各悬一滴墨滴", icon: emblems.dark },
  war: { name: "瓦尔坎 战争之神", role: "战争、武勇、征服", symbol: "交叉的剑与斧，交叉点处是一团不灭的火焰", icon: emblems.war },
  death: { name: "莫尔甘 死亡之神", role: "死亡、亡魂、终结", symbol: "一扇半开的石门，门缝中透出微弱的灰白光芒，门楣上刻有沙漏", icon: emblems.death },
  nature: { name: "艾尔薇恩 自然之神", role: "自然、野兽、季节", symbol: "一棵枝叶分为四季形态的巨树，根系中缠绕着一条沉睡的蛇", icon: emblems.nature },
  forging: { name: "图尔克 锻造之神", role: "锻造、工艺、矿石", symbol: "一柄锤头朝下的战锤，锤面刻有齿轮纹样，锤柄缠绕锁链", icon: emblems.forging },
  magic: { name: "梅萨娜 魔法之神", role: "魔法、知识、真理", symbol: "一本展开的书页上悬浮着一颗多面体结晶，结晶的每个面映射不同的符文", icon: emblems.magic },
};

type ReputationLevel = '友善' | '中立' | '冷淡' | '敌对' | '通缉' | '崇拜' | '盟友';

// 与 界面/主界面/utils/gameInitializer 中 DEFAULT_势力 保持一致（名称、声望、描述）
const FACTIONS: { name: string; reputation: ReputationLevel; description: string }[] = [
  {
    name: '魔国',
    reputation: '敌对',
    description: '魔王统治的神权军事帝国，盘踞于暗影裂谷。以“暗影同化”将俘虏转化为服从的战士——浅层同化者保留自我但绝对服从，深层同化者成为魔王意志的延伸。三百年来持续发动“魔潮”冲击帝国防线，是文明世界最直接的军事威胁。'
  },
  {
    name: '灭世教派',
    reputation: '敌对',
    description: '跨国极端宗教联盟，崇拜七大灭世要素，认为现世是“诸神黄昏后拼凑的残次品”，唤醒灭世要素即是“修复真实”。四大派系分别崇拜噬根之蛇、寂静圣画、钢铁神子和魔王，由从未现身的“先知”通过精神指令操控。总部“幽灵方舟”在枯萎之地边缘游荡，观测者至今无法锁定。'
  },
  {
    name: '神圣罗兰帝国',
    reputation: '中立',
    description: '人类与兽人共治的君主-神权国家，占据大陆中央最富饶的翡翠平原。帝国已与南方的魔国进行三百年战争，国力从巅峰缓慢下滑。皇权与神权并立，当今国教为光明神教，皇帝为狮兽人威廉·格里亚斯，四大贵族家族各掌军事、财政、魔法、情报大权。这里是冒险者最活跃的区域。'
  },
  {
    name: '永夜森林议会',
    reputation: '中立',
    description: '精灵的封闭长老议会，统治西方遮天蔽日的永夜森林。四大氏族分管祭祀、军事、知识与生态，由740岁的月精灵议长露娜统领。精灵寿命悠长、行动缓慢，视帝国为“急躁的孩子”，但对魔国保持绝对敌意。森林南部正遭受无名荒芜侵蚀，这是议会最深层的焦虑。'
  },
  {
    name: '矮人地下城',
    reputation: '中立',
    description: '矮人称其为卡兹·莫丹，工匠行会联合统治的地下要塞，位于凛冬山脉深处。四大行会分管锻造、符文、爆破与勘探，由217岁的首席大工匠泰德统领。这里是帝国抗魔前线的军备供应商，六成以上的武器盔甲产自此处。城市呈倒锥形向下延伸，越深处越热、越富、也越危险。'
  },
  {
    name: '观测者组织',
    reputation: '中立',
    description: '国际公认的第三方监测机构，总部位于大陆地理中心的虚空圣所。通过遍布各地的观测塔和“以太共鸣雷达”网络，监测七大灭世要素的苏醒迹象。末日时钟的指针位置，代表当前灭世风险的综合评估。巡查使拥有跨国执法权，是学会的外勤精英。'
  },
  {
    name: '远方行歌',
    reputation: '中立',
    description: '跨国界冒险者互助联盟，总部位于漂移的浮空城“天际港”。通过遍布各地的“狮鹫酒馆”网络发布委托、收购素材、认证等级。等级从铜牌到苍蓝共五级，全大陆苍蓝级仅十二人。冒险者公约是唯一的规则——拒绝明显违法的委托，报酬与风险必须匹配。'
  },
  {
    name: '星语协会',
    reputation: '中立',
    description: '跨国魔法学术权威机构，总部位于浮空的“语石群岛”。垄断从学徒到传奇的全部法师认证，运营着大陆最完整的魔法文献库“无尽书廊”。七座主塔对应七个研究方向，由七位传奇法师（星语长席）统领。协会维护一份“封缄目录”，禁止研究涉及灭世要素、灵魂永续等危险课题。'
  },
];

const getReputationColor = (rep: ReputationLevel) => {
  switch (rep) {
    case '崇拜': return 'text-fuchsia-400 drop-shadow-[0_0_3px_rgba(232,121,249,0.5)]';
    case '盟友': return 'text-cyan-400 drop-shadow-[0_0_3px_rgba(34,211,238,0.5)]';
    case '友善': return 'text-lime-400 drop-shadow-[0_0_2px_rgba(163,230,53,0.5)]';
    case '中立': return 'text-slate-400';
    case '冷淡': return 'text-orange-400';
    case '敌对': return 'text-red-500';
    case '通缉': return 'text-rose-600 font-bold animate-pulse shadow-sm';
    default: return 'text-ink-500/60';
  }
};

const FlipCard = ({ front, back, className = "" }: { front: React.ReactNode, back: React.ReactNode, className?: string }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  return (
    <div
      className={`group perspective-1000 cursor-pointer aspect-[1/1.7] ${className}`}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className={`relative w-full h-full duration-700 preserve-3d transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}>
        <div className="absolute inset-0 backface-hidden rounded-sm overflow-hidden shadow-2xl">
          {front}
        </div>
        <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-sm overflow-hidden shadow-2xl">
          {back}
        </div>
      </div>
    </div>
  );
};

const GodCardContent = ({ god, theme }: { god: { name: string, role: string, symbol: string, icon: string }, theme: string }) => {
  const getThemeColors = (theme: string) => {
    switch(theme) {
      case 'light': return 'bg-amber-50 text-amber-950 border-amber-900/30';
      case 'dark': return 'bg-slate-950 text-slate-200 border-slate-800';
      case 'war': return 'bg-red-50 text-red-950 border-red-900/30';
      case 'death': return 'bg-neutral-900 text-neutral-300 border-neutral-700';
      case 'nature': return 'bg-stone-50 text-stone-900 border-stone-800/30';
      case 'forging': return 'bg-orange-50 text-orange-950 border-orange-900/30';
      default: return 'bg-parchment-50 text-ink-500 border-ink-500/20';
    }
  };

  return (
    <div className={`absolute inset-0 p-1 flex flex-col rounded-sm shadow-2xl border ${getThemeColors(theme)} overflow-hidden`}>
      {/* Outer Border Decor */}
      <div className="absolute inset-1 border border-current opacity-20 pointer-events-none"></div>

      {/* Tarot Frame */}
      <div className="flex-1 m-2 border-2 border-current/10 relative flex flex-col items-center p-4 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]">
        {/* Corner Ornaments */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-current/30"></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-current/30"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-current/30"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-current/30"></div>

        {/* Central Icon (Illustration) */}
        <div className="w-full aspect-[3/4] mb-4 relative flex items-center justify-center">
           <div className="absolute inset-0 bg-current/5 rounded-full blur-2xl"></div>
           <img
             src={god.icon}
             alt={god.name}
             className="w-4/5 h-4/5 object-contain relative z-10 opacity-90 brightness-110 drop-shadow-[0_0_8px_rgba(0,0,0,0.2)]"
           />
        </div>

        {/* Text Content */}
        <div className="flex-1 flex flex-col items-center justify-start gap-2">
          <h4 className="font-display font-bold text-xl tracking-[0.2em] uppercase text-center">{god.name.split(' ')[1]}</h4>
          <div className="w-12 h-px bg-current opacity-30"></div>
          <p className="text-[10px] uppercase tracking-[0.3em] font-sans opacity-60 text-center px-2">{god.role}</p>
          <div className="mt-auto">
             <p className="text-[11px] font-serif italic opacity-70 leading-relaxed text-center px-2 line-clamp-4">
               {god.symbol}
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProphecyCardContent = ({ prophecy }: { prophecy: { name: string, status: string, desc: string } }) => {
  return (
    <div className="absolute inset-0 p-1 flex flex-col rounded-sm shadow-2xl border bg-zinc-950 text-zinc-200 border-zinc-800 overflow-hidden">
      <div className="absolute inset-1 border border-zinc-100/10 pointer-events-none"></div>
      <div className="flex-1 m-2 border-2 border-zinc-100/5 relative flex flex-col items-center p-6 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]">
        <div className="text-zinc-500 font-display text-sm mb-6 tracking-[0.4em]">PROPHETIA</div>

        <div className="w-full aspect-[4/3] border border-zinc-800 flex flex-col items-center justify-center relative mb-8 bg-zinc-900/50">
           <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-[size:20px_20px]"></div>
           <Skull className="w-16 h-16 text-rust-500/40 mb-2" />
           <span className="text-[10px] uppercase tracking-widest text-rust-500 font-bold border border-rust-500/20 px-2 py-0.5">{prophecy.status}</span>
        </div>

        <h3 className="font-display font-bold text-2xl mb-6 text-zinc-100 tracking-[0.2em] uppercase text-center">{prophecy.name}</h3>
        <div className="w-16 h-px bg-zinc-100/20 mb-6"></div>
        <p className="text-sm text-zinc-400 font-serif italic leading-relaxed text-center px-4">
          "{prophecy.desc}"
        </p>

        <div className="mt-auto text-[10px] font-sans opacity-30 uppercase tracking-[0.3em]">
          The Great Doom
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [viewState, setViewState] = useState<ViewState>('start');
  const [playerConfig, setPlayerConfig] = useState<PlayerConfig | null>(null);
  const [worldConfig, setWorldConfig] = useState({
    era: '暗影纪元',
    month: 1,
    day: 1,
    period: '上午' as '清晨' | '上午' | '正午' | '下午' | '黄昏' | '深夜'
  });
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [showFullClock, setShowFullClock] = useState(false);
  const [socialTab, setSocialTab] = useState<'squad' | 'npcs'>('squad');
  const [expandedFaction, setExpandedFaction] = useState<string | null>(null);
  const [archiveView, setArchiveView] = useState<'menu' | 'prophecies' | 'theology' | 'pantheon'>('menu');
  const [archiveIndex, setArchiveIndex] = useState(0);
  const [input, setInput] = useState('');
  const [logs, setLogs] = useState([
    { type: 'system', text: '系统: 连接到世界... 时间同步完成。' },
    { type: 'narrative', text: '诸神黄昏的灰烬落定已逾三千年。' },
    {
      type: 'narrative',
      text: '在那场将古神系彻底埋葬的战争中，世界被撕裂又再度缝合。幸存的新神——索利昂、诺克萨拉、瓦尔坎、莫尔甘、艾尔薇恩、梅萨娜、图尔克——在废墟上立下沉默誓约：永不主动干涉凡间因果，只回应祈祷。七位神祇以光明与黑暗、战争与死亡、自然与锻造的六柱对位，加上居中的魔法之神，构建起今日艾瑟兰的法则根基。他们的圣徽高悬于神殿穹顶，他们的名号铭刻在每一座城镇的基石之上。',
    },
    { type: 'narrative', text: '但誓约无法抹去的，是那七道深埋于世界本质中的裂痕。' },
    {
      type: 'narrative',
      text: '《末日预言书》 记载着七大灭世要素——它们是诸神黄昏未被清算的遗产，是旧世界崩溃时残存的力量残余，指向世界存续的七个根本维度。魔王已在三百年前觉醒，于暗影裂谷深处建立魔国，其暗影同化如瘟疫般向中央平原蔓延；无名荒芜从南方枯萎之地持续北侵，所过之处物理法则逐层失效，存在本身被缓慢抹消；噬根之蛇沉睡于根源地脉深处，以时间为食，一旦苏醒便将吞食因果本身，奥法之灾——魔力奇点——预言中"一次呼吸便能焚毁真理根基"的容器，至今下落不明；寂静圣画遗失在历史的褶皱里，等待着将现实收录于画中；盲目之光会消解"我们"；钢铁神子沉睡于某处失落的封印中，当它睁开眼睛，生命将按名单被逐一清算。',
    },
    { type: 'narrative', text: '在这灭世的阴影下，凡人的文明如同摇曳的烛火。' },
    {
      type: 'narrative',
      text: '神圣罗兰帝国雄踞中央翡翠平原，狮兽人皇帝威廉·格里亚斯在神权与贵族的夹缝中维系着人类与兽人共治的脆弱平衡。永夜森林议会的精灵们在世界树的根系间倾听自然之声，月精灵议长露娜·约尔兰德已七百四十岁，见证过帝国尚未建立时的岁月。矮人地下城卡兹·莫丹的熔炉在凛冬山脉深处昼夜不息，首席大工匠泰德·托亚锻造的武器正源源不断运往抗魔前线。星语协会的七座浮空塔在语石群岛上空旋转，魔法之神的信徒们以理性丈量着法则的边界。远方行歌的冒险者们从浮空城天际港出发，将足迹印遍大陆的每一个角落。而观测者学会的末日时钟，此刻正指向刻度三——距离"午夜"的危机等级，还有九个刻度。',
    },
    { type: 'narrative', text: '暗影纪元第三百年的初春。' },
    {
      type: 'narrative',
      text: '圣罗兰城的钟声正越过圣河的薄雾，狮鹫旗帜在皇宫塔楼上猎猎作响。银潮港的商船满载着矮人的符文钢锭起锚，永夜森林的露水从世界树的枝叶间滴落，绝境长城上的哨兵揉了揉因注视暗影太久而酸涩的眼睛。',
    },
    { type: 'narrative', text: '而某个尚未知晓自己命运的灵魂，正在过着再平常不过的一天。' },
    { type: 'narrative', text: '诸神沉默。预言苏醒。' },
    { type: 'narrative', text: '你的故事，即将开始。' },
  ]);

  const handleSend = () => {
    if (!input.trim()) return;
    setLogs([...logs, { type: 'user', text: input }]);
    setInput('');
    // Simulate response
    setTimeout(() => {
      setLogs(prev => [...prev, { type: 'narrative', text: '风中传来低语，似乎在回应你的呼唤...' }]);
    }, 1000);
  };

  if (viewState === 'start') {
    return <StartPage onStart={() => setViewState('customize')} />;
  }

  if (viewState === 'customize') {
    return (
      <CustomizationPage
        onComplete={(config) => {
          setPlayerConfig(config);
          setViewState('game');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen w-full p-4 md:p-8 lg:p-12 flex flex-col gap-6 max-w-[1920px] mx-auto">

      {/* --- Header: Doomsday Clock & Ticker --- */}
      <header className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Doomsday Clock */}
        <div
          onClick={() => setShowFullClock(true)}
          className="lg:col-span-3 box-sketch bg-parchment-50/50 p-4 flex items-center gap-4 rounded-sm cursor-pointer hover:bg-parchment-100 transition-colors group"
        >
          <div className="relative w-16 h-16 flex-shrink-0 group-hover:scale-110 transition-transform">
            <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 36 36">
              <path className="text-ink-500/10" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2" />
              <path className="text-rust-500 drop-shadow-[0_0_2px_rgba(138,75,56,0.5)]" strokeDasharray="75, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-display font-bold text-rust-500">
              III
            </div>
          </div>
          <div>
            <h2 className="text-sm font-display tracking-widest text-rust-500 uppercase">末日时钟</h2>
            <p className="text-xs font-serif italic opacity-70">距离终焉还有三个刻度</p>
          </div>
        </div>

        {/* Time & Ticker */}
        <div className="lg:col-span-9 box-sketch bg-parchment-50/50 p-4 flex flex-col md:flex-row items-center justify-between gap-4 rounded-sm h-full">
          <div className="flex items-center gap-3 px-4 border-r border-ink-500/10 min-w-fit">
            <Clock className="w-5 h-5 text-ink-400" />
            <div className="text-center md:text-left">
              <div className="font-display text-lg leading-none">{playerConfig?.location || '未知地点'}</div>
              <div className="text-xs font-serif opacity-60">
                {worldConfig.era} {worldConfig.month}月{worldConfig.day}日 {worldConfig.period}
              </div>
            </div>
          </div>
          <div className="flex-1 w-full overflow-hidden relative">
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-parchment-50 to-transparent z-10"></div>
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-parchment-50 to-transparent z-10"></div>
            <div className="whitespace-nowrap animate-marquee flex items-center gap-8 text-sm font-serif italic text-ink-500/80">
              <span className="flex items-center gap-2"><AlertTriangle size={14} className="text-rust-500" /> 帝国北境发现异常以太波动...</span>
              <span className="flex items-center gap-2"><Feather size={14} /> 教廷宣布新的圣谕：禁止私藏古神遗物...</span>
              <span className="flex items-center gap-2"><Coins size={14} /> 铁炉堡的矿石价格上涨了 15%...</span>
            </div>
          </div>
        </div>
      </header>

      {/* --- Main Grid --- */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-[600px]">

        {/* --- Left Sidebar: Character --- */}
        <aside className="lg:col-span-3 flex flex-col gap-6">
          {/* Character Card */}
          <div className="box-sketch bg-parchment-50 p-6 rounded-sm flex-1 flex flex-col gap-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-display font-bold">{playerConfig?.profession ? `契约者: ${playerConfig.profession}` : '艾瑞克·黑棘'}</h2>
                <p className="text-sm font-serif italic text-ink-500/60">{playerConfig?.title || '流浪的守夜人'}</p>
              </div>
              <div className="w-12 h-12 rounded-full border-2 border-ink-500/20 bg-ink-500/5 flex items-center justify-center">
                <User className="w-6 h-6 text-ink-400" />
              </div>
            </div>

            <div className="space-y-4">
              <StatBar label="生命 (HP)" value={340} max={450} colorClass="bg-rust-500" />
              <StatBar label="法力 (MP)" value={120} max={200} colorClass="bg-slate-500" />
              <StatBar label="奥法之灾觉醒度 (SAN)" value={45} max={100} colorClass="bg-moss-500" />
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-ink-500/10">
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-widest opacity-50 block">职业</span>
                <span className="font-display">{playerConfig?.profession || '猎魔人 Lv.14'}</span>
              </div>
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-widest opacity-50 block">信仰</span>
                <span className="font-display">{playerConfig?.faith || '无信者'}</span>
              </div>
            </div>

            {/* Equipment Slots */}
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest opacity-50">装备</span>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { icon: Sword, label: "主手" },
                  { icon: Shield, label: "副手" },
                  { icon: User, label: "服饰" },
                  { icon: Sparkles, label: "饰品" }
                ].map((item, i) => (
                  <Tooltip text={item.label} key={i}>
                    <button
                      onClick={() => setActiveModal('inventory')}
                      className="aspect-square border border-ink-500/20 rounded bg-ink-500/5 hover:bg-ink-500/10 hover:border-ink-500/40 transition-all flex items-center justify-center group"
                    >
                      <item.icon className="w-5 h-5 text-ink-400 group-hover:text-ink-500" />
                    </button>
                  </Tooltip>
                ))}
              </div>
            </div>

            {/* Temporary Status */}
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest opacity-50 flex items-center gap-1">
                <Sparkles size={12} /> 临时状态
              </span>
              <div className="flex flex-wrap gap-2">
                <Tooltip text={playerConfig?.status || "没有什么异常状态"}>
                  <div className={`flex items-center gap-1.5 px-2 py-1 rounded-sm border text-[10px] font-bold tracking-wider uppercase transition-all cursor-help bg-emerald-500/10 border-emerald-500/30 text-emerald-600`}>
                    <Sparkles size={10} />
                    {playerConfig?.status || "健康"}
                  </div>
                </Tooltip>
              </div>
            </div>

            {/* Currency */}
            <div className="mt-auto pt-4 border-t border-ink-500/10">
              <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm font-mono text-ink-500/80">
                <Tooltip text="帝国金狮">
                  <div className="flex items-center gap-2 cursor-help">
                    <div className="w-3 h-3 rounded-full bg-gold-500 shadow-sm border border-ink-500/20"></div>
                    <span>{playerConfig?.currency?.gold ?? 1240}</span>
                  </div>
                </Tooltip>
                <Tooltip text="银辉币">
                  <div className="flex items-center gap-2 cursor-help">
                    <div className="w-3 h-3 rounded-full bg-gray-300 shadow-sm border border-ink-500/20"></div>
                    <span>{playerConfig?.currency?.silver ?? 450}</span>
                  </div>
                </Tooltip>
                <Tooltip text="铜叶币">
                  <div className="flex items-center gap-2 cursor-help">
                    <div className="w-3 h-3 rounded-full bg-amber-700 shadow-sm border border-ink-500/20"></div>
                    <span>{playerConfig?.currency?.copper ?? 3020}</span>
                  </div>
                </Tooltip>
                <Tooltip text="以太结晶">
                  <div className="flex items-center gap-2 cursor-help">
                    <div className="w-3 h-3 rotate-45 bg-purple-400 shadow-[0_0_5px_rgba(192,132,252,0.5)] border border-ink-500/20"></div>
                    <span>12</span>
                  </div>
                </Tooltip>
              </div>
            </div>
          </div>
        </aside>

        {/* --- Center: Narrative Log --- */}
        <section className="lg:col-span-6 flex flex-col gap-4 h-[70vh] lg:h-auto">
          <div className="flex-1 box-sketch bg-parchment-50 p-8 rounded-sm overflow-y-auto custom-scrollbar relative">
            <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-parchment-50 to-transparent pointer-events-none z-10"></div>

            <div className="space-y-6 pt-4 pb-4">
              {logs.map((log, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`
                    ${log.type === 'system' ? 'text-xs text-ink-500/40 font-mono text-center border-b border-ink-500/5 pb-2 mb-4' : ''}
                    ${log.type === 'user' ? 'text-right text-ink-500 font-serif italic pl-12' : ''}
                    ${log.type === 'narrative' ? 'text-left text-lg leading-relaxed font-serif text-ink-500 pr-8' : ''}
                  `}
                >
                  {log.type === 'user' ? (
                    <span className="inline-block bg-ink-500/5 px-4 py-2 rounded-lg rounded-tr-none border border-ink-500/10">
                      {log.text}
                    </span>
                  ) : (
                    log.text
                  )}
                </motion.div>
              ))}
            </div>

            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-parchment-50 to-transparent pointer-events-none z-10"></div>
          </div>

          {/* Input Area */}
          <div className="box-sketch bg-parchment-50 p-2 rounded-sm flex gap-2 items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="输入你的行动..."
              className="flex-1 bg-transparent border-none outline-none px-4 py-3 font-serif text-lg placeholder:text-ink-500/30 text-ink-500"
            />
            <button
              onClick={handleSend}
              className="p-3 bg-ink-500 text-parchment-100 hover:bg-ink-400 transition-colors rounded-sm"
            >
              <Feather className="w-5 h-5" />
            </button>
          </div>
        </section>

        {/* --- Right Sidebar: World & Quests --- */}
        <aside className="lg:col-span-3 flex flex-col gap-6">

          {/* Map Preview */}
          <div
            onClick={() => setActiveModal('map')}
            className="group box-sketch bg-ink-500/5 aspect-video rounded-sm relative overflow-hidden cursor-pointer transition-all hover:shadow-lg"
          >
            <div className="absolute inset-0 bg-[url('https://img.freepik.com/free-vector/ancient-map-background_1284-15632.jpg')] bg-cover bg-center opacity-40 group-hover:opacity-60 transition-opacity grayscale sepia"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-parchment-100/90 p-3 rounded-full border border-ink-500/20 group-hover:scale-110 transition-transform">
                <MapIcon className="w-6 h-6 text-ink-500" />
              </div>
            </div>
            <div className="absolute bottom-0 w-full p-3 bg-gradient-to-t from-ink-500/80 to-transparent text-parchment-50 text-center font-display tracking-widest text-sm">
              世界地图
            </div>
          </div>

          {/* Quest Board */}
          <div className="box-sketch bg-parchment-50 p-6 rounded-sm flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-bold text-lg flex items-center gap-2">
                <Scroll className="w-4 h-4" /> 委托
              </h3>
              <span className="text-xs font-mono border border-ink-500/20 px-2 py-0.5 rounded text-ink-500/60">
                白银级
              </span>
            </div>

            <div className="space-y-4 flex-1">
              <div
                onClick={() => setActiveModal('quests')}
                className="p-3 border border-ink-500/10 bg-white/40 rounded hover:border-rust-500/30 hover:bg-white/60 transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-sm group-hover:text-rust-500 transition-colors">调查废弃矿坑</span>
                  <span className="text-[10px] uppercase tracking-wider text-rust-500 font-bold">进行中</span>
                </div>
                <p className="text-xs opacity-60 line-clamp-2 leading-relaxed">
                  有报告称在黑岩矿坑深处听到了奇怪的低语声，矿工们拒绝进入。
                </p>
              </div>
            </div>
          </div>

          {/* Social Button */}
          <button
            onClick={() => setActiveModal('social')}
            className="box-sketch p-4 bg-ink-500/10 text-ink-500 flex items-center justify-center gap-3 hover:bg-ink-500/20 transition-all rounded-sm group border border-ink-500/20"
          >
            <User className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-display tracking-widest text-sm">社交与契约</span>
          </button>

          {/* Archives Button */}
          <button
            onClick={() => setActiveModal('archives')}
            className="box-sketch p-4 bg-ink-500 text-parchment-100 flex items-center justify-center gap-3 hover:bg-ink-400 transition-colors rounded-sm group"
          >
            <BookOpen className="w-5 h-5 group-hover:rotate-[-10deg] transition-transform" />
            <span className="font-display tracking-widest">末日档案馆</span>
          </button>
        </aside>
      </main>

      {/* --- Modals --- */}

      {/* Social Modal */}
      <Modal
        isOpen={activeModal === 'social'}
        onClose={() => setActiveModal(null)}
        title="社交与契约"
        maxWidth="max-w-4xl"
      >
        <div className="flex flex-col gap-6">
          {/* Tabs */}
          <div className="flex border-b border-ink-500/10">
            <button
              onClick={() => setSocialTab('squad')}
              className={`px-6 py-2 font-display tracking-widest text-sm transition-all border-b-2 ${
                socialTab === 'squad' ? 'border-rust-500 text-rust-600 bg-rust-500/5' : 'border-transparent opacity-40 hover:opacity-100'
              }`}
            >
              小队成员
            </button>
            <button
              onClick={() => setSocialTab('npcs')}
              className={`px-6 py-2 font-display tracking-widest text-sm transition-all border-b-2 ${
                socialTab === 'npcs' ? 'border-rust-500 text-rust-600 bg-rust-500/5' : 'border-transparent opacity-40 hover:opacity-100'
              }`}
            >
              人际关系
            </button>
          </div>

          <div className="p-4 bg-white/20 rounded-sm border border-ink-500/5 min-h-[400px]">
            {socialTab === 'squad' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {TEAMMATES.map((member, i) => (
                  <div key={i} className="p-5 border border-ink-500/10 rounded bg-white/40 shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-display font-bold text-lg">{member.name}</h4>
                        <p className="text-xs font-serif italic opacity-60 text-rust-700">{member.profession}</p>
                      </div>
                      <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-700 px-2 py-1 rounded border border-emerald-500/20">
                        {member.status}
                      </span>
                    </div>
                    <StatBar label="生命 (HP)" value={member.hp} max={member.maxHp} colorClass="bg-rust-500" />
                    <div className="mt-4 flex gap-2">
                       <button className="flex-1 py-1.5 bg-ink-500/5 hover:bg-ink-500/10 rounded text-[10px] font-display tracking-widest border border-ink-500/10 transition-colors uppercase">
                          指令
                       </button>
                       <button className="flex-1 py-1.5 bg-ink-500/5 hover:bg-ink-500/10 rounded text-[10px] font-display tracking-widest border border-ink-500/10 transition-colors uppercase">
                          交换物品
                       </button>
                    </div>
                  </div>
                ))}
                {/* Recruitment Slot */}
                <div className="p-5 border border-dashed border-ink-500/20 rounded bg-ink-500/5 flex flex-col items-center justify-center opacity-40 hover:opacity-60 cursor-pointer transition-opacity">
                   <div className="w-10 h-10 rounded-full border border-ink-500/20 flex items-center justify-center mb-2">
                      <span className="text-2xl">+</span>
                   </div>
                   <span className="text-xs font-display tracking-widest">寻找新的队友</span>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {NPCS.map((npc, i) => (
                  <div key={i} className="p-5 border border-ink-500/10 rounded bg-white/40 shadow-sm hover:border-rust-500/20 transition-all">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                       <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-ink-500/5 flex items-center justify-center border border-ink-500/10">
                            <User className="w-5 h-5 opacity-40" />
                         </div>
                         <div>
                            <h4 className="font-display font-bold text-lg leading-tight">{npc.name}</h4>
                            <span className="text-[10px] font-display tracking-widest uppercase text-rust-600">{npc.relation}</span>
                         </div>
                       </div>
                       <div className="w-full md:w-48">
                          <div className="flex justify-between text-[10px] font-mono mb-1">
                             <span>好感度</span>
                             <span>{npc.affinity}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-ink-500/10 rounded-full overflow-hidden">
                             <div
                                className="h-full bg-rust-500 shadow-[0_0_5px_rgba(138,75,56,0.5)] transition-all duration-1000"
                                style={{ width: `${npc.affinity}%` }}
                             />
                          </div>
                       </div>
                    </div>
                    <p className="text-sm font-serif italic text-ink-500/80 leading-relaxed border-t border-ink-500/5 pt-3">
                       "{npc.description}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Map Modal */}
      <Modal
        isOpen={activeModal === 'map'}
        onClose={() => setActiveModal(null)}
        title="世界地图"
        maxWidth="max-w-6xl"
      >
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="flex-1 w-full aspect-[16/9] lg:aspect-auto lg:h-[65vh] bg-parchment-200 rounded border-2 border-ink-500/20 relative overflow-hidden shadow-2xl group/map">
             {/* The Map Image */}
             <div
               className="absolute inset-0 bg-cover bg-center"
               style={{ backgroundImage: `url(${emblems.map})` }}
             ></div>

             {/* Map Texture Overlay */}
             <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] pointer-events-none"></div>
             <div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(45deg,transparent,transparent_20px,#2C241B_20px,#2C241B_21px)] pointer-events-none"></div>

             {/* Vignette */}
             <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.3)] pointer-events-none"></div>

             {/* Location Markers */}

             {/* 1. 西北：永夜森林 */}
             <div className="absolute top-[20%] left-[20%] group cursor-pointer hover:scale-110 transition-transform">
               <div className="w-4 h-4 bg-emerald-950 rounded-full border-2 border-parchment-100 shadow-lg flex items-center justify-center">
                 <div className="w-1.5 h-1.5 bg-parchment-100 rounded-full"></div>
               </div>
               <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-ink-500 text-parchment-50 text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap shadow-xl z-20 border border-ink-400">
                 <span className="font-display tracking-widest uppercase">永夜森林</span>
               </div>
             </div>

             {/* 2. 北偏东：凛冬山脉 */}
             <div className="absolute top-[15%] left-[65%] group cursor-pointer hover:scale-110 transition-transform">
               <div className="w-4 h-4 bg-slate-200 rounded-full border-2 border-ink-500 shadow-lg flex items-center justify-center">
                 <div className="w-1.5 h-1.5 bg-ink-50 rounded-full"></div>
               </div>
               <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-ink-500 text-parchment-50 text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap shadow-xl z-20 border border-ink-400">
                 <span className="font-display tracking-widest uppercase">凛冬山脉</span>
               </div>
             </div>

             {/* 3. 中间部分：翡翠平原 */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group cursor-pointer hover:scale-110 transition-transform">
               <div className="w-5 h-5 bg-moss-500 rounded-full border-2 border-parchment-100 shadow-lg flex items-center justify-center">
                 <div className="w-2 h-2 bg-parchment-100 rounded-full animate-pulse"></div>
               </div>
               <div className="absolute top-7 left-1/2 -translate-x-1/2 bg-ink-500 text-parchment-50 text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap shadow-xl z-20 border border-ink-400">
                 <span className="font-display tracking-widest uppercase">翡翠平原</span>
               </div>
             </div>

             {/* 4. 东方：赤砂荒漠 */}
             <div className="absolute top-1/2 right-[15%] group cursor-pointer hover:scale-110 transition-transform">
               <div className="w-4 h-4 bg-orange-700 rounded-full border-2 border-parchment-100 shadow-lg flex items-center justify-center">
                 <div className="w-1.5 h-1.5 bg-parchment-100 rounded-full"></div>
               </div>
               <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-ink-500 text-parchment-50 text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap shadow-xl z-20 border border-ink-400">
                 <span className="font-display tracking-widest uppercase">赤砂荒漠</span>
               </div>
             </div>

             {/* 5. 南方：枯萎之地 */}
             <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 group cursor-pointer hover:scale-110 transition-transform">
               <div className="w-4 h-4 bg-zinc-800 rounded-full border-2 border-parchment-100 shadow-lg flex items-center justify-center">
                 <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full"></div>
               </div>
               <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-ink-500 text-parchment-50 text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap shadow-xl z-20 border border-ink-400">
                 <span className="font-display tracking-widest uppercase">枯萎之地</span>
               </div>
             </div>

             {/* Coordinates Display */}
             <div className="absolute top-4 left-4 font-mono text-[10px] text-ink-500/40 tracking-widest bg-parchment-50/40 px-2 py-1 rounded-sm border border-ink-500/10">
               LAT: 42.36' N | LON: 71.05' W
             </div>
          </div>

          {/* Factions Panel */}
          <div className="w-full lg:w-80 flex flex-col gap-6">
             <div className="flex items-center gap-3 pb-3 border-b border-ink-500/10">
                <Compass className="w-6 h-6 text-rust-600" />
                <div>
                   <h3 className="font-display font-bold text-xl tracking-[0.2em] text-ink-500 uppercase">势力与声望</h3>
                   <p className="text-[10px] font-serif italic opacity-60">世界各地的影响力平衡</p>
                </div>
             </div>

             <div className="space-y-4 overflow-y-auto max-h-[55vh] pr-2 custom-scrollbar">
                {FACTIONS.map((faction, i) => (
                  <div
                    key={i}
                    onClick={() => setExpandedFaction(expandedFaction === faction.name ? null : faction.name)}
                    className={`group flex flex-col gap-1 p-3 border rounded-sm transition-all cursor-pointer ${
                      expandedFaction === faction.name
                        ? 'bg-parchment-200 border-ink-500/30 shadow-inner'
                        : 'bg-white/40 border-ink-500/10 hover:bg-white/70 hover:border-ink-500/20'
                    }`}
                  >
                     <div className="flex items-center justify-between">
                        <span className={`text-sm font-display font-bold tracking-wider transition-colors ${
                          expandedFaction === faction.name ? 'text-rust-700' : 'text-ink-500'
                        }`}>
                          {faction.name}
                        </span>
                        <span className={`text-[10px] font-display font-bold tracking-[0.1em] px-2 py-0.5 rounded bg-ink-950/5 ${getReputationColor(faction.reputation)}`}>
                           {faction.reputation}
                        </span>
                     </div>

                     <AnimatePresence>
                        {expandedFaction === faction.name && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="overflow-hidden"
                          >
                            <p className="pt-2 text-[11px] font-serif leading-relaxed text-ink-500/80 border-t border-ink-500/5 mt-1">
                              {faction.description}
                            </p>
                          </motion.div>
                        )}
                     </AnimatePresence>

                     {/* Mini Rep Bar */}
                     <div className="h-0.5 w-full bg-ink-500/5 rounded-full overflow-hidden mt-1">
                        <div
                          className={`h-full opacity-70 transition-all duration-700 ${
                            faction.reputation === '敌对' || faction.reputation === '通缉' ? 'bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]' :
                            faction.reputation === '中立' || faction.reputation === '冷淡' ? 'bg-slate-400' : 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]'
                          }`}
                          style={{ width:
                            faction.reputation === '通缉' ? '10%' :
                            faction.reputation === '敌对' ? '25%' :
                            faction.reputation === '冷淡' ? '40%' :
                            faction.reputation === '中立' ? '50%' :
                            faction.reputation === '友善' ? '70%' :
                            faction.reputation === '盟友' ? '85%' : '100%'
                          }}
                        />
                     </div>
                  </div>
                ))}
             </div>

             <div className="mt-auto p-4 bg-ink-500/5 border border-ink-500/10 rounded-sm">
                <p className="text-[10px] font-serif italic text-ink-400 leading-relaxed">
                  "名望如烟，唯有力量与利益永恒存在于这片破碎的大地上。"
                </p>
             </div>
          </div>
        </div>
      </Modal>

      {/* Archives Modal */}
      <Modal
        isOpen={activeModal === 'archives'}
        onClose={() => { setActiveModal(null); setArchiveView('menu'); }}
        title="末日档案馆"
      >
        {archiveView === 'menu' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
            {/* Card 1: Prophecies */}
            <div onClick={() => setArchiveView('prophecies')} className="group relative aspect-[1/1.6] perspective-1000 cursor-pointer">
              <div className="absolute inset-0 bg-parchment-100 border-2 border-rust-900/20 rounded-sm shadow-xl transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-4 overflow-hidden p-1">
                <div className="absolute inset-1 border border-rust-900/10 pointer-events-none"></div>
                <div className="h-full border border-rust-900/5 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] p-6 flex flex-col items-center">
                   {/* Top Number/Ornament */}
                   <div className="text-rust-900/40 font-display text-sm mb-4 tracking-[0.3em]">VII</div>

                   {/* Illustrative Container */}
                   <div className="w-full aspect-square border-2 border-rust-900/10 flex items-center justify-center relative mb-8 group-hover:border-rust-900/30 transition-colors">
                      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-rust-900/40"></div>
                      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-rust-900/40"></div>
                      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-rust-900/40"></div>
                      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-rust-900/40"></div>
                      <Skull className="w-16 h-16 text-rust-900/60 group-hover:scale-110 group-hover:text-rust-700 transition-all duration-500" />
                   </div>

                   <h3 className="font-display font-bold text-2xl mb-4 text-rust-900 tracking-[0.2em] uppercase text-center">末日预言书</h3>
                   <div className="w-12 h-0.5 bg-rust-900/20 mb-4"></div>
                   <p className="text-xs text-rust-900/60 font-serif italic leading-relaxed text-center px-2">
                     "当七个封印被揭开，群星将坠落如熟透的无花果。"
                   </p>
                   <div className="mt-auto text-[10px] font-sans opacity-40 uppercase tracking-[0.3em] text-rust-900">
                     禁忌知识
                   </div>
                </div>
              </div>
            </div>

            {/* Card 2: Theology */}
            <div onClick={() => setArchiveView('theology')} className="group relative aspect-[1/1.6] perspective-1000 cursor-pointer">
              <div className="absolute inset-0 bg-parchment-100 border-2 border-slate-900/20 rounded-sm shadow-xl transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-4 overflow-hidden p-1">
                <div className="absolute inset-1 border border-slate-900/10 pointer-events-none"></div>
                <div className="h-full border border-slate-900/5 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] p-6 flex flex-col items-center">
                   <div className="text-slate-900/40 font-display text-sm mb-4 tracking-[0.3em]">XI</div>

                   <div className="w-full aspect-square border-2 border-slate-900/10 flex items-center justify-center relative mb-8 group-hover:border-slate-900/30 transition-colors">
                      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-slate-900/40"></div>
                      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-slate-900/40"></div>
                      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-slate-900/40"></div>
                      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-slate-900/40"></div>
                      <div className="w-16 h-16 border-2 border-slate-900/40 rotate-45 group-hover:rotate-[135deg] transition-all duration-700" />
                   </div>

                   <h3 className="font-display font-bold text-2xl mb-4 text-slate-900 tracking-[0.2em] uppercase text-center">神学对位图</h3>
                   <div className="w-12 h-0.5 bg-slate-900/20 mb-4"></div>
                   <p className="text-xs text-slate-900/60 font-serif italic leading-relaxed text-center px-2">
                     "秩序与混沌并非对立，而是同一枚硬币的两面。"
                   </p>
                   <div className="mt-auto text-[10px] font-sans opacity-40 uppercase tracking-[0.3em] text-slate-900">
                     宇宙学
                   </div>
                </div>
              </div>
            </div>

            {/* Card 3: Pantheon */}
            <div onClick={() => setArchiveView('pantheon')} className="group relative aspect-[1/1.6] perspective-1000 cursor-pointer">
              <div className="absolute inset-0 bg-parchment-100 border-2 border-gold-900/20 rounded-sm shadow-xl transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-4 overflow-hidden p-1">
                <div className="absolute inset-1 border border-gold-900/10 pointer-events-none"></div>
                <div className="h-full border border-gold-900/5 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] p-6 flex flex-col items-center">
                   <div className="text-gold-900/40 font-display text-sm mb-4 tracking-[0.3em]">XXI</div>

                   <div className="w-full aspect-square border-2 border-gold-900/10 flex items-center justify-center relative mb-8 group-hover:border-gold-900/30 transition-colors">
                      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-gold-900/40"></div>
                      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-gold-900/40"></div>
                      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-gold-900/40"></div>
                      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-gold-900/40"></div>
                      <History className="w-16 h-16 text-gold-900/60 group-hover:scale-110 group-hover:text-gold-700 transition-all duration-500" />
                   </div>

                   <h3 className="font-display font-bold text-2xl mb-4 text-gold-900 tracking-[0.2em] uppercase text-center">诸神列传</h3>
                   <div className="w-12 h-0.5 bg-gold-900/20 mb-4"></div>
                   <p className="text-xs text-gold-900/60 font-serif italic leading-relaxed text-center px-2">
                     "他们曾行走于大地，如今只在梦境中低语。"
                   </p>
                   <div className="mt-auto text-[10px] font-sans opacity-40 uppercase tracking-[0.3em] text-gold-900">
                     历史与神话
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {archiveView === 'prophecies' && (
          <div className="space-y-8 flex flex-col items-center">
            <div className="w-full flex justify-between items-center px-4">
              <button onClick={() => { setArchiveView('menu'); setArchiveIndex(0); }} className="flex items-center gap-2 text-sm font-display uppercase tracking-widest text-ink-500/60 hover:text-ink-500 transition-colors">
                <div className="rotate-180">➜</div> 返回目录
              </button>
              <div className="text-xs font-mono opacity-40 uppercase tracking-widest">卡片 {archiveIndex + 1} / {PROPHECIES.length}</div>
            </div>

            <div className="flex items-center gap-12 w-full max-w-4xl justify-center">
              <button
                onClick={() => setArchiveIndex(prev => (prev > 0 ? prev - 1 : PROPHECIES.length - 1))}
                className="p-4 bg-ink-500/5 hover:bg-ink-500/10 rounded-full border border-ink-500/10 transition-colors group"
              >
                <div className="rotate-180 text-2xl group-hover:-translate-x-1 transition-transform">➜</div>
              </button>

              <div className="w-72 md:w-80 lg:w-96 perspective-1000">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={archiveIndex}
                    initial={{ opacity: 0, x: 50, rotateY: 20 }}
                    animate={{ opacity: 1, x: 0, rotateY: 0 }}
                    exit={{ opacity: 0, x: -50, rotateY: -20 }}
                    transition={{ duration: 0.4 }}
                    className="aspect-[1/1.6] relative"
                  >
                    <ProphecyCardContent prophecy={PROPHECIES[archiveIndex]} />
                  </motion.div>
                </AnimatePresence>
              </div>

              <button
                onClick={() => setArchiveIndex(prev => (prev < PROPHECIES.length - 1 ? prev + 1 : 0))}
                className="p-4 bg-ink-500/5 hover:bg-ink-500/10 rounded-full border border-ink-500/10 transition-colors group"
              >
                <div className="text-2xl group-hover:translate-x-1 transition-transform">➜</div>
              </button>
            </div>
          </div>
        )}

        {archiveView === 'theology' && (
          <div className="space-y-8 flex flex-col items-center">
            <div className="w-full flex justify-between items-center px-4">
              <button onClick={() => { setArchiveView('menu'); setArchiveIndex(0); }} className="flex items-center gap-2 text-sm font-display uppercase tracking-widest text-ink-500/60 hover:text-ink-500 transition-colors">
                <div className="rotate-180">➜</div> 返回目录
              </button>
              <div className="text-xs font-mono opacity-40 uppercase tracking-widest">对位关系 {archiveIndex + 1} / {THEOLOGY_PAIRS.length}</div>
            </div>

            <div className="flex items-center gap-12 w-full max-w-4xl justify-center">
              <button
                onClick={() => setArchiveIndex(prev => (prev > 0 ? prev - 1 : THEOLOGY_PAIRS.length - 1))}
                className="p-4 bg-ink-500/5 hover:bg-ink-500/10 rounded-full border border-ink-500/10 transition-colors group"
              >
                <div className="rotate-180 text-2xl group-hover:-translate-x-1 transition-transform">➜</div>
              </button>

              <div className="w-72 md:w-80 lg:w-96">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={archiveIndex}
                    initial={{ opacity: 0, x: 50, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -50, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                  >
                    <FlipCard
                      front={
                        <div className="absolute inset-0 bg-zinc-950 text-zinc-100 p-6 flex flex-col items-center justify-center text-center rounded-sm shadow-lg border-2 border-zinc-800">
                          <div className="absolute inset-1 border border-white/5"></div>
                          <div className="text-zinc-500 font-display text-[10px] tracking-[0.4em] mb-8">NEMESIS ELEMENT</div>
                          <h4 className="font-display font-bold text-3xl mb-4 tracking-widest">{THEOLOGY_PAIRS[archiveIndex].element}</h4>
                          <div className="w-16 h-0.5 bg-rust-500/40 mb-4"></div>
                          <p className="text-xs opacity-40 font-mono uppercase tracking-[0.2em]">灭世要素</p>
                        </div>
                      }
                      back={
                        <div className="absolute inset-0 bg-parchment-100 text-zinc-950 p-6 flex flex-col items-center justify-center text-center rounded-sm shadow-lg border-2 border-zinc-950/20">
                          <div className="absolute inset-1 border border-black/5"></div>
                          <div className="text-zinc-500 font-display text-[10px] tracking-[0.4em] mb-8">DIVINE COUNTERPART</div>
                          <h4 className="font-display font-bold text-3xl mb-4 tracking-widest">{THEOLOGY_PAIRS[archiveIndex].god}</h4>
                          <div className="w-16 h-0.5 bg-gold-900/40 mb-4"></div>
                          <p className="text-xs opacity-60 font-mono uppercase tracking-[0.2em] mb-4">对位神祗</p>
                          <p className="text-xs font-serif italic opacity-80 leading-relaxed px-4">{THEOLOGY_PAIRS[archiveIndex].desc}</p>
                        </div>
                      }
                    />
                  </motion.div>
                </AnimatePresence>
                <p className="text-center text-[10px] font-mono opacity-40 mt-6 uppercase tracking-widest animate-pulse">点击卡片翻转查看对位</p>
              </div>

              <button
                onClick={() => setArchiveIndex(prev => (prev < THEOLOGY_PAIRS.length - 1 ? prev + 1 : 0))}
                className="p-4 bg-ink-500/5 hover:bg-ink-500/10 rounded-full border border-ink-500/10 transition-colors group"
              >
                <div className="text-2xl group-hover:translate-x-1 transition-transform">➜</div>
              </button>
            </div>
          </div>
        )}

        {archiveView === 'pantheon' && (
          <div className="space-y-8 flex flex-col items-center">
            <div className="w-full flex justify-between items-center px-4">
              <button onClick={() => { setArchiveView('menu'); setArchiveIndex(0); }} className="flex items-center gap-2 text-sm font-display uppercase tracking-widest text-ink-500/60 hover:text-ink-500 transition-colors">
                <div className="rotate-180">➜</div> 返回目录
              </button>
              <div className="text-xs font-mono opacity-40 uppercase tracking-widest">诸神 {archiveIndex + 1} / {Object.keys(GODS).length}</div>
            </div>

            <div className="flex items-center gap-12 w-full max-w-4xl justify-center">
              <button
                onClick={() => setArchiveIndex(prev => (prev > 0 ? prev - 1 : Object.keys(GODS).length - 1))}
                className="p-4 bg-ink-500/5 hover:bg-ink-500/10 rounded-full border border-ink-500/10 transition-colors group"
              >
                <div className="rotate-180 text-2xl group-hover:-translate-x-1 transition-transform">➜</div>
              </button>

              <div className="w-72 md:w-80 lg:w-96 perspective-1000">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={archiveIndex}
                    initial={{ opacity: 0, scale: 0.9, rotateY: 45 }}
                    animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                    exit={{ opacity: 0, scale: 0.9, rotateY: -45 }}
                    transition={{ duration: 0.5 }}
                    className="aspect-[1/1.6] relative"
                  >
                    {/* Render the specific god based on index */}
                    {(() => {
                      const godKey = Object.keys(GODS)[archiveIndex] as keyof typeof GODS;
                      return <GodCardContent god={GODS[godKey]} theme={godKey} />;
                    })()}
                  </motion.div>
                </AnimatePresence>
              </div>

              <button
                onClick={() => setArchiveIndex(prev => (prev < Object.keys(GODS).length - 1 ? prev + 1 : 0))}
                className="p-4 bg-ink-500/5 hover:bg-ink-500/10 rounded-full border border-ink-500/10 transition-colors group"
              >
                <div className="text-2xl group-hover:translate-x-1 transition-transform">➜</div>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Inventory Modal */}
      <Modal
        isOpen={activeModal === 'inventory'}
        onClose={() => setActiveModal(null)}
        title="行囊与装备"
        maxWidth="max-w-5xl"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
             <h3 className="font-display text-lg border-b border-ink-500/10 pb-2 mb-6 flex items-center gap-2">
               <Shield className="w-4 h-4 text-rust-600" /> 当前装备
             </h3>
             <div className="space-y-4">
               {[
                 { slot: "主手", name: "生锈的铁剑", desc: "虽然有些钝了，但依然能造成伤害。", quality: "common" },
                 { slot: "副手", name: "守夜人提灯", desc: "驱散黑暗，照亮前路。", quality: "rare" },
                 { slot: "服饰", name: "磨损的皮甲", desc: "提供基本的防护。", quality: "common" },
                 { slot: "饰品", name: "母亲的吊坠", desc: "微弱的理智回复效果。", quality: "epic" }
               ].map((item, i) => (
                 <div key={i} className="flex gap-4 p-4 border border-ink-500/10 rounded-sm bg-white/30 hover:bg-white/50 hover:border-ink-500/20 transition-all">
                   <div className="w-14 h-14 bg-ink-500/5 flex items-center justify-center border border-ink-500/10 rounded-sm shrink-0">
                     <Sword className="w-6 h-6 opacity-30" />
                   </div>
                   <div>
                     <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase tracking-widest opacity-40 font-bold">{item.slot}</span>
                        <div className="w-1 h-1 rounded-full bg-ink-500/20"></div>
                        <div className={`font-bold font-display text-sm ${
                          item.quality === 'rare' ? 'text-blue-600' :
                          item.quality === 'epic' ? 'text-purple-600' : 'text-ink-600'
                        }`}>{item.name}</div>
                     </div>
                     <p className="text-xs font-serif italic opacity-70 mt-1">{item.desc}</p>
                   </div>
                 </div>
               ))}
             </div>
          </div>
          <div className="lg:col-span-7">
            <h3 className="font-display text-lg border-b border-ink-500/10 pb-2 mb-6 flex items-center gap-2">
               <Scroll className="w-4 h-4 text-rust-600" /> 背包物品
            </h3>
            <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-2 custom-scrollbar">
              {INVENTORY_ITEMS.map((item, i) => (
                <div key={i} className="group p-4 border border-ink-500/5 bg-white/20 rounded-sm hover:bg-white/40 hover:border-ink-500/20 transition-all">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        item.quality === 'common' ? 'bg-slate-400' :
                        item.quality === 'rare' ? 'bg-blue-400' :
                        item.quality === 'epic' ? 'bg-purple-400' : 'bg-gold-500'
                      }`} />
                      <span className={`font-bold font-display tracking-wide ${
                        item.quality === 'common' ? 'text-ink-600' :
                        item.quality === 'rare' ? 'text-blue-700' :
                        item.quality === 'epic' ? 'text-purple-700' : 'text-amber-700'
                      }`}>
                        {item.name}
                      </span>
                    </div>
                    <span className="font-mono text-xs bg-ink-500/5 px-2 py-0.5 rounded border border-ink-500/10">
                      数量: {item.quantity}
                    </span>
                  </div>
                  <p className="text-[11px] font-serif italic opacity-70 leading-relaxed ml-5">
                    "{item.description}"
                  </p>
                </div>
              ))}
              {/* Empty Slots Placeholder */}
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={`empty-${i}`} className="p-4 border border-dashed border-ink-500/10 rounded-sm opacity-30 flex items-center justify-center">
                   <span className="text-[10px] font-mono tracking-widest">--- 空槽位 ---</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Quests Modal */}
      <Modal
        isOpen={activeModal === 'quests'}
        onClose={() => setActiveModal(null)}
        title="委托板"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 bg-rust-500/5 border border-rust-500/20 rounded">
            <div className="w-16 h-16 bg-rust-500/10 rounded flex items-center justify-center border border-rust-500/20">
              <Shield className="w-8 h-8 text-rust-500" />
            </div>
            <div>
              <h3 className="font-display font-bold text-xl text-rust-700">等级认证：白银级</h3>
              <p className="text-sm font-serif opacity-70">你已经证明了自己的实力，可以接受中等难度的委托。</p>
            </div>
          </div>

          <div className="space-y-4">
             <h3 className="font-display text-lg border-b border-ink-500/10 pb-2">当前委托</h3>
             <div className="p-4 border border-ink-500/10 bg-white/40 rounded flex justify-between items-center hover:shadow-md transition-shadow">
               <div>
                 <h4 className="font-bold font-display">调查废弃矿坑</h4>
                 <p className="text-sm font-serif opacity-60 mt-1">报酬: 50 金狮</p>
               </div>
               <button className="px-4 py-2 bg-rust-500 text-parchment-50 text-xs font-bold uppercase tracking-widest cursor-default rounded-sm">
                 进行中
               </button>
             </div>
          </div>
        </div>
      </Modal>

      {/* --- Fullscreen 3D Doomsday Clock --- */}
      <AnimatePresence>
        {showFullClock && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-8 overflow-hidden"
            onClick={() => setShowFullClock(false)}
          >
            <motion.div
              initial={{ scale: 0.5, rotateY: 90, opacity: 0 }}
              animate={{ scale: 1, rotateY: 0, opacity: 1 }}
              exit={{ scale: 0.5, rotateY: -90, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              className="relative w-[300px] h-[300px] md:w-[600px] md:h-[600px] perspective-2000"
              onClick={(e) => e.stopPropagation()}
            >
              {/* The 3D Clock Body */}
              <div className="w-full h-full relative preserve-3d">

                {/* Outer Ring / Brass Frame */}
                <div className="absolute inset-0 rounded-full border-[12px] md:border-[24px] border-amber-900 bg-amber-950/20 shadow-[0_0_100px_rgba(146,64,14,0.3),inset_0_0_50px_rgba(0,0,0,0.5)] translate-z-10"></div>

                {/* Clock Face */}
                <div className="absolute inset-4 md:inset-8 rounded-full bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] bg-parchment-100 border-4 border-amber-900/50 flex items-center justify-center shadow-inner translate-z-20">

                  {/* Roman Numerals */}
                  <div className="absolute inset-0 p-8 md:p-12 pointer-events-none">
                    {[...Array(12)].map((_, i) => {
                      const angle = (i + 1) * 30;
                      const romans = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
                      return (
                        <div
                          key={i}
                          className="absolute inset-0 flex items-start justify-center"
                          style={{ transform: `rotate(${angle}deg)` }}
                        >
                          <span
                            className="font-display text-2xl md:text-5xl font-bold text-amber-950/80"
                            style={{ transform: `rotate(-${angle}deg)` }}
                          >
                            {romans[i]}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Decorative Center */}
                  <div className="w-12 h-12 md:w-24 md:h-24 rounded-full border-2 border-amber-900/20 bg-amber-900/5 flex items-center justify-center relative translate-z-30">
                     <div className="w-2 h-2 md:w-4 md:h-4 bg-amber-950 rounded-full z-50"></div>
                     <div className="absolute inset-0 rounded-full border-t-2 border-amber-900 animate-spin-slow opacity-20"></div>
                  </div>

                  {/* Hands */}
                  {/* Hour Hand */}
                  <motion.div
                    animate={{ rotate: 90 }} // Example: set to "III" position for doomsday vibe
                    className="absolute w-2 md:w-4 h-[25%] md:h-[30%] bg-amber-950 rounded-full origin-bottom bottom-1/2 left-1/2 -translate-x-1/2 translate-z-40"
                  ></motion.div>

                  {/* Minute Hand */}
                  <motion.div
                    animate={{ rotate: 0 }}
                    className="absolute w-1 md:w-2 h-[35%] md:h-[40%] bg-amber-900 rounded-full origin-bottom bottom-1/2 left-1/2 -translate-x-1/2 translate-z-50"
                  ></motion.div>

                  {/* Second Hand (The "Doomsday" Hand) */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                    className="absolute w-0.5 md:w-1 h-[40%] md:h-[45%] bg-rust-600 rounded-full origin-bottom bottom-1/2 left-1/2 -translate-x-1/2 translate-z-[60px]"
                  ></motion.div>
                </div>

                {/* Depth Layers for 3D effect */}
                <div className="absolute inset-0 rounded-full border-8 border-amber-900/30 -translate-z-10"></div>
                <div className="absolute inset-0 rounded-full border-8 border-amber-900/20 -translate-z-20"></div>
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-12 text-center"
            >
              <h1 className="text-4xl md:text-6xl font-display font-bold text-rust-500 tracking-[0.5em] mb-4 uppercase drop-shadow-2xl">
                末日审判之时
              </h1>
              <p className="text-parchment-100/60 font-serif italic text-xl tracking-widest">
                "时间是诸神最后的怜悯，也是最冷的枷锁。"
              </p>
              <button
                onClick={() => setShowFullClock(false)}
                className="mt-8 px-8 py-3 bg-amber-900/40 text-parchment-100 border border-amber-900/50 hover:bg-amber-900/60 transition-all font-display tracking-[0.3em] uppercase text-sm"
              >
                返回现实
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
