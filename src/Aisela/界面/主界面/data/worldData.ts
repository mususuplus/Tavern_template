import type { HostPhase, RegionMeta, ReputationLevel, StorySummaryMeta, StoryTickerItem } from '../types';
import harpSvg from '../../../竖琴.svg?raw';

const ASSET_BASE_URL = 'https://raw.githubusercontent.com/mususuplus/my-assets/main/';
const MUSIC_BASE_URL = `${ASSET_BASE_URL}music/`;

export const harpIcon = `data:image/svg+xml;utf8,${encodeURIComponent(harpSvg)}`;

export const PLAYLIST = [
  { name: '精灵的低语', url: `${MUSIC_BASE_URL}精灵的低语.mp3` },
  { name: '永夜森林耳语', url: `${MUSIC_BASE_URL}永夜森林的耳语.mp3` },
  { name: '30s战斗', url: `${MUSIC_BASE_URL}30s战斗.mp3` },
  { name: '艾瑟兰之夜', url: `${MUSIC_BASE_URL}艾瑟兰之夜.mp3` },
  { name: '远方行歌', url: `${MUSIC_BASE_URL}远方行歌.mp3` },
];

export const emblems = {
  light: `${ASSET_BASE_URL}光明之神圣徽.webp`,
  dark: `${ASSET_BASE_URL}黑暗之神圣徽.webp`,
  war: `${ASSET_BASE_URL}战争之神圣徽.webp`,
  death: `${ASSET_BASE_URL}死亡之神圣徽.webp`,
  nature: `${ASSET_BASE_URL}自然之神圣徽.webp`,
  forging: `${ASSET_BASE_URL}锻造之神圣徽.webp`,
  magic: `${ASSET_BASE_URL}魔法之神圣徽.webp`,
  map: `${ASSET_BASE_URL}地图.webp`,
};

export const EQUIPMENT_ICON_URLS = {
  主手: `${ASSET_BASE_URL}equipment/主手.png`,
  副手: `${ASSET_BASE_URL}equipment/副手.png`,
  服饰: `${ASSET_BASE_URL}equipment/服饰.png`,
  饰品: `${ASSET_BASE_URL}equipment/饰品.png`,
};

export const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

