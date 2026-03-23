<template>
  <main class="dashboard" :class="{ 'dashboard--fullscreen': isFullscreen }">
    <section class="top-strip">
      <div class="top-strip__meta">
        <article class="mini-stat mini-stat--wide">
          <span>场景</span>
          <strong>{{ data.剧情.当前场景 }}</strong>
        </article>
        <button type="button" class="utility-button" @click="openUtilityModal">其他功能区</button>
      </div>
      <div class="top-strip__actions">
        <button type="button" class="fullscreen-button" @click="toggleFullscreen">
          {{ isFullscreen ? '退出全屏' : '全屏显示' }}
        </button>
      </div>
    </section>

    <section class="reading-layout">
      <aside class="reading-layout__left">
        <section class="summary-card character-card">
          <header class="summary-card__header">
            <p class="panel-kicker">Character</p>
            <h2>{{ data.角色.姓名 }}</h2>
            <p class="character-card__meta">{{ data.角色.种族 }} {{ data.角色.职业 }} · Lv.{{ data.角色.等级 }}</p>
          </header>

          <div class="hero-health">
            <div class="hero-health__row">
              <span>生命值</span>
              <strong>{{ data.角色.生命值 }}/{{ data.角色.生命上限 }}</strong>
            </div>
            <div class="bar"><i :style="{ width: `${hpRatio}%` }"></i></div>
            <article class="hero-health__row">
              <span>金币</span>
              <strong>{{ data.资源.金币 }}</strong>
            </article>
          </div>

          <div class="character-card__stats">
            <article class="chip-card">
              <span>AC</span>
              <strong>{{ data.角色.护甲等级 }}</strong>
            </article>
            <article class="chip-card">
              <span>速度</span>
              <strong>{{ data.角色.速度 }} ft</strong>
            </article>
            <article class="chip-card">
              <span>临时生命</span>
              <strong>{{ data.角色.临时生命 }}</strong>
            </article>
            <article class="chip-card">
              <span>法术位</span>
              <strong>{{ data.资源.法术位摘要 }}</strong>
            </article>
          </div>

          <div class="ability-grid">
            <article v-for="key in ABILITY_KEYS" :key="key" class="ability-card">
              <span>{{ key }}</span>
              <strong>{{ data.角色.能力值[key] }}</strong>
              <em>{{ formatModifier(data.角色.能力值[key]) }}</em>
            </article>
          </div>

          <article class="copy-block">
            <span>背景札记</span>
            <p>{{ data.角色.背景 }}</p>
          </article>
        </section>
      </aside>

      <section class="reading-layout__center">
        <article class="play-shell">
          <header class="play-header">
            <div>
              <p class="panel-kicker">Narrative</p>
              <h2>正文阅读区</h2>
              <p class="play-summary">在这里直接输入行动、提问或推进剧情，AI 回复会同步更新到正文区域。</p>
            </div>
            <div class="status-pill" :class="{ 'status-pill--busy': isGenerating }">
              {{ isGenerating ? '同步生成中' : '交互就绪' }}
            </div>
          </header>

          <div class="play-body">
            <section ref="transcriptRef" class="transcript">
              <article
                v-for="(entry, index) in displayEntries"
                :key="entry.id ?? index"
                class="transcript-entry"
                :class="`transcript-entry--${entry.role}`"
              >
                <div class="entry-meta">
                  <span class="entry-role">{{ roleLabelMap[entry.role] }}</span>
                  <span class="entry-time">{{ entry.time }}</span>
                  <span v-if="entry.state !== '完成'" class="entry-state">{{ entry.state }}</span>
                </div>
                <h3 v-if="entry.title">{{ entry.title }}</h3>
                <p>{{ entry.content || '等待内容...' }}</p>
              </article>
            </section>

            <form class="composer" @submit.prevent="submitPrompt">
              <label class="composer-label" for="main-panel-prompt">输入区域</label>
              <textarea
                id="main-panel-prompt"
                v-model="draft"
                class="composer-input"
                rows="5"
                :disabled="isGenerating"
                placeholder="输入行动、对白、追问或你希望 AI 接续的剧情。"
              />
              <div class="composer-footer">
                <div class="quick-actions">
                  <button type="button" class="ghost-button" :disabled="isGenerating" @click="fillScenePrompt">
                    带入当前场景
                  </button>
                  <button type="button" class="ghost-button" :disabled="isGenerating" @click="fillTacticalPrompt">
                    请求战术建议
                  </button>
                  <button type="button" class="ghost-button" :disabled="isGenerating" @click="fillRoleplayPrompt">
                    继续剧情正文
                  </button>
                </div>
                <button type="submit" class="send-button" :disabled="isSubmitDisabled">
                  {{ isGenerating ? '生成中...' : '发送给 AI' }}
                </button>
              </div>
            </form>
          </div>
        </article>
      </section>

      <aside class="reading-layout__right">
        <Bg3DicePanel />
      </aside>
    </section>

    <div
      v-if="isUtilityModalOpen"
      class="utility-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="utility-modal-title"
      @click.self="closeUtilityModal"
    >
      <section class="utility-modal__panel">
        <header class="utility-modal__header">
          <div>
            <p class="panel-kicker">Utility</p>
            <h2 id="utility-modal-title">其他功能区</h2>
          </div>
          <button type="button" class="utility-modal__close" @click="closeUtilityModal">关闭</button>
        </header>

        <nav class="utility-modal__nav" aria-label="其他功能分页">
          <button
            v-for="tab in utilityTabs"
            :key="tab.key"
            type="button"
            class="utility-modal__tab"
            :class="{ 'utility-modal__tab--active': activeUtilityTab === tab.key }"
            @click="activeUtilityTab = tab.key"
          >
            {{ tab.label }}
          </button>
        </nav>

        <div class="utility-modal__body">
          <section v-if="activeUtilityTab === 'overview'" class="utility-pane utility-pane--overview">
            <section class="summary-card utility-card">
              <header class="summary-card__header">
                <p class="panel-kicker">Party</p>
                <h2>小队速览</h2>
              </header>
              <div class="compact-list">
                <article v-for="[name, member] in partyEntries" :key="name" class="compact-card">
                  <div class="compact-card__head">
                    <strong>{{ name }}</strong>
                    <span>{{ member.职责 }}</span>
                  </div>
                  <p>{{ member.状态 }} · HP {{ member.当前生命 }}/{{ member.生命上限 }}</p>
                </article>
              </div>
            </section>

            <section class="summary-card utility-card">
              <header class="summary-card__header">
                <p class="panel-kicker">Story Tools</p>
                <h2>剧情速览</h2>
              </header>
              <div class="compact-list">
                <article v-for="[name, quest] in questEntries.slice(0, 3)" :key="name" class="compact-card">
                  <div class="compact-card__head">
                    <strong>{{ name }}</strong>
                    <span>{{ quest.状态 }}</span>
                  </div>
                  <p>{{ quest.目标 }}</p>
                </article>
                <article v-for="[id, clue] in clueEntries.slice(0, 2)" :key="id" class="compact-card">
                  <div class="compact-card__head">
                    <strong>{{ id }}</strong>
                  </div>
                  <p>{{ clue }}</p>
                </article>
              </div>
            </section>
          </section>

          <section v-else-if="activeUtilityTab === 'character'" class="utility-pane">
            <CharacterPanel />
          </section>

          <section v-else-if="activeUtilityTab === 'story'" class="utility-pane">
            <StoryPanel />
          </section>

          <section v-else class="utility-pane">
            <PartyPanel />
          </section>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { ABILITY_KEYS, createRecordId, createTimeLabel, formatModifier, getHpRatio } from '../shared/model';
