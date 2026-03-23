/**
 * 消息解析工具
 * 从最新 assistant 楼层消息中解析 <maintext>、<option> 等标签
 * 依赖酒馆助手全局接口 getChatMessages、getLastMessageId、getVariables、updateVariablesWith（见 @types）
 */

/** 创建 assistant 楼层并应用变量命令后发送此事件，前端监听后刷新正文、选项与最新楼层 stat_data */
export const AISELA_ASSISTANT_READY = 'aisela_assistant_ready';

/**
 * 移除 <thinking> 和 <think> 标签及其内容（用于生成结果后清洗）
 */
export function removeThinkingTags(text: string): string {
  if (!text) return '';
  let result = text
    .replace(/<thinking>[\s\S]*?<\/thinking>/gi, '')
    .replace(/<think>[\s\S]*?<\/redacted_reasoning>/gi, '');
  const thinkStart = result.search(/<think>/i);
  if (thinkStart !== -1) result = result.substring(0, thinkStart);
  const thinkingStart = result.search(/<thinking>/i);
  if (thinkingStart !== -1) result = result.substring(0, thinkingStart);
  return result.trim();
}

/**
 * 校验消息是否包含 <maintext> 标签（在 removeThinkingTags 后的文本上使用）
 */
export function validateHasMaintext(cleanedMessage: string): boolean {
  return /<maintext>[\s\S]*?<\/maintext>/i.test(cleanedMessage ?? '');
}

/**
 * 根据当前楼层调整消息隐藏范围：楼层 >= 30 时隐藏 0 到 (当前楼层 - 15)
 * 应在发送新消息前调用，用于控制上下文长度与读档时界面
 */
export async function adjustMessageVisibility(): Promise<void> {
  const lastId = getLastMessageId();
  if (lastId < 30) return;
  const hideUpTo = lastId - 15;
  if (hideUpTo < 0) return;
  const toHide = _.range(0, hideUpTo + 1).map((message_id) => ({ message_id, is_hidden: true }));
  await setChatMessages(toHide, { refresh: 'affected' });
}

/**
 * 解析消息中的正文
 * 只提取不在 <thinking> 或 <think> 标签内部的 <maintext> 标签
 */
export function parseMaintext(messageContent: string): string {
  if (!messageContent) return '';

  let cleaned = messageContent.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '');
  cleaned = cleaned.replace(/<think>[\s\S]*?<\/redacted_reasoning>/gi, '');

  const thinkingStart = cleaned.search(/<thinking>/i);
  if (thinkingStart !== -1) {
    cleaned = cleaned.substring(0, thinkingStart);
  }
  const redactedStart = cleaned.search(/<think>/i);
  if (redactedStart !== -1) {
    cleaned = cleaned.substring(0, redactedStart);
  }

  const matches = cleaned.match(/<maintext>([\s\S]*?)<\/maintext>/gi);
  if (!matches || matches.length === 0) return '';
  const lastMatch = matches[matches.length - 1];
  const content = lastMatch.match(/<maintext>([\s\S]*?)<\/maintext>/i);
  return content ? content[1].trim() : '';
}

/** 选项结构：id 如 A/B/C/D，text 为选项文案 */
export interface Option {
  id: string;
  text: string;
}

const cleanForParse = (raw: string): string => {
  let cleaned = raw.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '');
  cleaned = cleaned.replace(/<think>[\s\S]*?<\/redacted_reasoning>/gi, '');
  const thinkingStart = cleaned.search(/<thinking>/i);
  if (thinkingStart !== -1) cleaned = cleaned.substring(0, thinkingStart);
  const redactedStart = cleaned.search(/<think>/i);
  if (redactedStart !== -1) cleaned = cleaned.substring(0, redactedStart);
  return cleaned;
};

/**
 * 解析消息中的选项
 * 支持：1) 带 id: <option id="A">选项文本</option>
 *       2) 不带 id: <option> 内以换行分隔，每行一个选项（可带 A. B. 前缀）
 */
