<template>
  <div id="addContestView">
    <h2>{{ updatePage ? "更新比赛" : "创建比赛" }}</h2>
    <a-form :model="formData" label-align="left">
      <!-- 比赛标题 -->
      <a-form-item
        field="title"
        label="比赛标题"
        :rules="[{ required: true, message: '请输入比赛标题' }]"
      >
        <a-input v-model="formData.title" placeholder="请输入比赛标题" />
      </a-form-item>

      <!-- 比赛描述 -->
      <a-form-item
        field="description"
        label="比赛描述"
        :rules="[{ required: true, message: '请输入比赛描述' }]"
      >
        <MdEditor
          :value="formData.description"
          :handle-change="onDescriptionChange"
        />
      </a-form-item>

      <!-- 开始时间 -->
      <a-form-item
        field="startTime"
        label="开始时间"
        :rules="[{ required: true, message: '请选择开始时间' }]"
      >
        <a-date-picker
          v-model="formData.startTime"
          placeholder="请选择开始时间"
          show-time
          format="YYYY-MM-DD HH:mm:ss"
        />
      </a-form-item>

      <!-- 结束时间 -->
      <a-form-item
        field="endTime"
        label="结束时间"
        :rules="[{ required: true, message: '请选择结束时间' }]"
      >
        <a-date-picker
          v-model="formData.endTime"
          placeholder="请选择结束时间"
          show-time
          format="YYYY-MM-DD HH:mm:ss"
        />
      </a-form-item>

      <!-- 选择题目 -->
      <a-form-item
        label="比赛题目"
        :rules="[{ required: true, message: '请至少选择一道题目' }]"
      >
        <div v-if="selectedQuestions.length > 0">
          <a-list :data="selectedQuestions">
            <template #header>
              <div>已选择的题目</div>
            </template>
            <a-list-item
              v-for="question in selectedQuestions"
              :key="question.id"
            >
              <div class="question-item">
                <h4>第 {{ question.order }} 题：{{ question.title }}</h4>
                <p class="question-id">题目编号：{{ question.id }}</p>
                <div class="question-content">
                  <p>
                    标签:
                    <a-tag
                      v-for="(tag, index) in question.tags"
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
            {{ updatePage ? "更新比赛" : "创建比赛" }}
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
import { ContestAddRequest, ContestQuestionVO } from "@/types/contest";
import moment from "moment";
import { ContestControllerService, ContestVO } from "../../../generated";
import store from "@/store";

const route = useRoute();
const router = useRouter();

const updatePage = computed(() => !!route.query.id);

// 表单数据
const formData = ref<ContestAddRequest>({
  title: "",
  description: "",
  startTime: "",
  endTime: "",
  questions: [],
});

// 选中的题目列表
const selectedQuestions = ref<ContestQuestionVO[]>([]);

// 处理描述编辑器的变化
const onDescriptionChange = (v: string) => {
  formData.value.description = v;
};

// 提交表单
const doSubmit = async () => {
  try {
    // 验证必填字段
    if (
      !formData.value.title ||
      !formData.value.description ||
      !formData.value.startTime ||
      !formData.value.endTime ||
      !selectedQuestions.value.length
    ) {
      message.error("请填写所有必填字段");
      return;
    }

    console.log("提交前的formData:", formData.value);
    console.log(
      "route.query.id:",
      route.query.id,
      "类型:",
      typeof route.query.id
    );

    const submitData = {
      ...formData.value,
      id: updatePage.value ? String(route.query.id) : undefined,
      startTime: moment(formData.value.startTime).format("YYYY-MM-DD HH:mm:ss"),
      endTime: moment(formData.value.endTime).format("YYYY-MM-DD HH:mm:ss"),
      questions: selectedQuestions.value.map((q) => ({
        id: String(q.id),
        order: q.order,
      })),
    };

    console.log("最终提交的数据:", submitData);
    console.log(
      "提交数据中的id类型:",
      typeof submitData.id,
      "值:",
      submitData.id
    );

    if (updatePage.value) {
      const res = await ContestControllerService.updateContestUsingPost1(
        submitData
      );
      console.log("更新接口返回:", res);
      if (res.code === 0) {
        message.success("更新成功");
        router.push("/contest/manage");
      } else {
        message.error(res.message || "更新失败");
      }
    } else {
      const res = await ContestControllerService.addContestUsingPost1(
        submitData
      );
      console.log("创建接口返回:", res);
      if (res.code === 0) {
        message.success("创建成功");
        router.push("/contest/manage");
      } else {
        message.error(res.message || "创建失败");
      }
    }
  } catch (error) {
    console.error("提交失败，详细错误:", error);
    message.error("操作失败");
  }
};

// 跳转到选择题目页面
const goToSelectQuestions = () => {
  // 保存当前表单数据到 localStorage
  localStorage.setItem(
    "contestFormData",
    JSON.stringify({
      title: formData.value.title,
      description: formData.value.description,
      startTime: formData.value.startTime,
      endTime: formData.value.endTime,
    })
  );

  const query = {
    from: "contest",
    existingQuestions:
      selectedQuestions.value.length > 0
        ? encodeURIComponent(JSON.stringify(selectedQuestions.value))
        : undefined,
  };

  router.push({
    path: "/contest/select-questions",
    query,
  });
};

// 加载比赛详情
const loadContestDetail = async (id: string) => {
  try {
    console.log("开始加载比赛详情, 传入的id:", id);
    let res = await ContestControllerService.getContestByIdUsingGet1(id);
    console.log("API返回的原始数据:", res);
    if (res.code === 50030) {
      // 在其他地方调用
      store.dispatch("user/getLoginUser");
      res = await ContestControllerService.getContestByIdUsingGet1(id);
    }

    if (res.code === 0 && res.data) {
      const detail = res.data;

      formData.value = {
        id: String(detail.id),
        title: detail.name || "",
        description: detail.description || "",
        startTime: detail.startTime || "",
        endTime: detail.endTime || "",
        questions: detail.problems || [],
      };

      if (detail.problems && detail.problems.length > 0) {
        selectedQuestions.value = detail.problems.map((q) => ({
          id: String(q.id),
          title: q.title || "",
          order: q.problemOrder || 0,
          tags: q.tags || [],
        }));
      }
    } else {
      message.error(res.message || "加载比赛详情失败");
    }
  } catch (error) {
    console.error("加载失败，详细错误:", error);
    message.error("加载比赛详情失败");
  }
};

// 从路由参数中获取选中的题目
onMounted(() => {
  // 如果不是编辑页面，尝试恢复之前保存的表单数据
  if (!route.query.id) {
    const savedFormData = localStorage.getItem("contestFormData");
    if (savedFormData) {
      const parsedData = JSON.parse(savedFormData);
      formData.value = {
        ...formData.value,
        ...parsedData,
      };
      // 清除保存的数据
      localStorage.removeItem("contestFormData");
    }
  }

  const selectedQuestionsStr = route.query.selectedQuestions;
  if (selectedQuestionsStr) {
    try {
      const decodedStr = decodeURIComponent(selectedQuestionsStr as string);
      const questions = JSON.parse(decodedStr);
      if (Array.isArray(questions)) {
        selectedQuestions.value = questions.sort((a, b) => a.order - b.order);
      }
    } catch (error) {
      console.error("解析选中题目失败:", error);
      message.error("解析题目数据失败");
    }
  }

  // 如果是编辑页面，加载比赛详情
  if (route.query.id) {
    loadContestDetail(route.query.id as string);
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