export const WORLD_REGIONS: RegionMeta[] = [
  {
    name: '中央翡翠平原',
    short: '帝国腹地',
    title: '中央翡翠平原',
    summary: '神圣罗兰帝国的核心区域，贸易、军政与宗教秩序在这里交错运转。',
    atmosphere: '大河、平原与石筑城邦共同维持着繁荣表象，任何风吹草动都会迅速传遍大陆。',
    hazard: '魔潮的前线压力会先从这里显现，帝国内部的派系摩擦也常在此爆发。',
    dominantFactions: ['神圣罗兰帝国', '观测者组织', '远方行歌'],
    linkedProphecy: '魔王',
    linkedGod: '索利昂',
    dominantCrisis: '帝国腹地的秩序表面稳定，实则被魔潮军情与内部派系角力同时拉扯。',
    recommendedFocus: '优先关注帝国军政、观测者调令与商路封锁，它们最先暴露大战前兆。',
    signatureAnomaly: '白昼仍明亮，但市集消息传播异常迅速，风声往往先于军报抵达。',
    factionTension: '帝国希望维持稳定表象，观测者更在意异常数据，远方行歌则盯着任务与利润。',
    marker: { left: '48%', top: '45%' },
    markerTone: 'bg-emerald-500/75 border-emerald-200/70 text-white',
  },
  {
    name: '凛冬山脉',
    short: '锻炉山脉',
    title: '北方凛冬山脉',
    summary: '矮人与古老矿脉共存的高寒山脉，锻炉与封印在此并立。',
    atmosphere: '风雪、矿井与地火形成强烈反差，任何金属回响都像是来自山体深处的回答。',
    hazard: '地脉震动与封印松动会让沉睡之物先于大地苏醒。',
    dominantFactions: ['矮人地下城', '观测者组织'],
    linkedProphecy: '钢铁神子',
    linkedGod: '图尔克',
    dominantCrisis: '矿脉震动与古代封印共振，让沉睡兵器的传闻重新升温。',
    recommendedFocus: '优先调查封印工坊、矿井事故和矮人工匠的异常征召记录。',
    signatureAnomaly: '山体深处会回荡不属于锻炉的金属回音，像某种仍在运算的机械祷文。',
    factionTension: '矮人希望封锁消息，观测者组织则试图把一切迹象纳入可验证档案。',
    marker: { left: '55%', top: '18%' },
    markerTone: 'bg-slate-500/80 border-slate-200/70 text-white',
  },
  {
    name: '永夜森林',
    short: '森议核心',
    title: '西方永夜森林',
    summary: '世界树的根系在此延展，自然神系与精灵议会共同守望这片古林。',
    atmosphere: '潮湿月光、荧色苔藓与树冠低语让这里更像活着的圣殿。',
    hazard: '无名荒芜正从林缘蚕食现实，失衡的生长也会反噬闯入者。',
    dominantFactions: ['永夜森林议会', '观测者组织'],
    linkedProphecy: '无名荒芜',
    linkedGod: '艾尔薇恩',
    dominantCrisis: '自然循环正在被缓慢掏空，荒芜并非摧毁，而是让存在悄悄失去凭证。',
    recommendedFocus: '优先留意林缘失踪、树根病变、精灵议会禁令与观测记录中的空白页。',
    signatureAnomaly: '苔藓的荧光会突然断片，熟悉的路径也可能在回头后失去记忆。',
    factionTension: '森林议会强调守护边界，观测者组织却执意深入测量荒芜扩散速度。',
    marker: { left: '20%', top: '38%' },
    markerTone: 'bg-lime-500/80 border-lime-100/70 text-white',
  },
  {
    name: '赤砂荒漠',
    short: '赤砂边域',
    title: '东方赤砂荒漠',
    summary: '旧时代遗迹被风沙埋藏，商队与秘教在残破石城之间穿行。',
    atmosphere: '炽热、空旷而寂静，白昼与夜晚像两种截然不同的世界。',
    hazard: '失落圣画与禁忌仪式的传闻频繁出现，认知污染比刀锋更危险。',
    dominantFactions: ['远方行歌', '星语协会'],
    linkedProphecy: '寂静圣画',
    linkedGod: '梅萨娜',
    dominantCrisis: '遗迹探险、秘教仪式与知识垄断在风沙下彼此喂养，真相越来越像陷阱。',
    recommendedFocus: '优先追踪失落画廊、学术调查团的失联报告与商队口中的禁忌传闻。',
    signatureAnomaly: '风沙会把远景磨成平面，某些废墟像被人提前“定格”在一幅画里。',
    factionTension: '远方行歌要的是可交易的遗迹线索，星语协会更在意认知污染是否已经扩散。',
    marker: { left: '78%', top: '47%' },
    markerTone: 'bg-amber-500/85 border-amber-100/70 text-white',
  },
  {
    name: '枯萎之地',
    short: '荒芜前沿',
    title: '南方枯萎之地',
    summary: '存在被缓慢抹去的区域，地形与记忆都可能在一次回头后消失。',
    atmosphere: '空气像被抽空了厚度，远处的轮廓模糊而不稳定。',
    hazard: '这里靠近多项灭世要素的重叠带，观测本身都可能改变现实。',
    dominantFactions: ['灭世教派', '观测者组织'],
    linkedProphecy: '盲目之光',
    linkedGod: '诺克萨拉',
    dominantCrisis: '存在崩坏与群体意识污染交叠，连观测本身都可能成为危机的放大器。',
    recommendedFocus: '优先查看隔离室记录、失语者名单与教派出现前后的集体异常行为。',
    signatureAnomaly: '空气像被抽空厚度，回忆会在叙述过程中自行磨平细节与差异。',
    factionTension: '观测者组织强调封锁与记录，灭世教派则把失序视作接近真理的礼拜。',
    marker: { left: '46%', top: '78%' },
    markerTone: 'bg-rose-500/80 border-rose-100/70 text-white',
  },
  {
    name: '浮空群岛',
    short: '天际港',
    title: '星语浮空群岛',
    summary: '魔网、浮空塔与航路在高空汇聚，世界的知识与消息都在此交换。',
    atmosphere: '高空风切、魔网共振与远距观测设备，让这里更像世界的大脑而非地理区域。',
    hazard: '一旦魔网波动失控，高空坠落与法则紊乱会在顷刻间席卷群岛。',
    dominantFactions: ['星语协会', '远方行歌'],
    linkedProphecy: '奥法之灾',
    linkedGod: '梅萨娜',
    dominantCrisis: '魔网波动、浮空航道与学术禁忌共振，让奥法之灾的宿主线索格外刺眼。',
    recommendedFocus: '优先关注魔网异常、星语协会内部封卷以及高阶法师突然中止的研究项目。',
    signatureAnomaly: '高空会传来不合时宜的共鸣低鸣，仿佛整个群岛都在替某个奇点呼吸。',
    factionTension: '星语协会想定义并收容真相，远方行歌更在意真相会把世界推向哪一边。',
    marker: { left: '63%', top: '28%' },
    markerTone: 'bg-cyan-500/80 border-cyan-100/70 text-white',
  },
];