export function parseOptions(messageContent: string): Option[] {
  if (!messageContent) return [];
  const cleaned = cleanForParse(messageContent);

  const optionWithIdRegex = /<option id="([^"]+)">([^<]+)<\/option>/g;
  const optionsWithId: Option[] = [];
  let match;
  while ((match = optionWithIdRegex.exec(cleaned)) !== null) {
    optionsWithId.push({ id: match[1], text: match[2].trim() });
  }
  if (optionsWithId.length > 0) return optionsWithId;

  const optionMatch = cleaned.match(/<option>([\s\S]*?)<\/option>/i);
  if (!optionMatch) return [];
  const optionText = optionMatch[1].trim();
  const lines = optionText.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);

  const optionPattern = /^[A-Z]\.\s*/;
  const hasLetterPrefix = lines.some((line) => optionPattern.test(line));
  if (hasLetterPrefix) {
    const options: Option[] = [];
    let currentOption: string[] = [];
    for (const line of lines) {
      if (optionPattern.test(line)) {
        if (currentOption.length > 0) {
          const text = currentOption.join('\n');
          const id = text.match(/^([A-Z])\./)?.[1] ?? String.fromCharCode(65 + options.length);
          options.push({ id, text: text.replace(/^[A-Z]\.\s*/, '').trim() });
          currentOption = [];
        }
        currentOption.push(line);
      } else {
        if (currentOption.length > 0) currentOption.push(line);
      }
    }
    if (currentOption.length > 0) {
      const text = currentOption.join('\n');
      const id = text.match(/^([A-Z])\./)?.[1] ?? String.fromCharCode(65 + options.length);
      options.push({ id, text: text.replace(/^[A-Z]\.\s*/, '').trim() });
    }
    return options;
  }
  return lines.map((line, index) => ({
    id: String.fromCharCode(65 + index),
    text: line,
  }));
}

const MAX_OPTIONS = 4;

/**
 * 从最新 assistant 楼层读取正文与选项（选项最多 4 条）
 */
export function loadFromLatestMessage(): { maintext: string; options: Option[] } {
  try {
    const lastMessageId = getLastMessageId();
    if (lastMessageId < 0) return { maintext: '', options: [] };

    const messages = getChatMessages(lastMessageId, { role: 'assistant' });
    const raw = messages?.[0]?.message ?? (getChatMessages(lastMessageId)[0] as { message?: string } | undefined)?.message ?? '';
    const maintext = parseMaintext(raw);
    const options = parseOptions(raw).slice(0, MAX_OPTIONS);
    return { maintext, options };
  } catch (error) {
    console.error('❌ [messageParser] 加载最新消息失败:', error);
    return { maintext: '', options: [] };
  }
}

/** 扩展信息：用于长按重 roll / 编辑正文 */
export interface LatestMessageInfo {
  maintext: string;
  options: Option[];
  messageId: number | undefined;
  userMessageId: number | undefined;
  fullMessage: string | undefined;
}

/**
 * 从最新 assistant 楼层读取正文、选项及 messageId / userMessageId / fullMessage（供长按功能使用）
 */
export function loadFromLatestMessageExtended(): LatestMessageInfo {
  try {
    const lastMessageId = getLastMessageId();
    if (lastMessageId < 0) {
      return { maintext: '', options: [], messageId: undefined, userMessageId: undefined, fullMessage: undefined };
    }

    const messages = getChatMessages(lastMessageId, { role: 'assistant' });
    const raw = messages?.[0]?.message ?? (getChatMessages(lastMessageId)[0] as { message?: string } | undefined)?.message ?? '';
    const maintext = parseMaintext(raw);
    const options = parseOptions(raw).slice(0, MAX_OPTIONS);
    const userMessageId = lastMessageId - 1 >= 0 ? lastMessageId - 1 : undefined;
    return {
      maintext,
      options,
      messageId: lastMessageId,
      userMessageId,
      fullMessage: raw || undefined,
    };
  } catch (error) {
    console.error('❌ [messageParser] loadFromLatestMessageExtended:', error);
    return { maintext: '', options: [], messageId: undefined, userMessageId: undefined, fullMessage: undefined };
  }
}

/** 仅读取正文（兼容旧用法） */
export function loadMaintextFromLatestMessage(): string {
  return loadFromLatestMessage().maintext;
}

/**
 * 解析消息中的 <sum> 摘要（与 maintext 同规则：排除 thinking/redacted）
 */
