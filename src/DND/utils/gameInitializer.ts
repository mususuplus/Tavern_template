import { Schema, type SchemaType } from '../schema';

type AbilityKey = '力量' | '敏捷' | '体质' | '智力' | '感知' | '魅力';

type MvuData = {
  stat_data: Record<string, any>;
  display_data: Record<string, any>;
  delta_data: Record<string, any>;
};

export interface OpeningFormData {
  playerName?: string;
  name?: string;
  姓名?: string;
  race?: string;
  种族?: string;
  characterClass?: string;
  class?: string;
  职业?: string;
  level?: number;
  等级?: number;
  background?: string;
  背景?: string;
  alignment?: string;
  阵营?: string;
  proficiencyBonus?: number;
  熟练加值?: number;
  armorClass?: number;
  护甲等级?: number;
  speed?: number;
  速度?: number;
  hp?: number;
  currentHp?: number;
  生命值?: number;
  hpMax?: number;
  maxHp?: number;
  生命上限?: number;
  tempHp?: number;
  临时生命?: number;
  gold?: number;
  金币?: number;
  spellSlotsSummary?: string;
  法术位摘要?: string;
  resourceNote?: string;
  资源备注?: string;
  currentScene?: string;
  当前场景?: string;
  sceneSummary?: string;
  场景摘要?: string;
  openingStory?: string;
  openingNarrative?: string;
  开场故事?: string;
  openingSummary?: string;
  summary?: string;
  开场摘要?: string;
  guildName?: string;
  公会名称?: string;
  guildRole?: string;
  公会身份?: string;
  guildDescription?: string;
  公会描述?: string;
  notes?: string;
  备注?: string;
  abilityScores?: Partial<Record<AbilityKey, number>>;
  abilities?: Partial<Record<AbilityKey, number>>;
  能力值?: Partial<Record<AbilityKey, number>>;
  partyMembers?: unknown;
  小队成员?: unknown;
  quests?: unknown;
  任务?: unknown;
  clues?: unknown;
  线索?: unknown;
  hooks?: unknown;
  剧情钩子?: unknown;
  [key: string]: unknown;
}

declare const Mvu:
  | {
      getMvuData: (options: { type: 'message'; message_id: number | 'latest' }) => Partial<MvuData> | undefined;
    }
  | undefined;
declare const _: typeof import('lodash');
declare function getVariables(option: { type: 'message'; message_id: number | 'latest' }): Record<string, any>;
declare function getChatMessages(
  range: string | number,
  option?: { role?: 'all' | 'assistant' | 'system' | 'user' },
): Array<{ message: string; message_id: number; role: string; data?: Record<string, any> }>;
declare function updateVariablesWith(
  updater: (variables: Record<string, any>) => Record<string, any> | Promise<Record<string, any>>,
  option: { type: 'message'; message_id: number | 'latest' },
): Promise<Record<string, any>> | Record<string, any>;
declare function createChatMessages(
  messages: Array<{ role: 'assistant' | 'system' | 'user'; message: string; data?: Record<string, any> }>,
  options?: { refresh?: 'none' | 'affected' | 'all' },
): Promise<void>;

declare global {
  interface Window {
    __DND_OPENING_STORY_CREATED__?: boolean;
    __DND_CHECK_AND_UPDATE_CHRONICLE__?: () => Promise<void>;
    checkAndUpdateChronicle?: () => Promise<void>;
  }
}

const CHRONICLE_RETRY_DELAY = 500;
const CHRONICLE_MAX_RETRIES = 3;
const DEFAULT_MVU_DATA: MvuData = { stat_data: {}, display_data: {}, delta_data: {} };
const ABILITY_KEYS: AbilityKey[] = ['力量', '敏捷', '体质', '智力', '感知', '魅力'];

function wait(ms: number) {
  return new Promise(resolve => window.setTimeout(resolve, ms));
}

function pickFirst<T>(formData: OpeningFormData, keys: string[], fallback: T): T {
  for (const key of keys) {
    const value = formData[key];
    if (value !== undefined && value !== null && value !== '') {
      return value as T;
    }
  }
  return fallback;
}

function normalizeRecord(
  input: unknown,
  prefix: string,
  mapper: (value: any, key: string, index: number) => Record<string, any>,
) {
  if (!input) {
    return undefined;
  }

  if (Array.isArray(input)) {
    return input.reduce<Record<string, any>>((result, item, index) => {
      const key = String(item?.名称 ?? item?.name ?? `${prefix}-${index + 1}`);
      result[key] = mapper(item, key, index);
      return result;
    }, {});
  }

  if (_.isPlainObject(input)) {
    return Object.entries(input as Record<string, unknown>).reduce<Record<string, any>>((result, [key, value], index) => {
      result[key] = mapper(value, key, index);
      return result;
    }, {});
  }

  return undefined;
}