export const PROPHECIES = [
  { name: '魔王', status: '高危', desc: '暗影同化正在压缩人类与兽人的生存边界。' },
  { name: '无名荒芜', status: '侵蚀中', desc: '法则失效之地向文明边界持续推进。' },
  { name: '噬根之蛇', status: '沉睡', desc: '根源地脉中的古老存在以时间为食。' },
  { name: '奥法之灾', status: '失控边缘', desc: '魔力奇点的去向尚未明确，但征兆越来越近。' },
  { name: '寂静圣画', status: '失落', desc: '某幅能够收录现实的圣画仍在历史褶皱中游荡。' },
  { name: '盲目之光', status: '潜伏', desc: '认知与群体意志可能在无声中被抹平。' },
  { name: '钢铁神子', status: '封印待证', desc: '一具不该苏醒的战争机器正在封印下等待名字。' },
];

export const THEOLOGY_PAIRS = [
  { element: '魔王', god: '瓦尔坎', desc: '战争的秩序一旦失衡，就会被纯粹征服欲吞没。' },
  { element: '无名荒芜', god: '艾尔薇恩', desc: '自然循环的反面不是死亡，而是彻底的空白。' },
  { element: '噬根之蛇', god: '莫尔甘', desc: '真正的终结不在死亡本身，而在因果被一并吞噬。' },
  { element: '奥法之灾', god: '梅萨娜', desc: '知识越接近真理，就越可能成为毁灭真理的火种。' },
  { element: '寂静圣画', god: '索利昂', desc: '光会记录世界，但过度的定义也会夺走活性。' },
  { element: '盲目之光', god: '诺克萨拉', desc: '看见一切的执念，终会把个体差异烧成同一种白。' },
  { element: '钢铁神子', god: '图尔克', desc: '锻造既能守护文明，也能制造无法回收的神兵。' },
];

export const GODS = {
  light: { name: '索利昂', role: '光明之神', symbol: '誓约、真理与秩序', icon: emblems.light },
  dark: { name: '诺克萨拉', role: '黑暗之神', symbol: '遮蔽、秘密与边界', icon: emblems.dark },
  war: { name: '瓦尔坎', role: '战争之神', symbol: '征伐、勇武与牺牲', icon: emblems.war },
  death: { name: '莫尔甘', role: '死亡之神', symbol: '葬仪、终结与安息', icon: emblems.death },
  nature: { name: '艾尔薇恩', role: '自然之神', symbol: '循环、生长与季节', icon: emblems.nature },
  magic: { name: '梅萨娜', role: '魔法之神', symbol: '知识、法则与理解', icon: emblems.magic },
  forging: { name: '图尔克', role: '锻造之神', symbol: '工艺、炉火与结构', icon: emblems.forging },
};

export const PANTHEON_KEYS = Object.keys(GODS) as Array<keyof typeof GODS>;

export const GOD_TAB_LABELS: Record<keyof typeof GODS, string> = {
  light: '索利昂 / 光明',
  dark: '诺克萨拉 / 黑暗',
  war: '瓦尔坎 / 战争',
  death: '莫尔甘 / 死亡',
  nature: '艾尔薇恩 / 自然',
  magic: '梅萨娜 / 魔法',
  forging: '图尔克 / 锻造',
};

export const FAITH_TO_GOD_KEY: Record<string, keyof typeof GODS | undefined> = {
  索利昂: 'light',
  诺克萨拉: 'dark',
  瓦尔坎: 'war',
  莫尔甘: 'death',
  艾尔薇恩: 'nature',
  梅萨娜: 'magic',
  图尔克: 'forging',
};

export const GOD_LORE: Partial<Record<keyof typeof GODS, string>> = {
  light:
    '索利昂相信秩序不是约束，而是让文明得以长期存在的骨架。\n\n祂的信徒多活跃于帝国司法、神殿记录与边境裁决之中。',
  dark:
    '诺克萨拉守护一切不该被轻易看见的事物。\n\n祂提醒凡人：并非所有真相都适合在光下被摊开。',
  war:
    '瓦尔坎从不赞美无意义的流血。\n\n祂真正看重的，是人在冲突中做出的选择与承担的代价。',
  death:
    '莫尔甘是终点的守门人。\n\n祂维护死亡的秩序，也维护哀悼与安息的权利。',
  nature:
    '艾尔薇恩不偏爱繁花盛景，也不厌弃寒冬凋零。\n\n祂守护的是循环，而不是单向的生长。',
  magic:
    '梅萨娜栖居于“理解发生的瞬间”。\n\n每一次法则被看见、命名与传承，都是祂力量的延伸。',
  forging:
    '图尔克使矿石拥有形体，也让结构成为文明的第二层骨骼。\n\n真正的锻造从不是蛮力，而是对材料与目的的共同理解。',
};

