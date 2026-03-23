<template>
  <textarea
    :value="localValue"
    :rows="rows"
    :placeholder="placeholder"
    @input="handleInput"
    @blur="flushPreview"
  />
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue: string;
    rows?: number;
    placeholder?: string;
    debounceMs?: number;
  }>(),
  {
    rows: 4,
    placeholder: '',
    debounceMs: 180,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
  'preview-sync': [value: string];
}>();

const localValue = ref(props.modelValue);
let timer: ReturnType<typeof setTimeout> | null = null;

watch(
  () => props.modelValue,
  value => {
    if (value !== localValue.value) {
      localValue.value = value;
    }
  },
);

function schedulePreview(value: string) {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    emit('preview-sync', value);
    timer = null;
  }, props.debounceMs);
}

function handleInput(event: Event) {
  const value = (event.target as HTMLTextAreaElement).value;
  localValue.value = value;
  emit('update:modelValue', value);
  schedulePreview(value);
}

function flushPreview() {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  emit('preview-sync', localValue.value);
}

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer);
});
</script>
