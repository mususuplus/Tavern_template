import { CORE_NPC_LORE, LOCATION_LORE, REGION_LORE } from './loreData';
import type { CoreNpcLore, LocationLore, LoreEntry, LoreSearchResult, RegionLore } from '../types';

export type LoreLine = {
  depth: number;
  kind: 'heading' | 'bullet' | 'text';
  label?: string;
  value: string;
};

export function normalizeLoreTerm(value: string) {
  return value
    .normalize('NFKC')
    .toLocaleLowerCase('zh-CN')
    .replace(/[\s·•（）()《》「」『』【】\u005b\u005d—–_.,，。:：'"“”‘’/\\-]/g, '');
}

export function stripLoreEnvelope(content: string) {
  return content
    .replace(/^<[^>]+>\s*/u, '')
    .replace(/\s*<\/[^>]+>\s*$/u, '')
    .trim();
}

export function parseLoreLines(content: string): LoreLine[] {
  const lines = stripLoreEnvelope(content).split(/\r?\n/u);
  const parsed: LoreLine[] = [];
  lines.forEach((raw, index) => {
    const indent = raw.match(/^\s*/u)?.[0].length ?? 0;
    const trimmed = raw.trim();
    if (!trimmed || (index === 0 && trimmed.endsWith(':'))) return;

    const depth = Math.min(3, Math.floor(indent / 2));
    const bullet = trimmed.match(/^[-•]\s*(.+)$/u);
    if (bullet) {
      parsed.push({ depth, kind: 'bullet', value: bullet[1] });
      return;
    }

    const separator = trimmed.indexOf(':');
    if (separator > 0) {
      const label = trimmed.slice(0, separator).trim();
      const value = trimmed.slice(separator + 1).trim();
      parsed.push({ depth, kind: value ? 'text' : 'heading', label, value });
      return;
    }

    parsed.push({ depth, kind: 'text', value: trimmed });
  });
  return parsed;
}

export function selectLoreSections(content: string, sectionNames: string[]) {
  const wanted = new Set(sectionNames.map(normalizeLoreTerm));
  const selected: LoreLine[] = [];
  let active = false;
  let activeDepth = Number.POSITIVE_INFINITY;

  parseLoreLines(content).forEach(line => {
    if (line.kind === 'heading') {
      const isWanted = Boolean(line.label && wanted.has(normalizeLoreTerm(line.label)));
      if (isWanted) {
        active = true;
        activeDepth = line.depth;
        selected.push(line);
        return;
      }
      if (active && line.depth <= activeDepth) active = false;
    }
    if (active) selected.push(line);
  });

  return selected;
}

export function loreExcerpt(content: string, maxLength = 118) {
  const text = parseLoreLines(content)
    .map(line => [line.label, line.value].filter(Boolean).join('：'))
    .join(' · ');
  return text.length > maxLength ? `${text.slice(0, maxLength).trim()}…` : text;
}

export function loreField(content: string, field: string) {
  const target = normalizeLoreTerm(field);
  const line = parseLoreLines(content).find(item => item.label && normalizeLoreTerm(item.label) === target);
  return line?.value ?? '';
}

function entryTerms(entry: LoreEntry) {
  return [entry.name, ...entry.aliases].map(normalizeLoreTerm).filter(Boolean);
}

function entryMatches(entry: LoreEntry, rawValue: string) {
  const value = normalizeLoreTerm(rawValue);
  if (!value) return false;
  return entryTerms(entry).some(
    term => term === value || (term.length >= 3 && value.includes(term)) || (value.length >= 3 && term.includes(value)),
  );
}

export function resolveLocation(rawLocation: string): LocationLore | undefined {
  return [...LOCATION_LORE]
    .sort((a, b) => normalizeLoreTerm(b.name).length - normalizeLoreTerm(a.name).length)
    .find(location => entryMatches(location, rawLocation));
}

export function resolveRegion(rawLocation: string): RegionLore | undefined {
  const location = resolveLocation(rawLocation);
  if (location) return REGION_LORE.find(region => region.name === location.region);
  return REGION_LORE.find(region => entryMatches(region, rawLocation));
}

export function resolveCoreNpc(rawName: string): CoreNpcLore | undefined {
  return CORE_NPC_LORE.find(npc => entryMatches(npc, rawName));
}

function searchEntry(entry: LoreEntry, query: string) {
  const haystack = normalizeLoreTerm([entry.name, ...entry.aliases, stripLoreEnvelope(entry.content)].join(' '));
  return haystack.includes(query);
}

function publicNpcText(entry: CoreNpcLore) {
  return selectLoreSections(entry.content, ['基本信息', '外貌识别', '外貌'])
    .map(line => [line.label, line.value].filter(Boolean).join('：'))
    .join(' · ');
}

export function searchLore(rawQuery: string): LoreSearchResult[] {
  const query = normalizeLoreTerm(rawQuery);
  if (!query) return [];

  const regions = REGION_LORE.filter(entry => searchEntry(entry, query)).map(entry => ({
    kind: 'region' as const,
    id: entry.id,
    name: entry.name,
    eyebrow: '区域卷宗',
    excerpt: loreExcerpt(entry.content),
  }));
  const locations = LOCATION_LORE.filter(entry => searchEntry(entry, query)).map(entry => ({
    kind: 'location' as const,
    id: entry.id,
    name: entry.name,
    eyebrow: entry.region,
    excerpt: loreExcerpt(entry.content),
  }));
  const npcs = CORE_NPC_LORE.filter(entry =>
    normalizeLoreTerm([entry.name, ...entry.aliases, publicNpcText(entry)].join(' ')).includes(query),
  ).map(entry => {
    const publicText = publicNpcText(entry);
    return {
      kind: 'npc' as const,
      id: entry.id,
      name: entry.name,
      eyebrow: loreField(entry.content, '身份') || '传奇人物',
      excerpt: publicText.length > 118 ? `${publicText.slice(0, 118).trim()}…` : publicText,
    };
  });

  return [...regions, ...locations, ...npcs].slice(0, 18);
}
