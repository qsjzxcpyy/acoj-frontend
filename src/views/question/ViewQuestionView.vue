<template>
  <div id="ViewQuestionView">
    <a-row :gutter="[24, 24]" style="">
      <a-col :md="12" :xs="24">
        <a-tabs default-active-key="question">
          <a-tab-pane key="question" title="题目">
            <a-card v-if="question" :title="question.title">
              <a-descriptions
                title="题目限制"
                :column="{ xs: 1, md: 2, lg: 3 }"
              >
                <a-descriptions-item label="时间限制">
                  {{ question.judgeConfig.timeLimit ?? 0 }}ms
                </a-descriptions-item>
                <a-descriptions-item label="空间限制限制">
                  {{ question.judgeConfig.memoryLimit ?? 0 }}KB
                </a-descriptions-item>
              </a-descriptions>
              <MdViewer :value="question.content || ''" />
              <template #extra>
                <a-space wrap>
                  <a-tag
                    v-for="(tag, index) of question.tags"
                    :key="index"
                    color="green"
                    >{{ tag }}
                  </a-tag>
                </a-space>
              </template>
            </a-card>
          </a-tab-pane>
          <a-tab-pane key="comment" title="评论" disabled> //todo</a-tab-pane>
          <a-tab-pane key="answer" title="答案" v-if="question">
            <MdViewer :value="question.answer || ''" />
          </a-tab-pane>
        </a-tabs>
      </a-col>
      <a-col :md="12" :xs="24" style="margin-top: 58px">
        <a-form :model="form" layout="inline">
          <a-form-item field="language" label="编程语言">
            <a-select :style="{ width: '320px' }" v-model="form.language">
              <a-option>cpp</a-option>
              <a-option>go</a-option>
              <a-option>java</a-option>
            </a-select>
          </a-form-item>
        </a-form>
        <CodeEditor
          :value="form.code"
          :language="form.language"
          :handle-change="doCodeChange"
        />
        <a-divider size="0" />
        <a-button status="success" style="min-width: 200px" @click="doSubmit"
          >提交代码
        </a-button>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import {
  QuestionControllerService,
  QuestionSubmitAddRequest,
  QuestionVO,
} from "../../../generated";
import message from "@arco-design/web-vue/es/message";
import { onMounted, ref, withDefaults, defineProps } from "vue";
import CodeEditor from "@/components/CodeEditor.vue";
import MdViewer from "@/components/MdViewer.vue";

interface Props {
  id: string;
}

const props = withDefaults(defineProps<Props>(), {
  id: () => "",
});
const doCodeChange = (v: string) => {
  form.value.code = v;
};
const question = ref<QuestionVO>();
const form = ref<QuestionSubmitAddRequest>({
  code: "",
  questionId: props.id as any,
  language: "java",
});
const doSubmit = async () => {
  if (!form.value.questionId) return;
  const res = await QuestionControllerService.doQuestionSubmitUsingPost(
    form.value
  );
  if (res.code === 0) {
    message.success("提交成功");
  } else {
    message.error("提交失败," + res.message);
  }
};
const loadData = async () => {
  const res = await QuestionControllerService.getQuestionVoByIdUsingGet(
    props.id as any
  );
  if (res.code === 0) {
    question.value = res.data;
  } else {
    message.error("加载数据失败," + res.message);
  }
};
onMounted(() => {
  loadData();
});
</script>

<style>
#ViewQuestionView {
  max-width: 1350px;
  margin: 0 auto;
}

#ViewQuestionView .arco-space-horizontal .arco-space-item {
  margin-bottom: 0 !important;
}
</style>
