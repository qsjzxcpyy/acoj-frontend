<template>
  <div
    id="code-editor"
    ref="codeEditorRef"
    style="min-height: 590px; min-width: 820px"
  />
</template>

<script setup lang="ts">
import * as monaco from "monaco-editor";
import { onMounted, ref, toRaw, withDefaults, defineProps, watch } from "vue";
import store from "@/store";
import { debounce } from "lodash";

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

// 使用防抖来限制更新频率
const updateEditorContent = debounce((newValue: string) => {
  if (codeEditor.value) {
    const model = codeEditor.value.getModel();
    if (model) {
      const currentValue = model.getValue();
      if (currentValue !== newValue) {
        model.setValue(newValue);
        console.log("Editor content updated:", newValue);
      }
    }
  }
}, 300);

// 监听 language 的变化
watch(
  () => props.language,
  () => {
    if (codeEditor.value) {
      monaco.editor.setModelLanguage(
        toRaw(codeEditor.value).getModel(),
        props.language
      );
    }
  }
);

// 监听 store 中代码的变化
watch(
  () => store.state.editor.updateCode.code,
  (newCode) => {
    if (codeEditor.value) {
      console.log("Store code updated:", newCode);
      const currentValue = toRaw(codeEditor.value).getValue();
      if (currentValue !== newCode) {
        toRaw(codeEditor.value).setValue(newCode);
      }
    }
  }
);

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

  // 使用防抖来限制触发频率
  const debouncedHandleChange = debounce((value: string) => {
    props.handleChange(value);
  }, 300);

  codeEditor.value.onDidChangeModelContent(() => {
    const value = toRaw(codeEditor.value).getValue();
    debouncedHandleChange(value);
  });
});
</script>

<style scoped></style>
