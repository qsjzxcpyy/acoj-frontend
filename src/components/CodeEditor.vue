<template>
  <div
    id="code-editor"
    ref="codeEditorRef"
    style="min-height: 590px; min-width: 820px"
  />
</template>

<script setup lang="ts">
import * as monaco from "monaco-editor";
import {
  onMounted,
  ref,
  toRaw,
  withDefaults,
  defineProps,
  defineExpose,
} from "vue";

interface Props {
  value: string;
  language?: string;
  handleChange: (v: string) => void;
}

const props = withDefaults(defineProps<Props>(), {
  value: () => "",
  language: () => "java",
  handleChange: (v: string) => {
    console.log(v);
  },
});

const codeEditorRef = ref();
const codeEditor = ref();

onMounted(() => {
  if (!codeEditorRef.value) return;

  codeEditor.value = monaco.editor.create(codeEditorRef.value, {
    value: props.value,
    language: props.language,
    automaticLayout: true,
    colorDecorators: true,
    minimap: {
      enabled: true,
      size: "fit",
      scale: 5,
    },
    readOnly: false,
    theme: "vs-dark",
  });

  codeEditor.value.onDidChangeModelContent(() => {
    props.handleChange(toRaw(codeEditor.value).getValue());
  });
});

// 暴露更新编辑器内容的方法
defineExpose({
  updateContent: (newValue: string) => {
    if (codeEditor.value) {
      if (toRaw(codeEditor.value).getValue() !== newValue)
        toRaw(codeEditor.value).setValue(newValue);
    }
  },
});
</script>

<style scoped></style>