import { useDndData } from '../shared/useDndData';
import { checkAndUpdateChronicle } from '../../utils/chronicleUpdater';
import {
  applyVariableCommands,
  buildFinalAssistantMessage,
  DND_ASSISTANT_READY,
  loadConversationFlow,
  parseContent,
  removeThinkingTags,
  validateHasContent,
  type ConversationFlowItem,
} from '../../utils/messageParser';
import Bg3DicePanel from './components/Bg3DicePanel.vue';
import CharacterPanel from './components/CharacterPanel.vue';
import PartyPanel from './components/PartyPanel.vue';
import StoryPanel from './components/StoryPanel.vue';

declare function createChatMessages(
  messages: Array<{ role: 'assistant' | 'system' | 'user'; message: string; data?: Record<string, any> }>,
  options?: { refresh?: 'none' | 'affected' | 'all' },
): Promise<void>;
declare function deleteChatMessages(message_ids: number[], options?: { refresh?: 'none' | 'affected' | 'all' }): Promise<void>;
declare function getLastMessageId(): number;
declare function generate(config: { generation_id?: string; user_input?: string; should_stream?: boolean }): Promise<string>;

type DisplayEntry = {
  id: string;
  role: 'user' | 'assistant';
  title: string;
  content: string;
  time: string;
  state: '完成' | '生成中' | '失败';
};

