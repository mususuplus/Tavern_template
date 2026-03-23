<template>
  <main class="book-shell" :class="{ 'book-shell--fullscreen': isFullscreen }">
    <section class="book-hero">
      <div class="book-hero__copy">
        <p class="eyebrow">Origin Tome</p>
        <h1>自定义角色卡</h1>
        <p class="lead">
          这是你的冒险开篇。逐页完善角色设定、能力值和剧情种子，保存后会写入 0 层变量，作为整场 DND 冒险的初始角色卡。
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
        <span>0 层专用建卡界面</span>
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
import CharacterBookLeftPage from './character-book/CharacterBookLeftPage.vue';
import CharacterBookPreview from './character-book/CharacterBookPreview.vue';
import {
  CHARACTER_BOOK_PREVIEW_DRAFT_KEYS,
  CHARACTER_BOOK_STEPS,
  buildCharacterBookPreviewModel,
  type CharacterBookPreviewDraftKey,
} from './character-book/ui';
import './character-book/styles.scss';

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
  currentPage.value === 6
    ? '确认并保存角色卡'
    : `继续翻到「${CHARACTER_BOOK_STEPS[currentPage.value + 1]?.label ?? CHARACTER_BOOK_STEPS[currentPage.value].label}」`,
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
  saveMessage.value = `已套用预设「${preset.title}」，你可以继续逐页微调。`;
}

function resetForm() {
  Object.assign(form, createCharacterBookForm());
  resetPreviewDrafts();
  saveState.value = 'idle';
  saveMessage.value = '已重置为空白书页。';
}

async function saveForm() {
  isSaving.value = true;
  saveState.value = 'idle';

  try {
    await saveCharacterBookForm(cloneForm(form));
    saveState.value = 'success';
    saveMessage.value = '角色卡已写入 0 层变量。重新打开本页时会自动回填这份数据。';
    emit('saved');
  } catch (error) {
    console.error('[DND][CharacterBook] 保存角色卡失败:', error);
    saveState.value = 'error';
    saveMessage.value = '保存失败，请检查字段内容后重试。';
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
    console.warn('[DND][CharacterBook] 切换全屏失败:', error);
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
