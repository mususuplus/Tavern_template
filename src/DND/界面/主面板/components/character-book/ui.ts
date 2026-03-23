import {
  CHARACTER_PRESETS,
  formatBookModifier,
  getAbilityKeys,
  getHookStatusOptions,
  getQuestStatusOptions,
  type CharacterBookForm,
  type CharacterPreset,
} from '../../../shared/characterBook';

export const CHARACTER_BOOK_STEPS = [
  { key: 'cover', index: '封面', label: '预设与开篇', description: '先决定这本角色卡的风格，或从空白书页起笔。' },
  { key: 'identity', index: 'I', label: '角色概览', description: '填写名字、职业、种族与背景，锁定人物第一印象。' },
  { key: 'ability', index: 'II', label: '能力值', description: '六维会决定角色在故事和战斗中的核心气质。' },
  { key: 'combat', index: 'III', label: '战斗基础', description: '建立 HP、AC 与速度，让战斗读感更具体。' },
  { key: 'resource', index: 'IV', label: '资源与叙事', description: '把法术位、资源、当前场景和情绪落到纸面。' },
  { key: 'story', index: 'V', label: '队伍与种子', description: '预先写下队友、任务、线索和剧情钩子。' },
  { key: 'review', index: 'VI', label: '总览确认', description: '检查整本角色书，保存后即可作为后续冒险的起点。' },
] as const;

export const RACE_OPTIONS = [
  { value: '人类', note: '均衡、好上手、什么方向都能演' },
  { value: '矮人', note: '结实顽强，适合前排与老练冒险者' },
  { value: '丘陵矮人', note: '更耐久，更像能扛能走的老兵' },
  { value: '山地矮人', note: '偏武装与近战，适合重甲路线' },
  { value: '精灵', note: '灵巧敏锐，适合优雅或古老气质的角色' },
  { value: '高等精灵', note: '偏知识和法术，学者感更强' },
  { value: '木精灵', note: '偏荒野与侦察，机动感更明显' },
  { value: '卓尔', note: '更神秘、危险，适合戏剧性背景' },
  { value: '半身人', note: '体型小但灵活，适合机敏和冒险感' },
  { value: '轻足半身人', note: '更擅长社交与灵巧行动' },
  { value: '强心半身人', note: '更耐打，也更像顽强幸存者' },
  { value: '龙裔', note: '带有龙族血统，形象鲜明且很有压迫感' },
  { value: '侏儒', note: '聪明机灵，适合工匠或法术向角色' },
  { value: '森林侏儒', note: '更贴近自然，带点奇想和隐匿感' },
  { value: '岩地侏儒', note: '更像发明家或工匠学者' },
  { value: '半精灵', note: '社交和机动感强，适合灵活角色' },
  { value: '半兽人', note: '强壮直接，适合野性和力量型角色' },
  { value: '提夫林', note: '异乡感和戏剧性都很强，适合有故事的人物' },
] as const;

export const CLASS_OPTIONS = [
  { value: '野蛮人', note: '爆发力强，适合直接压上去的玩法' },
  { value: '吟游诗人', note: '社交、支援、表演与机智并存' },
  { value: '牧师', note: '治疗与信念并重，适合团队支援' },
  { value: '德鲁伊', note: '自然、变形、仪式感和神秘感都很足' },
  { value: '战士', note: '直接、稳定、适合喜欢正面战斗的人' },
  { value: '武僧', note: '轻装、高机动，适合干净利落的战斗风格' },
  { value: '圣武士', note: '誓言与神圣力量并重，英雄感很强' },
  { value: '游侠', note: '荒野、生存、远程与追踪感更强' },
  { value: '游荡者', note: '潜行、机动、喜欢巧妙解决问题' },
  { value: '术士', note: '天赋法力路线，适合力量来自血脉或异变' },
  { value: '邪术师', note: '依赖契约馈赠，适合偏危险或秘密的法术路线' },
  { value: '法师', note: '擅长法术和知识，适合喜欢准备与策略' },
] as const;

