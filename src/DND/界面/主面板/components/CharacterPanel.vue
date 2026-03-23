<template>
  <section class="panel">
    <div class="panel-heading">
      <div>
        <p class="panel-kicker">Character</p>
        <h2>角色总览</h2>
      </div>
      <p class="meta">{{ data.角色.阵营 }} · 熟练 +{{ data.角色.熟练加值 }}</p>
    </div>

    <div class="identity-grid">
      <label>
        <span>姓名</span>
        <input v-model="data.角色.姓名" type="text" />
      </label>
      <label>
        <span>职业</span>
        <input v-model="data.角色.职业" type="text" />
      </label>
      <label>
        <span>种族</span>
        <input v-model="data.角色.种族" type="text" />
      </label>
      <label>
        <span>等级</span>
        <input v-model.number="data.角色.等级" type="number" min="1" max="20" />
      </label>
    </div>

    <div class="resource-strip">
      <div class="resource-card">
        <span>生命</span>
        <strong>{{ data.角色.生命值 }}/{{ data.角色.生命上限 }}</strong>
        <div class="bar"><i :style="{ width: `${hpRatio}%` }"></i></div>
      </div>
      <div class="resource-card">
        <span>临时生命</span>
        <strong>{{ data.角色.临时生命 }}</strong>
      </div>
      <div class="resource-card">
        <span>速度</span>
        <strong>{{ data.角色.速度 }} ft</strong>
      </div>
      <div class="resource-card">
        <span>法术位</span>
        <strong>{{ data.资源.法术位摘要 }}</strong>
      </div>
    </div>

    <div class="ability-grid">
      <article v-for="key in ABILITY_KEYS" :key="key" class="ability-card">
        <span class="ability-name">{{ key }}</span>
        <strong>{{ data.角色.能力值[key] }}</strong>
        <em>{{ formatModifier(data.角色.能力值[key]) }}</em>
      </article>
    </div>

    <label class="wide-field">
      <span>背景札记</span>
      <textarea v-model="data.角色.背景" rows="3"></textarea>
    </label>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ABILITY_KEYS, formatModifier, getHpRatio } from '../../shared/model';
import { useDndData } from '../../shared/useDndData';

const { data } = useDndData();
const hpRatio = computed(() => getHpRatio(data.value.角色.生命值, data.value.角色.生命上限));
</script>

<style scoped lang="scss">
.panel {
  display: grid;
  gap: 18px;
}

.panel-heading,
.identity-grid,
.resource-strip,
.ability-grid {
  display: grid;
  gap: 12px;
}

.panel-heading {
  grid-template-columns: 1fr auto;
  align-items: end;
}

.panel-kicker {
  margin: 0 0 6px;
  color: var(--dnd-accent);
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

h2,
.meta {
  margin: 0;
}

.meta {
  color: var(--dnd-text-soft);
}

.identity-grid,
.resource-strip,
.ability-grid {
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
}

label,
.resource-card,
.ability-card {
  display: grid;
  gap: 8px;
  padding: 14px;
  border: 1px solid var(--dnd-border-soft);
  background: var(--dnd-panel-soft);
}

label span,
.resource-card span,
.ability-name {
  color: var(--dnd-text-soft);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
}

input,
textarea {
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(0, 0, 0, 0.18);
  color: var(--dnd-text);
  padding: 10px 12px;
}

.bar {
  height: 8px;
  background: rgba(0, 0, 0, 0.22);
}

.bar i {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #cf8f46, #e9ca77);
}

.resource-card strong,
.ability-card strong,
.ability-card em {
  font-family: var(--dnd-font-display);
}

.ability-card {
  place-items: center;
  text-align: center;
}

.ability-card strong {
  font-size: 28px;
}

.ability-card em {
  color: var(--dnd-accent);
  font-style: normal;
}

.wide-field {
  width: 100%;
}

@media (max-width: 720px) {
  .panel-heading {
    grid-template-columns: 1fr;
  }
}
</style>