export function getDoomPressureData(value: number) {
  if (value >= 10) return { label: '临界前夜', short: '极高', desc: '多个灭世征兆同时升温，世界已进入高压阶段。' };
  if (value >= 7) return { label: '危险攀升', short: '高烈度', desc: '局势正在快速恶化，许多势力已被迫改变原本节奏。' };
  if (value >= 4) return { label: '不稳定', short: '中烈度', desc: '裂缝已能被多数观察者感知，局部失控事件开始增加。' };
  return { label: '可控波动', short: '低烈度', desc: '世界仍在缓慢滑向危险，只是多数人还看不见裂缝。' };
}

export function getLocationThemePreset(location: string, doom: number, awakening: number, faith: string) {
  const regionTheme = (
    accent: string,
    accentSoft: string,
    accentStrong: string,
    glow: string,
    overlay: string,
    alert: string,
    arcane: string,
    background: string,
    backgroundGlow: string,
    backgroundTexture: string,
  ) => ({
    accent,
    accentSoft,
    accentStrong,
    glow,
    overlay,
    alert,
    arcane,
    background,
    backgroundGlow,
    backgroundTexture,
  });

  if (location.includes('永夜森林') || location.includes('森林')) {
    return regionTheme(
      '#3d6b53',
      'rgba(99, 155, 122, 0.15)',
      'rgba(99, 155, 122, 0.38)',
      'rgba(127, 209, 157, 0.25)',
      'linear-gradient(135deg, rgba(10, 23, 18, 0.75), rgba(32, 59, 45, 0.18))',
      '#89b97b',
      '#9de7c2',
      'radial-gradient(circle at 18% 16%, rgba(115, 189, 142, 0.2), transparent 24%), radial-gradient(circle at 82% 14%, rgba(199, 255, 220, 0.12), transparent 22%), linear-gradient(180deg, #08130f 0%, #0d2019 42%, #06100d 100%)',
      'radial-gradient(circle at 50% 0%, rgba(156, 236, 181, 0.12), transparent 38%), radial-gradient(circle at 12% 88%, rgba(96, 173, 124, 0.14), transparent 24%)',
      'linear-gradient(180deg, rgba(5, 18, 12, 0.14), rgba(5, 18, 12, 0.42))',
    );
  }

  if (location.includes('浮空群岛') || location.includes('群岛') || location.includes('星语')) {
    return regionTheme(
      '#4f63b9',
      'rgba(112, 136, 255, 0.16)',
      'rgba(112, 136, 255, 0.35)',
      'rgba(132, 201, 255, 0.2)',
      'linear-gradient(135deg, rgba(17, 24, 56, 0.7), rgba(69, 110, 204, 0.16))',
      '#9ad9ff',
      '#9f9cff',
      'radial-gradient(circle at 24% 12%, rgba(150, 210, 255, 0.18), transparent 26%), radial-gradient(circle at 76% 18%, rgba(197, 214, 255, 0.14), transparent 24%), linear-gradient(180deg, #10182f 0%, #17284c 44%, #0b1122 100%)',
      'radial-gradient(circle at 50% 0%, rgba(156, 215, 255, 0.16), transparent 38%), radial-gradient(circle at 82% 76%, rgba(122, 120, 255, 0.12), transparent 22%)',
      'linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0) 24%, rgba(10, 16, 30, 0.35) 100%)',
    );
  }

  if (location.includes('凛冬山脉') || location.includes('山脉') || location.includes('山')) {
    return regionTheme(
      '#607089',
      'rgba(119, 136, 160, 0.15)',
      'rgba(136, 154, 181, 0.35)',
      'rgba(198, 216, 246, 0.16)',
      'linear-gradient(135deg, rgba(24, 30, 42, 0.74), rgba(91, 110, 138, 0.18))',
      '#c6d7ec',
      '#9ab4d8',
      'radial-gradient(circle at 18% 16%, rgba(214, 231, 255, 0.1), transparent 22%), radial-gradient(circle at 80% 14%, rgba(157, 175, 202, 0.16), transparent 24%), linear-gradient(180deg, #141922 0%, #252d3c 48%, #171c26 100%)',
      'radial-gradient(circle at 50% 0%, rgba(214, 231, 255, 0.12), transparent 34%), radial-gradient(circle at 18% 80%, rgba(94, 116, 148, 0.14), transparent 24%)',
      'linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0) 28%, rgba(10, 14, 20, 0.4) 100%)',
    );
  }

  if (location.includes('赤砂荒漠') || location.includes('荒漠') || location.includes('砂')) {
    return regionTheme(
      '#b56f38',
      'rgba(214, 145, 80, 0.16)',
      'rgba(214, 145, 80, 0.34)',
      'rgba(255, 196, 129, 0.18)',
      'linear-gradient(135deg, rgba(67, 34, 14, 0.68), rgba(184, 119, 62, 0.14))',
      '#f3bf76',
      '#d88d5c',
      'radial-gradient(circle at 20% 14%, rgba(255, 220, 156, 0.18), transparent 24%), radial-gradient(circle at 84% 16%, rgba(214, 145, 80, 0.16), transparent 26%), linear-gradient(180deg, #3a2011 0%, #6c4123 46%, #28160d 100%)',
      'radial-gradient(circle at 52% 0%, rgba(255, 218, 163, 0.14), transparent 34%), radial-gradient(circle at 14% 78%, rgba(211, 122, 70, 0.14), transparent 20%)',
      'linear-gradient(180deg, rgba(255, 245, 220, 0.04), rgba(255, 245, 220, 0) 20%, rgba(59, 29, 13, 0.42) 100%)',
    );
  }

  if (location.includes('枯萎之地') || location.includes('枯萎') || location.includes('荒芜')) {
    return regionTheme(
      '#7c4f64',
      'rgba(149, 92, 120, 0.16)',
      'rgba(149, 92, 120, 0.34)',
      'rgba(223, 162, 196, 0.14)',
      'linear-gradient(135deg, rgba(36, 19, 30, 0.76), rgba(109, 62, 88, 0.16))',
      '#d7a0bd',
      '#a26f94',
      'radial-gradient(circle at 22% 12%, rgba(201, 145, 174, 0.12), transparent 22%), radial-gradient(circle at 80% 20%, rgba(120, 73, 98, 0.16), transparent 26%), linear-gradient(180deg, #1d1219 0%, #341e2c 44%, #140d12 100%)',
      'radial-gradient(circle at 48% 0%, rgba(200, 144, 174, 0.12), transparent 34%), radial-gradient(circle at 12% 78%, rgba(91, 57, 74, 0.18), transparent 22%)',
      'linear-gradient(180deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0) 16%, rgba(12, 7, 10, 0.48) 100%)',
    );
  }

  if (location.includes('中央') || location.includes('平原') || location.includes('帝国')) {
    return regionTheme(
      '#8a5a3a',
      'rgba(138, 90, 58, 0.13)',
      'rgba(138, 90, 58, 0.3)',
      'rgba(218, 181, 112, 0.18)',
      'linear-gradient(135deg, rgba(120, 88, 56, 0.16), rgba(255, 255, 255, 0.02))',
      '#cfa869',
      '#8d78cc',
      'radial-gradient(circle at 18% 14%, rgba(247, 220, 171, 0.16), transparent 22%), radial-gradient(circle at 84% 18%, rgba(186, 138, 92, 0.12), transparent 24%), linear-gradient(180deg, #33261d 0%, #5c4536 44%, #241913 100%)',
      'radial-gradient(circle at 50% 0%, rgba(231, 205, 145, 0.12), transparent 34%), radial-gradient(circle at 16% 80%, rgba(157, 111, 71, 0.14), transparent 22%)',
      'linear-gradient(180deg, rgba(255, 248, 232, 0.03), rgba(255, 248, 232, 0) 22%, rgba(28, 20, 16, 0.38) 100%)',
    );
  }

  if (awakening >= 60 || faith === '梅萨娜') {
    return regionTheme(
      '#4660c9',
      'rgba(88, 116, 255, 0.15)',
      'rgba(88, 116, 255, 0.35)',
      'rgba(84, 130, 255, 0.22)',
      'linear-gradient(135deg, rgba(12, 18, 40, 0.72), rgba(29, 54, 118, 0.18))',
      '#7bc2ff',
      '#8d92ff',
      'radial-gradient(circle at 18% 16%, rgba(132, 160, 255, 0.16), transparent 24%), radial-gradient(circle at 82% 12%, rgba(109, 219, 255, 0.14), transparent 22%), linear-gradient(180deg, #11182c 0%, #1d2f58 44%, #0d1426 100%)',
      'radial-gradient(circle at 50% 0%, rgba(129, 191, 255, 0.14), transparent 36%), radial-gradient(circle at 18% 80%, rgba(96, 112, 255, 0.12), transparent 20%)',
      'linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0) 22%, rgba(9, 14, 26, 0.4) 100%)',
    );
  }

  if (doom >= 8) {
    return regionTheme(
      '#a24f42',
      'rgba(162, 79, 66, 0.15)',
      'rgba(162, 79, 66, 0.36)',
      'rgba(230, 113, 88, 0.18)',
      'linear-gradient(135deg, rgba(50, 16, 15, 0.68), rgba(94, 34, 30, 0.18))',
      '#f29b6d',
      '#d97a52',
      'radial-gradient(circle at 20% 14%, rgba(242, 155, 109, 0.18), transparent 24%), radial-gradient(circle at 82% 18%, rgba(191, 73, 58, 0.16), transparent 22%), linear-gradient(180deg, #2a1110 0%, #4e1e1b 44%, #170909 100%)',
      'radial-gradient(circle at 50% 0%, rgba(255, 173, 120, 0.14), transparent 34%), radial-gradient(circle at 16% 82%, rgba(191, 73, 58, 0.16), transparent 22%)',
      'linear-gradient(180deg, rgba(255, 236, 220, 0.03), rgba(255, 236, 220, 0) 18%, rgba(22, 9, 9, 0.45) 100%)',
    );
  }

  return regionTheme(
    '#8a4b38',
    'rgba(138, 75, 56, 0.12)',
    'rgba(138, 75, 56, 0.28)',
    'rgba(197, 160, 89, 0.2)',
    'linear-gradient(135deg, rgba(120, 88, 56, 0.12), rgba(255, 255, 255, 0))',
    '#c5a059',
    '#7d6ac8',
    'radial-gradient(circle at 18% 14%, rgba(235, 205, 156, 0.14), transparent 22%), radial-gradient(circle at 84% 18%, rgba(138, 75, 56, 0.12), transparent 24%), linear-gradient(180deg, #2f221a 0%, #4e392e 42%, #221914 100%)',
    'radial-gradient(circle at 50% 0%, rgba(219, 192, 133, 0.12), transparent 34%), radial-gradient(circle at 14% 80%, rgba(138, 75, 56, 0.12), transparent 22%)',
    'linear-gradient(180deg, rgba(255, 248, 232, 0.03), rgba(255, 248, 232, 0) 20%, rgba(22, 15, 11, 0.4) 100%)',
  );
}

