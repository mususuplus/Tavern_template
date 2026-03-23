import { useEffect, useState } from 'react';

import {
  AISELA_ASSISTANT_READY,
  loadConversationFlow,
  loadFromLatestMessageExtended,
  parseSum,
  parseSumMeta,
  type ConversationFlowItem,
  type Option,
} from '../utils/messageParser';
import type { CurrentMessageInfo, GameStage, StorySummaryMeta, StoryTickerItem } from '../types';

export function useStoryFlow(gameStage: GameStage) {
  const [mainText, setMainText] = useState('');
  const [options, setOptions] = useState<Option[]>([]);
  const [displayMessages, setDisplayMessages] = useState<ConversationFlowItem[]>([]);
  const [tickerItems, setTickerItems] = useState<StoryTickerItem[]>([]);
  const [latestSummaryMeta, setLatestSummaryMeta] = useState<StorySummaryMeta | null>(null);
  const [currentMessageInfo, setCurrentMessageInfo] = useState<CurrentMessageInfo>({});

  const refreshMaintext = () => {
    const result = loadFromLatestMessageExtended();
    setMainText(result.maintext);
    setOptions(result.options);
    setDisplayMessages(loadConversationFlow());
    setCurrentMessageInfo({
      messageId: result.messageId,
      userMessageId: result.userMessageId,
      fullMessage: result.fullMessage,
    });
    const sumText = parseSum(result.fullMessage ?? '');
    setLatestSummaryMeta(parseSumMeta(sumText));
    setTickerItems([]);
  };

  useEffect(() => {
    if (gameStage === 'GAME') {
      refreshMaintext();
    }
  }, [gameStage]);

  useEffect(() => {
    const onAssistantReady = () => refreshMaintext();
    window.addEventListener(AISELA_ASSISTANT_READY, onAssistantReady);
    return () => window.removeEventListener(AISELA_ASSISTANT_READY, onAssistantReady);
  }, []);

  return {
    mainText,
    options,
    setOptions,
    displayMessages,
    setDisplayMessages,
    tickerItems,
    setTickerItems,
    latestSummaryMeta,
    currentMessageInfo,
    refreshMaintext,
  };
}
