import { useEffect, useRef, useState } from 'react';
import type { Dispatch, MouseEvent as ReactMouseEvent, SetStateAction, TouchEvent as ReactTouchEvent } from 'react';

import toastr from 'toastr';

import type { CurrentMessageInfo, EditingMessage, LogEntry } from '../types';
import {
  adjustMessageVisibility,
  AISELA_ASSISTANT_READY,
  applyVariableCommands,
  loadConversationFlow,
  parseMaintext,
  removeThinkingTags,
  validateHasMaintext,
  type ConversationFlowItem,
} from '../utils/messageParser';
import { checkAndUpdateChronicle } from '../utils/chronicleUpdater';
import { callSecondApiForVariable, mergeVariableBlockIntoMessage } from '../utils/secondApiVariable';
import { loadVaultSettings } from '../utils/vaultSettings';

type Params = {
  mainText: string;
  currentMessageInfo: CurrentMessageInfo;
  refreshMaintext: () => void;
  setDisplayMessages: Dispatch<SetStateAction<ConversationFlowItem[]>>;
  onBranchCreateDone: () => void;
};

const INITIAL_LOGS: LogEntry[] = [
  { type: 'system', text: '系统: 连接到世界... 时间同步完成。' },
  { type: 'narrative', text: '诸神沉默，预言苏醒，命运的齿轮缓慢转动。' },
  { type: 'narrative', text: '新的故事已经开始，你的每一步都会在这个世界留下痕迹。' },
];

function extractErrorMessage(raw: unknown): string | null {
  if (raw == null) return null;
  const text = String(raw).trim();
  if (!text) return null;

  try {
    const parsed = JSON.parse(text) as {
      error?: { message?: string };
      choices?: Array<{ finish_reason?: string; message?: { content?: string } }>;
    };
    if (parsed.error?.message) return parsed.error.message;
    const choice = parsed.choices?.[0];
    if (choice?.finish_reason === 'error' && choice.message?.content) return choice.message.content;
  } catch {
    // Ignore JSON parsing failure.
  }

  const match =
    text.match(/(?:message|"message")\s*:\s*"([^"]+)"/) ??
    text.match(/(?:message|'message')\s*:\s*'([^']+)'/);

  return match?.[1]?.trim() || null;
}

