<template>
  <article class="record-card">
    <div class="record-card__top">
      <input v-model="item.名称" type="text" placeholder="队友名称" />
      <button type="button" class="mini-button mini-button--ghost" @click="$emit('remove', item.id)">删除</button>
    </div>
    <div class="mini-grid">
      <input v-model="item.职责" type="text" placeholder="职责" />
      <input v-model.number="item.当前生命" type="number" min="0" max="999" placeholder="当前生命" />
      <input v-model.number="item.生命上限" type="number" min="1" max="999" placeholder="生命上限" />
    </div>
    <input v-model="item.状态" type="text" placeholder="状态" />
    <textarea v-model="item.备注" rows="2" placeholder="备注" />
  </article>
</template>

<script setup lang="ts">
import type { CharacterBookForm } from '../../../../../shared/characterBook';
import type { CharacterBookListItemProps } from '../../ui';

defineProps<CharacterBookListItemProps<CharacterBookForm['队伍'][number]>>();
defineEmits<{
  remove: [id: string];
}>();
</script>
