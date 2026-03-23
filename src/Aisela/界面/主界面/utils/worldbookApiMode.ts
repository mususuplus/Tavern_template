/**
 * 根据输出模式（单 API / 多 API）切换世界书中与变量相关的条目启用状态
 * 多 API 模式：关闭变量相关条目，只开启「多api输出格式」
 * 单 API 模式：开启变量相关条目，关闭「多api输出格式」
 */

/** 世界书名称（与编年史一致；当前聊天未绑定世界书时使用此名称） */
const WORLDBOOK_NAME = '艾瑟兰 · 奥法之灾';

function getWorldbookName(): string {
  return getChatWorldbookName('current') ?? WORLDBOOK_NAME;
}

/** 多 API 模式下需要关闭的条目名称 */
const MULTI_API_DISABLE_ENTRY_NAMES = [
  '[mvu_update]变量更新规则',
  '变量列表',
  '[mvu_update]变量输出格式',
  '单api输出格式',
] as const;

/** 多 API 模式下需要开启的条目名称 */
const MULTI_API_ENABLE_ENTRY_NAME = '多api输出格式';

/** 单 API 模式下需要开启的条目名称（即多 API 关闭的那批，不含「多api输出格式」） */
const SINGLE_API_ENABLE_ENTRY_NAMES = [
  '[mvu_update]变量更新规则',
  '变量列表',
  '[mvu_update]变量输出格式',
  '单api输出格式',
] as const;

/**
 * 切换到多 API 模式：关闭上述 4 个变量相关条目，开启「多api输出格式」
 */
export async function setWorldbookForMultiApiMode(): Promise<void> {
  const worldbookName = getWorldbookName();
  try {
    const worldbook = await getWorldbook(worldbookName);
    const updated = worldbook.map((entry) => {
      if (MULTI_API_DISABLE_ENTRY_NAMES.includes(entry.name as any)) {
        return { ...entry, enabled: false };
      }
      if (entry.name === MULTI_API_ENABLE_ENTRY_NAME) {
        return { ...entry, enabled: true };
      }
      return entry;
    });
    await replaceWorldbook(worldbookName, updated, { render: 'debounced' });
    console.info('[Aisela] 已切换世界书为多 API 模式');
  } catch (e) {
    console.warn('[Aisela] 切换世界书多 API 模式失败:', e);
  }
}

/**
 * 切换到单 API 模式：开启上述 4 个变量相关条目，关闭「多api输出格式」
 */
export async function setWorldbookForSingleApiMode(): Promise<void> {
  const worldbookName = getWorldbookName();
  try {
    const worldbook = await getWorldbook(worldbookName);
    const updated = worldbook.map((entry) => {
      if (SINGLE_API_ENABLE_ENTRY_NAMES.includes(entry.name as any)) {
        return { ...entry, enabled: true };
      }
      if (entry.name === MULTI_API_ENABLE_ENTRY_NAME) {
        return { ...entry, enabled: false };
      }
      return entry;
    });
    await replaceWorldbook(worldbookName, updated, { render: 'debounced' });
    console.info('[Aisela] 已切换世界书为单 API 模式');
  } catch (e) {
    console.warn('[Aisela] 切换世界书单 API 模式失败:', e);
  }
}

/** 拼第二 API 提示时从世界书读取的条目（不含「变量列表」，变量列表改为直接读最新酒馆变量） */
const VARIABLE_ENTRY_NAMES = [
  '[mvu_update]变量更新规则',
  '[mvu_update]变量输出格式',
] as const;

/**
 * 从当前聊天世界书中读取变量相关条目的 content，用于拼成第二 API 的提示
 */
export async function getVariablePromptFromWorldbook(): Promise<string> {
  const worldbookName = getWorldbookName();
  try {
    const worldbook = await getWorldbook(worldbookName);
    const parts: string[] = [];
    for (const name of VARIABLE_ENTRY_NAMES) {
      const entry = worldbook.find((e) => e.name === name);
      if (entry?.content?.trim()) parts.push(entry.content.trim());
    }
    return parts.join('\n\n---\n\n');
  } catch (e) {
    console.warn('[Aisela] 读取世界书变量条目失败:', e);
    return '';
  }
}
