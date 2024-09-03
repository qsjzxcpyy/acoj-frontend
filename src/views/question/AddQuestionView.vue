<template>
  <div id="addQuestionView">
    <h2>{{ updatePage ? "更新题目" : "创建题目" }}</h2>
    <a-form :model="form" label-align="left">
      <a-form-item field="title" label="题目标题">
        <a-input v-model="form.title" placeholder="请输入标题" />
      </a-form-item>
      <a-form-item field="tags" label="题目标签">
        <a-input-tag v-model="form.tags" placeholder="请输入标签" allow-clear />
      </a-form-item>
      <a-form-item field="content" label="题目内容">
        <MdEditor :value="form.content" :handle-change="onContentChange" />
      </a-form-item>

      <a-form-item label="题目限制" :content-flex="false" :merge-props="false">
        <a-space direction="vertical" style="min-width: 480px">
          <a-form-item field="judgeConfig.memoryLimit" label="内存限制">
            <a-input-number
              v-model="form.judgeConfig.memoryLimit"
              placeholder="请输入内存限制"
              mode="button"
              min="0"
              size="large"
            />
          </a-form-item>
          <a-form-item field="judgeConfig.timeLimit" label="时间限制">
            <a-input-number
              v-model="form.judgeConfig.timeLimit"
              placeholder="请输入时间限制"
              mode="button"
              min="0"
              size="large"
            />
          </a-form-item>
          <a-form-item field="judgeConfig.stackLimit" label="堆栈限制">
            <a-input-number
              v-model="form.judgeConfig.stackLimit"
              placeholder="请输入堆栈限制"
              mode="button"
              size="large"
              min="0"
            />
          </a-form-item>
        </a-space>
      </a-form-item>
      <a-form-item
        label="题目测试用例"
        :content-flex="false"
        :merge-props="false"
      >
        <a-form-item
          v-for="(judgeCaseItem, index) of form.judgeCase"
          :field="`judgeCase[${index}].value`"
          :key="index"
          no-style
        >
          <a-space direction="vertical" style="min-width: 480px">
            <a-form-item
              :field="`judgeCase[${index}].input`"
              :label="`输入用例-${index}`"
              :key="index"
            >
              <a-input
                v-model="judgeCaseItem.input"
                placeholder="请输入测试输入用例"
              />
            </a-form-item>
            <a-form-item
              :field="`judgeCase[${index}].output`"
              :label="`输出用例-${index}`"
              :key="index"
            >
              <a-input
                v-model="judgeCaseItem.output"
                placeholder="请输入测试输出用例"
              />
            </a-form-item>
            <a-button status="danger" @click="handleDeleteCaseItem(index)">
              删除
            </a-button>
          </a-space>
        </a-form-item>

        <div style="margin-top: 20px">
          <a-button @click="handleAddCaseItem" type="outline" status="success">
            新增测试用例
          </a-button>
        </div>
      </a-form-item>

      <a-form-item field="answer" label="答案">
        <MdEditor :value="form.answer" :handle-change="onAnswerChange" />
      </a-form-item>
      <div style="margin-top: 16px">
        <a-form-item>
          <a-button type="primary" style="min-width: 200px" @click="doSubmit">
            提交
          </a-button>
        </a-form-item>
      </div>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import MdEditor from "@/components/MdEditor.vue";
import {
  QuestionAddRequest,
  QuestionControllerService,
} from "../../../generated";
import message from "@arco-design/web-vue/es/message";
import { useRoute } from "vue-router";

const route = useRoute();

const form = ref({
  title: "",
  content: "",
  judgeConfig: {
    memoryLimit: 0,
    stackLimit: 0,
    timeLimit: 0,
  },
  judgeCase: [
    {
      input: "",
      output: "",
    },
  ],
  tags: [],
  answer: "",
} as QuestionAddRequest);

const updatePage = computed(() => route.path.includes("update"));

const doSubmit = async () => {
  if (updatePage.value) {
    const res = await QuestionControllerService.updateQuestionUsingPost1(
      form.value
    );
    if (res.code === 0) {
      message.success("更新成功");
    } else {
      message.error("更新失败," + res.message);
    }
  } else {
    const res = await QuestionControllerService.addQuestionUsingPost1(
      form.value
    );
    if (res.code === 0) {
      message.success("创建成功");
    } else {
      message.error("创建失败" + res.message);
    }
  }
};

const onAnswerChange = (v: string) => {
  form.value.answer = v;
};

const onContentChange = (v: string) => {
  form.value.content = v;
};

const handleAddCaseItem = () => {
  form.value.judgeCase.push({
    input: "",
    output: "",
  });
};

const handleDeleteCaseItem = (index: number) => {
  form.value.judgeCase.splice(index, 1);
};

const resetForm = () => {
  form.value = {
    title: "",
    content: "",
    judgeConfig: {
      memoryLimit: 0,
      stackLimit: 0,
      timeLimit: 0,
    },
    judgeCase: [
      {
        input: "",
        output: "",
      },
    ],
    tags: [],
    answer: "",
  } as QuestionAddRequest;
};

const loadData = async () => {
  if (updatePage.value) {
    const id = route.query.id;
    if (!id) return;
    const res = await QuestionControllerService.getQuestionByIdUsingGet1(
      id as any
    );
    if (res.code === 0) {
      form.value = res.data as any;
      if (!form.value.judgeCase) {
        form.value.judgeCase = [{ input: "", output: "" }];
      } else {
        form.value.judgeCase = JSON.parse(form.value.judgeCase as any);
      }
      if (!form.value.judgeConfig) {
        form.value.judgeConfig = {
          memoryLimit: 1000,
          stackLimit: 1000,
          timeLimit: 1000,
        };
      } else {
        form.value.judgeConfig = JSON.parse(form.value.judgeConfig as any);
      }
      if (!form.value.tags) {
        form.value.tags = [];
      } else {
        form.value.tags = JSON.parse(form.value.tags as any);
      }
    } else {
      message.error("加载数据失败," + res.message);
    }
  } else {
    resetForm();
  }
};

onMounted(() => {
  loadData();
});

watch(route, () => {
  loadData();
});
</script>

<style scoped>
#addQuestionView {
  /* 样式 */
}
</style>
