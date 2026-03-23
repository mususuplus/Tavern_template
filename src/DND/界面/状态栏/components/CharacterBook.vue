<template>
  <main class="book-shell" :class="{ 'book-shell--fullscreen': isFullscreen }">
    <section class="book-hero">
      <div class="book-hero__copy">
        <p class="eyebrow">Origin Tome</p>
        <h1>自定义角色卡</h1>
        <p class="lead">
          这套书页用于状态栏玩法。完成角色卡后会先写入 0 层变量，再自动向 AI 发送开场提示词，生成第一段开场白。
        </p>
      </div>
      <div class="book-hero__meta">
        <button type="button" class="fullscreen-button" @click="toggleFullscreen">
          {{ isFullscreen ? '退出全屏' : '全屏显示' }}
        </button>
        <div class="book-hero__status">
          <span>{{ currentStep.label }}</span>
          <strong>{{ currentPage + 1 }} / {{ CHARACTER_BOOK_STEPS.length }}</strong>
        </div>
      </div>
    </section>

    <section class="book-stage">
      <div class="chapter-rail">
        <button
          v-for="(step, index) in CHARACTER_BOOK_STEPS"
          :key="step.key"
          type="button"
          class="chapter-pill"
          :class="{ 'chapter-pill--active': currentPage === index }"
          @click="currentPage = index"
        >
          <span>{{ step.index }}</span>
          <strong>{{ step.label }}</strong>
        </button>
      </div>

      <section class="book">
        <div class="book__spine" />

        <article class="book__page book__page--left">
          <div class="page-head">
            <p class="page-kicker">{{ currentStep.index }}</p>
            <h2>{{ currentStep.label }}</h2>
            <p>{{ currentStep.description }}</p>
          </div>

          <CharacterBookLeftPage
            :current-page="currentPage"
            :form="form"
            @apply-preset="applyPreset"
            @reset-form="resetForm"
            @preview-sync="handlePreviewSync"
          />
        </article>

        <article class="book__page book__page--right">
          <CharacterBookPreview
            :current-page="currentPage"
            :form="form"
            :preview-model="previewModel"
            :save-state="saveState"
            :save-message="saveMessage"
            :is-saving="isSaving"
            @save="saveForm"
          />
        </article>
      </section>
    </section>

    <footer class="book-footer">
      <button type="button" class="secondary-button" :disabled="currentPage === 0" @click="currentPage -= 1">上一页</button>
      <div class="book-footer__hint">
        <span>状态栏专用建卡界面</span>
        <strong>{{ footerHint }}</strong>
      </div>
      <button
        type="button"
        class="primary-button"
        :disabled="currentPage === CHARACTER_BOOK_STEPS.length - 1"
        @click="currentPage += 1"
      >
        下一页
      </button>
    </footer>
  </main>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import {
  CHARACTER_PRESETS,
  cloneForm,
  createCharacterBookForm,
  getInitialCharacterBookForm,
  saveCharacterBookForm,
  type CharacterBookForm,
} from '../../shared/characterBook';
import { buildFinalAssistantMessage, removeThinkingTags, validateHasContent } from '../../../utils/messageParser';
import CharacterBookLeftPage from './character-book/CharacterBookLeftPage.vue';
import CharacterBookPreview from './character-book/CharacterBookPreview.vue';
import {
  CHARACTER_BOOK_PREVIEW_DRAFT_KEYS,
  CHARACTER_BOOK_STEPS,
  buildCharacterBookPreviewModel,
  type CharacterBookPreviewDraftKey,
} from './character-book/ui';
import './character-book/styles.scss';

declare function createChatMessages(
  messages: Array<{ role: 'assistant' | 'system' | 'user'; message: string; data?: Record<string, any> }>,
  options?: { refresh?: 'none' | 'affected' | 'all' },
): Promise<void>;
declare function deleteChatMessages(message_ids: number[], options?: { refresh?: 'none' | 'affected' | 'all' }): Promise<void>;
declare function generate(config: { generation_id?: string; user_input?: string; should_stream?: boolean }): Promise<string>;
declare function getLastMessageId(): number;

const emit = defineEmits<{
  saved: [];
}>();