export const ALIGNMENT_OPTIONS = [
  { value: '守序善良', note: '讲原则，也愿意帮助别人' },
  { value: '中立善良', note: '更看重善意本身，不太拘泥规则' },
  { value: '混乱善良', note: '愿意做好事，但讨厌被条条框框束缚' },
  { value: '守序中立', note: '更看重秩序、责任和规则本身' },
  { value: '绝对中立', note: '更关注平衡、自保或个人判断' },
  { value: '混乱中立', note: '自由优先，行为更看当下想法' },
  { value: '守序邪恶', note: '会守规则，但规则只为自己服务' },
  { value: '中立邪恶', note: '更现实，也更愿意为利益做脏事' },
  { value: '混乱邪恶', note: '冲动、破坏性强，适合危险角色' },
] as const;

export const BACKGROUND_OPTIONS = [
  { title: '流浪卫兵', text: '曾在边境或城镇担任守卫，见过混乱和灾难，也因此知道自己为何不能对危险视而不见。' },
  { title: '失学学徒', text: '原本跟随某位导师学习技艺或法术，但一场意外让这段关系中断，如今带着未完成的问题继续前行。' },
  { title: '旧日信使', text: '曾替人送信、跑腿或传递机密，因此认识很多地方，也知道许多不该知道的小事。' },
  { title: '离乡旅人', text: '因为家乡无法再容纳现在的自己，只能带着一段记忆和一个目标踏上旅途。' },
] as const;

export const ABILITY_KEYS = getAbilityKeys();
export const QUEST_STATUS_OPTIONS = getQuestStatusOptions();
export const HOOK_STATUS_OPTIONS = getHookStatusOptions();
export const CHARACTER_BOOK_PRESETS = CHARACTER_PRESETS;

export type CharacterBookPreviewDraftKey = 'roleplayHook' | 'background' | 'sceneSummary' | 'resourceNotes';
export const CHARACTER_BOOK_PREVIEW_DRAFT_KEYS: CharacterBookPreviewDraftKey[] = [
  'roleplayHook',
  'background',
  'sceneSummary',
  'resourceNotes',
];

export type CharacterBookPreviewDrafts = Record<CharacterBookPreviewDraftKey, string>;

export type CharacterBookPreviewBlock = {
  label: string;
  value: string;
  multiline?: boolean;
};

export type CharacterBookPreviewModel = {
  title: string;
  description: string;
  hero?: {
    eyebrow: string;
    name: string;
    body: string;
  };
  metrics: CharacterBookPreviewBlock[];
  abilities: Array<{
    key: string;
    value: number;
    modifier: string;
  }>;
  notes: CharacterBookPreviewBlock[];
};

export type CharacterBookListItemProps<T extends { id: string }> = {
  item: T;
};

export type CharacterBookStepProps = {
  form: CharacterBookForm;
};

function resolveDraftValue(formValue: string, draftValue: string) {
  return draftValue || formValue;
}

function getCombatTone(form: CharacterBookForm) {
  const ratio = form.角色.生命上限 <= 0 ? 0 : form.角色.生命值 / form.角色.生命上限;
  if (ratio >= 0.8) return '状态稳健';
  if (ratio >= 0.45) return '适合谨慎推进';
  return '需要更多保护';
}

