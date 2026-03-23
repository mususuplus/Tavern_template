/**
 * DND 消息解析工具
 * 参考 Aisela 的 messageParser，实现对 assistant 消息中结构化标签的提取与变量更新。
 */

declare const _: typeof import('lodash');
declare const klona: <T>(value: T) => T;
declare function getLastMessageId(): number;
declare function getChatMessages(
  range: string | number,
  option?: { role?: 'all' | 'assistant' | 'system' | 'user' },
): Array<{ message: string; message_id: number; role: string; data?: Record<string, any> }>;
declare function updateVariablesWith(
  updater: (variables: Record<string, any>) => Record<string, any> | Promise<Record<string, any>>,
  option: { type: 'message'; message_id: number | 'latest' },
): Promise<Record<string, any>> | Record<string, any>;
declare function setChatMessages(
  chat_messages: Array<{ message_id: number; is_hidden?: boolean }>,
  option?: { refresh?: 'none' | 'affected' | 'all' },
): Promise<void>;

export const DND_ASSISTANT_READY = 'dnd_assistant_ready';

export interface Option {
  id: string;
  text: string;
}

export interface MissionItem {
  id: string;
  text: string;
}

export interface LatestMessageInfo {
  content: string;
  mission: string;
  summary: string;
  options: Option[];
  messageId: number | undefined;
  userMessageId: number | undefined;
  fullMessage: string | undefined;
}

export type ConversationFlowItem = { type: 'user' | 'narrative'; text: string };

const UPDATE_VARIABLE_BLOCK_REG = /<UpdateVariable>([\s\S]*?)<\/UpdateVariable>/i;
const JSON_PATCH_BLOCK_REG = /<JSONPatch>([\s\S]*?)<\/JSONPatch>/i;
const MAX_OPTIONS = 4;

export function removeThinkingTags(text: string): string {
  if (!text) {
    return '';
  }

  let result = text
    .replace(/<thinking>[\s\S]*?<\/thinking>/gi, '')
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/<think>[\s\S]*?<\/redacted_reasoning>/gi, '');

  const thinkStart = result.search(/<think>/i);
  if (thinkStart !== -1) {
    result = result.substring(0, thinkStart);
  }

  const thinkingStart = result.search(/<thinking>/i);
  if (thinkingStart !== -1) {
    result = result.substring(0, thinkingStart);
  }

  return result.trim();
}

const cleanForParse = (raw: string) => removeThinkingTags(raw ?? '');

function extractLastTagContent(text: string, tagName: string): string {
  if (!text) {
    return '';
  }

  const cleaned = cleanForParse(text);
  const reg = new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`, 'gi');
  const matches = cleaned.match(reg);
  if (!matches || matches.length === 0) {
    return '';
  }

  const lastMatch = matches[matches.length - 1];
  const content = lastMatch.match(new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`, 'i'));
  return content?.[1]?.trim() ?? '';
}

export function validateHasContent(cleanedMessage: string): boolean {
  return /<content>[\s\S]*?<\/content>/i.test(cleanedMessage ?? '') || /<maintext>[\s\S]*?<\/maintext>/i.test(cleanedMessage ?? '');
}

export async function adjustMessageVisibility(): Promise<void> {
  const lastId = getLastMessageId();
  if (lastId < 30) {
    return;
  }

  const hideUpTo = lastId - 15;
  if (hideUpTo < 0) {
    return;
  }

  const toHide = _.range(0, hideUpTo + 1).map(message_id => ({ message_id, is_hidden: true }));
  await setChatMessages(toHide, { refresh: 'affected' });
}

export function parseContent(messageContent: string): string {
  return extractLastTagContent(messageContent, 'content') || extractLastTagContent(messageContent, 'maintext');
}

export function parseMission(messageContent: string): string {
  return extractLastTagContent(messageContent, 'mission');
}

export function parseSummary(messageContent: string): string {
  return extractLastTagContent(messageContent, 'summary') || extractLastTagContent(messageContent, 'sum');
}

export function parseUpdateVariable(messageContent: string): string {
  return extractLastTagContent(messageContent, 'UpdateVariable');
}

export function buildFinalAssistantMessage(messageContent: string): string {
  const cleaned = cleanForParse(messageContent);
  const content = parseContent(cleaned);
  const mission = parseMission(cleaned);
  const summary = parseSummary(cleaned);
  const updateVariable = parseUpdateVariable(cleaned);

  const blocks = [
    content ? `<content>${content}</content>` : '',
    mission ? `<mission>${mission}</mission>` : '',
    summary ? `<summary>${summary}</summary>` : '',
    updateVariable ? `<UpdateVariable>${updateVariable}</UpdateVariable>` : '',
  ].filter(Boolean);

  return blocks.join('\n\n');
}