const currentPage = ref(0);
const isSaving = ref(false);
const isFullscreen = ref(Boolean(document.fullscreenElement));
const saveState = ref<'idle' | 'success' | 'error'>('idle');
const saveMessage = ref('尚未保存。');
const form = reactive<CharacterBookForm>(getInitialCharacterBookForm());
const previewDrafts = reactive<Record<CharacterBookPreviewDraftKey, string>>({
  roleplayHook: '',
  background: '',
  sceneSummary: '',
  resourceNotes: '',
});

const currentStep = computed(() => CHARACTER_BOOK_STEPS[currentPage.value]);
const previewModel = computed(() => buildCharacterBookPreviewModel(currentPage.value, form, previewDrafts));
const footerHint = computed(() =>
  currentPage.value === CHARACTER_BOOK_STEPS.length - 1
    ? '确认保存角色卡，并自动生成状态栏玩法开场白'
    : `继续翻到“${CHARACTER_BOOK_STEPS[currentPage.value + 1]?.label ?? CHARACTER_BOOK_STEPS[currentPage.value].label}”`,
);

function resetPreviewDrafts() {
  CHARACTER_BOOK_PREVIEW_DRAFT_KEYS.forEach(key => {
    previewDrafts[key] = '';
  });
}

function handlePreviewSync(payload: { key: CharacterBookPreviewDraftKey; value: string }) {
  previewDrafts[payload.key] = payload.value;
}

function applyPreset(presetId: string) {
  const preset = CHARACTER_PRESETS.find(item => item.id === presetId);
  if (!preset) return;

  Object.assign(form, cloneForm(preset.form));
  resetPreviewDrafts();
  saveState.value = 'idle';
  saveMessage.value = `已套用预设“${preset.title}”，你可以继续逐页微调。`;
}

function resetForm() {
  Object.assign(form, createCharacterBookForm());
  resetPreviewDrafts();
  saveState.value = 'idle';
  saveMessage.value = '已重置为空白书页，可重新设定状态栏开场角色。';
}

function buildOpeningSummary() {
  const name = form.角色.姓名.trim() || '未命名角色';
  const scene = form.剧情.当前场景.trim() || '未知场景';
  const firstQuest = form.任务[0]?.名称?.trim();

  return [name, `已在${scene}完成开场部署`, firstQuest ? `当前首要目标是${firstQuest}` : '准备开始第一段冒险']
    .filter(Boolean)
    .join('，');
}

function buildOpeningPrompt() {
  const partySummary =
    form.队伍.length > 0
      ? form.队伍
          .map(member => `${member.名称 || '未命名队友'}（${member.职责 || '支援'}，状态：${member.状态 || '待命'}）`)
          .join('；')
      : '暂无已登记队友';
  const questSummary =
    form.任务.length > 0
      ? form.任务
          .map(quest => `${quest.名称 || '未命名任务'}（${quest.状态}）：${quest.目标 || quest.摘要 || '待补充'}`)
          .join('；')
      : '暂无已登记任务';
  const clueSummary =
    form.线索.length > 0
      ? form.线索.map(clue => `${clue.名称 || '未命名线索'}：${clue.内容 || '待补充'}`).join('；')
      : '暂无关键线索';
  const hookSummary =
    form.剧情钩子.length > 0
      ? form.剧情钩子
          .map(hook => `${hook.标题 || '未命名钩子'}（${hook.状态}）：${hook.摘要 || '待补充'}`)
          .join('；')
      : '暂无剧情钩子';

  return [
    'Your task is to generate a grand, epic opening narrative for our D&D campaign. The goal is to deeply immerse a player who has never played D&D before, using vivid imagery and cinematic pacing rather than confusing lore or jargon.',
    'Please structure the narrative strictly using a "Macro to Micro" (Camera Zoom-In) approach:',
    'The Cosmos (Macro): Start with the grand scale. Describe the mythical foundation of the world—the ancient gods, the primordial forces of light and dark, or the invisible weave of magic that binds the universe. Keep it awe-inspiring and mythical.',
    'The Realm (Meso): Zoom in on the continent or the mortal world. Describe a land shaped by ancient wars, forgotten empires, or a looming, overarching tension (e.g., a fading golden age, a gathering storm in the east).',
    'The Local Setting (Micro): Zoom in further to the specific starting location. Describe the atmosphere, the weather, and the sensory details (sounds, smells, lighting) of the immediate environment (e.g., a rain-slicked cobblestone street, a bustling frontier tavern, an ancient overgrown ruin).',
    'The Focal Point (The Character): Finally, focus the "camera" entirely on my character. Describe how they fit into this immediate scene, waiting for the adventure to begin. End with a compelling hook or a direct question asking what I do next.',
    'Tone and Style Guidelines:Cinematic & Epic: Use evocative, sensory-rich language. Think of the opening sweeping shots of The Lord of the Rings.',
    'Pacing: Build the tension slowly. The transition from the cosmic scale to the character\'s immediate reality should feel seamless and grounding.',
    '角色卡信息如下：',
    `姓名：${form.角色.姓名 || '未填写'}`,
    `种族：${form.角色.种族 || '未填写'}`,
    `职业：${form.角色.职业 || '未填写'}`,
    `等级：${form.角色.等级}`,
    `背景：${form.角色.背景 || '未填写'}`,
    `阵营：${form.角色.阵营 || '未填写'}`,
    `角色动机：${form.roleplayHook || '未填写'}`,
    `生命：${form.角色.生命值}/${form.角色.生命上限}，临时生命：${form.角色.临时生命}`,
    `护甲等级：${form.角色.护甲等级}，速度：${form.角色.速度}ft，熟练加值：+${form.角色.熟练加值}`,
    `法术位摘要：${form.资源.法术位摘要 || '未填写'}`,
    `资源备注：${form.资源.资源备注 || '未填写'}`,
    `金币：${form.资源.金币}`,
    `当前场景：${form.剧情.当前场景 || '未填写'}`,
    `场景摘要：${form.剧情.场景摘要 || '未填写'}`,
    `队伍：${partySummary}`,
    `任务：${questSummary}`,
    `线索：${clueSummary}`,
    `剧情钩子：${hookSummary}`,
    `开场日志标题：${form.剧情.战役日志标题 || '开场记录'}`,
    `开场日志内容：${form.剧情.战役日志内容 || '未填写'}`,
  ].join('\n');
}

