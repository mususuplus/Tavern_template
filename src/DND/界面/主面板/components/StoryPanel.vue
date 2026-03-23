<template>
  <section class="panel">
    <div class="panel-heading">
      <div>
        <p class="panel-kicker">Story</p>
        <h2>剧情记录</h2>
      </div>
      <div class="panel-actions">
        <button type="button" @click="addQuest">新增任务</button>
        <button type="button" @click="addLog">新增日志</button>
      </div>
    </div>

    <div class="scene-card">
      <label>
        <span>当前场景</span>
        <input v-model="data.剧情.当前场景" type="text" />
      </label>
      <label class="wide">
        <span>场景摘要</span>
        <textarea v-model="data.剧情.场景摘要" rows="3"></textarea>
      </label>
    </div>

    <div class="story-grid">
      <div class="story-column">
        <h3>任务</h3>
        <article v-for="[name, quest] in questEntries" :key="name" class="story-card">
          <strong>{{ name }}</strong>
          <select v-model="quest.状态">
            <option value="进行中">进行中</option>
            <option value="可选">可选</option>
            <option value="完成">完成</option>
          </select>
          <textarea v-model="quest.摘要" rows="2"></textarea>
          <input v-model="quest.目标" type="text" />
        </article>
      </div>

      <div class="story-column">
        <h3>战役日志</h3>
        <article v-for="[id, log] in logEntries" :key="id" class="story-card">
          <input v-model="log.标题" type="text" />
          <textarea v-model="log.内容" rows="3"></textarea>
          <input v-model="log.时间" type="text" />
        </article>
      </div>
    </div>

    <div class="story-grid secondary">
      <div class="story-column">
        <h3>关键线索</h3>
        <article v-for="[id, clue] in clueEntries" :key="id" class="story-card compact">
          <strong>{{ id }}</strong>
          <textarea v-model="data.剧情.关键线索[id]" rows="2"></textarea>
        </article>
      </div>

      <div class="story-column">
        <h3>剧情钩子</h3>
        <article v-for="[id, hook] in hookEntries" :key="id" class="story-card compact">
          <strong>{{ hook.标题 }}</strong>
          <select v-model="hook.状态">
            <option value="潜伏">潜伏</option>
            <option value="激活">激活</option>
            <option value="兑现">兑现</option>
          </select>
          <textarea v-model="hook.摘要" rows="2"></textarea>
          <small>{{ id }}</small>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useDndData } from '../../shared/useDndData';

const { data, questEntries, logEntries, clueEntries, hookEntries, addQuest, addLog } = useDndData();
</script>

<style scoped lang="scss">
.panel,
.panel-heading,
.scene-card,
.story-grid,
.story-column {
  display: grid;
  gap: 14px;
}

.panel-heading {
  grid-template-columns: 1fr auto;
  align-items: center;
}

.panel-kicker {
  margin: 0 0 6px;
  color: var(--dnd-accent);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.22em;
}

h2,
h3,
small {
  margin: 0;
}

.panel-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

button,
input,
textarea,
select {
  border: 1px solid var(--dnd-border-soft);
  background: rgba(0, 0, 0, 0.2);
  color: var(--dnd-text);
  padding: 10px 12px;
}

label,
.story-card {
  display: grid;
  gap: 8px;
  padding: 14px;
  border: 1px solid var(--dnd-border-soft);
  background: var(--dnd-panel-soft);
}

label span {
  color: var(--dnd-text-soft);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
}

.scene-card {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.wide {
  grid-column: 1 / -1;
}

.story-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.story-column {
  align-content: start;
}

.compact small {
  color: var(--dnd-text-soft);
}

@media (max-width: 960px) {
  .panel-heading,
  .scene-card,
  .story-grid {
    grid-template-columns: 1fr;
  }
}
</style>
