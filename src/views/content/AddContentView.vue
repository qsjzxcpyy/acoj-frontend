<template>
  <div id="addContestView">
    <h2>{{ updatePage ? "更新比赛" : "创建比赛" }}</h2>
    <a-form :model="form" label-align="left">
      <!-- 比赛标题 -->
      <a-form-item field="title" label="比赛标题">
        <a-input v-model="form.title" placeholder="请输入比赛标题" />
      </a-form-item>

      <!-- 开始时间 -->
      <a-form-item field="startTime" label="开始时间">
        <a-date-picker
          v-model="form.startTime"
          placeholder="请选择开始时间"
          show-time
          format="YYYY-MM-DD HH:mm:ss"
        />
      </a-form-item>

      <!-- 结束时间 -->
      <a-form-item field="endTime" label="结束时间">
        <a-date-picker
          v-model="form.endTime"
          placeholder="请选择结束时间"
          show-time
          format="YYYY-MM-DD HH:mm:ss"
        />
      </a-form-item>

      <!-- 比赛规则 -->
      <a-form-item field="rules" label="比赛规则">
        <MdEditor :value="form.rules" :handle-change="onRulesChange" />
      </a-form-item>

      <!-- 选择题目 -->
      <a-form-item label="比赛题目">
        <div v-if="selectedQuestions.length > 0">
          <a-list :data="selectedQuestions">
            <template #header>
              <div>已选择的题目</div>
            </template>
            <a-list-item v-for="item in selectedQuestions" :key="item.id">
              <div class="question-item">
                <h4>第 {{ item.order }} 题：{{ item.title }}</h4>
                <p class="question-id">题目编号：{{ item.id }}</p>
                <div class="question-content">
                  <p>内容: {{ item.content }}</p>
                  <p>
                    标签:
                    <a-tag
                      v-for="(tag, index) in item.tags"
                      :key="index"
                      color="blue"
                    >
                      {{ tag }}
                    </a-tag>
                  </p>
                </div>
              </div>
            </a-list-item>
          </a-list>
        </div>
        <div v-else>
          <a-empty description="暂未选择题目" />
        </div>
        <div style="margin-top: 16px">
          <a-button type="primary" @click="goToSelectQuestions">
            {{ selectedQuestions.length > 0 ? "重新选择题目" : "选择题目" }}
          </a-button>
        </div>
      </a-form-item>

      <!-- 提交按钮 -->
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
import { computed, ref, onMounted } from "vue";
import MdEditor from "@/components/MdEditor.vue";
import { useRoute, useRouter } from "vue-router";
import message from "@arco-design/web-vue/es/message";

const route = useRoute();
const router = useRouter();

const form = ref({
  title: "",
  description: "",
  startTime: null,
  endTime: null,
  judgeConfig: {
    memoryLimit: 0,
    stackLimit: 0,
    timeLimit: 0,
  },
  tags: [],
  rules: "",
});

const selectedQuestions = ref([]);

const updatePage = computed(() => route.path.includes("update"));

const doSubmit = () => {
  console.log("提交数据：", form.value);
};

const onRulesChange = (v: string) => {
  form.value.rules = v;
};

// 跳转到选择题目页面
const goToSelectQuestions = () => {
  console.log("准备跳转到选择题目页面");
  console.log("当前选中的题目:", selectedQuestions.value);

  const query = {
    from: "contest",
    existingQuestions:
      selectedQuestions.value?.length > 0
        ? encodeURIComponent(JSON.stringify(selectedQuestions.value))
        : undefined,
  };

  console.log("跳转查询参数:", query);

  router.push({
    path: "/contest/select-questions",
    query,
  });
};

// 从路由参数中获取选中的题目
onMounted(() => {
  console.log("组件挂载");
  const selectedQuestionsStr = route.query.selectedQuestions;

  if (selectedQuestionsStr) {
    try {
      const decodedStr = decodeURIComponent(selectedQuestionsStr as string);
      const questions = JSON.parse(decodedStr);

      if (Array.isArray(questions)) {
        selectedQuestions.value = questions.sort((a, b) => a.order - b.order);
        console.log("已加载选中题目:", selectedQuestions.value);
      }
    } catch (error) {
      console.error("解析选中题目失败:", error);
      message.error("解析题目数据失败");
      selectedQuestions.value = [];
    }
  }
});
</script>

<style scoped>
#addContestView {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

h2 {
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: bold;
  text-align: center;
}

a-form {
  width: 100%;
}

a-form-item {
  margin-bottom: 16px;
}

a-button {
  width: 100%;
}

.empty-text {
  text-align: center;
  color: #86909c;
  margin: 16px 0;
}

.question-item {
  width: 100%;
}

.question-item h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: bold;
}

.question-id {
  color: #86909c;
  margin-bottom: 8px;
}

.question-content {
  margin-top: 8px;
}

.question-content p {
  margin: 4px 0;
}

:deep(.arco-list-item) {
  padding: 16px;
}

:deep(.arco-tag) {
  margin-right: 8px;
}
</style>
