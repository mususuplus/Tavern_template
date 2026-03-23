/**
 * DND 编年史更新工具
 * 负责从消息中提取 <summary> 标签并同步到世界书中的“编年史”条目。
 */

declare function getChatMessages(
  range: string | number,
  options?: { role?: 'all' | 'system' | 'assistant' | 'user' },
): Array<{ message: string; message_id: number; role: string }>;
declare function getLastMessageId(): number;
declare function getChatWorldbookName(chat_name: 'current'): string | null;
declare function getWorldbook(worldbook_name: string): Promise<WorldbookEntry[]>;
declare function replaceWorldbook(
  worldbook_name: string,
  worldbook: PartialDeep<WorldbookEntry>[],
  options?: { render?: 'debounced' | 'immediate' },
): Promise<void>;

type WorldbookEntry = {
  uid: number;
  name: string;
  enabled: boolean;
  strategy: {
    type: 'constant' | 'selective' | 'vectorized';
    keys: (string | RegExp)[];
    keys_secondary: { logic: 'and_any' | 'and_all' | 'not_all' | 'not_any'; keys: (string | RegExp)[] };
    scan_depth: 'same_as_global' | number;
  };
  position: {
    type:
      | 'before_character_definition'
      | 'after_character_definition'
      | 'before_example_messages'
      | 'after_example_messages'
      | 'before_author_note'
      | 'after_author_note'
      | 'at_depth';
    role: 'system' | 'assistant' | 'user';
    depth: number;
    order: number;
  };
  content: string;
  probability: number;
  recursion: {
    prevent_incoming: boolean;
    prevent_outgoing: boolean;
    delay_until: null | number;
  };
  effect: {
    sticky: null | number;
    cooldown: null | number;
    delay: null | number;
  };
  extra?: Record<string, any>;
};

type PartialDeep<T> = {
  [P in keyof T]?: T[P] extends object ? PartialDeep<T[P]> : T[P];
};

declare global {
  interface Window {
    __DND_CHECK_AND_UPDATE_CHRONICLE__?: () => Promise<void>;
    checkAndUpdateChronicle?: () => Promise<void>;
  }
}

const WORLDBOOK_NAME = 'DND';
const ENTRY_NAME = '编年史';

function getChronicleWorldbookName(): string {
  return getChatWorldbookName('current') ?? WORLDBOOK_NAME;
}

function parseChronicleContent(content: string): Array<{ number: number; text: string }> {
  const entries: Array<{ number: number; text: string }> = [];
  const lines = content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  for (const line of lines) {
    const match = line.match(/^(\d+)\.(.+)$/);
    if (!match) {
      continue;
    }

    const number = parseInt(match[1], 10);
    const text = match[2].trim();
    if (!Number.isNaN(number) && text) {
      entries.push({ number, text });
    }
  }

  return entries;
}

function formatChronicleContent(entries: Array<{ number: number; text: string }>): string {
  entries.sort((a, b) => b.number - a.number);
  return entries.map(entry => `${entry.number}.${entry.text}`).join('\n\n');
}

function floorToEntryNumber(messageId: number): number {
  return Math.floor(messageId / 2) + 1;
}

/**
 * 解析消息中的 <summary> 标签
 * - 移除 <thinking> 和 <think> 及其完整闭合内容
 * - 若 <summary> 标签未闭合，则忽略并返回 null
 * - 取最后一个 <summary> 标签
 */
function parseSum(message: string): string | null {
  if (!message || typeof message !== 'string') {
    return null;
  }

  let cleaned = message.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '');
  cleaned = cleaned.replace(/<think>[\s\S]*?<\/redacted_reasoning>/gi, '');

  const unclosedThinkingStart = cleaned.search(/<thinking>/i);
  if (unclosedThinkingStart !== -1) {
    cleaned = cleaned.substring(0, unclosedThinkingStart);
  }

  const unclosedThinkStart = cleaned.search(/<think>/i);
  if (unclosedThinkStart !== -1) {
    cleaned = cleaned.substring(0, unclosedThinkStart);
  }

  const openCount = (cleaned.match(/<summary>/gi) || []).length;
  const closeCount = (cleaned.match(/<\/summary>/gi) || []).length;
  if (openCount !== closeCount) {
    return null;
  }

  const matches = cleaned.match(/<summary>([\s\S]*?)<\/summary>/gi);
  if (!matches || matches.length === 0) {
    return null;
  }

  const lastMatch = matches[matches.length - 1];
  const content = lastMatch.match(/<summary>([\s\S]*?)<\/summary>/i);
  return content?.[1]?.trim() || null;
}

/**
 * 从指定楼层开始向下查找最新的 <summary>
 */
function findLatestSumMessage(startMessageId: number): { messageId: number; sumText: string } | null {
  for (let messageId = startMessageId; messageId >= 0; messageId--) {
    try {
      const messages = getChatMessages(messageId);
      if (!messages || messages.length === 0) {
        continue;
      }

      const sumText = parseSum(String(messages[0]?.message ?? ''));
      if (sumText) {
        return { messageId, sumText };
      }
    } catch {
      continue;
    }
  }

  return null;
}

