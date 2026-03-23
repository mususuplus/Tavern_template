import type { SchemaType } from '../../schema';

export const ABILITY_KEYS = ['力量', '敏捷', '体质', '智力', '感知', '魅力'] as const;

export type AbilityKey = (typeof ABILITY_KEYS)[number];
export type DndData = SchemaType;

export function getAbilityModifier(score: number) {
  return Math.floor((score - 10) / 2);
}

export function formatModifier(score: number) {
  const modifier = getAbilityModifier(score);
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
}

export function getHpRatio(current: number, max: number) {
  if (max <= 0) {
    return 0;
  }
  return _.clamp((current / max) * 100, 0, 100);
}

export function getStatusTone(current: number, max: number) {
  const ratio = getHpRatio(current, max);
  if (ratio >= 70) {
    return 'stable';
  }
  if (ratio >= 35) {
    return 'worn';
  }
  return 'critical';
}

export function createRecordId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function createTimeLabel() {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
}

export function sortEntries<T>(record: Record<string, T>) {
  return _(record).entries().reverse().value();
}
