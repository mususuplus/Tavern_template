import { Settings, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import type { ApiMode, SecondApiConfig, UiTheme, VaultSettings } from '../utils/vaultSettings';
import { loadVaultSettings, saveVaultSettings } from '../utils/vaultSettings';
import { setWorldbookForMultiApiMode, setWorldbookForSingleApiMode } from '../utils/worldbookApiMode';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onThemeChange?: (theme: UiTheme) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onThemeChange }) => {
  const [apiMode, setApiMode] = useState<ApiMode>('single');
  const [uiTheme, setUiTheme] = useState<UiTheme>('classic');
  const [secondApi, setSecondApi] = useState<SecondApiConfig>({
    url: '',
    apiKey: '',
    model: '',
    maxRetries: 3,
    timeout: 60000,
  });
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'ok' | 'fail'>('idle');
  const [modelList, setModelList] = useState<string[]>([]);
  const [modelListLoading, setModelListLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const s = loadVaultSettings();
      setApiMode(s.apiMode);
      setUiTheme(s.uiTheme);
      setSecondApi(s.secondApi);
      setTestStatus('idle');
      setModelList([]);
    }
  }, [isOpen]);

  const handleSave = () => {
    const settings: VaultSettings = { apiMode, uiTheme, secondApi };
    saveVaultSettings(settings);
    onClose();
  };

  const handleApiModeChange = async (mode: ApiMode) => {
    setApiMode(mode);
    if (mode === 'multi') {
      await setWorldbookForMultiApiMode();
    } else {
      await setWorldbookForSingleApiMode();
    }
  };

  const handleThemeSelect = (theme: UiTheme) => {
    setUiTheme(theme);
    onThemeChange?.(theme);
    const latest = loadVaultSettings();
    saveVaultSettings({ ...latest, uiTheme: theme });
  };

  const getModelListApi =
    typeof window !== 'undefined' && window.TavernHelper?.getModelList ? window.TavernHelper.getModelList : null;

  const handleTestConnection = async () => {
    if (!secondApi.url?.trim()) {
      setTestStatus('fail');
      return;
    }
    if (!getModelListApi) {
      setTestStatus('fail');
      return;
    }
    setTestStatus('testing');
    try {
      const list = await getModelListApi({
        apiurl: secondApi.url.trim(),
        key: secondApi.apiKey || undefined,
      });
      setTestStatus(Array.isArray(list) && list.length > 0 ? 'ok' : 'fail');
    } catch {
      setTestStatus('fail');
    }
  };

  const handleGetModels = async () => {
    if (!secondApi.url?.trim() || !getModelListApi) return;
    setModelListLoading(true);
    setModelList([]);
    try {
      const list = await getModelListApi({
        apiurl: secondApi.url.trim(),
        key: secondApi.apiKey || undefined,
      });
      setModelList(Array.isArray(list) ? list : []);
    } catch (e) {
      console.warn('[Aisela] 获取模型列表失败:', e);
      setModelList([]);
    } finally {
      setModelListLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="box-sketch bg-parchment-50 rounded-sm w-full max-w-[calc(100vw-1rem)] sm:max-w-2xl max-h-[90vh] flex flex-col border border-ink-500/20 shadow-xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-ink-500/10 px-3 sm:px-5 py-2.5 sm:py-3 shrink-0">
          <h2 className="font-display font-bold text-base sm:text-lg text-ink-700 flex items-center gap-2 truncate">
            <Settings className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            设置
          </h2>
          <button type="button" onClick={onClose} className="p-1 rounded hover:bg-ink-500/10 text-ink-500 shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 sm:p-5 overflow-y-auto space-y-4 sm:space-y-6 min-h-0">
          {/* 界面风格 */}
          <section>
            <h3 className="font-display font-semibold text-ink-700 mb-2">界面风格</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleThemeSelect('classic')}
                className={`text-left p-3 rounded-sm border transition-colors ${
                  uiTheme === 'classic'
                    ? 'border-rust-500/50 bg-rust-500/10'
                    : 'border-ink-500/20 bg-parchment-100 hover:bg-parchment-200'
                }`}
              >
                <div className="font-medium text-ink-700">经典羊皮卷</div>
                <p className="text-xs text-ink-500 mt-1">保留当前米白纸张与古典手稿风格</p>
              </button>
              <button
                type="button"
                onClick={() => handleThemeSelect('evernight_forest')}
                className={`text-left p-3 rounded-sm border transition-colors ${
                  uiTheme === 'evernight_forest'
                    ? 'border-emerald-500/60 bg-emerald-500/10'
                    : 'border-ink-500/20 bg-parchment-100 hover:bg-parchment-200'
                }`}
              >
                <div className="font-medium text-ink-700">永夜森林</div>
                <p className="text-xs text-ink-500 mt-1">冷绿夜色、藤蔓与林影，偏精灵秘境氛围</p>
              </button>
              <button
                type="button"
                onClick={() => handleThemeSelect('cyberpunk')}
                className={`text-left p-3 rounded-sm border transition-colors ${
                  uiTheme === 'cyberpunk'
                    ? 'border-yellow-400/70 bg-cyan-400/10'
                    : 'border-ink-500/20 bg-parchment-100 hover:bg-parchment-200'
                }`}
              >
                <div className="font-medium text-ink-700">赛博朋克</div>
                <p className="text-xs text-ink-500 mt-1">黑金霓虹、HUD 扫描线与高密度都市夜景质感</p>
              </button>
            </div>
          </section>

          {/* 输出模式 */}
          <section className="border-t border-ink-500/10 pt-4">
            <h3 className="font-display font-semibold text-ink-700 mb-2">输出模式</h3>
            <div className="space-y-3">
              <label className="flex gap-3 items-start cursor-pointer">
                <input
                  type="radio"
                  name="apiMode"
                  checked={apiMode === 'single'}
                  onChange={() => handleApiModeChange('single')}
                  className="mt-1"
                />
                <div>
                  <span className="font-medium text-ink-600">单API模式</span>
                  <p className="text-sm text-ink-500 mt-0.5">一次输出完整生成剧情+变量</p>
                </div>
              </label>
              <label className="flex gap-3 items-start cursor-pointer">
                <input
                  type="radio"
                  name="apiMode"
                  checked={apiMode === 'multi'}
                  onChange={() => handleApiModeChange('multi')}
                  className="mt-1"
                />
                <div>
                  <span className="font-medium text-ink-600">多API模式</span>
                  <p className="text-sm text-ink-500 mt-0.5">主API输出剧情，第二API单独处理变量更新和其他更新</p>
                  <p className="text-sm text-red-500 mt-0.5">特别注意：用了这个虽然变量更新更好了，但是生成速度会变慢</p>
                </div>
              </label>
            </div>
          </section>

          {/* 第二 API 配置（仅多 API 时显示） */}
          {apiMode === 'multi' && (
            <section className="border-t border-ink-500/10 pt-4">
              <h3 className="font-display font-semibold text-ink-700 mb-3">第二 API 配置</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-ink-600 mb-1">API URL（兼容 OpenAI 格式）</label>
                  <input
                    type="url"
                    value={secondApi.url}
                    onChange={e => setSecondApi(prev => ({ ...prev, url: e.target.value }))}
                    className="w-full px-3 py-2 border border-ink-500/20 rounded-sm bg-parchment-100 text-ink-700"
                    placeholder="https://api.openai.com/v1"
                  />
                </div>
                <div>
                  <label className="block text-sm text-ink-600 mb-1">API Key</label>
                  <input
                    type="password"
                    value={secondApi.apiKey}
                    onChange={e => setSecondApi(prev => ({ ...prev, apiKey: e.target.value }))}
                    className="w-full px-3 py-2 border border-ink-500/20 rounded-sm bg-parchment-100 text-ink-700"
                    placeholder="sk-..."
                    autoComplete="off"
                  />
                </div>
                <div>
                  <label className="block text-sm text-ink-600 mb-1">模型</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={secondApi.model}
                      onChange={e => setSecondApi(prev => ({ ...prev, model: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-ink-500/20 rounded-sm bg-parchment-100 text-ink-700"
                      placeholder="gpt-4 或从下方获取"
                    />
                    <button
                      type="button"
                      onClick={handleGetModels}
                      disabled={modelListLoading || !secondApi.url?.trim() || !getModelListApi}
                      title={getModelListApi ? undefined : '需在酒馆助手中加载界面后可用'}
                      className="px-3 py-2 border border-ink-500/20 rounded-sm hover:bg-ink-500/5 disabled:opacity-50 text-sm"
                    >
                      {modelListLoading ? '获取中…' : '获取可用模型'}
                    </button>
                  </div>
                  {modelList.length > 0 && (
                    <select
                      className="mt-2 w-full px-3 py-2 border border-ink-500/20 rounded-sm bg-parchment-100 text-ink-700"
                      value={secondApi.model}
                      onChange={e => setSecondApi(prev => ({ ...prev, model: e.target.value }))}
                    >
                      <option value="">请选择模型</option>
                      {modelList.map(m => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-ink-600 mb-1">最大重试次数（0-10）</label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={secondApi.maxRetries}
                    onChange={e =>
                      setSecondApi(prev => ({
                        ...prev,
                        maxRetries: Math.min(10, Math.max(0, parseInt(e.target.value, 10) || 0)),
                      }))
                    }
                    className="w-24 px-3 py-2 border border-ink-500/20 rounded-sm bg-parchment-100 text-ink-700"
                  />
                </div>
                <div>
                  <label className="block text-sm text-ink-600 mb-1">超时（毫秒）</label>
                  <input
                    type="number"
                    min={5000}
                    max={300000}
                    step={1000}
                    value={secondApi.timeout}
                    onChange={e =>
                      setSecondApi(prev => ({
                        ...prev,
                        timeout: Math.min(300000, Math.max(5000, parseInt(e.target.value, 10) || 60000)),
                      }))
                    }
                    className="w-32 px-3 py-2 border border-ink-500/20 rounded-sm bg-parchment-100 text-ink-700"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={!secondApi.url?.trim() || testStatus === 'testing' || !getModelListApi}
                    title={getModelListApi ? undefined : '需在酒馆助手中加载界面后可用'}
                    className="px-4 py-2 border border-ink-500/20 rounded-sm hover:bg-ink-500/5 disabled:opacity-50"
                  >
                    {testStatus === 'testing' ? '测试中…' : '连接测试'}
                  </button>
                  {testStatus === 'ok' && <span className="text-green-600 text-sm">连接成功</span>}
                  {testStatus === 'fail' && <span className="text-red-600 text-sm">连接失败</span>}
                </div>
              </div>
            </section>
          )}
        </div>

        <div className="flex flex-col gap-2 p-3 sm:p-5 border-t border-ink-500/10 shrink-0">
          <p className="text-xs text-ink-500 text-right">
            界面版本 v{__BUILD_VERSION__} · 构建于 {__BUILD_TIME__.slice(0, 10)}
          </p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 sm:px-4 py-2 border border-ink-500/20 text-ink-600 rounded-sm hover:bg-ink-500/10 text-sm sm:text-base"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-3 sm:px-4 py-2 bg-rust-500 text-parchment-50 rounded-sm hover:bg-rust-600 text-sm sm:text-base"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;