export function buildCharacterBookPreviewModel(
  currentPage: number,
  form: CharacterBookForm,
  drafts: CharacterBookPreviewDrafts,
): CharacterBookPreviewModel {
  const roleplayHook = resolveDraftValue(form.roleplayHook, drafts.roleplayHook);
  const background = resolveDraftValue(form.角色.背景, drafts.background);
  const sceneSummary = resolveDraftValue(form.剧情.场景摘要, drafts.sceneSummary);
  const resourceNotes = resolveDraftValue(form.资源.资源备注, drafts.resourceNotes);
  const firstQuest = form.任务[0];
  const firstHook = form.剧情钩子[0];
  const firstClue = form.线索[0];
  const heroName = form.角色.姓名 || '未命名冒险者';
  const heroEyebrow = `${form.角色.种族} ${form.角色.职业}`.trim();

  if (currentPage === 2) {
    return {
      title: '能力值读感',
      description: '只保留本页最关键的能力分布，减少不必要的右页重渲染。',
      metrics: [],
      abilities: ABILITY_KEYS.map(key => ({
        key,
        value: form.角色.能力值[key],
        modifier: formatBookModifier(form.角色.能力值[key]),
      })),
      notes: [
        { label: '最高能力', value: [...ABILITY_KEYS].sort((a, b) => form.角色.能力值[b] - form.角色.能力值[a])[0] ?? '力量' },
      ],
    };
  }

  if (currentPage === 3) {
    return {
      title: '战斗基础预览',
      description: '战斗页只展示生命、护甲与推进节奏判断。',
      hero: {
        eyebrow: heroEyebrow,
        name: heroName,
        body: roleplayHook || background,
      },
      metrics: [
        { label: '当前 HP', value: `${form.角色.生命值}` },
        { label: '最大 HP', value: `${form.角色.生命上限}` },
        { label: '护甲等级', value: `${form.角色.护甲等级}` },
        { label: '速度', value: `${form.角色.速度}` },
      ],
      abilities: [],
      notes: [{ label: '战斗体感', value: getCombatTone(form) }],
    };
  }

  if (currentPage === 4) {
    return {
      title: '资源与场景预览',
      description: '聚焦当前场景、资源状态和文本备注，不再常驻整套角色总览。',
      hero: {
        eyebrow: 'Scene & Resource',
        name: form.剧情.当前场景 || '未填写场景',
        body: sceneSummary || '这一页会决定角色进入冒险时的叙事温度。',
      },
      metrics: [
        { label: '金币', value: `${form.资源.金币}` },
        { label: '法术位', value: form.资源.法术位摘要 || '未填写' },
      ],
      abilities: [],
      notes: [
        { label: '场景摘要', value: sceneSummary || '尚未填写。', multiline: true },
        { label: '资源备注', value: resourceNotes || '尚未填写。', multiline: true },
      ],
    };
  }

  if (currentPage === 5) {
    return {
      title: '队伍与剧情种子',
      description: '这里仅展示列表统计和首个剧情抓手，避免队伍编辑时右页整块同步抖动。',
      hero: {
        eyebrow: 'Story Seed',
        name: firstQuest?.名称 || firstHook?.标题 || '下一段冒险尚未命名',
        body: firstQuest?.目标 || firstHook?.摘要 || firstClue?.内容 || '先写一个队伍目标，故事就有了起点。',
      },
      metrics: [
        { label: '队伍成员', value: `${form.队伍.length}` },
        { label: '任务', value: `${form.任务.length}` },
        { label: '线索', value: `${form.线索.length}` },
        { label: '钩子', value: `${form.剧情钩子.length}` },
      ],
      abilities: [],
      notes: [
        { label: '首位队友', value: form.队伍[0]?.名称 || '尚未填写' },
        { label: '首条线索', value: firstClue?.名称 || '尚未填写' },
      ],
    };
  }

  return {
    title: currentPage === 0 ? '开篇预览' : '角色书页预览',
    description: currentPage === 1 ? '只保留身份页的关键信息与长文本摘要。' : '右页会跟随当前步骤展示最必要的角色信息。',
    hero: {
      eyebrow: heroEyebrow,
      name: heroName,
      body: roleplayHook || background || '写下角色此刻最在意的一件事。',
    },
    metrics: [
      { label: '等级', value: `${form.角色.等级}` },
      { label: '熟练', value: `+${form.角色.熟练加值}` },
      { label: 'HP', value: `${form.角色.生命值}/${form.角色.生命上限}` },
      { label: 'AC', value: `${form.角色.护甲等级}` },
    ],
    abilities: currentPage === 0 ? [] : ABILITY_KEYS.slice(0, 3).map(key => ({
      key,
      value: form.角色.能力值[key],
      modifier: formatBookModifier(form.角色.能力值[key]),
    })),
    notes: [
      { label: '动机钩子', value: roleplayHook || '尚未填写。', multiline: true },
      { label: '背景摘要', value: background || '尚未填写。', multiline: true },
    ],
  };
}

export type CharacterBookOption = (typeof RACE_OPTIONS)[number];
export type CharacterBookPreset = CharacterPreset;