const { data, clueEntries, partyEntries, questEntries } = useDndData();

const draft = ref('');
const isGenerating = ref(false);
const isFullscreen = ref(Boolean(document.fullscreenElement));
const transcriptRef = ref<HTMLElement | null>(null);
const activeGenerationId = ref<string | null>(null);
const activeGenerationTime = ref('');
const displayMessages = ref<ConversationFlowItem[]>([]);
const streamingPreview = ref('');
const isUtilityModalOpen = ref(false);
const activeUtilityTab = ref<'overview' | 'character' | 'story' | 'party'>('overview');
const stopHandles: Array<() => void> = [];

const hpRatio = computed(() => getHpRatio(data.value.角色.生命值, data.value.角色.生命上限));
const isSubmitDisabled = computed(() => isGenerating.value || draft.value.trim().length === 0);
const utilityTabs = [
  { key: 'overview', label: '概览' },
  { key: 'character', label: '角色与资源' },
  { key: 'story', label: '剧情与变量' },
  { key: 'party', label: '小队与战术' },
] as const;

const roleLabelMap: Record<'user' | 'assistant', string> = {
  user: '玩家输入',
  assistant: 'AI 正文',
};

const displayEntries = computed<DisplayEntry[]>(() => {
  const entries = displayMessages.value.map((entry, index) => ({
    id: `chat-${index}`,
    role: entry.type === 'user' ? 'user' : 'assistant',
    title: entry.type === 'user' ? '玩家行动' : 'AI 响应',
    content: entry.text,
    time: '',
    state: '完成' as const,
  }));

  if (isGenerating.value) {
    entries.push({
      id: activeGenerationId.value ?? 'streaming-assistant',
      role: 'assistant',
      title: 'AI 响应',
      content: streamingPreview.value,
      time: activeGenerationTime.value,
      state: '生成中',
    });
  }

  return entries;
});

function scrollToLatest() {
  nextTick(() => {
    if (!transcriptRef.value) {
      return;
    }
    transcriptRef.value.scrollTop = transcriptRef.value.scrollHeight;
  });
}

function refreshTranscript() {
  displayMessages.value = loadConversationFlow();
}

function getStreamingPreview(rawText: string): string {
  const content = parseContent(rawText);
  if (content) {
    return content;
  }

  return removeThinkingTags(rawText)
    .replace(/<\/?[^>]+>/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

function fillScenePrompt() {
  draft.value = `当前场景是“${data.value.剧情.当前场景}”。请结合场景摘要、小队状态与现有线索，为我续写下一段正文，并给出可执行的下一步行动。`;
}

function fillTacticalPrompt() {
  draft.value = '基于当前生命值、资源和任务状态，请给出一份简洁的战术建议，包含风险判断与推荐行动顺序。';
}

function fillRoleplayPrompt() {
  draft.value = `请延续当前冒险的正文表现，保持 DND 风格，结合“${data.value.剧情.当前场景}”与现有线索、任务状态，自然推进接下来的遭遇或抉择。`;
}

function openUtilityModal() {
  isUtilityModalOpen.value = true;
}

function closeUtilityModal() {
  isUtilityModalOpen.value = false;
}

async function submitPrompt() {
  const prompt = draft.value.trim();
  if (!prompt || isGenerating.value) {
    return;
  }

  const generationId = createRecordId('generation');
  let userMessageId: number | null = null;

  activeGenerationId.value = generationId;
  activeGenerationTime.value = createTimeLabel();
  streamingPreview.value = '';
  isGenerating.value = true;
  draft.value = '';

  try {
    await createChatMessages([{ role: 'user', message: prompt }], { refresh: 'none' });
    userMessageId = getLastMessageId();
    refreshTranscript();
    scrollToLatest();

    const result = await generate({
      generation_id: generationId,
      user_input: prompt,
      should_stream: true,
    });

    const finalMessage = buildFinalAssistantMessage(result);
    if (!validateHasContent(finalMessage)) {
      throw new Error('生成结果缺少 <content> 标签，无法写入正文区域。');
    }

    await createChatMessages([{ role: 'assistant', message: finalMessage }], { refresh: 'affected' });
    applyVariableCommands(finalMessage);
    await checkAndUpdateChronicle();
    window.dispatchEvent(new CustomEvent(DND_ASSISTANT_READY));
    refreshTranscript();
  } catch (error) {
    if (userMessageId != null) {
      try {
        await deleteChatMessages([userMessageId], { refresh: 'none' });
      } catch (deleteError) {
        console.warn('[DND] 删除失败的用户消息时出错:', deleteError);
      }
    }
    refreshTranscript();
    console.error('[DND] 发送请求失败:', error);
  } finally {
    if (activeGenerationId.value === generationId) {
      activeGenerationId.value = null;
      activeGenerationTime.value = '';
      streamingPreview.value = '';
      isGenerating.value = false;
    }
    scrollToLatest();
  }
}

async function toggleFullscreen() {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen?.();
      return;
    }

    await document.documentElement.requestFullscreen?.();
  } catch (error) {
    console.warn('切换全屏失败', error);
  }
}

