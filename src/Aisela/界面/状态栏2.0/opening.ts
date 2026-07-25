import { klona } from 'klona';

import { Schema, type SchemaType } from '../../schema';
import type { OpeningConfig } from './types';

const defaultFactions = {
  神圣罗兰帝国: { 声望: '中立', 描述: '中央翡翠平原的人类与兽人共治帝国，冒险者公会与神权贵族在此交错。' },
  永夜森林议会: { 声望: '中立', 描述: '西方精灵长老议会，守望森林、月井与古老自然盟约。' },
  矮人地下城: { 声望: '中立', 描述: '凛冬山脉深处的工匠城邦，铸造、符文和军备贸易是其根基。' },
  观察者组织: { 声望: '中立', 描述: '监测末日时钟与灾世要素的第三方机构，记录各地异常。' },
  远方行歌: { 声望: '中立', 描述: '跨国冒险者互助联盟，以委托、认证和旅店网络维系大陆往来。' },
  魔国: { 声望: '敌对', 描述: '暗影裂谷深处的敌对国度，三百年来持续冲击文明边境。' },
};

const GOLDEN_FINGER_ENTRY_NAME = '【常驻】{{user}}的金手指';
const ARCANE_DISASTER_USER_ENTRY_NAME = '{{user}}是奥法之灾';
const FALLBACK_WORLDBOOK_NAME = '艾瑟兰 · 奥法之灾';
const ARCANE_DISASTER_HOST_NOTE = '（宿主: {{user}}，宿主未察觉）';

const GOLDEN_FINGER_GENERATION_SYSTEM_PROMPT = `
你是爽文设定编辑。为一名“穿越者”创作一则极致无敌、可长期反复游玩的金手指条目。

故事的落点是艾瑟兰：这里正处于暗影纪元，大陆在七大灭世要素的阴影下维持脆弱秩序，其中包括奥法之灾。主角来自世界之外，但金手指不是奥法之灾，也不能取代玩家选择。

金手指的来源、形态与表现不受艾瑟兰的暗黑奇幻风格限制：可以是科幻、奇幻、神话、修真、游戏系统、超自然、未来科技或任何其他设定体系的事物。它进入艾瑟兰后应保留其独特气质，不要强行改写成西幻魔法物品。

核心风格：极致无敌流爽文，不追求平衡、限制、慢热成长或长期解锁。每件奇物、系统或权能必须不仅强，而且好玩；必须拥有能被{{user}}主动操作、反复使用、改变场景互动并引发后续玩法的独特机制。

输出要求：只输出一则可直接存入世界书的中文条目，不要寒暄、不要 Markdown、不要解释创作过程。控制在 120 至 320 个汉字，使用以下五行格式：
名称：
核心权能：
主动操作：
场景互动：
后续玩法：

权能必须强大、鲜明并适合被{{user}}主动发动；场景互动和后续玩法必须具体可演。`.trim();

export function clampOpeningMoney(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(999999, Math.floor(value)));
}

export function faithName(faith: string) {
  return faith === '无' ? '无' : faith.split('(')[0] || faith;
}

function parseCustomItems(value: string) {
  return value
    .split(/[\n,，]+/)
    .map(item => item.trim())
    .filter(Boolean)
    .slice(0, 10)
    .reduce<Record<string, { 描述: string; 数量: number; 品质: 'common' }>>((items, rawItem) => {
      const [rawName, rawDescription = '旅人亲手放进行囊的物件。'] = rawItem.split(/[：:]/, 2);
      const name = rawName.trim().slice(0, 32);
      if (!name) return items;
      items[name] = {
        描述: rawDescription.trim().slice(0, 90) || '旅人亲手放进行囊的物件。',
        数量: 1,
        品质: 'common',
      };
      return items;
    }, {});
}

function getGoldenFinger(config: OpeningConfig) {
  return config.goldenFinger.trim().slice(0, 360);
}

