/**
 * 编年史更新工具
 * 从消息中提取 <sum> 标签并更新世界书中的编年史条目
 * 条目编号：Math.floor(楼层号 / 2) + 1
 */

/** 编年史所在世界书名称（与酒馆中世界书名称完全一致） */
const WORLDBOOK_NAME = '艾瑟兰 · 奥法之灾';
/** 编年史条目在世界书中的名称 */
const ENTRY_NAME = '编年史';

function getChronicleWorldbookName(): string {
  return WORLDBOOK_NAME;
}

/**
 * 解析消息中的 <sum> 标签
 * - 移除所有 <thinking> 和 <think> 标签及其内容
 * - 若有未闭合的 <sum>/</sum> 则返回 null
 * - 提取最后一个 <sum> 标签的内容
 */
function parseSum(message: string): string | null {
  if (!message || typeof message !== 'string') return null;

  let cleaned = message.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '');
  cleaned = cleaned.replace(/<think>[\s\S]*?<\/redacted_reasoning>/gi, '');

  const openCount = (cleaned.match(/<sum>/gi) || []).length;
  const closeCount = (cleaned.match(/<\/sum>/gi) || []).length;
  if (openCount !== closeCount) {
    return null;
  }

  const matches = cleaned.match(/<sum>([\s\S]*?)<\/sum>/gi);
  if (!matches || matches.length === 0) return null;

  const lastMatch = matches[matches.length - 1];
  const content = lastMatch.match(/<sum>([\s\S]*?)<\/sum>/i);
  return content ? content[1].trim() : null;
}

/**
 * 从指定楼层开始向下查找包含 <sum> 的消息
 * @param startMessageId 起始楼层号（从该楼层开始向楼层号减小方向查找）
 * @returns 找到的楼层号和 <sum> 内容，未找到返回 null
 */
function findLatestSumMessage(startMessageId: number): { messageId: number; sumText: string } | null {
  for (let messageId = startMessageId; messageId >= 0; messageId--) {
    try {
      const messages = getChatMessages(messageId);
      if (messages && messages.length > 0) {
        const msg = messages[0];
        if (msg && 'message' in msg && msg.message) {
          const raw = String(msg.message);
          const sumText = parseSum(raw);
          if (sumText !== null && sumText !== '') {
            return { messageId, sumText };
          }
        }
      }
    } catch (e) {
      continue;
    }
  }
  return null;
}

/**
 * 解析编年史内容，提取所有条目（格式：数字.文本）
 */
function parseChronicleContent(content: string): Array<{ number: number; text: string }> {
  const entries: Array<{ number: number; text: string }> = [];
  const lines = content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  for (const line of lines) {
    const match = line.match(/^(\d+)\.(.+)$/);
    if (match) {
      const number = parseInt(match[1], 10);
      const text = match[2].trim();
      if (!isNaN(number) && text) {
        entries.push({ number, text });
      }
    }
  }
  return entries;
}

/**
 * 格式化编年史内容（按编号倒序，最新在上）
 */
function formatChronicleContent(entries: Array<{ number: number; text: string }>): string {
  entries.sort((a, b) => b.number - a.number);
  return entries.map(entry => `${entry.number}.${entry.text}`).join('\n\n');
}

/**
 * 根据楼层号计算编年史条目编号
 */
function floorToEntryNumber(messageId: number): number {
  return Math.floor(messageId / 2) + 1;
}

/**
 * 更新编年史条目
 * - 重roll：替换相同编号的条目
 * - 读档：清空编号 >= 当前条目编号的条目，但保留条目 1，再写入当前条目
 */
function updateChronicleEntry(content: string, entryNumber: number, entryText: string): string {
  const entries = parseChronicleContent(content);

  const existingIndex = entries.findIndex(e => e.number === entryNumber);
  if (existingIndex >= 0) {
    entries[existingIndex].text = entryText;
  } else {
    entries.push({ number: entryNumber, text: entryText });
  }

  const filteredEntries = entries.filter(e => e.number < entryNumber || e.number === 1 || e.number === entryNumber);
  return formatChronicleContent(filteredEntries);
}

/**
 * 更新世界书中的编年史条目
 */