export function parseSum(messageContent: string): string {
  if (!messageContent) return '';
  const cleaned = cleanForParse(messageContent);
  const matches = cleaned.match(/<sum>([\s\S]*?)<\/sum>/gi);
  if (!matches || matches.length === 0) return '';
  const lastMatch = matches[matches.length - 1];
  const content = lastMatch.match(/<sum>([\s\S]*?)<\/sum>/i);
  return content ? content[1].trim() : '';
}

export function parseSumMeta(sumText: string) {
  const raw = (sumText || '').trim();
  if (!raw) return null;

  const parts = raw
    .split('|')
    .map(part => part.trim())
    .filter(Boolean);

  const getField = (prefix: string) =>
    parts.find(part => part.startsWith(prefix))?.replace(prefix, '').trim();

  const time = getField('时间：') || getField('时间:');
  const location = getField('地点：') || getField('地点:');
  const characters = getField('人物：') || getField('人物:');
  const event = getField('事件：') || getField('事件:') || raw;

  const tags = [time, location, characters]
    .flatMap(item => (item ? item.split(/[、，,]/).map(value => value.trim()) : []))
    .filter(Boolean)
    .slice(0, 6);

  const worldTags = [
    ...tags.filter(tag => /(平原|山脉|森林|荒漠|枯萎|群岛|港|酒馆|营地|教派|观测者|帝国|行歌|协会)/.test(tag)),
    ...((event || '').match(/(奥法之灾|魔王|无名荒芜|寂静圣画|盲目之光|钢铁神子|噬根之蛇|观测者|灭世教派|星语协会)/g) ?? []),
  ]
    .filter(Boolean)
    .slice(0, 6);

  return { raw, time, location, characters, event, tags, worldTags };
}

/** 按楼层收集所有 assistant 楼层的 maintext，用于阅读模式 */
export function loadAllFloorsForReading(): { messageId: number; maintext: string; summaryMeta: ReturnType<typeof parseSumMeta> }[] {
  try {
    const lastId = getLastMessageId();
    if (lastId < 0) return [];
    const messages = getChatMessages(`0-${lastId}`, { role: 'assistant' }) as { message_id: number; message: string }[];
    return (messages ?? [])
      .map((m) => ({
        messageId: m.message_id,
        maintext: parseMaintext(m.message || ''),
        summaryMeta: parseSumMeta(parseSum(m.message || '')),
      }))
      .filter((f) => f.maintext.length > 0);
  } catch (e) {
    console.error('❌ [messageParser] loadAllFloorsForReading:', e);
    return [];
  }
}

/** 按楼层收集所有楼层的 <sum>，用于读档列表；点击后对该楼层 /branch-create */
export function loadAllFloorsForSaves(): { messageId: number; sum: string; summaryMeta: ReturnType<typeof parseSumMeta> }[] {
  try {
    const lastId = getLastMessageId();
    if (lastId < 0) return [];
    const messages = getChatMessages(`0-${lastId}`) as { message_id: number; message: string; role: string }[];
    return (messages ?? [])
      .map((m) => {
        const sum = parseSum(m.message || '');
        return { messageId: m.message_id, sum, summaryMeta: parseSumMeta(sum) };
      })
      .filter((f) => f.sum.length > 0);
  } catch (e) {
    console.error('❌ [messageParser] loadAllFloorsForSaves:', e);
    return [];
  }
}

/** 对话流单项：用于正文框按顺序展示 user（右）/ narrative（左） */
export type ConversationFlowItem = { type: 'user' | 'narrative'; text: string };

/**
 * 按楼层顺序加载完整对话流（user 与 assistant 的 maintext），用于正文框展示
 */
export function loadConversationFlow(): ConversationFlowItem[] {
  try {
    const lastId = getLastMessageId();
    if (lastId < 0) return [];
    const messages = getChatMessages(`0-${lastId}`) as { message_id: number; message: string; role: string }[];
    const items: ConversationFlowItem[] = [];
    for (const m of messages ?? []) {
      const role = (m.role || '').toLowerCase();
      const msg = (m.message || '').trim();
      if (role === 'user') {
        if (msg.length > 0) items.push({ type: 'user', text: msg });
      } else if (role === 'assistant') {
        const maintext = parseMaintext(m.message || '');
        if (maintext.length > 0) items.push({ type: 'narrative', text: maintext });
      }
    }
    return items;
  } catch (e) {
    console.error('❌ [messageParser] loadConversationFlow:', e);
    return [];
  }
}