async function generateOpeningMessage() {
  const prompt = buildOpeningPrompt();
  let userMessageId: number | null = null;

  await createChatMessages([{ role: 'user', message: prompt }], { refresh: 'none' });
  userMessageId = getLastMessageId();

  try {
    const rawReply = await generate({ user_input: prompt });
    const cleanedReply = removeThinkingTags(String(rawReply ?? '')).trim();
    const assistantMessage = validateHasContent(cleanedReply)
      ? buildFinalAssistantMessage(cleanedReply)
      : [`<content>${cleanedReply || '开场白生成失败，请稍后重试。'}</content>`, `<summary>${buildOpeningSummary()}</summary>`].join(
          '\n\n',
        );

    await createChatMessages([{ role: 'assistant', message: assistantMessage }], { refresh: 'affected' });
  } catch (error) {
    if (userMessageId != null) {
      try {
        await deleteChatMessages([userMessageId], { refresh: 'none' });
      } catch (deleteError) {
        console.warn('[DND][StatusCharacterBook] 删除失败的开场提示词消息时出错:', deleteError);
      }
    }
    throw error;
  }
}

async function saveForm() {
  isSaving.value = true;
  saveState.value = 'idle';

  try {
    await saveCharacterBookForm(cloneForm(form));
    await generateOpeningMessage();
    saveState.value = 'success';
    saveMessage.value = '角色卡已写入 0 层变量，并已自动向 AI 发送开场提示词生成开场白。';
    emit('saved');
  } catch (error) {
    console.error('[DND][StatusCharacterBook] 保存角色卡或生成开场白失败:', error);
    saveState.value = 'error';
    saveMessage.value = '保存失败，或角色卡虽已保存但开场白生成未完成，请检查内容后重试。';
  } finally {
    isSaving.value = false;
  }
}

async function toggleFullscreen() {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen?.();
      isFullscreen.value = false;
      return;
    }

    await document.documentElement.requestFullscreen?.();
    isFullscreen.value = true;
  } catch (error) {
    console.warn('[DND][StatusCharacterBook] 切换全屏失败:', error);
  }
}

function syncFullscreenState() {
  isFullscreen.value = Boolean(document.fullscreenElement);
}

onMounted(() => {
  document.addEventListener('fullscreenchange', syncFullscreenState);
});

onBeforeUnmount(() => {
  document.removeEventListener('fullscreenchange', syncFullscreenState);
});
</script>
