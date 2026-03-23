<template>
  <CharacterBook v-if="showCharacterBook" @saved="showMainPanel = true" />
  <MainPanel v-else />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import CharacterBook from './components/CharacterBook.vue';
import MainPanel from './App.vue';

declare function getCurrentMessageId(): number;

const currentMessageId = getCurrentMessageId();
const showMainPanel = ref(false);
const showCharacterBook = computed(() => currentMessageId === 0 && !showMainPanel.value);
</script>
