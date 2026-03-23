<template>
  <div class="record-stack">
    <section class="record-panel">
      <div class="record-panel__head">
        <h3>队伍</h3>
        <button type="button" class="mini-button" @click="form.队伍.push(createEmptyPartyMember())">新增</button>
      </div>
      <div class="record-list">
        <CharacterBookPartyMemberCard
          v-for="member in form.队伍"
          :key="member.id"
          :item="member"
          @remove="removeById(form.队伍, $event)"
        />
      </div>
    </section>

    <section class="record-panel">
      <div class="record-panel__head">
        <h3>任务与线索</h3>
        <div class="record-panel__actions">
          <button type="button" class="mini-button" @click="form.任务.push(createEmptyQuest())">任务</button>
          <button type="button" class="mini-button" @click="form.线索.push(createEmptyClue())">线索</button>
          <button type="button" class="mini-button" @click="form.剧情钩子.push(createEmptyHook())">钩子</button>
        </div>
      </div>
      <div class="record-list">
        <CharacterBookQuestCard
          v-for="quest in form.任务"
          :key="quest.id"
          :item="quest"
          @remove="removeById(form.任务, $event)"
        />
        <CharacterBookClueCard
          v-for="clue in form.线索"
          :key="clue.id"
          :item="clue"
          @remove="removeById(form.线索, $event)"
        />
        <CharacterBookHookCard
          v-for="hook in form.剧情钩子"
          :key="hook.id"
          :item="hook"
          @remove="removeById(form.剧情钩子, $event)"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import {
  createEmptyClue,
  createEmptyHook,
  createEmptyPartyMember,
  createEmptyQuest,
  type CharacterBookForm,
} from '../../../../shared/characterBook';
import CharacterBookClueCard from './story/CharacterBookClueCard.vue';
import CharacterBookHookCard from './story/CharacterBookHookCard.vue';
import CharacterBookPartyMemberCard from './story/CharacterBookPartyMemberCard.vue';
import CharacterBookQuestCard from './story/CharacterBookQuestCard.vue';

defineProps<{
  form: CharacterBookForm;
}>();

function removeById<T extends { id: string }>(list: T[], id: string) {
  const index = list.findIndex(item => item.id === id);
  if (index >= 0) list.splice(index, 1);
}
</script>
