<template>
  <section class="guide-panel">
    <div class="guide-panel__head">
      <h3>不会填也没关系</h3>
      <p>先从下方推荐里选一个最接近你想象的答案，再按自己的口味微调文字即可。</p>
    </div>
    <div class="guide-grid">
      <article class="guide-card">
        <span>种族怎么选</span>
        <p>人类最均衡；矮人与半兽人更偏耐打；精灵与半身人更偏灵巧；龙裔、提夫林更有鲜明戏剧感。</p>
      </article>
      <article class="guide-card">
        <span>职业怎么选</span>
        <p>想正面战斗选战士、圣武士、野蛮人；想潜行机动选游荡者、武僧；想用法术解决问题选法师、术士、邪术师。</p>
      </article>
      <article class="guide-card">
        <span>背景怎么写</span>
        <p>写“角色过去做什么、为什么踏上旅途、现在最在意什么”就已经足够了。</p>
      </article>
    </div>
  </section>

  <div class="field-grid">
    <label class="field">
      <span>姓名</span>
      <input v-model="form.角色.姓名" type="text" />
    </label>
    <label class="field">
      <span>种族</span>
      <select v-model="form.角色.种族">
        <option v-for="option in RACE_OPTIONS" :key="option.value" :value="option.value">
          {{ option.value }} · {{ option.note }}
        </option>
      </select>
    </label>
    <label class="field">
      <span>职业</span>
      <select v-model="form.角色.职业">
        <option v-for="option in CLASS_OPTIONS" :key="option.value" :value="option.value">
          {{ option.value }} · {{ option.note }}
        </option>
      </select>
    </label>
    <label class="field">
      <span>等级</span>
      <input v-model.number="form.角色.等级" type="number" min="1" max="20" />
    </label>
    <label class="field">
      <span>阵营</span>
      <select v-model="form.角色.阵营">
        <option v-for="option in ALIGNMENT_OPTIONS" :key="option.value" :value="option.value">
          {{ option.value }} · {{ option.note }}
        </option>
      </select>
    </label>
    <label class="field">
      <span>熟练加值</span>
      <input v-model.number="form.角色.熟练加值" type="number" min="1" max="10" />
    </label>
  </div>

  <section class="choice-row">
    <article class="choice-panel">
      <span>背景模板</span>
      <div class="choice-chips">
        <button
          v-for="option in BACKGROUND_OPTIONS"
          :key="option.title"
          type="button"
          class="choice-chip"
          @click="applyBackground(option.text)"
        >
          {{ option.title }}
        </button>
      </div>
    </article>
    <article class="choice-panel">
      <span>一键灵感</span>
      <div class="choice-chips">
        <button type="button" class="choice-chip" @click="applyRoleplayHook('我必须证明自己配得上这个名字。')">证明自己</button>
        <button type="button" class="choice-chip" @click="applyRoleplayHook('有人欠我一个答案，而我会亲手找到它。')">追查真相</button>
        <button type="button" class="choice-chip" @click="applyRoleplayHook('只要同伴还在，我就不会退后。')">守护同伴</button>
      </div>
    </article>
  </section>

  <label class="field field--stack">
    <span>背景</span>
    <DeferredTextarea
      :model-value="form.角色.背景"
      rows="8"
      @update:model-value="value => (form.角色.背景 = value)"
      @preview-sync="value => $emit('preview-sync', { key: 'background', value })"
    />
  </label>
</template>

<script setup lang="ts">
import type { CharacterBookForm } from '../../../../shared/characterBook';
import DeferredTextarea from '../DeferredTextarea.vue';
import { ALIGNMENT_OPTIONS, BACKGROUND_OPTIONS, CLASS_OPTIONS, RACE_OPTIONS } from '../ui';

const props = defineProps<{
  form: CharacterBookForm;
}>();

const emit = defineEmits<{
  'preview-sync': [payload: { key: 'roleplayHook' | 'background'; value: string }];
}>();

function applyBackground(text: string) {
  props.form.角色.背景 = text;
  emit('preview-sync', { key: 'background', value: text });
}

function applyRoleplayHook(text: string) {
  props.form.roleplayHook = text;
  emit('preview-sync', { key: 'roleplayHook', value: text });
}
</script>
