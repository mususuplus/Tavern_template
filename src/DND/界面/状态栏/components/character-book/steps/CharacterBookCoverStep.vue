<template>
  <section class="preset-gallery">
    <button
      v-for="preset in CHARACTER_BOOK_PRESETS"
      :key="preset.id"
      type="button"
      class="preset-card"
      :class="{ 'preset-card--active': form.presetId === preset.id }"
      @click="$emit('apply-preset', preset.id)"
    >
      <span>{{ preset.subtitle }}</span>
      <strong>{{ preset.title }}</strong>
      <p>{{ preset.blurb }}</p>
    </button>
  </section>

  <div class="cover-actions">
    <button type="button" class="secondary-button" @click="$emit('reset-form')">
      从空白书页开始
    </button>
    <label class="inline-note">
      <span>角色动机钩子</span>
      <DeferredTextarea
        :model-value="form.roleplayHook"
        rows="4"
        placeholder="写下角色此刻最在意的一件事。"
        @update:model-value="value => (form.roleplayHook = value)"
        @preview-sync="value => $emit('preview-sync', { key: 'roleplayHook', value })"
      />
    </label>
  </div>
</template>

<script setup lang="ts">
import type { CharacterBookForm } from '../../../../shared/characterBook';
import DeferredTextarea from '../DeferredTextarea.vue';
import { CHARACTER_BOOK_PRESETS } from '../ui';

defineProps<{
  form: CharacterBookForm;
}>();

defineEmits<{
  'apply-preset': [presetId: string];
  'reset-form': [];
  'preview-sync': [payload: { key: 'roleplayHook'; value: string }];
}>();
</script>