export function getAwakeningData(value: number) {
  if (value >= 80) return { label: '逼近阈值', short: '失控', desc: '奥法回响已接近失控边界，角色会吸引危险与注视。' };
  if (value >= 55) return { label: '显著活化', short: '高频', desc: '魔力波动明显增强，已能影响环境与他人感知。' };
  if (value >= 25) return { label: '持续苏醒', short: '中频', desc: '力量正在逐渐抬升，偶发异象会跟随行动出现。' };
  return { label: '平稳', short: '低频', desc: '奥法之灾仍处在可控边缘，尚未显著扭曲现实。' };
}

export function getHostPhaseData(value: number): HostPhase {
  if (value >= 92) {
    return {
      code: 'S12',
      name: '找到自我',
      label: '共存终章',
      short: '自我锚定',
      description: '宿主不再被“灾难”定义，奥法之灾成为被主动命名与承担的力量。',
      omen: '魔力回响趋于稳定，异象不再尖叫，而像沉静的星潮贴着皮肤流动。',
      risk: '任何重大抉择都可能永久改写法则，代价从失控转为“无法回头”。',
      nextTrigger: '进入真正的最终抉择，决定奥法之灾将成为守护、牺牲还是新法则。',
      cost: '必须接受“我就是容器也是选择者”这一事实，再无回避空间。',
      intensityClass: 'host-phase-apex',
      accentColor: '#7bc2ff',
    };
  }
  if (value >= 80) {
    return {
      code: 'S10',
      name: '寻道驾驭',
      label: '刀刃共振',
      short: '高危驾驭',
      description: '宿主开始尝试与奇点共存，每一次调用都像在世界骨架上刻下新伤口。',
      omen: '周围魔网会随情绪短暂失谐，金属、晶石与祷文都会出现延迟回应。',
      risk: '高强度使用会引发局部法则崩裂，并让敌对势力更快锁定宿主。',
      nextTrigger: '若继续主动修行，将逼近最终决战与真正的自我定义。',
      cost: '每次成功驾驭都在削减退路，身体与精神会被更深层卷入。',
      intensityClass: 'host-phase-threshold',
      accentColor: '#8d92ff',
    };
  }
  if (value >= 62) {
    return {
      code: 'S9',
      name: '自我抉择',
      label: '意志返火',
      short: '主动触碰',
      description: '宿主第一次不再只想着压制，而是试图决定力量该如何被使用。',
      omen: '法术痕迹开始带有个人意志的纹理，异象会回应选择而非单纯情绪。',
      risk: '任何犹豫都可能让旧的恐惧卷土重来，形成更危险的反噬回路。',
      nextTrigger: '若在危机中继续主动调用，宿主将跨入真正的驾驭阶段。',
      cost: '必须放弃“我与它无关”的幻想，承认自己已站在预言内部。',
      intensityClass: 'host-phase-awakened',
      accentColor: '#6f8cff',
    };
  }
  if (value >= 42) {
    return {
      code: 'S8',
      name: '低谷深渊',
      label: '静默坠落',
      short: '压抑潜行',
      description: '在低潮与自我怀疑里，奥法之灾表面沉寂，实则把宿主推向更深的自省。',
      omen: '异象频率下降，但环境会呈现“过分安静”的反常，像风也在屏息。',
      risk: '沉寂阶段最容易被误判为安全，实则是剧烈跃迁前的回落带。',
      nextTrigger: '遭遇高压抉择或关键真相后，将进入主动选择与重新定义的阶段。',
      cost: '必须面对孤立、误解与自我身份碎裂留下的空洞。',
      intensityClass: 'host-phase-buried',
      accentColor: '#9f9cff',
    };
  }
  if (value >= 24) {
    return {
      code: 'S5',
      name: '身份暴露',
      label: '余烬外泄',
      short: '高压伪装',
      description: '真相逐渐逼近，宿主已经无法完全把异常归咎于偶然。',
      omen: '情绪波动会带来轻微吞噬、静电、法力抽离或周围人短暂的不适。',
      risk: '观测者、教派与同伴都会开始重新定义宿主，外部注视迅速增加。',
      nextTrigger: '一旦真相被确认或被迫直面，宿主会进入真正的身份危机。',
      cost: '继续压制意味着持续耗损精神与肉体，且反弹会越来越剧烈。',
      intensityClass: 'host-phase-exposed',
      accentColor: '#a26f94',
    };
  }
  return {
    code: 'S4',
    name: '被追踪调查',
    label: '前兆潜伏',
    short: '低频异动',
    description: '奥法之灾仍在边缘潜伏，异常更多表现为无法解释的细碎回响。',
    omen: '周围魔力浓度偶尔失衡，器物静电、祷文失准、法阵迟滞是最早的信号。',
    risk: '宿主本人可能尚未察觉，但观测者与敏感施法者已经能捕捉到微弱痕迹。',
    nextTrigger: '随着剧情推进与情绪压力积累，宿主会被更明确地卷入调查与怀疑。',
    cost: '每一次忽视异常，都会让失控的那一步更突然。',
    intensityClass: 'host-phase-dormant',
    accentColor: '#89b97b',
  };
}

