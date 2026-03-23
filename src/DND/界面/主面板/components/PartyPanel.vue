<template>
  <section class="panel">
    <div class="panel-heading">
      <div>
        <p class="panel-kicker">Party</p>
        <h2>小队战术板</h2>
      </div>
      <button type="button" class="add-button" @click="addPartyMember">新增队员</button>
    </div>

    <div class="party-list">
      <article v-for="[name, member] in partyEntries" :key="name" class="member-card" :data-tone="getStatusTone(member.当前生命, member.生命上限)">
        <label class="wide">
          <span>姓名</span>
          <input :value="name" type="text" readonly />
        </label>
        <label>
          <span>职责</span>
          <input v-model="member.职责" type="text" />
        </label>
        <label>
          <span>生命</span>
          <input v-model.number="member.当前生命" type="number" min="0" max="999" />
        </label>
        <label>
          <span>生命上限</span>
          <input v-model.number="member.生命上限" type="number" min="1" max="999" />
        </label>
        <label>
          <span>先攻</span>
          <input v-model.number="member.先攻" type="number" min="-10" max="50" />
        </label>
        <label>
          <span>状态</span>
          <input v-model="member.状态" type="text" />
        </label>
        <label class="wide">
          <span>备注</span>
          <textarea v-model="member.备注" rows="2"></textarea>
        </label>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { getStatusTone } from '../../shared/model';
import { useDndData } from '../../shared/useDndData';

const { partyEntries, addPartyMember } = useDndData();
</script>

<style scoped lang="scss">
.panel,
.panel-heading,
.party-list {
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

h2 {
  margin: 0;
}

.add-button,
input,
textarea {
  border: 1px solid var(--dnd-border-soft);
  background: rgba(0, 0, 0, 0.2);
  color: var(--dnd-text);
  padding: 10px 12px;
}

.add-button {
  cursor: pointer;
}

.party-list {
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.member-card {
  display: grid;
  gap: 10px;
  padding: 14px;
  border: 1px solid var(--dnd-border-soft);
  background: var(--dnd-panel-soft);
}

.member-card[data-tone='stable'] {
  box-shadow: inset 0 0 0 1px rgba(109, 157, 110, 0.25);
}

.member-card[data-tone='worn'] {
  box-shadow: inset 0 0 0 1px rgba(215, 169, 91, 0.25);
}

.member-card[data-tone='critical'] {
  box-shadow: inset 0 0 0 1px rgba(182, 79, 63, 0.35);
}

label {
  display: grid;
  gap: 8px;
}

label span {
  color: var(--dnd-text-soft);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
}

.wide {
  grid-column: 1 / -1;
}
</style>
