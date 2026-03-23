<template>
  <div class="ability-sheet">
    <article v-for="key in ABILITY_KEYS" :key="key" class="ability-sheet__card">
      <span>{{ key }}</span>
      <input v-model.number="form.角色.能力值[key]" type="number" min="1" max="30" />
      <strong>{{ formatBookModifier(form.角色.能力值[key]) }}</strong>
    </article>
  </div>
</template>

<script setup lang="ts">
import { formatBookModifier, type CharacterBookForm } from '../../../../shared/characterBook';
import { ABILITY_KEYS } from '../ui';

defineProps<{
  form: CharacterBookForm;
}>();
</script>