export function getFocusedProphecyName(location: string, doom: number, awakening: number, faith: string) {
  if (awakening >= 70) return '奥法之灾';
  if (doom >= 9) return '魔王';
  if (location.includes('森林')) return '无名荒芜';
  if (location.includes('山')) return '钢铁神子';
  if (location.includes('荒')) return '寂静圣画';
  if (faith === '诺克萨拉') return '盲目之光';
  return '魔王';
}

export function getFocusedProphecyReason(location: string, doom: number, awakening: number, faith: string) {
  if (awakening >= 70) return '主角的奥法觉醒度已经成为最强烈的世界异动信号，档案馆优先聚焦奥法之灾。';
  if (doom >= 9) return '末日时钟逼近高位，战争与魔潮的总压迫感盖过了其他异象。';
  if (location.includes('森林')) return '当前位置靠近永夜森林边界，无名荒芜正在侵蚀自然循环。';
  if (location.includes('山')) return '北境矿脉与封印同时活跃，钢铁神子的警戒级别因此上升。';
  if (location.includes('荒')) return '荒漠与枯萎地常伴随失落遗迹，圣画与认知污染的关联度更高。';
  if (faith === '诺克萨拉') return '当前信仰会让角色更敏锐地感知遮蔽、边界与盲目之光的征兆。';
  return '综合地点、时钟与势力活动后，魔王相关卷宗仍是当前最具解释力的焦点。';
}

