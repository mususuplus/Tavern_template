<template>
  <article class="record-card">
    <div class="record-card__top">
      <input v-model="item.名称" type="text" placeholder="任务名称" />
      <button type="button" class="mini-button mini-button--ghost" @click="$emit('remove', item.id)">删除</button>
    </div>
    <select v-model="item.状态">
      <option v-for="status in QUEST_STATUS_OPTIONS" :key="status" :value="status">{{ status }}</option>
    </select>
    <textarea v-model="item.摘要" rows="2" placeholder="摘要" />
    <textarea v-model="item.目标" rows="2" placeholder="目标" />
  </article>
</template>

<script setup lang="ts">
import type { CharacterBookForm } from '../../../../../shared/characterBook';
import { QUEST_STATUS_OPTIONS } from '../../ui';
import type { CharacterBookListItemProps } from '../../ui';

defineProps<CharacterBookListItemProps<CharacterBookForm['任务'][number]>>();
defineEmits<{
  remove: [id: string];
}>();
</script>
