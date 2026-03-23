<template>
  <CharacterBookCoverStep
    v-if="currentPage === 0"
    :form="form"
    @apply-preset="$emit('apply-preset', $event)"
    @reset-form="$emit('reset-form')"
    @preview-sync="$emit('preview-sync', $event)"
  />
  <CharacterBookIdentityStep
    v-else-if="currentPage === 1"
    :form="form"
    @preview-sync="$emit('preview-sync', $event)"
  />
  <CharacterBookAbilityStep v-else-if="currentPage === 2" :form="form" />
  <CharacterBookCombatStep v-else-if="currentPage === 3" :form="form" />
  <CharacterBookResourceStep
    v-else-if="currentPage === 4"
    :form="form"
    @preview-sync="$emit('preview-sync', $event)"
  />
  <CharacterBookStoryStep v-else-if="currentPage === 5" :form="form" />
  <CharacterBookReviewStep v-else :form="form" />
</template>

<script setup lang="ts">
import type { CharacterBookForm } from '../../../shared/characterBook';
import CharacterBookAbilityStep from './steps/CharacterBookAbilityStep.vue';
import CharacterBookCombatStep from './steps/CharacterBookCombatStep.vue';
import CharacterBookCoverStep from './steps/CharacterBookCoverStep.vue';
import CharacterBookIdentityStep from './steps/CharacterBookIdentityStep.vue';
import CharacterBookResourceStep from './steps/CharacterBookResourceStep.vue';
import CharacterBookReviewStep from './steps/CharacterBookReviewStep.vue';
import CharacterBookStoryStep from './steps/CharacterBookStoryStep.vue';

defineProps<{
  currentPage: number;
  form: CharacterBookForm;
}>();

defineEmits<{
  'apply-preset': [presetId: string];
  'reset-form': [];
  'preview-sync': [payload: { key: 'roleplayHook' | 'background' | 'sceneSummary' | 'resourceNotes'; value: string }];
}>();
</script>