export function getTheologyEcho(location: string, prophecy: string, faith: string, awakening: number) {
  if (faith === '梅萨娜' && (location.includes('浮空') || awakening >= 55 || prophecy === '奥法之灾')) {
    return '梅萨娜的学派会把这种波动视为“规则之前的声音”。你看到的，不只是异象，而是法则被撕开的缝。';
  }
  if (faith === '诺克萨拉' && (location.includes('枯萎') || prophecy === '盲目之光')) {
    return '诺克萨拉的信徒会把这类征兆理解为“边界被擦除前的寂静”。越是相似，越该警惕失去自我。';
  }
  if (faith === '艾尔薇恩' && location.includes('森林')) {
    return '艾尔薇恩的神官会把这里的异常理解为循环被截断的病灶，任何过度采样都可能加剧失衡。';
  }
  if (faith === '图尔克' && location.includes('山')) {
    return '图尔克的工匠会优先关心结构是否仍能承重，因为真正的灾难往往从“还能运行”开始。';
  }
  if (faith !== '无') {
    return `${faith}的神学视角会让你优先关注与“${prophecy}”有关的秩序裂缝，而不是表层事件。`;
  }
  return '你尚未以某位神祇的语言理解这些征兆，因此档案馆将更依赖地点、势力和危机热度来组织线索。';
}

