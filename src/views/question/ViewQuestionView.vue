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
                  {{ question1.judgeConfig.timeLimit ?? 0 }}s
                </a-descriptions-item>
                <a-descriptions-item label="空间限制限制">
                  {{ question1.judgeConfig.memoryLimit ?? 0 }}MB
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
            <template v-if="isInContest">
              <a-result status="warning">
                <template #icon>
                  <icon-lock style="font-size: 48px; color: #ff7d00" />
                </template>
                <template #title>比赛进行中，无法查看答案</template>
                <template #subtitle>答案将在比赛结束后开放查看</template>
              </a-result>
            </template>
            <template v-else>
              <template v-if="isAnswerEmpty(question1.answer)">
                <a-result status="warning">
                  <template #icon>
                    <icon-exclamation-circle
                      style="font-size: 48px; color: #ff7d00"
                    />
                  </template>
                  <template #title>暂无答案</template>
                  <template #subtitle>该题目暂未设置答案</template>
                </a-result>
              </template>
              <template v-else>
                <div class="answer-content">
                  <div class="answer-box">
                    <MdViewer :value="question1.answer" />
                  </div>
                  <div class="answer-actions">
                    <a-button type="primary" @click="copyAnswer">
                      <template #icon>
                        <icon-copy />
                      </template>
                      复制答案
                    </a-button>
                  </div>
                </div>
              </template>
            </template>
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
          <a-button status="primary" @click="handleSaveCode">
            保存代码
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
import {
  IconLock,
  IconExclamationCircle,
  IconCopy,
} from "@arco-design/web-vue/es/icon";
import moment from "moment";
import { ContestControllerService } from "../../../generated";

interface Props {
  id: string;
}

const props = withDefaults(defineProps<Props>(), {
  id: () => "",
});
const doCodeChange = (v: string) => {
  if (form.value.code !== v) {
    form.value.code = v;
    console.log("ViewQuestionView - 代码已更新" + form.value.code);
  }
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

// 修改生成代码存储key的函数
const getCodeStorageKey = (questionId: string, contestId?: string) => {
  const userId = store.state.user.loginUser.id;
  if (contestId) {
    // 比赛模式的代码存储，加入用户ID
    return `contest_code_${contestId}_question_${questionId}_user_${userId}`;
  }
  // 普通模式的代码存储，加入用户ID
  return `normal_code_${questionId}_user_${userId}`;
};

// 添加 codeEditorRef 的声明
const codeEditorRef = ref(null);

// 修改提交函数
const doSubmit = async () => {
  if (!form.value.questionId) return;

  handleSaveCode();

  try {
    const submitData = {
      code: form.value.code,
      language: form.value.language,
      questionId: form.value.questionId,
    };

    let res = await QuestionControllerService.doQuestionSubmitUsingPost1(
      submitData,
      form.value.contestId as any
    );
    if (res.code === 50030) {
      // 在其他地方调用
      store.dispatch("user/getLoginUser");
      res = await QuestionControllerService.doQuestionSubmitUsingPost1(
        submitData,
        form.value.contestId as any
      );
    }

    if (res.code === 0) {
      message.success("提交成功");
      const token = res.data.refreshToken;
      if (token != null && token != "") {
        useStore1.commit("question/updateToken", token);
      }
      // 优化跳转逻辑
      if (form.value.contestId) {
        // 如果是比赛模式，跳转到比赛详情页的题目标签
        router.push({
          path: `/contest/detail/${form.value.contestId}`,
          query: {
            activeTab: "2", // 使用 "2" 来匹配比赛详情页题目标签
            questionId: form.value.questionId,
          },
        });
      } else {
        // 普通模式，跳转到提交记录页
        router.push({
          path: "/question/submitted",
          query: {
            questionId: form.value.questionId,
            returnPath: route.fullPath,
          },
        });
      }
    } else {
      message.error("提交失败," + res.message);
    }
  } catch (error) {
    console.error("提交失败:", error);
    message.error("提交失败");
  }
};
const loadData = async () => {
  // 检查题目是否在比赛中
  isInContest.value = await checkQuestionInContest();

  const res = await QuestionControllerService.getQuestionVoByIdUsingGet1(
    props.id as any
  );
  if (res.code === 0) {
    question1.value = res.data;
    console.log("answer:" + question1.value?.answer);
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
      const { code, language, from } = JSON.parse(savedData);
      // 检查代码来源是否匹配当前模式
      const currentMode = form.value.contestId ? "contest" : "normal";
      if (from === currentMode) {
        form.value.code = code;
        form.value.language = language;
        if (codeEditorRef.value) {
          codeEditorRef.value.updateContent(code);
        }
        console.log("currentMode:" + currentMode + " savedData.from:" + from);
        console.log(
          `已恢复${currentMode === "contest" ? "比赛" : "普通"}模式的代码`
        );
      }
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
    onOk: () => {
      const userId = store.state.user.loginUser.id;
      if (!userId) {
        message.error("请先登录");
        return;
      }

      const codeKey = getCodeStorageKey(props.id, form.value.contestId);
      localStorage.removeItem(codeKey);
      form.value.code = "";
      if (codeEditorRef.value) {
        codeEditorRef.value.updateContent("");
      }
      console.log(`${form.value.contestId ? "比赛" : "普通"}模式的代码已清空`);
    },
  });
};

