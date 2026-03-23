import type React from 'react';

import type { ConversationFlowItem, Option } from './utils/messageParser';

export type ModalType = 'map' | 'archives' | 'inventory' | 'quests' | 'social' | null;

export type GameStage = 'CLICK_TO_START' | 'TITLE' | 'LOADING' | 'OPENING' | 'GAME';

export type Currency = {
  gold: number;
  silver: number;
  copper: number;
  aether: number;
};

export type Teammate = {
  name: string;
  profession: string;
  hp: number;
  maxHp: number;
  status: string;
  avatar?: string;
};

export type NPC = {
  name: string;
  affinity: number;
  relation: string;
  description: string;
  stance?: string;
  temperature?: string;
  factionPull?: string;
};

export type InventoryItem = {
  name: string;
  quantity: number;
  description: string;
  quality: 'common' | 'rare' | 'epic' | 'legendary';
};

export type CurrentMessageInfo = {
  messageId?: number;
  userMessageId?: number;
  fullMessage?: string;
};

export type EditingMessage = {
  messageId: number;
  currentText: string;
  fullMessage: string;
};

export type LogEntry = {
  type: 'system' | 'narrative' | 'user';
  text: string;
};

export type StoryFlowState = {
  mainText: string;
  options: Option[];
  displayMessages: ConversationFlowItem[];
  tickerItems: string[];
  currentMessageInfo: CurrentMessageInfo;
};

export type StoryTickerItem = {
  category: '地点变化' | '势力动作' | '宿主异常' | '当前任务';
  text: string;
};

export type StorySummaryMeta = {
  raw: string;
  time?: string;
  location?: string;
  characters?: string;
  event?: string;
  tags: string[];
  worldTags: string[];
};

export type HostPhase = {
  code: string;
  name: string;
  label: string;
  short: string;
  description: string;
  omen: string;
  risk: string;
  nextTrigger: string;
  cost: string;
  intensityClass: string;
  accentColor: string;
};

export type RegionMeta = {
  name: string;
  short: string;
  title: string;
  summary: string;
  atmosphere: string;
  hazard: string;
  dominantFactions: string[];
  linkedProphecy: string;
  linkedGod: string;
  dominantCrisis: string;
  recommendedFocus: string;
  signatureAnomaly: string;
  factionTension: string;
  marker: React.CSSProperties;
  markerTone: string;
};

export type ReputationLevel = '友善' | '中立' | '冷淡' | '敌对' | '通缉' | '崇拜' | '盟友';