export function buildChronicleTickerItems(summary: StorySummaryMeta | null, context: {
  region: RegionMeta;
  prophecy: string;
  hostPhase: HostPhase;
  questNames: string[];
}): StoryTickerItem[] {
  const items: StoryTickerItem[] = [
    {
      category: '地点变化',
      text: `${context.region.short}：${summary?.location || context.region.title} 的主导异象为 ${context.region.signatureAnomaly}`,
    },
    {
      category: '势力动作',
      text: `${context.region.dominantFactions[0] || '地方势力'} 正围绕 ${context.region.linkedProphecy} 调整布局，${context.region.factionTension}`,
    },
    {
      category: '宿主异常',
      text: `${context.hostPhase.code} ${context.hostPhase.name}：${context.hostPhase.omen}`,
    },
  ];

  if (context.questNames.length > 0) {
    items.push({
      category: '当前任务',
      text: `优先追踪：${context.questNames[0]}${context.questNames[1] ? `；其次为 ${context.questNames[1]}` : ''}`,
    });
  } else if (summary?.event) {
    items.push({
      category: '当前任务',
      text: `本幕纪要：${summary.event}`,
    });
  } else {
    items.push({
      category: '当前任务',
      text: `当前情报建议沿 ${context.prophecy} 线继续推进，优先切入 ${context.region.recommendedFocus}`,
    });
  }

  return items;
}

export function getWorldThemePreset(location: string, doom: number, awakening: number, faith: string) {
  if (location.includes('森林')) {
    return {
      accent: '#3d6b53',
      accentSoft: 'rgba(99, 155, 122, 0.15)',
      accentStrong: 'rgba(99, 155, 122, 0.38)',
      glow: 'rgba(127, 209, 157, 0.25)',
      overlay: 'linear-gradient(135deg, rgba(10, 23, 18, 0.75), rgba(32, 59, 45, 0.18))',
      alert: '#89b97b',
      arcane: '#9de7c2',
    };
  }
  if (awakening >= 60 || faith === '梅萨娜') {
    return {
      accent: '#4660c9',
      accentSoft: 'rgba(88, 116, 255, 0.15)',
      accentStrong: 'rgba(88, 116, 255, 0.35)',
      glow: 'rgba(84, 130, 255, 0.22)',
      overlay: 'linear-gradient(135deg, rgba(12, 18, 40, 0.72), rgba(29, 54, 118, 0.18))',
      alert: '#7bc2ff',
      arcane: '#8d92ff',
    };
  }
  if (doom >= 8) {
    return {
      accent: '#a24f42',
      accentSoft: 'rgba(162, 79, 66, 0.15)',
      accentStrong: 'rgba(162, 79, 66, 0.36)',
      glow: 'rgba(230, 113, 88, 0.18)',
      overlay: 'linear-gradient(135deg, rgba(50, 16, 15, 0.68), rgba(94, 34, 30, 0.18))',
      alert: '#f29b6d',
      arcane: '#d97a52',
    };
  }
  return {
    accent: '#8a4b38',
    accentSoft: 'rgba(138, 75, 56, 0.12)',
    accentStrong: 'rgba(138, 75, 56, 0.28)',
    glow: 'rgba(197, 160, 89, 0.2)',
    overlay: 'linear-gradient(135deg, rgba(120, 88, 56, 0.12), rgba(255, 255, 255, 0))',
    alert: '#c5a059',
    arcane: '#7d6ac8',
  };
}

export function normalizeReputation(value?: string): ReputationLevel {
  switch (value) {
    case '崇拜':
    case '盟友':
    case '友善':
    case '中立':
    case '冷淡':
    case '敌对':
    case '通缉':
      return value;
    default:
      return '中立';
  }
}
