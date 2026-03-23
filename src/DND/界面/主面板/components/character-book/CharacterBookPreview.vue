<template>
  <div class="page-head">
    <p class="page-kicker">Preview</p>
    <h2>{{ currentPage === 6 ? '保存前检查' : previewModel.title }}</h2>
    <p>{{ currentPage === 6 ? '确认这些内容会作为 0 层角色数据写入。' : previewModel.description }}</p>
  </div>

  <template v-if="currentPage < 6">
    <section v-if="previewModel.hero" class="preview-card">
      <div class="preview-card__hero">
        <span>{{ previewModel.hero.eyebrow }}</span>
        <strong>{{ previewModel.hero.name }}</strong>
        <p>{{ previewModel.hero.body }}</p>
      </div>

      <div v-if="previewModel.metrics.length > 0" class="preview-grid">
        <article v-for="metric in previewModel.metrics" :key="metric.label">
          <span>{{ metric.label }}</span>
          <strong>{{ metric.value }}</strong>
        </article>
      </div>

      <div v-if="previewModel.abilities.length > 0" class="preview-abilities">
        <article v-for="ability in previewModel.abilities" :key="ability.key">
          <span>{{ ability.key }}</span>
          <strong>{{ ability.value }}</strong>
          <em>{{ ability.modifier }}</em>
        </article>
      </div>
    </section>

    <section class="margin-notes">
      <article v-for="note in previewModel.notes" :key="note.label">
        <span>{{ note.label }}</span>
        <p v-if="note.multiline">{{ note.value }}</p>
        <strong v-else>{{ note.value }}</strong>
      </article>
    </section>
  </template>

  <template v-else>
    <section class="review-sheet">
      <label class="field field--stack">
        <span>战役日志标题</span>
        <input v-model="form.剧情.战役日志标题" type="text" />
      </label>
      <label class="field field--stack">
        <span>战役日志内容</span>
        <textarea v-model="form.剧情.战役日志内容" rows="5" />
      </label>

      <section class="review-block">
        <h3>创建完成前总览</h3>
        <p>{{ form.角色.姓名 || '未命名冒险者' }} 将以 {{ form.角色.种族 }} {{ form.角色.职业 }} 的身份踏入“{{ form.剧情.当前场景 }}”。</p>
        <p>共记录 {{ form.队伍.length }} 名队伍成员、{{ form.任务.length }} 条任务、{{ form.线索.length }} 条线索和 {{ form.剧情钩子.length }} 个剧情钩子。</p>
      </section>

      <div class="completion-box" :class="{ 'completion-box--success': saveState === 'success' }">
        <strong>{{ saveMessage }}</strong>
        <p>保存目标：0 层消息变量 `stat_data`。</p>
      </div>

      <button type="button" class="primary-button" :disabled="isSaving" @click="$emit('save')">
        {{ isSaving ? '写入中...' : '保存角色卡' }}
      </button>
    </section>
  </template>
</template>

<script setup lang="ts">
import type { CharacterBookForm } from '../../../shared/characterBook';
import type { CharacterBookPreviewModel } from './ui';

defineProps<{
  currentPage: number;
  form: CharacterBookForm;
  previewModel: CharacterBookPreviewModel;
  saveState: 'idle' | 'success' | 'error';
  saveMessage: string;
  isSaving: boolean;
}>();

defineEmits<{
  save: [];
}>();
</script>