/**
 * 更新编年史内容
 * - 重 roll: 替换相同编号条目
 * - 读档: 清空编号 >= 当前条目编号的条目，但保留条目 1
 */
function updateChronicleEntry(content: string, entryNumber: number, entryText: string): string {
  const entries = parseChronicleContent(content);
  const existingIndex = entries.findIndex(entry => entry.number === entryNumber);

  if (existingIndex >= 0) {
    entries[existingIndex].text = entryText;
  } else {
    entries.push({ number: entryNumber, text: entryText });
  }

  const filteredEntries = entries.filter(entry => entry.number < entryNumber || entry.number === 1 || entry.number === entryNumber);
  return formatChronicleContent(filteredEntries);
}

async function updateChronicleInWorldbook(messageId: number, sumText: string): Promise<void> {
  const entryNumber = floorToEntryNumber(messageId);
  if (entryNumber <= 0) {
    console.warn(`[DND][chronicle] 楼层 ${messageId} 对应条目编号 ${entryNumber} 无效，跳过更新。`);
    return;
  }

  const worldbookName = getChronicleWorldbookName();
  let worldbook: WorldbookEntry[];

  try {
    worldbook = await getWorldbook(worldbookName);
  } catch (error) {
    console.warn(`[DND][chronicle] 世界书 "${worldbookName}" 不存在或读取失败，跳过更新。`, error);
    return;
  }

  const chronicleEntry = worldbook.find(entry => entry.name === ENTRY_NAME);
  if (!chronicleEntry) {
    console.warn(
      `[DND][chronicle] 世界书 "${worldbookName}" 中未找到条目 "${ENTRY_NAME}"，跳过更新。当前条目: ${
        worldbook.map(entry => entry.name).join(', ') || '(无)'
      }`,
    );
    return;
  }

  const updatedContent = updateChronicleEntry(chronicleEntry.content || '', entryNumber, sumText);
  const updatedWorldbook = worldbook.map(entry => (entry.name === ENTRY_NAME ? { ...entry, content: updatedContent } : entry));

  await replaceWorldbook(worldbookName, updatedWorldbook, { render: 'debounced' });
  console.info(
    `[DND][chronicle] 已更新世界书 "${worldbookName}" 中的编年史：${entryNumber}. ${sumText.slice(0, 60)}${
      sumText.length > 60 ? '...' : ''
    }`,
  );
}

export async function checkAndUpdateChronicle(): Promise<void> {
  try {
    const latestMessageId = getLastMessageId();
    console.info(`[DND][chronicle] 开始检查编年史，最新楼层=${latestMessageId}，世界书="${getChronicleWorldbookName()}"`);

    if (latestMessageId < 0) {
      console.warn('[DND][chronicle] 没有消息楼层，跳过编年史更新。');
      return;
    }

    const sumInfo = findLatestSumMessage(latestMessageId);
    if (!sumInfo) {
      console.info('[DND][chronicle] 未找到包含 <summary> 标签的消息，跳过编年史更新。');
      return;
    }

    console.info(`[DND][chronicle] 找到 <summary>，楼层=${sumInfo.messageId}，内容长度=${sumInfo.sumText.length}`);
    await updateChronicleInWorldbook(sumInfo.messageId, sumInfo.sumText);
  } catch (error) {
    console.error('[DND][chronicle] 检查并更新编年史失败:', error);
  }
}

export async function clearChronicleEntriesFromCurrentFloor(floor?: number): Promise<void> {
  const messageId = floor ?? getLastMessageId();
  if (messageId < 0) {
    console.warn('[DND][chronicle] 没有有效楼层，跳过编年史清理。');
    return;
  }

  const fromEntryNumber = floorToEntryNumber(messageId);
  const worldbookName = getChronicleWorldbookName();
  let worldbook: WorldbookEntry[];

  try {
    worldbook = await getWorldbook(worldbookName);
  } catch (error) {
    console.warn(`[DND][chronicle] 世界书 "${worldbookName}" 不存在或读取失败，跳过清理。`, error);
    return;
  }

  const chronicleEntry = worldbook.find(entry => entry.name === ENTRY_NAME);
  if (!chronicleEntry) {
    console.warn(`[DND][chronicle] 未找到条目 "${ENTRY_NAME}"，跳过清理。`);
    return;
  }

  const entries = parseChronicleContent(chronicleEntry.content || '');
  const keptEntries = entries.filter(entry => entry.number < fromEntryNumber || entry.number === 1);
  const updatedContent = formatChronicleContent(keptEntries);
  const updatedWorldbook = worldbook.map(entry => (entry.name === ENTRY_NAME ? { ...entry, content: updatedContent } : entry));

  await replaceWorldbook(worldbookName, updatedWorldbook, { render: 'debounced' });
  console.info(`[DND][chronicle] 已清除编号 >= ${fromEntryNumber} 的编年史条目，并保留条目 1。`);
}

window.__DND_CHECK_AND_UPDATE_CHRONICLE__ = checkAndUpdateChronicle;
window.checkAndUpdateChronicle = checkAndUpdateChronicle;