// 修改保存代码的处理函数
const handleSaveCode = () => {
  const userId = store.state.user.loginUser.id;
  if (!userId) {
    message.error("请先登录");
    return;
  }

  const codeKey = getCodeStorageKey(props.id, form.value.contestId);
  const saveData = {
    code: form.value.code,
    language: form.value.language,
    timestamp: new Date().getTime(),
    questionId: props.id,
    contestId: form.value.contestId,
    userId: userId,
    // 添加来源标记
    from: form.value.contestId ? "contest" : "normal",
  };
  localStorage.setItem(codeKey, JSON.stringify(saveData));
  message.success(form.value.contestId ? "比赛代码已保存" : "代码已保存");
};

// 添加比赛时间检查函数
const isContestOngoing = (contestEndTime?: string) => {
  if (!contestEndTime) return false;
  return moment().isBefore(moment(contestEndTime));
};

// 添加检查题目是否在比赛中的函数
const checkQuestionInContest = async () => {
  try {
    const res =
      await ContestControllerService.checkQuestionInOngoingContestUsingGet1(
        props.id as any
      );
    if (res.code === 0) {
      return res.data;
    }
    return false;
  } catch (error) {
    console.error("检查题目是否在比赛中失败:", error);
    return false;
  }
};

// 添加响应式变量
const isInContest = ref(false);

// 添加检查答案是否为空的函数
const isAnswerEmpty = (answer: string | null): boolean => {
  if (answer === null) return true;
  return answer.trim() === "";
};

// 修改复制答案的方法
const copyAnswer = async () => {
  if (!question1.value?.answer) {
    message.error("无法复制答案");
    return;
  }

  try {
    // 处理答案文本，去掉首尾的代码标记
    let answerText = question1.value.answer;
    const lines = answerText.split("\n");

    // 检查并移除首尾的代码标记
    if (
      lines[0].startsWith("```") &&
      lines[lines.length - 1].startsWith("```")
    ) {
      // 移除第一行和最后一行
      lines.shift(); // 移除第一行
      lines.pop(); // 移除最后一行
      answerText = lines.join("\n");
    }

    // 创建临时文本区域
    const textArea = document.createElement("textarea");
    textArea.value = answerText;
    document.body.appendChild(textArea);

    // 选择文本
    textArea.select();
    textArea.setSelectionRange(0, textArea.value.length);

    // 尝试复制
    let success = false;
    try {
      // 首先尝试使用现代 API
      await navigator.clipboard.writeText(answerText);
      success = true;
    } catch {
      // 如果 clipboard API 失败，尝试使用 document.execCommand
      try {
        success = document.execCommand("copy");
      } catch (err) {
        console.error("execCommand 复制失败:", err);
      }
    }

    // 移除临时元素
    document.body.removeChild(textArea);

    // 根据复制结果显示提示
    if (success) {
      message.success("答案已复制到剪贴板");
    } else {
      message.error("复制失败，请手动复制");
    }
  } catch (err) {
    console.error("复制失败:", err);
    message.error("复制失败，请手动复制");
  }
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

.answer-locked,
.answer-empty {
  padding: 40px;
  text-align: center;
  background: #fff;
  border-radius: 8px;
  margin-top: 16px;
}

:deep(.arco-result) {
  padding: 48px 32px;
}

:deep(.arco-result-subtitle) {
  margin-top: 16px;
  color: #86909c;
  font-size: 15px;
}

.answer-content {
  position: relative;
}

.answer-box {
  margin-top: 16px;
  padding: 16px;
  background-color: #f5f5f5;
  border-radius: 4px;
  font-family: monospace;
}

.answer-box :deep(.markdown-body) {
  background-color: transparent;
}

.answer-box :deep(.markdown-body pre) {
  background-color: #e8e8e8;
}

.answer-actions {
  margin-top: 16px;
  display: flex;
  justify-content: flex-start;
}
</style>