function buildPartyMembers(formData: OpeningFormData) {
  return normalizeRecord(
    pickFirst(formData, ['partyMembers', '小队成员'], undefined),
    '队员',
    (value, key) => ({
      职责: value?.职责 ?? value?.role ?? '支援',
      当前生命: Number(value?.当前生命 ?? value?.currentHp ?? value?.hp ?? 10),
      生命上限: Number(value?.生命上限 ?? value?.maxHp ?? 10),
      状态: value?.状态 ?? value?.status ?? '待命',
      先攻: Number(value?.先攻 ?? value?.initiative ?? 0),
      备注: value?.备注 ?? value?.note ?? `${key} 已加入队伍。`,
    }),
  );
}

function buildQuests(formData: OpeningFormData) {
  return normalizeRecord(
    pickFirst(formData, ['quests', '任务'], undefined),
    '任务',
    value => ({
      状态: value?.状态 ?? value?.status ?? '进行中',
      摘要: value?.摘要 ?? value?.summary ?? '',
      目标: value?.目标 ?? value?.goal ?? '',
    }),
  );
}

function buildClues(formData: OpeningFormData) {
  const clues = pickFirst<unknown>(formData, ['clues', '线索'], undefined);
  if (!clues) {
    return undefined;
  }

  if (Array.isArray(clues)) {
    return clues.reduce<Record<string, string>>((result, item, index) => {
      result[`线索${index + 1}`] = String(item);
      return result;
    }, {});
  }

  if (_.isPlainObject(clues)) {
    return Object.entries(clues as Record<string, unknown>).reduce<Record<string, string>>((result, [key, value]) => {
      result[key] = String(value ?? '');
      return result;
    }, {});
  }

  return undefined;
}

function buildHooks(formData: OpeningFormData) {
  return normalizeRecord(
    pickFirst(formData, ['hooks', '剧情钩子'], undefined),
    'hook',
    (value, key) => ({
      标题: value?.标题 ?? value?.title ?? key,
      摘要: value?.摘要 ?? value?.summary ?? '',
      状态: value?.状态 ?? value?.status ?? '潜伏',
    }),
  );
}

function buildOpeningLog(formData: OpeningFormData) {
  const guildName = pickFirst(formData, ['guildName', '公会名称'], '');
  const guildRole = pickFirst(formData, ['guildRole', '公会身份'], '');
  const guildDescription = pickFirst(formData, ['guildDescription', '公会描述'], '');
  const notes = pickFirst(formData, ['notes', '备注'], '');

  const logEntries: Record<string, { 标题: string; 内容: string; 时间: string }> = {
    'log-opening': {
      标题: '开局记录',
      内容: buildOpeningSummary(formData),
      时间: '刚刚',
    },
  };

  if (guildName || guildRole || guildDescription) {
    logEntries['log-guild'] = {
      标题: '公会档案',
      内容: [guildName ? `公会：${guildName}` : '', guildRole ? `身份：${guildRole}` : '', guildDescription]
        .filter(Boolean)
        .join('，'),
      时间: '开局',
    };
  }

  if (notes) {
    logEntries['log-note'] = {
      标题: '开局备注',
      内容: notes,
      时间: '开局',
    };
  }

  return logEntries;
}

