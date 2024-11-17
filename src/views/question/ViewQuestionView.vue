请结合以下代码和之前提供给你的代码分析一下为什么页面会卡死
<template>
  <div id="ViewQuestionView">
    <a-row :gutter="[24, 24]" style="">
      <a-col :md="12" :xs="24">
        <a-tabs default-active-key="question">
          <a-tab-pane key="question" title="题目">
            <a-card v-if="question1" :title="question1.title">
              <a-descriptions
                title="题目限制"
                :column="{ xs: 1, md: 2, lg: 3 }"
              >
                <a-descriptions-item label="时间限制">
                  {{ question1.judgeConfig.timeLimit ?? 0 }}ms
                </a-descriptions-item>
                <a-descriptions-item label="空间限制限制">
                  {{ question1.judgeConfig.memoryLimit ?? 0 }}KB
                </a-descriptions-item>
              </a-descriptions>
              <MdViewer :value="question1.content || ''" />
              <template #extra>
                <a-space wrap>
                  <a-tag
                    v-for="(tag, index) of question1.tags"
                    :key="index"
                    color="green"
                    >{{ tag }}
                  </a-tag>
                </a-space>
              </template>
            </a-card>
          </a-tab-pane>
          <a-tab-pane key="comment" title="评论" disabled> //todo</a-tab-pane>
          <a-tab-pane key="answer" title="答案" v-if="question1">
            <MdViewer :value="question1.answer || ''" />
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
          ref="codeEditorRef"
          :value="form.code"
          :language="form.language"
          :handle-change="doCodeChange"
        />
        <a-divider size="0" />
        <a-space>
          <a-button status="success" style="min-width: 200px" @click="doSubmit">
            提交代码
          </a-button>
          <a-button status="warning" @click="handleClearCode">
            清空代码
          </a-button>
        </a-space>
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
import {
  onMounted,
  ref,
  withDefaults,
  defineProps,
  onBeforeUnmount,
  nextTick,
} from "vue";
import CodeEditor from "@/components/CodeEditor.vue";
import MdViewer from "@/components/MdViewer.vue";
import store from "@/store";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import { Modal } from "@arco-design/web-vue";

interface Props {
  id: string;
}

const props = withDefaults(defineProps<Props>(), {
  id: () => "",
});
const doCodeChange = (v: string) => {
  if (form.value.code !== v) {
    form.value.code = v;
  }
  console.log("ViewQuestionView - 编辑器内容变化:", v);
};
const question1 = ref<QuestionVO>();

// 修改表单类型定义
interface SubmitForm extends QuestionSubmitAddRequest {
  contestId?: string; // 添加可选的比赛ID
}

// 修改表单初始值
const form = ref<SubmitForm>({
  code: "",
  questionId: props.id as any,
  language: "java",
  contestId: undefined, // 初始化比赛ID为undefined
});
const useStore1 = useStore();
const route = useRoute();
const router = useRouter();

// 添加生成代码存储key的函数
const getCodeStorageKey = (questionId: string, contestId?: string) => {
  if (contestId) {
    // 如果是比赛题目，使用比赛ID和题目ID的组合
    return `code_contest_${contestId}_question_${questionId}`;
  }
  // 普通题目只使用题目ID
  return `code_question_${questionId}`;
};

// 添加 codeEditorRef 的声明
const codeEditorRef = ref(null);

// 修改提交函数
const doSubmit = async () => {
  if (!form.value.questionId) return;

  // 使用新的key生成方式
  const codeKey = getCodeStorageKey(props.id, form.value.contestId);
  const saveData = {
    code: form.value.code,
    language: form.value.language,
    timestamp: new Date().getTime(),
    questionId: props.id,
    contestId: form.value.contestId,
  };
  localStorage.setItem(codeKey, JSON.stringify(saveData));

  try {
    const submitData = {
      code: form.value.code,
      language: form.value.language,
      questionId: form.value.questionId,
    };

    const res = await QuestionControllerService.doQuestionSubmitUsingPost1(
      submitData,
      form.value.contestId as any
    );

    if (res.code === 0) {
      message.success("提交成功");
      const token = res.data.refreshToken;
      if (token != null && token != "") {
        useStore1.commit("question/updateToken", token);
      }

      // 根据提交结果显示不同消息
      if (res.data.judgeInfo?.result === "Accepted") {
        message.success("恭喜你通过了这道题！");
      }

      // 跳转逻辑
      if (form.value.contestId) {
        router.push({
          path: "/question/submitted",
          query: {
            questionId: form.value.questionId,
            contestId: form.value.contestId,
            returnPath: route.fullPath,
          },
        });
      } else {
        router.push({
          path: "/question/submitted",
          query: {
            questionId: form.value.questionId,
            returnPath: route.fullPath,
          },
        });
      }
    } else if (res.code === 50030) {
      // token过期处理...
    } else {
      message.error("提交失败," + res.message);
    }
  } catch (error) {
    console.error("提交失败:", error);
    message.error("提交失败");
  }
};

const loadData = async () => {
  const res = await QuestionControllerService.getQuestionVoByIdUsingGet1(
    props.id as any
  );
  if (res.code === 0) {
    question1.value = res.data;
  } else {
    if (res.code === 40100) {
      const userInfo = {
        userName: "未登录",
        userProfile: "",
        userMailbox: "",
      };
      store.commit("user/updateUser", userInfo);
    }
    message.error("加载数据失败," + res.message);
  }
};
const getTokenAndsetToken = async () => {
  await useStore1.dispatch("question/getRequestToken");
};

// 修改 onMounted
onMounted(() => {
  loadData();
  getTokenAndsetToken();

  // 获取路由中的比赛ID
  const contestId = route.query.contestId;
  if (contestId) {
    form.value.contestId = contestId as string;
  }

  // 尝试恢复保存的代码
  const codeKey = getCodeStorageKey(props.id, form.value.contestId);
  const savedData = localStorage.getItem(codeKey);
  if (savedData) {
    try {
      const { code, language } = JSON.parse(savedData);
      form.value.code = code;
      form.value.language = language;
      console.log("已恢复保存的代码");
    } catch (error) {
      console.error("恢复代码失败:", error);
    }
  }
});

// 修改清空代码的处理函数
const handleClearCode = () => {
  Modal.confirm({
    title: "确认清空",
    content: "确定要清空当前代码吗？这个操作不可恢复。",
    onOk: async () => {
      const codeKey = getCodeStorageKey(props.id, form.value.contestId);
      localStorage.removeItem(codeKey);
      form.value.code = "";
      console.log("ViewQuestionView - 代码已清空");
      if (store.state.editor.code !== "") {
        store.commit("editor/updateCode", "xxxxx");
      }
      await useStore1.dispatch("editor/updateCode", "");
    },
  });
};
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