export function parseMissionItems(messageContent: string): MissionItem[] {
  const missionText = parseMission(messageContent);
  if (!missionText) {
    return [];
  }

  const lines = missionText
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);

  const result: MissionItem[] = [];
  let currentItem: string[] = [];

  for (const line of lines) {
    if (/^([A-Z]|\d+)[.:：]\s*/.test(line)) {
      if (currentItem.length > 0) {
        const text = currentItem.join('\n');
        const match = text.match(/^([A-Z]|\d+)[.:：]/);
        result.push({
          id: match?.[1] ?? `${result.length + 1}`,
          text: text.replace(/^([A-Z]|\d+)[.:：]\s*/, '').trim(),
        });
        currentItem = [];
      }
      currentItem.push(line);
    } else if (currentItem.length > 0) {
      currentItem.push(line);
    } else {
      result.push({
        id: `${result.length + 1}`,
        text: line,
      });
    }
  }

  if (currentItem.length > 0) {
    const text = currentItem.join('\n');
    const match = text.match(/^([A-Z]|\d+)[.:：]/);
    result.push({
      id: match?.[1] ?? `${result.length + 1}`,
      text: text.replace(/^([A-Z]|\d+)[.:：]\s*/, '').trim(),
    });
  }

  return result;
}

export function parseOptions(messageContent: string): Option[] {
  if (!messageContent) {
    return [];
  }

  const cleaned = cleanForParse(messageContent);
  const optionWithIdRegex = /<option id="([^"]+)">([^<]+)<\/option>/g;
  const optionsWithId: Option[] = [];
  let match: RegExpExecArray | null;

  while ((match = optionWithIdRegex.exec(cleaned)) !== null) {
    optionsWithId.push({ id: match[1], text: match[2].trim() });
  }
  if (optionsWithId.length > 0) {
    return optionsWithId;
  }

  const optionText = extractLastTagContent(cleaned, 'option');
  if (!optionText) {
    return [];
  }

  const lines = optionText
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);

  const optionPattern = /^[A-Z][.:：]\s*/;
  const hasLetterPrefix = lines.some(line => optionPattern.test(line));

  if (hasLetterPrefix) {
    const options: Option[] = [];
    let currentOption: string[] = [];

    for (const line of lines) {
      if (optionPattern.test(line)) {
        if (currentOption.length > 0) {
          const text = currentOption.join('\n');
          const id = text.match(/^([A-Z])[.:：]/)?.[1] ?? String.fromCharCode(65 + options.length);
          options.push({ id, text: text.replace(/^[A-Z][.:：]\s*/, '').trim() });
          currentOption = [];
        }
        currentOption.push(line);
      } else if (currentOption.length > 0) {
        currentOption.push(line);
      }
    }

    if (currentOption.length > 0) {
      const text = currentOption.join('\n');
      const id = text.match(/^([A-Z])[.:：]/)?.[1] ?? String.fromCharCode(65 + options.length);
      options.push({ id, text: text.replace(/^[A-Z][.:：]\s*/, '').trim() });
    }

    return options;
  }

  return lines.map((line, index) => ({
    id: String.fromCharCode(65 + index),
    text: line,
  }));
}

export function loadFromLatestMessage(): Pick<LatestMessageInfo, 'content' | 'mission' | 'summary' | 'options'> {
  try {
    const lastMessageId = getLastMessageId();
    if (lastMessageId < 0) {
      return { content: '', mission: '', summary: '', options: [] };
    }

    const raw =
      getChatMessages(lastMessageId, { role: 'assistant' })?.[0]?.message ??
      getChatMessages(lastMessageId)?.[0]?.message ??
      '';

    return {
      content: parseContent(raw),
      mission: parseMission(raw),
      summary: parseSummary(raw),
      options: parseOptions(raw).slice(0, MAX_OPTIONS),
    };
  } catch (error) {
    console.error('❌ [DND messageParser] 加载最新消息失败:', error);
    return { content: '', mission: '', summary: '', options: [] };
  }
}

export function loadFromLatestMessageExtended(): LatestMessageInfo {
  try {
    const lastMessageId = getLastMessageId();
    if (lastMessageId < 0) {
      return {
        content: '',
        mission: '',
        summary: '',
        options: [],
        messageId: undefined,
        userMessageId: undefined,
        fullMessage: undefined,
      };
    }

    const raw =
      getChatMessages(lastMessageId, { role: 'assistant' })?.[0]?.message ??
      getChatMessages(lastMessageId)?.[0]?.message ??
      '';

    return {
      content: parseContent(raw),
      mission: parseMission(raw),
      summary: parseSummary(raw),
      options: parseOptions(raw).slice(0, MAX_OPTIONS),
      messageId: lastMessageId,
      userMessageId: lastMessageId - 1 >= 0 ? lastMessageId - 1 : undefined,
      fullMessage: raw || undefined,
    };
  } catch (error) {
    console.error('❌ [DND messageParser] loadFromLatestMessageExtended:', error);
    return {
      content: '',
      mission: '',
      summary: '',
      options: [],
      messageId: undefined,
      userMessageId: undefined,
      fullMessage: undefined,
    };
  }
}