/** 约定：LLM 输出的变量更新块，内含 <Analysis> 与 <JSONPatch>（JSON Patch + 自定义 op: delta） */
const UPDATE_VARIABLE_BLOCK_REG = /<UpdateVariable>([\s\S]*?)<\/UpdateVariable>/i;
const JSON_PATCH_BLOCK_REG = /<JSONPatch>([\s\S]*?)<\/JSONPatch>/i;

/** JSON Pointer 转 lodash 可用的 path 数组（RFC 6901：/ 分隔，~1 为 /，~0 为 ~） */
function jsonPointerToPath(pointer: string): string[] {
  if (!pointer || pointer === '/') return [];
  return pointer
    .replace(/^\/+/, '')
    .split('/')
    .map(seg => seg.replace(/~1/g, '/').replace(/~0/g, '~'));
}

type JsonPatchOp = { op: string; path?: string; from?: string; to?: string; value?: unknown };

function applyOneOp(obj: Record<string, any>, op: JsonPatchOp): void {
  const path = op.path;
  const pathArr = path != null ? jsonPointerToPath(path) : [];
  const fromArr = op.from != null ? jsonPointerToPath(op.from) : [];
  const toArr = op.to != null ? jsonPointerToPath(op.to) : [];

  switch (op.op) {
    case 'replace':
      if (pathArr.length) _.set(obj, pathArr, op.value);
      break;
    case 'delta': {
      if (!pathArr.length) break;
      const cur = _.get(obj, pathArr);
      const delta = Number(op.value);
      _.set(obj, pathArr, (typeof cur === 'number' ? cur : 0) + delta);
      break;
    }
    case 'insert': {
      if (!pathArr.length) break;
      if (path === '-' || pathArr[pathArr.length - 1] === '-') {
        const parentPath = pathArr.slice(0, -1);
        const parent = parentPath.length ? _.get(obj, parentPath) : obj;
        if (Array.isArray(parent)) parent.push(op.value);
        else _.set(obj, pathArr, op.value);
      } else {
        _.set(obj, pathArr, op.value);
      }
      break;
    }
    case 'remove':
      if (pathArr.length) _.unset(obj, pathArr);
      break;
    case 'move':
      if (fromArr.length && toArr.length) {
        const val = _.get(obj, fromArr);
        _.unset(obj, fromArr);
        _.set(obj, toArr, val);
      }
      break;
    default:
      break;
  }
}

/**
 * 解析并应用 LLM 返回中的「变量命令」（步骤 5）
 *
 * 约定格式：<UpdateVariable> 内包含 <JSONPatch>，其中为 JSON 数组，每项为：
 * - replace / delta / insert / remove / move（path 为 JSON Pointer，如 /stat_data/主角/货币/金狮）
 * 作用于最新楼层消息变量（type: 'message', message_id: getLastMessageId()），便于当前页展示与编辑一致。
 */
export function applyVariableCommands(rawAssistantMessage: string): void {
  const blockMatch = rawAssistantMessage.match(UPDATE_VARIABLE_BLOCK_REG) ?? rawAssistantMessage.match(JSON_PATCH_BLOCK_REG);
  const block = blockMatch ? blockMatch[1].trim() : '';
  const patchMatch = block.match(JSON_PATCH_BLOCK_REG);
  const patchRaw = patchMatch ? patchMatch[1].trim() : block;
  if (!patchRaw) return;

  let list: JsonPatchOp[];
  try {
    list = JSON.parse(patchRaw) as JsonPatchOp[];
  } catch (e) {
    console.warn('❌ [messageParser] <JSONPatch> 解析失败:', e);
    return;
  }
  if (!Array.isArray(list) || list.length === 0) return;

  const variableOption = { type: 'message' as const, message_id: getLastMessageId() };
  updateVariablesWith(vars => {
    const copy = klona(vars);
    for (const op of list) {
      try {
        applyOneOp(copy, op);
      } catch (err) {
        console.warn('[messageParser] 应用单条 JSON Patch 失败:', op, err);
      }
    }
    return copy;
  }, variableOption);
}
