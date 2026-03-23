<template>
  <div class="field-grid">
    <label class="field">
      <span>金币</span>
      <input v-model.number="form.资源.金币" type="number" min="0" max="999999" />
    </label>
    <label class="field">
      <span>法术位摘要</span>
      <input v-model="form.资源.法术位摘要" type="text" />
    </label>
    <label class="field field--wide">
      <span>当前场景</span>
      <input v-model="form.剧情.当前场景" type="text" />
    </label>
  </div>

  <label class="field field--stack">
    <span>场景摘要</span>
    <DeferredTextarea
      :model-value="form.剧情.场景摘要"
      rows="5"
      @update:model-value="value => (form.剧情.场景摘要 = value)"
      @preview-sync="value => $emit('preview-sync', { key: 'sceneSummary', value })"
    />
  </label>
  <label class="field field--stack">
    <span>资源备注</span>
    <DeferredTextarea
      :model-value="form.资源.资源备注"
      rows="5"
      @update:model-value="value => (form.资源.资源备注 = value)"
      @preview-sync="value => $emit('preview-sync', { key: 'resourceNotes', value })"
    />
  </label>
</template>

<script setup lang="ts">
import type { CharacterBookForm } from '../../../../shared/characterBook';
import DeferredTextarea from '../DeferredTextarea.vue';

defineProps<{
  form: CharacterBookForm;
}>();

defineEmits<{
  'preview-sync': [payload: { key: 'sceneSummary' | 'resourceNotes'; value: string }];
}>();
</script>