function normalizeGoldenFingerDraft(raw: string) {
  return raw
    .replace(/^```(?:text|markdown)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim()
    .slice(0, 360);
}

export async function generateGoldenFingerDraft() {
  const response = await generateRaw({
    user_input: '请按既定格式生成一则新的金手指条目。',
    should_stream: false,
    max_chat_history: 0,
    ordered_prompts: [{ role: 'system', content: GOLDEN_FINGER_GENERATION_SYSTEM_PROMPT }, 'user_input'],
  });
  if (typeof response !== 'string') throw new Error('金手指生成没有返回文本。');

  const draft = normalizeGoldenFingerDraft(response);
  if (!draft) throw new Error('金手指生成结果为空。');
  return draft;
}

function getOpeningWorldbookName() {
  return getChatWorldbookName('current') ?? FALLBACK_WORLDBOOK_NAME;
}

function formatGoldenFingerWorldbookDescription(goldenFinger: string) {
  const hasStructuredField = /^\s*(?:名称|描述|核心权能|主动操作|场景互动|后续玩法)\s*[：:]/m.test(goldenFinger);
  return hasStructuredField ? goldenFinger : `描述：${goldenFinger}`;
}

function buildGoldenFingerWorldbookContent(goldenFinger: string) {
  const description = formatGoldenFingerWorldbookDescription(goldenFinger);
  return `
<golden_finger>
持有者：{{user}}
性质：来自世界之外的常驻极致权能；不属于奥法之灾，也不触发奥法之灾相关阶段。

${description}

玩法指引：该奇物应被{{user}}主动操作、反复使用，并能改变场景互动、推动新的后续玩法。
</golden_finger>
`.trim();
}

function goldenFingerEntryPatch(goldenFinger: string) {
  return {
    name: GOLDEN_FINGER_ENTRY_NAME,
    enabled: true,
    strategy: {
      type: 'constant' as const,
      keys: [],
      keys_secondary: { logic: 'and_any' as const, keys: [] },
      scan_depth: 'same_as_global' as const,
    },
    position: {
      type: 'after_character_definition' as const,
      role: 'system' as const,
      depth: 4,
      order: 100,
    },
    content: buildGoldenFingerWorldbookContent(goldenFinger),
    probability: 100,
    recursion: {
      prevent_incoming: false,
      prevent_outgoing: true,
      delay_until: null,
    },
    effect: { sticky: null, cooldown: null, delay: null },
    extra: { aisela_status_2_kind: 'golden_finger' },
  };
}

function isGoldenFingerEntry(entry: WorldbookEntry) {
  return entry.name === GOLDEN_FINGER_ENTRY_NAME || entry.extra?.aisela_status_2_kind === 'golden_finger';
}

export async function persistGoldenFingerWorldbookEntry(goldenFinger: string) {
  const normalizedGoldenFinger = normalizeGoldenFingerDraft(goldenFinger);
  if (!normalizedGoldenFinger) throw new Error('无法保存空白的金手指条目。');

  const worldbookName = getOpeningWorldbookName();
  const patch = goldenFingerEntryPatch(normalizedGoldenFinger);
  let updated = false;

  await updateWorldbookWith(
    worldbookName,
    worldbook =>
      worldbook.map(entry => {
        if (!isGoldenFingerEntry(entry)) return entry;
        updated = true;
        return {
          ...entry,
          ...patch,
          extra: { ...entry.extra, ...patch.extra },
        };
      }),
    { render: 'debounced' },
  );

  if (!updated) {
    await createWorldbookEntries(worldbookName, [patch], { render: 'debounced' });
  }
}

function buildArcaneDisasterUserWorldbookContent(originMode: OpeningConfig['originMode']) {
  const currentPresentation =
    originMode === 'arcane_disaster'
      ? '当前呈现：{{user}}已完全掌控奥法之灾本身。力量的使用由{{user}}决定，不得写成封印、失控或渐进觉醒。'
      : '当前呈现：{{user}}以常规旅人的身份踏入艾瑟兰。奥法之灾的迹象、知晓程度与表现仅遵循当前剧情和 MVU 状态，不额外赋予可被{{user}}自觉使用的灾厄能力。';

  return `
<user_arcane_disaster_identity>
{{user}}是奥法之灾。
身份约束：{{user}}与奥法之灾是同一存在；叙事中不得将二者写成相互独立的人物或力量来源。
${currentPresentation}
</user_arcane_disaster_identity>
`.trim();
}

function arcaneDisasterUserEntryPatch(originMode: OpeningConfig['originMode']) {
  return {
    name: ARCANE_DISASTER_USER_ENTRY_NAME,
    enabled: originMode !== 'transmigrator',
    strategy: {
      type: 'constant' as const,
      keys: [],
      keys_secondary: { logic: 'and_any' as const, keys: [] },
      scan_depth: 'same_as_global' as const,
    },
    position: {
      type: 'after_character_definition' as const,
      role: 'system' as const,
      depth: 4,
      order: 101,
    },
    content: buildArcaneDisasterUserWorldbookContent(originMode),
    probability: 100,
    recursion: {
      prevent_incoming: false,
      prevent_outgoing: true,
      delay_until: null,
    },
    effect: { sticky: null, cooldown: null, delay: null },
    extra: { aisela_status_2_kind: 'user_arcane_disaster_identity' },
  };
}

function isArcaneDisasterUserEntry(entry: WorldbookEntry) {
  return (
    entry.name === ARCANE_DISASTER_USER_ENTRY_NAME ||
    entry.content.includes('<user_arcane_disaster_identity>') ||
    entry.extra?.aisela_status_2_kind === 'user_arcane_disaster_identity'
  );
}

function removeArcaneDisasterHostNote(entry: WorldbookEntry) {
  if (!entry.content.includes('<wef_scourgemagic>') || !entry.content.includes(ARCANE_DISASTER_HOST_NOTE)) return entry;
  return { ...entry, content: entry.content.replace(ARCANE_DISASTER_HOST_NOTE, '') };
}

export async function syncArcaneDisasterUserWorldbookEntry(config: OpeningConfig) {
  const worldbookName = getOpeningWorldbookName();
  const patch = arcaneDisasterUserEntryPatch(config.originMode);
  let updated = false;

  await updateWorldbookWith(
    worldbookName,
    worldbook =>
      worldbook.map(entry => {
        const sanitizedEntry = removeArcaneDisasterHostNote(entry);
        if (!isArcaneDisasterUserEntry(sanitizedEntry)) return sanitizedEntry;
        updated = true;
        return {
          ...sanitizedEntry,
          ...patch,
          extra: { ...sanitizedEntry.extra, ...patch.extra },
        };
      }),
    { render: 'debounced' },
  );

  if (!updated) {
    await createWorldbookEntries(worldbookName, [patch], { render: 'debounced' });
  }
}

function getOpeningIdentity(config: OpeningConfig) {
  const goldenFinger = getGoldenFinger(config);

  if (config.originMode === 'arcane_disaster') {
    return {
      title: '奥法之灾·完全受控',
      awakening: 100,
      temporaryState: {
        奥法之灾完全受控: {
          类型: 'buff' as const,
          描述: '奥法之灾由主角的意志完全掌控；它不是待唤醒的宿主异象。',
        },
      },
      hostProfile: {
        阶段代码: '无',
        阶段名称: '不适用',
        阶段称谓: '奥法之灾本体',
        异象前兆: '无需掩藏的奥法余辉会在主角意志抵达之处自行收束，魔力潮汐随之归序。',
        风险提示: '奥法之灾已完全受控，任何波动均被视为主角主动意志的一部分，而非失控征兆。',
        下一阈值: '不适用；力量的使用边界只由主角的选择与世界承受的后果决定。',
        可能代价: '每一次干预都会改变周遭势力、魔网与末日要素对主角的判断。',
      },
      prompt:
        '身份模式：奥法之灾·完全受控。玩家不是奥法之灾的宿主，而是已完全掌控奥法之灾本身的意志主体。不要将其写成封印、失控或渐进觉醒的异常。力量依旧应有世界层面的后果与他人的反应，但不应剥夺玩家的掌控权。',
    };
  }

  if (config.originMode === 'transmigrator') {
    return {
      title: '异界来客',
      awakening: 0,
      temporaryState: {},
      hostProfile: {
        阶段代码: 'EX',
        阶段名称: '异界来客',
        阶段称谓: '命轨之外',
        异象前兆: '主角的来历不属于艾瑟兰既有的命运记录，偶尔会让占星、预言与旧法阵得出空白读数。',
        风险提示: '主角并非奥法之灾宿主；异界来历与金手指均不应被误判为奥法之灾觉醒或阶段变化。',
        下一阈值: '无长期解锁；金手指自开局起即可被主动使用，并可在剧情中持续衍生新的玩法。',
        可能代价: '不设常规代价；界外权能的展示会令场景、势力与末日要素作出更鲜明的回应。',
      },
      prompt: `身份模式：携带金手指的穿越者。玩家来自艾瑟兰之外，并非奥法之灾宿主。玩家拥有的金手指为「${goldenFinger || '尚未命名的极致权能'}」。将它写成可被{{user}}主动操作、反复使用、改变场景互动并引发后续玩法的常驻设定；允许它以压倒性力量解决问题。不要把异界来历或金手指误写为奥法之灾的觉醒阶段。`,
    };
  }

  return {
    title: '你好世界',
    awakening: 0,
    temporaryState: {},
    hostProfile: undefined,
    prompt:
      '身份模式：循常而来的旅人。玩家以所选职业、信仰与行囊进入艾瑟兰；{{user}}与奥法之灾的身份联系由已启用的世界书条目约束，但开局不额外赋予可自觉使用的灾厄能力。',
  };
}

export function buildOpeningStatData(config: OpeningConfig): SchemaType {
  const defaults = Schema.parse({});
  const identity = getOpeningIdentity(config);
  return Schema.parse({
    ...defaults,
    主角: {
      ...defaults.主角,
      职业: config.profession,
      信仰: faithName(config.faith),
      当前地点: config.location,
      称号: identity.title,
      状态: config.status || '健康',
      临时状态: identity.temporaryState,
      货币: {
        金狮: clampOpeningMoney(config.currency.gold),
        银辉币: clampOpeningMoney(config.currency.silver),
        铜叶币: clampOpeningMoney(config.currency.copper),
        以太结晶: 0,
      },
      生命: 450,
      生命上限: 450,
      法力: 200,
      法力上限: 200,
      奥法之灾觉醒度: identity.awakening,
      奥法之灾觉醒度上限: 100,
      ...(identity.hostProfile ? { 宿主档案: identity.hostProfile } : {}),
      装备栏: {
        主手: { 装备名: '空置', 描述: '', 品质: 'common' },
        副手: { 装备名: '空置', 描述: '', 品质: 'common' },
        服饰: { 装备名: '旅行外衣', 描述: '足以遮风，却挡不住命运的注视。', 品质: 'common' },
        饰品: { 装备名: '空置', 描述: '', 品质: 'common' },
      },
      物品栏: {
        干粮: { 描述: '几日份的旅途口粮。', 数量: 3, 品质: 'common' },
        火折子: { 描述: '潮湿夜路里仍能点亮的一点火。', 数量: 1, 品质: 'common' },
        ...parseCustomItems(config.customItems),
      },
    },
    世界: {
      ...defaults.世界,
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
        排序权重: 100,
        危机关联: '奥法之灾',
      },
    },
  });
}

export function buildOpeningPrompt(config: OpeningConfig) {
  const faith = faithName(config.faith);
  const customItems = Object.entries(parseCustomItems(config.customItems));
  const customStory = config.openingStory.trim();
  const identity = getOpeningIdentity(config);
  return `
开始旅程。

请根据以下开局档案，为{{user}}生成 Aisela 的第一段正式剧情。让故事从{{user}}当前所在地点自然展开。${customStory ? '玩家指定的剧情是本幕既定前提，必须自然承接，不得改写或忽略。' : ''}

{{user}}的开局档案：
  - 职业：${config.profession}
  - 身份：${identity.title}
  - 信仰：${faith}
- 初始地点：${config.location}
- 小地点提示：${config.subLocation || '未指定，只以大地点展开'}
- 当前状态：${config.status || '健康'}
- 初始资产：金狮 ${clampOpeningMoney(config.currency.gold)}，银辉币 ${clampOpeningMoney(config.currency.silver)}，铜叶币 ${clampOpeningMoney(config.currency.copper)}
  - 自携物品：${customItems.length ? customItems.map(([name, item]) => `${name}（${item.描述}）`).join('；') : '无额外记录'}
  - 身份设定：${identity.prompt}
${customStory ? `- 玩家亲自写下的本幕剧情：${customStory}` : ''}

世界背景参考：
诸神黄昏的灰烬落定已逾三千年。幸存的新神在废墟上立下沉默誓约：永不主动干涉凡间因果，只回应祈祷。今日的艾瑟兰仍在七大灭世要素的阴影下维持脆弱秩序，魔王、无名荒芜、噬根之蛇、奥法之灾、寂静圣画、盲目之光与钢铁神子共同指向末日预言。

当前纪元为暗影纪元第三百年的初春。神圣罗兰帝国、永夜森林议会、矮人地下城、星语协会、远方行歌与观测者学会仍在各自的秩序中抵抗灾变。末日时钟此刻指向刻度三。

请以第三人称书写{{user}}的经历。${config.subLocation ? `开场应落在“${config.subLocation}”。` : ''}${customStory ? '先让玩家写下的剧情在场景中真实发生，再向外展开。' : '从{{user}}所在地点与当前局势自然起幕。'}不要把以上档案当作旁白复述；把它们自然融入场景与遭遇中。第一段应留下一个清晰、可立即回应的行动契机，而不是替{{user}}决定行动。
`.trim();
}

export async function startStatusOpening(config: OpeningConfig) {
  await syncArcaneDisasterUserWorldbookEntry(config);
  if (config.originMode === 'transmigrator') {
    await persistGoldenFingerWorldbookEntry(getGoldenFinger(config));
  }
  const statData = buildOpeningStatData(config);
  await updateVariablesWith(variables => ({ ...variables, stat_data: klona(statData) }), {
    type: 'message',
    message_id: 0,
  });
  await createChatMessages([{ role: 'user', message: buildOpeningPrompt(config) }], {
    refresh: 'affected',
  });
  await triggerSlash('/trigger');
}
