import type { OpeningConfig, OpeningOriginMode, OpeningStep } from '../types';

export const OPENING_STEPS: Array<{ key: OpeningStep; label: string; hint: string }> = [
  { key: 'faith', label: '未立的誓言', hint: '第一幕' },
  { key: 'profession', label: '你将如何出手', hint: '第二幕' },
  { key: 'location', label: '幕景降临', hint: '第三幕' },
  { key: 'assets', label: '演员携带之物', hint: '第四幕' },
];

export const PROFESSION_GROUPS: Record<string, string[]> = {
  普通: ['普通冒险者'],
  魔法师体系: ['魔法学徒', '正式法师', '大法师', '传奇法师'],
  战士体系: ['见习战士', '正式战士', '精英战士', '英雄战士'],
  神职者体系: ['受感者', '祭司', '大祭司', '神使'],
};

export const FAITH_OPTIONS = [
  '无',
  '索利昂(光明之神)',
  '诺克萨拉(黑暗之神)',
  '瓦尔坎(战争之神)',
  '莫尔甘(死亡之神)',
  '艾尔薇恩(自然之神)',
  '梅萨娜(魔法之神)',
  '图尔克(锻造之神)',
];

export const STARTING_LOCATIONS = [
  '中央翡翠平原',
  '北方凛冬山脉',
  '西方永夜森林',
  '东方赤砂荒漠',
  '南方枯萎之地',
  '浮空疆域',
];

export const OPENING_ORIGINS: Array<{
  id: OpeningOriginMode;
  numeral: string;
  eyebrow: string;
  title: string;
  detail: string;
  welcome: string;
}> = [
  {
    id: 'wanderer',
    numeral: 'I',
    eyebrow: 'THE COMMON PATH',
    title: '循常而来的旅人',
    detail: '用你的职业、行囊与判断，走进这片尚未认识你的大陆。',
    welcome: '世界尚未替你准备位置。走进去，让第一步替你留下名字。',
  },
  {
    id: 'arcane_disaster',
    numeral: 'II',
    eyebrow: 'THE CALAMITY AWAKENS',
    title: '奥法之灾 · 完全受控',
    detail: '你并非灾厄的宿主。你就是已由自身意志执掌的奥法之灾。',
    welcome: '——奥法之灾，万象之律——\n——诸法低伏，灾厄归一——\n——亘古不易，万象重铸——\n——礼赞 {{user}}！——',
  },
  {
    id: 'transmigrator',
    numeral: 'III',
    eyebrow: 'THE OUTSIDER ARRIVES',
    title: '携带金手指的穿越者',
    detail: '从世界之外坠入艾瑟兰，并带来一则只属于你的极致权能。',
    welcome: '异界来客，世界尚未学会你的名字。',
  },
];

export const DEFAULT_OPENING_CONFIG: OpeningConfig = {
  originMode: 'wanderer',
  goldenFinger: '',
  profession: '普通冒险者',
  faith: '无',
  location: '中央翡翠平原',
  subLocation: '',
  status: '健康',
  customItems: '',
  openingStory: '',
  currency: { gold: 10, silver: 0, copper: 0 },
};
