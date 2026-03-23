<template>
  <article class="record-card">
    <div class="record-card__top">
      <input v-model="item.名称" type="text" placeholder="线索名称" />
      <button type="button" class="mini-button mini-button--ghost" @click="$emit('remove', item.id)">删除</button>
    </div>
    <textarea v-model="item.内容" rows="2" placeholder="线索内容" />
  </article>
</template>

<script setup lang="ts">
import type { CharacterBookForm } from '../../../../../shared/characterBook';
import type { CharacterBookListItemProps } from '../../ui';

defineProps<CharacterBookListItemProps<CharacterBookForm['线索'][number]>>();
defineEmits<{
  remove: [id: string];
}>();
</script>
