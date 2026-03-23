<template>
  <section class="hero-panel">
    <div class="hero-copy">
      <p class="eyebrow">Camp Ledger</p>
      <h1>{{ data.角色.姓名 }}</h1>
      <p class="subtitle">{{ data.角色.种族 }} {{ data.角色.职业 }} · Lv.{{ data.角色.等级 }}</p>
      <p class="summary">{{ data.剧情.场景摘要 }}</p>
    </div>

    <div class="hero-stats">
      <div class="stat-pill">
        <span>AC</span>
        <strong>{{ data.角色.护甲等级 }}</strong>
      </div>
      <div class="stat-pill">
        <span>HP</span>
        <strong>{{ data.角色.生命值 }}/{{ data.角色.生命上限 }}</strong>
      </div>
      <div class="stat-pill">
        <span>金币</span>
        <strong>{{ data.资源.金币 }}</strong>
      </div>
      <div class="stat-pill">
        <span>场景</span>
        <strong>{{ data.剧情.当前场景 }}</strong>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useDndData } from '../../shared/useDndData';

const { data } = useDndData();
</script>

<style scoped lang="scss">
.hero-panel {
  position: relative;
  overflow: hidden;
  display: grid;
  gap: 18px;
  padding: 22px;
  border: 1px solid var(--dnd-border);
  background:
    linear-gradient(130deg, rgba(89, 60, 36, 0.82), rgba(31, 22, 17, 0.94)),
    rgba(34, 25, 19, 0.92);
  box-shadow: var(--dnd-shadow);
}

.hero-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, transparent, rgba(244, 231, 206, 0.05), transparent),
    radial-gradient(circle at right top, rgba(215, 169, 91, 0.22), transparent 34%);
  pointer-events: none;
}

.hero-copy,
.hero-stats {
  position: relative;
  z-index: 1;
}

.eyebrow {
  margin: 0 0 8px;
  color: var(--dnd-accent);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.28em;
}

h1 {
  margin: 0;
  font-family: var(--dnd-font-display);
  font-size: clamp(28px, 4vw, 42px);
  line-height: 1;
}

.subtitle,
.summary {
  margin: 8px 0 0;
  color: var(--dnd-text-soft);
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
}

.stat-pill {
  padding: 12px 14px;
  border: 1px solid var(--dnd-border-soft);
  background: rgba(0, 0, 0, 0.2);
}

.stat-pill span {
  display: block;
  margin-bottom: 6px;
  color: var(--dnd-text-soft);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
}

.stat-pill strong {
  font-size: 18px;
  font-family: var(--dnd-font-display);
}
</style>