function mapOpeningFormDataToStatData(formData: OpeningFormData, base: SchemaType): SchemaType {
  const next = _.cloneDeep(base);

  next.角色.姓名 = pickFirst(formData, ['playerName', 'name', '姓名'], next.角色.姓名);
  next.角色.种族 = pickFirst(formData, ['race', '种族'], next.角色.种族);
  next.角色.职业 = pickFirst(formData, ['characterClass', 'class', '职业'], next.角色.职业);
  next.角色.等级 = pickFirst(formData, ['level', '等级'], next.角色.等级);
  next.角色.背景 = pickFirst(formData, ['background', '背景'], next.角色.背景);
  next.角色.阵营 = pickFirst(formData, ['alignment', '阵营'], next.角色.阵营);
  next.角色.熟练加值 = pickFirst(formData, ['proficiencyBonus', '熟练加值'], next.角色.熟练加值);
  next.角色.护甲等级 = pickFirst(formData, ['armorClass', '护甲等级'], next.角色.护甲等级);
  next.角色.速度 = pickFirst(formData, ['speed', '速度'], next.角色.速度);
  next.角色.生命值 = pickFirst(formData, ['hp', 'currentHp', '生命值'], next.角色.生命值);
  next.角色.生命上限 = pickFirst(formData, ['hpMax', 'maxHp', '生命上限'], next.角色.生命上限);
  next.角色.临时生命 = pickFirst(formData, ['tempHp', '临时生命'], next.角色.临时生命);

  const abilityScores = pickFirst<Partial<Record<AbilityKey, number>> | undefined>(
    formData,
    ['abilityScores', 'abilities', '能力值'],
    undefined,
  );
  if (abilityScores) {
    for (const key of ABILITY_KEYS) {
      const score = abilityScores[key];
      if (score !== undefined) {
        next.角色.能力值[key] = score;
      }
    }
  }

  next.资源.金币 = pickFirst(formData, ['gold', '金币'], next.资源.金币);
  next.资源.法术位摘要 = pickFirst(formData, ['spellSlotsSummary', '法术位摘要'], next.资源.法术位摘要);
  next.资源.资源备注 = pickFirst(formData, ['resourceNote', '资源备注'], next.资源.资源备注);

  next.剧情.当前场景 = pickFirst(formData, ['currentScene', '当前场景'], next.剧情.当前场景);
  next.剧情.场景摘要 = pickFirst(formData, ['sceneSummary', '场景摘要'], next.剧情.场景摘要);
    next.剧情.战役日志 = buildOpeningLog(formData);

  const quests = buildQuests(formData);
  if (quests) {
    next.剧情.任务列表 = quests;
  }

  const clues = buildClues(formData);
  if (clues) {
    next.剧情.关键线索 = clues;
  }

  const hooks = buildHooks(formData);
  if (hooks) {
    next.剧情.剧情钩子 = hooks;
  }

  const partyMembers = buildPartyMembers(formData);
  if (partyMembers) {
    next.小队 = partyMembers;
  }

  return Schema.parse(next);
}

function buildOpeningContent(formData: OpeningFormData) {
  const explicitStory = pickFirst(formData, ['openingStory', 'openingNarrative', '开场故事'], '').trim();
  if (explicitStory) {
    return explicitStory;
  }

  const name = pickFirst(formData, ['playerName', 'name', '姓名'], '无名冒险者');
  const race = pickFirst(formData, ['race', '种族'], '人类');
  const characterClass = pickFirst(formData, ['characterClass', 'class', '职业'], '冒险者');
  const scene = pickFirst(formData, ['currentScene', '当前场景'], '临时营地');
  const sceneSummary = pickFirst(formData, ['sceneSummary', '场景摘要'], '新的冒险才刚刚开始。');
  const guildName = pickFirst(formData, ['guildName', '公会名称'], '');
  const guildRole = pickFirst(formData, ['guildRole', '公会身份'], '');
  const guildDescription = pickFirst(formData, ['guildDescription', '公会描述'], '');

  return [
    `${name}以${race}${characterClass}的身份抵达${scene}。`,
    sceneSummary,
    guildName || guildRole ? `你与${guildName || '所属公会'}的联系仍未切断，当前身份为${guildRole || '成员'}。` : '',
    guildDescription,
  ]
    .filter(Boolean)
    .join('\n');
}

function buildOpeningSummary(formData: OpeningFormData) {
  const explicitSummary = pickFirst(formData, ['openingSummary', 'summary', '开场摘要'], '').trim();
  if (explicitSummary) {
    return explicitSummary;
  }

  const name = pickFirst(formData, ['playerName', 'name', '姓名'], '无名冒险者');
  const characterClass = pickFirst(formData, ['characterClass', 'class', '职业'], '冒险者');
  const scene = pickFirst(formData, ['currentScene', '当前场景'], '临时营地');
  const guildName = pickFirst(formData, ['guildName', '公会名称'], '');

  return [name, characterClass, `已在${scene}完成开局部署`, guildName ? `并带着${guildName}相关任务` : '']
    .filter(Boolean)
    .join('，');
}

function getLayer0MvuData(): MvuData {
  try {
    const mvuData = Mvu?.getMvuData({ type: 'message', message_id: 0 });
    if (mvuData?.stat_data) {
      return {
        stat_data: mvuData.stat_data ?? {},
        display_data: mvuData.display_data ?? {},
        delta_data: mvuData.delta_data ?? {},
      };
    }
  } catch (error) {
    console.warn('[DND][gameInitializer] 读取 0 层 MVU 数据失败，尝试变量回退。', error);
  }

  try {
    const variables = getVariables({ type: 'message', message_id: 0 });
    return {
      stat_data: variables?.stat_data ?? {},
      display_data: variables?.display_data ?? {},
      delta_data: variables?.delta_data ?? {},
    };
  } catch (error) {
    console.warn('[DND][gameInitializer] 读取 0 层变量失败，使用空 MVU 数据。', error);
    return _.cloneDeep(DEFAULT_MVU_DATA);
  }
}

