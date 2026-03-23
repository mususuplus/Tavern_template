/**
 * 前端输出模式、界面主题与第二 API 配置
 * 存于 localStorage，键：aisela_vault_settings
 */

export type ApiMode = 'single' | 'multi';
export type UiTheme = 'classic' | 'evernight_forest' | 'cyberpunk';

export type SecondApiConfig = {
  url: string;
  apiKey: string;
  model: string;
  maxRetries: number;
  timeout: number;
};

export type VaultSettings = {
  apiMode: ApiMode;
  uiTheme: UiTheme;
  secondApi: SecondApiConfig;
};

const STORAGE_KEY = 'aisela_vault_settings';

const defaultSecondApi: SecondApiConfig = {
  url: '',
  apiKey: '',
  model: '',
  maxRetries: 3,
  timeout: 60000,
};

const defaults: VaultSettings = {
  apiMode: 'single',
  uiTheme: 'classic',
  secondApi: { ...defaultSecondApi },
};

function clampMaxRetries(n: number): number {
  if (typeof n !== 'number' || isNaN(n)) return 3;
  return Math.min(10, Math.max(0, Math.round(n)));
}

function clampTimeout(n: number): number {
  if (typeof n !== 'number' || isNaN(n) || n < 0) return 60000;
  return Math.min(300000, Math.max(5000, Math.round(n)));
}

function normalizeUiTheme(raw: unknown): UiTheme {
  if (raw === 'cyberpunk') return 'cyberpunk';
  return raw === 'evernight_forest' ? 'evernight_forest' : 'classic';
}

function normalizeSecondApi(raw: unknown): SecondApiConfig {
  if (!raw || typeof raw !== 'object') return { ...defaultSecondApi };
  const o = raw as Record<string, unknown>;
  return {
    url: typeof o.url === 'string' ? o.url : defaultSecondApi.url,
    apiKey: typeof o.apiKey === 'string' ? o.apiKey : defaultSecondApi.apiKey,
    model: typeof o.model === 'string' ? o.model : defaultSecondApi.model,
    maxRetries: clampMaxRetries(Number(o.maxRetries)),
    timeout: clampTimeout(Number(o.timeout)),
  };
}

export function loadVaultSettings(): VaultSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaults };
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return { ...defaults };
    const o = parsed as Record<string, unknown>;
    return {
      apiMode: o.apiMode === 'multi' ? 'multi' : 'single',
      uiTheme: normalizeUiTheme(o.uiTheme),
      secondApi: normalizeSecondApi(o.secondApi),
    };
  } catch {
    return { ...defaults };
  }
}

export function saveVaultSettings(settings: VaultSettings): void {
  const toSave: VaultSettings = {
    apiMode: settings.apiMode,
    uiTheme: normalizeUiTheme(settings.uiTheme),
    secondApi: {
      ...defaultSecondApi,
      ...settings.secondApi,
      maxRetries: clampMaxRetries(settings.secondApi.maxRetries),
      timeout: clampTimeout(settings.secondApi.timeout),
    },
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (e) {
    console.warn('[Aisela] 保存 vault 设置失败:', e);
  }
}



