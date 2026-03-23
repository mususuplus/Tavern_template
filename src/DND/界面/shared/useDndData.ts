import { computed } from 'vue';
import type { SchemaType } from '../../schema';
import { useDataStore } from '../store';
import { createRecordId, createTimeLabel, sortEntries } from './model';

export function useDndData() {
  const store = useDataStore();

  const data = computed<SchemaType>(() => store.data);
  const partyEntries = computed(() => _(data.value.小队).entries().value());
  const questEntries = computed(() => _(data.value.剧情.任务列表).entries().value());
  const logEntries = computed(() => sortEntries(data.value.剧情.战役日志));
  const clueEntries = computed(() => _(data.value.剧情.关键线索).entries().value());
  const hookEntries = computed(() => _(data.value.剧情.剧情钩子).entries().value());

  function addPartyMember() {
    const id = `队员${partyEntries.value.length + 1}`;
    store.data.小队[id] = {
      职责: '支援',
      当前生命: 12,
      生命上限: 12,
      状态: '待命',
      先攻: 0,
      备注: '新加入营地',
    };
  }

  function addQuest() {
    const id = `新任务${questEntries.value.length + 1}`;
    store.data.剧情.任务列表[id] = {
      状态: '可选',
      摘要: '记录新的委托或个人目标。',
      目标: '等待填写行动目标。',
    };
  }

  function addLog() {
    const id = createRecordId('log');
    store.data.剧情.战役日志[id] = {
      标题: '新营地记录',
      内容: '在这里记录新的剧情推进、遭遇战结果或 DM 备注。',
      时间: createTimeLabel(),
    };
  }

  return {
    store,
    data,
    partyEntries,
    questEntries,
    logEntries,
    clueEntries,
    hookEntries,
    addPartyMember,
    addQuest,
    addLog,
  };
}
