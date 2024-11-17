<template>
  <div id="ViewSavedCodeView">
    <h2>提交代码记录</h2>
    <a-descriptions :column="1">
      <a-descriptions-item label="题目">
        <a-link @click="goToQuestion">{{ questionTitle }}</a-link>
      </a-descriptions-item>
      <a-descriptions-item label="提交时间">
        {{ new Date(timestamp).toLocaleString() }}
      </a-descriptions-item>
      <a-descriptions-item label="编程语言">
        {{ language }}
      </a-descriptions-item>
    </a-descriptions>

    <!-- 根据不同情况显示不同内容 -->
    <template v-if="code === null">
      <div class="code-locked">
        <a-result status="warning">
          <template #icon>
            <icon-lock style="font-size: 48px; color: #ff7d00" />
          </template>
          <template #title> 比赛期间无法查看他人代码 </template>
          <template #subtitle> 代码将在比赛结束后开放查看 </template>
        </a-result>
      </div>
    </template>
    <template v-else>
      <a-textarea
        v-model="code"
        :auto-size="{ minRows: 20, maxRows: 50 }"
        readonly
        style="margin-top: 16px; font-family: monospace"
      />
      <div style="margin-top: 16px">
        <a-button type="primary" @click="copyCode">
          <template #icon>
            <icon-copy />
          </template>
          复制代码
        </a-button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Message } from "@arco-design/web-vue";
import { IconCopy, IconLock } from "@arco-design/web-vue/es/icon";
import { QuestionControllerService } from "../../../generated";

const route = useRoute();
const router = useRouter();

const code = ref<string | null>("");
const language = ref("java");
const timestamp = ref(0);
const questionId = ref("");
const questionTitle = ref("");
const contestId = ref("");

onMounted(async () => {
  const { codeKey } = route.query;
  if (!codeKey) {
    Message.error("未找到代码信息");
    return;
  }

  const savedData = localStorage.getItem(codeKey as string);
  if (savedData) {
    try {
      const data = JSON.parse(savedData);
      code.value = data.code;
      language.value = data.language;
      timestamp.value = data.timestamp;
      questionId.value = data.questionId;
      contestId.value = data.contestId;

      // 获取题目信息
      const res = await QuestionControllerService.getQuestionVoByIdUsingGet1(
        questionId.value as any
      );
      if (res.code === 0 && res.data) {
        questionTitle.value = res.data.title || "未知题目";
      }
    } catch (error) {
      Message.error("代码信息解析失败");
    }
  } else {
    Message.error("未找到提交的代码");
  }
});

// 添加复制代码的方法
const copyCode = async () => {
  if (!code.value) {
    Message.error("无法复制代码");
    return;
  }
  try {
    await navigator.clipboard.writeText(code.value);
    Message.success("代码已复制到剪贴板");
  } catch (err) {
    Message.error("复制失败，请手动复制");
  }
};

// 添加跳转到题目详情的方法
const goToQuestion = () => {
  if (questionId.value) {
    const query: any = { id: questionId.value };
    if (contestId.value) {
      query.contestId = contestId.value;
    }
    router.push({
      path: `/view/question/${questionId.value}`,
      query,
    });
  }
};
</script>

<style>
#ViewSavedCodeView {
  max-width: 1350px;
  margin: 0 auto;
  padding: 20px;
}

.arco-textarea {
  font-size: 14px;
  line-height: 1.5;
  background-color: #f5f5f5;
}

.code-locked {
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
</style>