export function useMessageActions({
  mainText,
  currentMessageInfo,
  refreshMaintext,
  setDisplayMessages,
  onBranchCreateDone,
}: Params) {
  const [input, setInput] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);
  const [isSending, setIsSending] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [editingMessage, setEditingMessage] = useState<EditingMessage | null>(null);
  const longPressTimerRef = useRef<number | null>(null);

  const appendToInput = (text: string) => {
    setInput(prev => {
      const base = prev.trim();
      if (!base) return text;
      if (base.endsWith('，') || base.endsWith(',') || base.endsWith(' ')) return `${base}${text}`;
      return `${base}，${text}`;
    });
  };

  const finalizeAssistantMessage = async (rawReply: string) => {
    let cleanedReply = removeThinkingTags(rawReply);

    if (!validateHasMaintext(cleanedReply)) {
      throw new Error('生成结果格式无效，缺少 <maintext> 标签。');
    }

    const vault = loadVaultSettings();
    if (vault.apiMode === 'multi') {
      const variableBlock = await callSecondApiForVariable(parseMaintext(cleanedReply), vault);
      cleanedReply = mergeVariableBlockIntoMessage(cleanedReply, variableBlock);
    }

    await createChatMessages([{ role: 'assistant', message: cleanedReply }], { refresh: 'affected' });
    applyVariableCommands(cleanedReply);
    window.dispatchEvent(new CustomEvent(AISELA_ASSISTANT_READY));
    window.setTimeout(() => checkAndUpdateChronicle(), 500);
  };

  const rollbackOnReplyFailure = async (userMessageId: number | null, sentText: string, display: string) => {
    if (userMessageId != null) {
      try {
        await deleteChatMessages([userMessageId], { refresh: 'none' });
      } catch (error) {
        console.warn('[Aisela] 删除失败的用户消息时出错:', error);
      }
    }
    setInput(sentText);
    refreshMaintext();
    setLogs(prev => [...prev, { type: 'system', text: display }]);
    toastr.error(display, '生成失败', { timeOut: 8000, preventDuplicates: true });
  };

  const handleSend = async () => {
    const prompt = input.trim();
    if (!prompt || isSending) return;

    setInput('');
    setIsSending(true);

    let userMessageId: number | null = null;

    try {
      await adjustMessageVisibility();
      await createChatMessages([{ role: 'user', message: prompt }], { refresh: 'none' });
      userMessageId = getLastMessageId();
      setDisplayMessages(loadConversationFlow());

      const rawReply = await generate({ user_input: prompt });
      const replyText = String(rawReply ?? '').trim();
      const apiError = extractErrorMessage(replyText);

      if (!replyText) {
        throw new Error('生成返回为空，请稍后重试。');
      }
      if (apiError) {
        throw new Error(apiError);
      }

      await finalizeAssistantMessage(replyText);
      setLogs(prev => [...prev, { type: 'user', text: prompt }]);
    } catch (error) {
      const display = error instanceof Error ? error.message : String(error);
      await rollbackOnReplyFailure(userMessageId, prompt, display);
    } finally {
      setIsSending(false);
    }
  };

  const handleLongPressStart = (event: ReactMouseEvent | ReactTouchEvent) => {
    if (contextMenu || !mainText || currentMessageInfo.messageId == null || isSending) return;

    longPressTimerRef.current = window.setTimeout(() => {
      const point = 'touches' in event ? event.touches[0] : event;
      if (!point) return;
      setContextMenu({ x: point.clientX, y: point.clientY });
      longPressTimerRef.current = null;
    }, 500);
  };

  const handleLongPressEnd = () => {
    if (longPressTimerRef.current != null) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleRegenerate = async () => {
    if (currentMessageInfo.messageId == null || currentMessageInfo.userMessageId == null) {
      setContextMenu(null);
      return;
    }

    setContextMenu(null);
    setIsSending(true);

    try {
      const userMessages = getChatMessages(currentMessageInfo.userMessageId, { role: 'user' }) as Array<{ message?: string }>;
      const userPrompt = userMessages[0]?.message?.trim();
      if (!userPrompt) throw new Error('未找到可用于重掷的用户消息。');

      await deleteChatMessages([currentMessageInfo.messageId], { refresh: 'none' });
      const rawReply = await generate({ user_input: userPrompt });
      const replyText = String(rawReply ?? '').trim();
      const apiError = extractErrorMessage(replyText);

      if (!replyText) throw new Error('重掷返回为空。');
      if (apiError) throw new Error(apiError);

      await finalizeAssistantMessage(replyText);
    } catch (error) {
      const display = error instanceof Error ? error.message : String(error);
      setLogs(prev => [...prev, { type: 'system', text: `重掷失败: ${display}` }]);
      toastr.error(display, '重掷失败', { timeOut: 8000, preventDuplicates: true });
    } finally {
      setIsSending(false);
    }
  };

  const handleRollVariable = async () => {
    if (currentMessageInfo.messageId == null || !currentMessageInfo.fullMessage) {
      setContextMenu(null);
      return;
    }

    const vault = loadVaultSettings();
    if (vault.apiMode !== 'multi') {
      setContextMenu(null);
      return;
    }

    setContextMenu(null);
    setIsSending(true);

    try {
      const variableBlock = await callSecondApiForVariable(parseMaintext(currentMessageInfo.fullMessage), vault);
      const merged = mergeVariableBlockIntoMessage(currentMessageInfo.fullMessage, variableBlock);
      await setChatMessages([{ message_id: currentMessageInfo.messageId, message: merged }], { refresh: 'affected' });
      applyVariableCommands(merged);
      window.setTimeout(() => refreshMaintext(), 100);
    } catch (error) {
      const display = error instanceof Error ? error.message : String(error);
      setLogs(prev => [...prev, { type: 'system', text: `变量重掷失败: ${display}` }]);
      toastr.error(display, '变量重掷失败', { timeOut: 8000, preventDuplicates: true });
    } finally {
      setIsSending(false);
    }
  };

  const handleEdit = () => {
    if (currentMessageInfo.messageId == null || !currentMessageInfo.fullMessage) {
      setContextMenu(null);
      return;
    }

    const match = currentMessageInfo.fullMessage.match(/<maintext>([\s\S]*?)<\/maintext>/i);
    if (!match) {
      setContextMenu(null);
      return;
    }

    setEditingMessage({
      messageId: currentMessageInfo.messageId,
      currentText: match[1].trim(),
      fullMessage: currentMessageInfo.fullMessage,
    });
    setContextMenu(null);
  };

  const handleSaveEdit = async () => {
    if (!editingMessage) return;

    try {
      const nextMessage = editingMessage.fullMessage.replace(
        /<maintext>[\s\S]*?<\/maintext>/i,
        `<maintext>${editingMessage.currentText}</maintext>`,
      );

      await setChatMessages([{ message_id: editingMessage.messageId, message: nextMessage }], { refresh: 'affected' });
      setEditingMessage(null);
      window.setTimeout(() => refreshMaintext(), 100);
    } catch (error) {
      const display = error instanceof Error ? error.message : String(error);
      toastr.error(display, '保存失败', { timeOut: 8000, preventDuplicates: true });
    }
  };

  const handleBranchCreate = (messageId: number) => {
    triggerSlash(`/branch-create ${messageId}`).catch(error => {
      console.warn('[Aisela] branch-create 失败:', error);
    });
    onBranchCreateDone();
  };

  useEffect(() => {
    if (!contextMenu) return undefined;

    const handleClickOutside = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest('.maintext-context-menu') && !target?.closest('.maintext-container')) {
        setContextMenu(null);
      }
    };

    const timer = window.setTimeout(() => {
      document.addEventListener('click', handleClickOutside, true);
    }, 250);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, [contextMenu]);

  return {
    input,
    setInput,
    logs,
    isSending,
    contextMenu,
    setContextMenu,
    editingMessage,
    setEditingMessage,
    appendToInput,
    handleSend,
    handleLongPressStart,
    handleLongPressEnd,
    handleRegenerate,
    handleRollVariable,
    handleEdit,
    handleSaveEdit,
    handleBranchCreate,
  };
}
