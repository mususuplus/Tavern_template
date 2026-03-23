<template>
  <div class="field-grid">
    <label class="field">
      <span>当前 HP</span>
      <input v-model.number="form.角色.生命值" type="number" min="0" max="999" />
    </label>
    <label class="field">
      <span>最大 HP</span>
      <input v-model.number="form.角色.生命上限" type="number" min="1" max="999" />
    </label>
    <label class="field">
      <span>临时生命</span>
      <input v-model.number="form.角色.临时生命" type="number" min="0" max="999" />
    </label>
    <label class="field">
      <span>AC</span>
      <input v-model.number="form.角色.护甲等级" type="number" min="1" max="40" />
    </label>
    <label class="field">
      <span>速度</span>
      <input v-model.number="form.角色.速度" type="number" min="0" max="120" />
    </label>
  </div>

  <div class="stat-summary">
    <article>
      <span>生命状态</span>
      <strong>{{ form.角色.生命值 }} / {{ form.角色.生命上限 }}</strong>
    </article>
    <article>
      <span>战斗体感</span>
      <strong>{{ combatTone }}</strong>
    </article>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { CharacterBookForm } from '../../../../shared/characterBook';

const props = defineProps<{
  form: CharacterBookForm;
}>();

const combatTone = computed(() => {
  const ratio = props.form.角色.生命上限 <= 0 ? 0 : props.form.角色.生命值 / props.form.角色.生命上限;
  if (ratio >= 0.8) return '状态稳健';
  if (ratio >= 0.45) return '适合谨慎推进';
  return '需要更多保护';
});
</script>
