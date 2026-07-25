export type ObservatoryMode = 'core' | 'atlas' | 'figures' | 'chronicle' | 'history' | 'prophecy' | 'vault';

export type RenderQuality = 'high' | 'balanced' | 'low';

export type RegionSculpture = 'emerald' | 'winter' | 'forest' | 'desert' | 'withered' | 'shadow' | 'sky';

export type LoreEntry = {
  uid: number;
  id: string;
  name: string;
  aliases: string[];
  content: string;
};

export type RegionLore = LoreEntry & {
  shortName: string;
  accent: string;
  sculpture: RegionSculpture;
};

export type LocationLore = LoreEntry & {
  region: string;
};

export type CoreNpcLore = LoreEntry;

export type LoreSearchResult = {
  kind: 'region' | 'location' | 'npc' | 'faction' | 'quest';
  id: string;
  name: string;
  eyebrow: string;
  excerpt: string;
};

export type OpeningStep = 'faith' | 'profession' | 'location' | 'assets';

export type OpeningOriginMode = 'wanderer' | 'arcane_disaster' | 'transmigrator';

export type OpeningConfig = {
  originMode: OpeningOriginMode;
  goldenFinger: string;
  profession: string;
  faith: string;
  location: string;
  subLocation: string;
  status: string;
  customItems: string;
  openingStory: string;
  currency: {
    gold: number;
    silver: number;
    copper: number;
  };
};
