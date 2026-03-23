<template>
  <article class="record-card">
    <div class="record-card__top">
      <input v-model="item.标题" type="text" placeholder="剧情钩子标题" />
      <button type="button" class="mini-button mini-button--ghost" @click="$emit('remove', item.id)">删除</button>
    </div>
    <select v-model="item.状态">
      <option v-for="status in HOOK_STATUS_OPTIONS" :key="status" :value="status">{{ status }}</option>
    </select>
    <textarea v-model="item.摘要" rows="2" placeholder="剧情钩子摘要" />
  </article>
</template>

<script setup lang="ts">
import type { CharacterBookForm } from '../../../../../shared/characterBook';
import { HOOK_STATUS_OPTIONS } from '../../ui';
import type { CharacterBookListItemProps } from '../../ui';

defineProps<CharacterBookListItemProps<CharacterBookForm['剧情钩子'][number]>>();
defineEmits<{
  remove: [id: string];
}>();
</script>