function hasOpeningStoryMessage() {
  try {
    const layerOneMessages = getChatMessages(1, { role: 'assistant' });
    return layerOneMessages.some(message => typeof message?.message === 'string' && message.message.trim().length > 0);
  } catch (error) {
    console.warn('[DND][gameInitializer] 检查 1 层消息失败，将仅依赖全局标记。', error);
    return false;
  }
}

async function updateChronicleWithRetry() {
  const updater = window.__DND_CHECK_AND_UPDATE_CHRONICLE__ ?? window.checkAndUpdateChronicle;
  if (typeof updater !== 'function') {
    console.warn('[DND][gameInitializer] 未找到编年史更新器，跳过编年史更新。');
    return false;
  }

  for (let attempt = 1; attempt <= CHRONICLE_MAX_RETRIES; attempt++) {
    try {
      if (attempt > 1) {
        await wait(CHRONICLE_RETRY_DELAY);
      }
      console.info(`[DND][gameInitializer] 正在更新编年史，第 ${attempt}/${CHRONICLE_MAX_RETRIES} 次尝试。`);
      await updater();
      console.info('[DND][gameInitializer] 编年史更新成功。');
      return true;
    } catch (error) {
      console.warn(`[DND][gameInitializer] 编年史更新失败，第 ${attempt}/${CHRONICLE_MAX_RETRIES} 次尝试。`, error);
    }
  }

  console.error('[DND][gameInitializer] 编年史更新已达到最大重试次数。');
  return false;
}

export async function initializeGameVariables(formData: OpeningFormData): Promise<boolean> {
  console.info('[DND][gameInitializer] 开始初始化 0 层游戏变量。', formData);

  try {
    let existingVariables: Record<string, any> = {};
    try {
      existingVariables = getVariables({ type: 'message', message_id: 0 });
    } catch (error) {
      console.warn('[DND][gameInitializer] 读取 0 层变量失败，将使用默认结构继续初始化。', error);
    }
    const existingStatData = existingVariables?.stat_data ?? {};
    const schemaSafeBase = Schema.parse(existingStatData);
    const nextStatData = mapOpeningFormDataToStatData(formData, schemaSafeBase);

    await updateVariablesWith(variables => {
      const nextVariables = _.cloneDeep(variables ?? {});
      if (!_.isPlainObject(nextVariables.stat_data)) {
        nextVariables.stat_data = {};
      }
      nextVariables.stat_data = nextStatData;
      return nextVariables;
    }, { type: 'message', message_id: 0 });

    console.info('[DND][gameInitializer] 0 层游戏变量初始化完成。', {
      角色: nextStatData.角色.姓名,
      场景: nextStatData.剧情.当前场景,
      金币: nextStatData.资源.金币,
    });
    return true;
  } catch (error) {
    console.error('[DND][gameInitializer] 初始化 0 层游戏变量失败。', error);
    return false;
  }
}

export async function createOpeningStoryMessage(formData: OpeningFormData): Promise<boolean> {
  console.info('[DND][gameInitializer] 开始创建 1 层开局消息。', formData);

  try {
    if (window.__DND_OPENING_STORY_CREATED__) {
      console.warn('[DND][gameInitializer] 已存在开局消息全局标记，跳过重复创建。');
      return true;
    }

    if (hasOpeningStoryMessage()) {
      window.__DND_OPENING_STORY_CREATED__ = true;
      console.warn('[DND][gameInitializer] 检测到 1 层 assistant 消息已存在，跳过重复创建。');
      return true;
    }

    const message = [`<content>${buildOpeningContent(formData)}</content>`, `<summary>${buildOpeningSummary(formData)}</summary>`].join(
      '\n\n',
    );
    const layer0Data = getLayer0MvuData();

    await createChatMessages(
      [
        {
          role: 'assistant',
          message,
          data: layer0Data,
        },
      ],
      { refresh: 'none' },
    );

    window.__DND_OPENING_STORY_CREATED__ = true;
    console.info('[DND][gameInitializer] 开局消息创建完成。', {
      hasStatData: !!layer0Data.stat_data,
      statDataKeys: Object.keys(layer0Data.stat_data ?? {}),
    });

    await updateChronicleWithRetry();
    return true;
  } catch (error) {
    console.error('[DND][gameInitializer] 创建开局消息失败。', error);
    return false;
  }
}
