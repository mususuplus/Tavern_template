<template>
  <main class="status-shell">
    <section class="hero-strip">
      <div class="hero-copy">
        <p class="eyebrow">STATUS MODE</p>
        <strong>{{ data.角色.姓名 }}</strong>
        <span>{{ data.角色.种族 }} {{ data.角色.职业 }} · Lv.{{ data.角色.等级 }}</span>
        <p class="scene-summary">{{ data.剧情.场景摘要 }}</p>
      </div>

      <div class="hero-stats">
        <article class="stat-card stat-card--accent">
          <label>生命</label>
          <strong>{{ data.角色.生命值 }}/{{ data.角色.生命上限 }}</strong>
          <div class="progress-track">
            <span :style="{ width: `${hpRatio}%` }" />
          </div>
        </article>
        <article class="stat-card">
          <label>护甲等级</label>
          <strong>{{ data.角色.护甲等级 }}</strong>
          <span>熟练 +{{ data.角色.熟练加值 }}</span>
        </article>
        <article class="stat-card">
          <label>资源</label>
          <strong>{{ data.资源.金币 }} 金币</strong>
          <span>{{ data.资源.法术位摘要 }}</span>
        </article>
        <article class="stat-card">
          <label>当前场景</label>
          <strong>{{ data.剧情.当前场景 }}</strong>
          <span>{{ activeQuestCount }} 项任务进行中</span>
        </article>
      </div>
    </section>

    <section class="page-shell">
      <section v-if="activePage === 'overview'" class="page-grid">
        <article class="panel-card metric-grid">
          <div class="metric-card">
            <span>队员数</span>
            <strong>{{ partyEntries.length }}</strong>
          </div>
          <div class="metric-card">
            <span>进行中任务</span>
            <strong>{{ activeQuestCount }}</strong>
          </div>
          <div class="metric-card">
            <span>短休剩余</span>
            <strong>{{ data.资源.短休剩余 }}</strong>
          </div>
          <div class="metric-card">
            <span>长休计数</span>
            <strong>{{ data.资源.长休计数 }}</strong>
          </div>
        </article>

        <article class="panel-card stacked-list">
          <header class="card-header">
            <h2>任务速览</h2>
          </header>
          <article v-for="[name, quest] in questEntries" :key="name" class="note-card">
            <div class="note-head">
              <strong>{{ name }}</strong>
              <span>{{ quest.状态 }}</span>
            </div>
            <p>{{ quest.摘要 }}</p>
            <small>{{ quest.目标 }}</small>
          </article>
        </article>
      </section>

      <section v-else-if="activePage === 'edit'" class="page-grid">
        <CharacterPanel class="embedded-panel" />
      </section>

      <section v-else-if="activePage === 'story'" class="page-grid">
        <StoryPanel class="embedded-panel" />
      </section>

      <section v-else-if="activePage === 'party'" class="page-grid">
        <PartyPanel class="embedded-panel" />
      </section>

      <section v-else-if="activePage === 'dice'" class="page-grid">
        <article class="panel-card dice-summary-card">
          <header class="card-header">
            <h2>骰子检定</h2>
            <p>把主面板里的 BG3 风格骰子系统接入状态栏，在这里直接完成属性检定、DC 对抗和结果查看。</p>
          </header>

          <div class="metric-grid dice-metric-grid">
            <div class="metric-card">
              <span>默认目标</span>
              <strong>15</strong>
            </div>
            <div class="metric-card">
              <span>熟练加值</span>
              <strong>+{{ data.角色.熟练加值 }}</strong>
            </div>
            <div class="metric-card">
              <span>最高属性</span>
              <strong>{{ highestAbilityLabel }}</strong>
            </div>
            <div class="metric-card">
              <span>当前生命</span>
              <strong>{{ data.角色.生命值 }}/{{ data.角色.生命上限 }}</strong>
            </div>
          </div>
        </article>

        <Bg3DicePanel input-target="none" />
      </section>

      <section v-else class="page-grid">
        <article class="panel-card stacked-list">
          <header class="card-header">
            <h2>战报日志</h2>
          </header>
          <article v-for="[id, log] in logEntries" :key="id" class="note-card">
            <div class="note-head">
              <strong>{{ log.标题 }}</strong>
              <span>{{ log.时间 }}</span>
            </div>
            <p>{{ log.内容 }}</p>
          </article>
        </article>
      </section>

      <nav class="bottom-nav" aria-label="状态栏分页导航">
        <button
          v-for="item in navItems"
          :key="item.id"
          type="button"
          class="nav-button"
          :class="{ 'nav-button--active': activePage === item.id }"
          @click="activePage = item.id"
        >
          <span>{{ item.label }}</span>
        </button>
      </nav>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import Bg3DicePanel from '../主面板/components/Bg3DicePanel.vue';
import CharacterPanel from '../主面板/components/CharacterPanel.vue';
import PartyPanel from '../主面板/components/PartyPanel.vue';
import StoryPanel from '../主面板/components/StoryPanel.vue';
import { ABILITY_KEYS, getHpRatio } from '../shared/model';
import { useDndData } from '../shared/useDndData';