onMounted(() => {
  refreshTranscript();

  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && isUtilityModalOpen.value) {
      closeUtilityModal();
    }
  };

  const handleFullscreenChange = () => {
    isFullscreen.value = Boolean(document.fullscreenElement);
  };

  document.addEventListener('keydown', handleKeydown);
  document.addEventListener('fullscreenchange', handleFullscreenChange);

  const streamHandle = eventOn(iframe_events.STREAM_TOKEN_RECEIVED_FULLY, (fullText, generationId) => {
    if (generationId !== activeGenerationId.value) {
      return;
    }

    streamingPreview.value = getStreamingPreview(String(fullText ?? ''));
    scrollToLatest();
  });

  const endHandle = eventOn(iframe_events.GENERATION_ENDED, (text, generationId) => {
    if (generationId !== activeGenerationId.value) {
      return;
    }

    streamingPreview.value = getStreamingPreview(String(text ?? ''));
    scrollToLatest();
  });

  const handleAssistantReady = () => {
    refreshTranscript();
    scrollToLatest();
  };

  window.addEventListener(DND_ASSISTANT_READY, handleAssistantReady);

  stopHandles.push(
    streamHandle.stop,
    endHandle.stop,
    () => window.removeEventListener(DND_ASSISTANT_READY, handleAssistantReady),
    () => document.removeEventListener('keydown', handleKeydown),
    () => document.removeEventListener('fullscreenchange', handleFullscreenChange),
  );
});

onBeforeUnmount(() => {
  stopHandles.forEach(stop => stop());
});

watch(
  () => displayEntries.value.length,
  () => {
    scrollToLatest();
  },
);
</script>

<style scoped lang="scss">
.dashboard {
  width: min(1520px, 100%);
  margin: 0 auto;
  display: grid;
  gap: 16px;
}

.dashboard--fullscreen {
  height: 100vh;
  padding: 12px;
  grid-template-rows: auto minmax(0, 1fr);
}

.top-strip,
.top-strip__meta,
.reading-layout,
.reading-layout__left,
.reading-layout__center,
.reading-layout__right,
.summary-card,
.summary-card__header,
.character-card__stats,
.ability-grid,
.play-shell,
.play-header,
.play-body,
.transcript-entry,
.composer,
.utility-pane,
.utility-pane--overview,
.utility-modal__body,
.compact-list,
.compact-card,
.utility-modal__nav {
  display: grid;
}

.top-strip,
.summary-card,
.play-shell,
.utility-modal__panel {
  border: 1px solid var(--dnd-border);
  background:
    radial-gradient(circle at top left, rgba(215, 169, 91, 0.08), transparent 28%),
    linear-gradient(180deg, rgba(56, 40, 29, 0.9), rgba(24, 18, 14, 0.96)),
    var(--dnd-panel);
  box-shadow: var(--dnd-shadow);
}

.top-strip {
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 16px;
  align-items: center;
  padding: 18px 20px;
}

.top-strip__meta {
  grid-template-columns: minmax(0, 1fr) auto auto;
  gap: 12px;
  align-items: stretch;
  min-width: 0;
}

