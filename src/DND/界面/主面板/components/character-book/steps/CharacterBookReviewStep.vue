<template>
  <section class="review-block">
    <h3>最后检查这些内容</h3>
    <p>确认姓名、职业、种族与动机都已经稳定，再保存到 0 层角色数据。</p>
    <p>如果你还没想好某段长文本，也可以先保存一个可运行版本，后续再回到建卡页继续补充。</p>
  </section>

  <section class="margin-notes">
    <article>
      <span>角色名</span>
      <strong>{{ form.角色.姓名 || '未命名冒险者' }}</strong>
    </article>
    <article>
      <span>当前场景</span>
      <strong>{{ form.剧情.当前场景 || '尚未填写' }}</strong>
    </article>
    <article>
      <span>故事抓手</span>
      <p>{{ firstStorySeed }}</p>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { CharacterBookForm } from '../../../../shared/characterBook';

const props = defineProps<{
  form: CharacterBookForm;
}>();

const firstStorySeed = computed(() => {
  const quest = props.form.任务[0];
  const hook = props.form.剧情钩子[0];
  return quest?.目标 || hook?.摘要 || '下一段冒险尚未落笔。';
});
</script>