async function updateChronicleInWorldbook(messageId: number, sumText: string): Promise<void> {
  const entryNumber = floorToEntryNumber(messageId);
  if (entryNumber <= 0) {
    console.warn(`[编年史] 楼层 ${messageId} 的条目编号 ${entryNumber} 无效，跳过更新`);
    return;
  }

  const worldbookName = getChronicleWorldbookName();
  let worldbook: Awaited<ReturnType<typeof getWorldbook>>;
  try {
    worldbook = await getWorldbook(worldbookName);
  } catch (err) {
    console.warn(`[编年史] 世界书 "${worldbookName}" 不存在或获取失败，跳过更新:`, err);
    return;
  }

  const chronicleEntry = worldbook.find(entry => entry.name === ENTRY_NAME);
  if (!chronicleEntry) {
    console.warn(
      `[编年史] 世界书 "${worldbookName}" 中未找到条目 "${ENTRY_NAME}"，跳过更新。当前世界书条目名: ${worldbook.map(e => e.name).join(', ') || '(无)'}`,
    );
    return;
  }

  const currentContent = chronicleEntry.content || '';
  const updatedContent = updateChronicleEntry(currentContent, entryNumber, sumText);

  const updatedWorldbook = worldbook.map(entry =>
    entry.name === ENTRY_NAME ? { ...entry, content: updatedContent } : entry,
  );

  await replaceWorldbook(worldbookName, updatedWorldbook, { render: 'debounced' });
  console.info(
    `[编年史] 已更新 世界书="${worldbookName}" 条目=${entryNumber}. ${sumText.slice(0, 50)}${sumText.length > 50 ? '…' : ''}`,
  );
}

/**
 * 检查并更新编年史
 * 从最新楼层开始向下查找包含 <sum> 的消息，然后更新编年史
 */
export async function checkAndUpdateChronicle(): Promise<void> {
  try {
    const latestMessageId = getLastMessageId();
    console.info(`[编年史] 开始检查 最新楼层=${latestMessageId} 将使用世界书="${getChronicleWorldbookName()}"`);
    if (latestMessageId < 0) {
      console.warn('[编年史] 没有消息楼层，跳过更新');
      return;
    }

    const sumInfo = findLatestSumMessage(latestMessageId);
    if (!sumInfo) {
      try {
        const latestMessages = getChatMessages(latestMessageId);
        const snippet =
          latestMessages?.[0] && 'message' in latestMessages[0]
            ? String((latestMessages[0] as { message?: string }).message ?? '').slice(0, 200)
            : '(无)';
        console.info(
          `[编年史] 未找到包含 <sum> 的消息（从楼层 ${latestMessageId} 向下查）。最新楼层消息预览: ${snippet}${snippet.length >= 200 ? '…' : ''}`,
        );
      } catch {
        console.info('[编年史] 未找到包含 <sum> 的消息，跳过更新');
      }
      return;
    }

    console.info(`[编年史] 找到 <sum> 楼层=${sumInfo.messageId} 内容长度=${sumInfo.sumText.length}`);
    await updateChronicleInWorldbook(sumInfo.messageId, sumInfo.sumText);
  } catch (error) {
    console.error('[编年史] 检查并更新失败:', error);
  }
}

/**
 * 清除编年史中编号 >= 当前楼层对应条目数的条目（保留条目 1）
 * 用于读档/回溯时避免历史编年史对当前情节的锚定
 * @param floor 楼层号，不传则使用当前最新楼层
 */
export async function clearChronicleEntriesFromCurrentFloor(floor?: number): Promise<void> {
  const messageId = floor ?? getLastMessageId();
  if (messageId < 0) {
    console.warn('[编年史] 无有效楼层，跳过清除');
    return;
  }

  const fromEntryNumber = floorToEntryNumber(messageId);

  const worldbookName = getChronicleWorldbookName();
  let worldbook: Awaited<ReturnType<typeof getWorldbook>>;
  try {
    worldbook = await getWorldbook(worldbookName);
  } catch (err) {
    console.warn(`[编年史] 世界书 "${worldbookName}" 不存在，跳过清除:`, err);
    return;
  }

  const chronicleEntry = worldbook.find(entry => entry.name === ENTRY_NAME);
  if (!chronicleEntry) {
    console.warn(`[编年史] 未找到条目 "${ENTRY_NAME}"，跳过清除`);
    return;
  }

  const entries = parseChronicleContent(chronicleEntry.content || '');
  const kept = entries.filter(e => e.number < fromEntryNumber || e.number === 1);
  const updatedContent = formatChronicleContent(kept);

  const updatedWorldbook = worldbook.map(entry =>
    entry.name === ENTRY_NAME ? { ...entry, content: updatedContent } : entry,
  );

  await replaceWorldbook(worldbookName, updatedWorldbook, { render: 'debounced' });
  console.info(`[编年史] 已清除编号 >= ${fromEntryNumber} 的条目（保留条目 1）`);
}