.top-strip__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

.panel-kicker,
.entry-role,
.entry-state,
.composer-label,
.mini-stat span,
.chip-card span,
.ability-card span,
.copy-block span,
.compact-card__head span {
  margin: 0;
  color: var(--dnd-text-soft);
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.play-header h2,
.summary-card__header h2,
.transcript-entry h3,
.utility-modal__header h2 {
  margin: 0;
  font-family: var(--dnd-font-display);
}

.play-summary,
.compact-card p,
.copy-block p {
  margin: 0;
  line-height: 1.7;
  color: rgba(244, 231, 206, 0.88);
}

.mini-stat {
  display: grid;
  gap: 6px;
  align-content: center;
  min-width: 0;
}

.mini-stat--wide strong {
  display: block;
  max-width: min(36vw, 420px);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.fullscreen-button,
.utility-button,
.utility-modal__close,
.utility-modal__tab {
  border: 1px solid rgba(215, 169, 91, 0.3);
  background: rgba(255, 255, 255, 0.04);
  color: var(--dnd-text);
  padding: 10px 14px;
  cursor: pointer;
  transition:
    transform 160ms ease,
    border-color 160ms ease,
    background 160ms ease;
}

.fullscreen-button:hover,
.utility-button:hover,
.utility-modal__close:hover,
.utility-modal__tab:hover {
  transform: translateY(-1px);
  border-color: rgba(215, 169, 91, 0.55);
  background: rgba(215, 169, 91, 0.12);
}

.chip-card,
.ability-card,
.compact-card,
.copy-block {
  padding: 12px 14px;
  border: 1px solid var(--dnd-border-soft);
  background: rgba(8, 6, 5, 0.3);
}

.mini-stat strong,
.chip-card strong,
.ability-card strong,
.compact-card strong,
.character-card__meta {
  font-family: var(--dnd-font-display);
}

.reading-layout {
  grid-template-columns: minmax(280px, 0.85fr) minmax(0, 1.6fr) minmax(300px, 0.95fr);
  gap: 16px;
  align-items: start;
}

.dashboard--fullscreen .reading-layout {
  min-height: 0;
  align-items: stretch;
}

.reading-layout__left,
.reading-layout__right {
  position: sticky;
  top: 12px;
}

.dashboard--fullscreen .reading-layout__left,
.dashboard--fullscreen .reading-layout__center,
.dashboard--fullscreen .reading-layout__right {
  min-height: 0;
}

.dashboard--fullscreen .reading-layout__left,
.dashboard--fullscreen .reading-layout__right {
  top: 0;
}

.reading-layout__right {
  align-content: start;
}

.summary-card,
.play-shell {
  gap: 16px;
  padding: 18px;
}

.dashboard--fullscreen .character-card,
.dashboard--fullscreen .play-shell {
  height: 100%;
  min-height: 0;
}

.dashboard--fullscreen .character-card {
  overflow: auto;
}

.summary-card__header {
  gap: 6px;
}

.character-card__meta {
  margin: 0;
  color: var(--dnd-text-soft);
}

.hero-health {
  display: grid;
  gap: 8px;
}

.hero-health__row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: baseline;
}

.bar {
  height: 8px;
  background: rgba(0, 0, 0, 0.22);
}

.bar i {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #cf8f46, #e9ca77);
}

.character-card__stats {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.ability-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.ability-card {
  place-items: center;
  text-align: center;
  gap: 4px;
}

.ability-card em {
  color: var(--dnd-accent);
  font-style: normal;
}

.copy-block {
  gap: 8px;
}

.play-header {
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 14px;
  align-items: start;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(215, 169, 91, 0.16);
}

.status-pill {
  padding: 8px 12px;
  border: 1px solid rgba(109, 157, 110, 0.4);
  color: #cfe8c3;
  background: rgba(72, 102, 64, 0.22);
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.status-pill--busy {
  border-color: rgba(215, 169, 91, 0.52);
  color: #f2dfb9;
  background: rgba(141, 79, 43, 0.22);
}

.play-body {
  gap: 14px;
}

.dashboard--fullscreen .play-body {
  min-height: 0;
  grid-template-rows: minmax(0, 1fr) auto;
}

.transcript {
  display: grid;
  gap: 12px;
}

.dashboard--fullscreen .transcript {
  min-height: 0;
  overflow: auto;
  padding-right: 6px;
}

.transcript-entry {
  gap: 8px;
  padding: 18px 20px;
  border-left: 3px solid rgba(215, 169, 91, 0.35);
  background: rgba(9, 7, 6, 0.3);
}

.transcript-entry--assistant {
  border-left-color: rgba(215, 169, 91, 0.92);
  background: linear-gradient(90deg, rgba(215, 169, 91, 0.08), rgba(9, 7, 6, 0.2));
}

.transcript-entry--user {
  border-left-color: rgba(110, 166, 177, 0.9);
  background: linear-gradient(90deg, rgba(110, 166, 177, 0.09), rgba(9, 7, 6, 0.2));
}

.transcript-entry--system {
  border-left-color: rgba(193, 114, 78, 0.9);
}

.entry-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.entry-time {
  color: var(--dnd-text-soft);
  font-size: 12px;
}

.transcript-entry p {
  margin: 0;
  line-height: 1.82;
  white-space: pre-wrap;
  word-break: break-word;
}

.composer {
  gap: 12px;
  padding: 16px;
  border: 1px solid var(--dnd-border-soft);
  background: rgba(12, 8, 7, 0.44);
}

.composer-input {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid rgba(215, 169, 91, 0.28);
  resize: vertical;
  color: var(--dnd-text);
  background: rgba(5, 4, 4, 0.56);
}

.composer-input:focus {
  outline: 1px solid rgba(215, 169, 91, 0.78);
  border-color: rgba(215, 169, 91, 0.78);
}

.composer-footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.ghost-button,
.send-button {
  border: 1px solid transparent;
  padding: 10px 14px;
  cursor: pointer;
  transition:
    transform 160ms ease,
    border-color 160ms ease,
    background 160ms ease;
}

.ghost-button {
  border-color: rgba(215, 169, 91, 0.28);
  color: var(--dnd-text-soft);
  background: rgba(255, 255, 255, 0.03);
}

.send-button {
  color: #1f1510;
  font-weight: 700;
  background: linear-gradient(135deg, #f0cb84, #cc8557);
}

.ghost-button:hover,
.send-button:hover {
  transform: translateY(-1px);
}

.ghost-button:disabled,
.send-button:disabled,
.composer-input:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.compact-list {
  gap: 10px;
}

.compact-card {
  gap: 6px;
}

.compact-card__head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: baseline;
}

.utility-modal {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(4, 3, 2, 0.64);
  backdrop-filter: blur(10px);
}

.utility-modal__panel {
  width: min(1180px, 100%);
  max-height: calc(100vh - 40px);
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr);
  gap: 16px;
  padding: 20px;
}

.utility-modal__header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: start;
}

.utility-modal__nav {
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.utility-modal__tab--active {
  border-color: rgba(215, 169, 91, 0.72);
  background: rgba(215, 169, 91, 0.18);
  color: #f7ddb0;
}

.utility-modal__body {
  min-height: 0;
}

.utility-pane {
  min-height: 0;
  overflow: auto;
  padding-right: 6px;
}

.utility-pane--overview {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

@media (max-width: 1240px) {
  .reading-layout {
    grid-template-columns: minmax(250px, 0.8fr) minmax(0, 1.4fr);
  }

  .reading-layout__right {
    position: static;
    grid-column: 1 / -1;
  }
}

@media (max-width: 960px) {
  .top-strip,
  .reading-layout,
  .play-header,
  .composer-footer {
    grid-template-columns: 1fr;
  }

  .top-strip__meta,
  .utility-modal__nav,
  .utility-pane--overview {
    display: grid;
    grid-template-columns: 1fr;
  }

  .reading-layout__left,
  .reading-layout__right {
    position: static;
  }

  .reading-layout__center {
    order: 1;
  }

  .reading-layout__left {
    order: 2;
  }

  .reading-layout__right {
    order: 3;
  }
}

@media (max-width: 720px) {
  .summary-card,
  .play-shell,
  .top-strip,
  .utility-modal__panel {
    padding: 14px;
  }

  .character-card__stats,
  .ability-grid {
    grid-template-columns: 1fr;
  }

  .utility-button,
  .fullscreen-button,
  .utility-modal__close,
  .utility-modal__tab {
    width: 100%;
  }

  .utility-modal {
    padding: 10px;
  }
}
</style>