const { data, logEntries, partyEntries, questEntries } = useDndData();

const activePage = ref<'overview' | 'edit' | 'story' | 'party' | 'dice' | 'log'>('overview');
const navItems = [
  { id: 'overview', label: '总览' },
  { id: 'dice', label: '骰子' },
  { id: 'edit', label: '修改' },
  { id: 'story', label: '剧情' },
  { id: 'party', label: '小队' },
  { id: 'log', label: '日志' },
] as const;

const hpRatio = computed(() => getHpRatio(data.value.角色.生命值, data.value.角色.生命上限));
const activeQuestCount = computed(() => questEntries.value.filter(([, quest]) => quest.状态 === '进行中').length);
const highestAbilityLabel = computed(() => {
  const bestKey = [...ABILITY_KEYS].sort(
    (left, right) => data.value.角色.能力值[right] - data.value.角色.能力值[left],
  )[0];
  return `${bestKey} ${data.value.角色.能力值[bestKey]}`;
});
</script>

<style scoped lang="scss">
.status-shell {
  width: min(1380px, 100%);
  margin: 0 auto;
  display: grid;
  gap: 16px;
  padding: 16px;
  color: var(--dnd-text);
}

.hero-strip,
.hero-copy,
.hero-stats,
.page-shell,
.page-grid,
.metric-grid,
.stacked-list,
.panel-card,
.note-card {
  display: grid;
}

.hero-strip,
.page-shell {
  border: 1px solid var(--dnd-border);
  background:
    radial-gradient(circle at top left, rgba(215, 169, 91, 0.14), transparent 30%),
    linear-gradient(135deg, rgba(69, 48, 33, 0.96), rgba(20, 16, 13, 0.98));
  box-shadow: var(--dnd-shadow);
}

.hero-strip {
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
  gap: 16px;
  padding: 20px;
}

.hero-copy {
  gap: 8px;
}

.eyebrow,
.stat-card label,
.metric-card span {
  margin: 0;
  color: var(--dnd-text-soft);
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.hero-copy strong {
  font-family: var(--dnd-font-display);
  font-size: clamp(26px, 4vw, 44px);
  line-height: 0.96;
}

.hero-copy span {
  color: var(--dnd-text-soft);
  font-size: 14px;
}

.scene-summary {
  width: min(58ch, 100%);
  margin: 4px 0 0;
  line-height: 1.7;
  color: rgba(244, 231, 206, 0.88);
}

.hero-stats,
.metric-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.stat-card,
.metric-card,
.note-card,
.panel-card {
  gap: 8px;
  padding: 14px;
  border: 1px solid var(--dnd-border-soft);
  background: rgba(8, 6, 5, 0.28);
}

.stat-card--accent {
  background: linear-gradient(180deg, rgba(131, 73, 37, 0.34), rgba(18, 11, 9, 0.38));
}

.stat-card strong,
.metric-card strong,
.note-card strong {
  font-family: var(--dnd-font-display);
}

.stat-card strong {
  font-size: 24px;
}

.stat-card span,
.note-card p,
.note-card small {
  color: var(--dnd-text-soft);
}

.progress-track {
  width: 100%;
  height: 7px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.08);
}

.progress-track span {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #d06d43, #e3bc73);
}

.page-shell {
  gap: 12px;
  padding: 14px;
}

.page-grid {
  gap: 12px;
}

.stacked-list {
  gap: 10px;
}

.card-header h2,
.card-header p,
.note-card p,
.note-card small {
  margin: 0;
}

.note-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: baseline;
}

.bottom-nav {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 10px;
  padding-top: 8px;
  border-top: 1px solid rgba(215, 169, 91, 0.16);
}

.dice-summary-card {
  gap: 12px;
}

.dice-summary-card .card-header {
  display: grid;
  gap: 6px;
}

.dice-summary-card .card-header p {
  color: var(--dnd-text-soft);
  line-height: 1.7;
}

.dice-metric-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.embedded-panel {
  min-width: 0;
}

.nav-button {
  border: 1px solid rgba(215, 169, 91, 0.16);
  background: rgba(255, 255, 255, 0.03);
  color: var(--dnd-text-soft);
  padding: 12px 10px;
  cursor: pointer;
  transition:
    transform 160ms ease,
    border-color 160ms ease,
    background 160ms ease;
}

.nav-button--active {
  color: var(--dnd-text);
  border-color: rgba(215, 169, 91, 0.55);
  background: linear-gradient(180deg, rgba(215, 169, 91, 0.16), rgba(141, 79, 43, 0.2));
}

.nav-button:hover {
  transform: translateY(-1px);
}

@media (max-width: 1024px) {
  .hero-strip,
  .dice-metric-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .status-shell {
    padding: 12px;
  }

  .hero-strip,
  .page-shell {
    padding: 14px;
  }

  .hero-stats,
  .metric-grid,
  .bottom-nav {
    grid-template-columns: 1fr;
  }
}
</style>