export function loadContentFromLatestMessage(): string {
  return loadFromLatestMessage().content;
}

export function loadAllFloorsForReading(): Array<{ messageId: number; content: string; summary: string; mission: string }> {
  try {
    const lastId = getLastMessageId();
    if (lastId < 0) {
      return [];
    }

    const messages = getChatMessages(`0-${lastId}`, { role: 'assistant' });
    return messages
      .map(message => ({
        messageId: message.message_id,
        content: parseContent(message.message || ''),
        summary: parseSummary(message.message || ''),
        mission: parseMission(message.message || ''),
      }))
      .filter(item => item.content.length > 0 || item.summary.length > 0 || item.mission.length > 0);
  } catch (error) {
    console.error('❌ [DND messageParser] loadAllFloorsForReading:', error);
    return [];
  }
}

export function loadConversationFlow(): ConversationFlowItem[] {
  try {
    const lastId = getLastMessageId();
    if (lastId < 0) {
      return [];
    }

    const messages = getChatMessages(`0-${lastId}`);
    const items: ConversationFlowItem[] = [];

    for (const message of messages) {
      const role = (message.role || '').toLowerCase();
      const raw = (message.message || '').trim();
      if (role === 'user' && raw.length > 0) {
        items.push({ type: 'user', text: raw });
        continue;
      }

      if (role === 'assistant') {
        const content = parseContent(raw);
        if (content.length > 0) {
          items.push({ type: 'narrative', text: content });
        }
      }
    }

    return items;
  } catch (error) {
    console.error('❌ [DND messageParser] loadConversationFlow:', error);
    return [];
  }
}

function jsonPointerToPath(pointer: string): string[] {
  if (!pointer || pointer === '/') {
    return [];
  }

  return pointer
    .replace(/^\/+/, '')
    .split('/')
    .map(seg => seg.replace(/~1/g, '/').replace(/~0/g, '~'));
}

type JsonPatchOp = { op: string; path?: string; from?: string; to?: string; value?: unknown };

function applyOneOp(obj: Record<string, any>, op: JsonPatchOp): void {
  const pathArr = op.path != null ? jsonPointerToPath(op.path) : [];
  const fromArr = op.from != null ? jsonPointerToPath(op.from) : [];
  const toArr = op.to != null ? jsonPointerToPath(op.to) : [];

  switch (op.op) {
    case 'replace':
      if (pathArr.length) {
        _.set(obj, pathArr, op.value);
      }
      break;
    case 'delta': {
      if (!pathArr.length) {
        break;
      }
      const currentValue = _.get(obj, pathArr);
      const delta = Number(op.value);
      _.set(obj, pathArr, (typeof currentValue === 'number' ? currentValue : 0) + delta);
      break;
    }
    case 'insert': {
      if (!pathArr.length) {
        break;
      }
      if (op.path === '-' || pathArr[pathArr.length - 1] === '-') {
        const parentPath = pathArr.slice(0, -1);
        const parent = parentPath.length ? _.get(obj, parentPath) : obj;
        if (Array.isArray(parent)) {
          parent.push(op.value);
        } else {
          _.set(obj, pathArr, op.value);
        }
      } else {
        _.set(obj, pathArr, op.value);
      }
      break;
    }
    case 'remove':
      if (pathArr.length) {
        _.unset(obj, pathArr);
      }
      break;
    case 'move':
      if (fromArr.length && toArr.length) {
        const value = _.get(obj, fromArr);
        _.unset(obj, fromArr);
        _.set(obj, toArr, value);
      }
      break;
    default:
      break;
  }
}

export function applyVariableCommands(rawAssistantMessage: string): void {
  const blockMatch = rawAssistantMessage.match(UPDATE_VARIABLE_BLOCK_REG) ?? rawAssistantMessage.match(JSON_PATCH_BLOCK_REG);
  const block = blockMatch ? blockMatch[1].trim() : '';
  const patchMatch = block.match(JSON_PATCH_BLOCK_REG);
  const patchRaw = patchMatch ? patchMatch[1].trim() : block;

  if (!patchRaw) {
    return;
  }

  let list: JsonPatchOp[];
  try {
    list = JSON.parse(patchRaw) as JsonPatchOp[];
  } catch (error) {
    console.warn('❌ [DND messageParser] <JSONPatch> 解析失败:', error);
    return;
  }

  if (!Array.isArray(list) || list.length === 0) {
    return;
  }

  const variableOption = { type: 'message' as const, message_id: getLastMessageId() };
  updateVariablesWith(vars => {
    const copy = klona(vars);
    for (const op of list) {
      try {
        applyOneOp(copy, op);
      } catch (error) {
        console.warn('[DND messageParser] 应用单条 JSON Patch 失败:', op, error);
      }
    }
    return copy;
  }, variableOption);
}
