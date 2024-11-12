<template>
  <div id="QuestionsView">
    <h2>{{ isSelecting ? "选择比赛题目" : "浏览题目" }}</h2>
    <a-form :model="searchParams" layout="inline">
      <a-form-item field="title" label="题目名称">
        <a-input
          v-model="searchParams.title"
          placeholder="请输入题目名称"
          style="min-width: 240px"
        />
      </a-form-item>
      <a-form-item field="tags" label="题目标签">
        <a-input-tag
          v-model="searchParams.tags"
          placeholder="请输入题目标签"
          style="min-width: 240px"
        />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="doSubmit">查询</a-button>
      </a-form-item>
    </a-form>
    <a-divider size="0" />
    <a-table
      :columns="columns"
      :data="dataList"
      :pagination="{
        showTotal: true,
        pageSize: searchParams.pageSize,
        current: searchParams.current,
        total: total,
      }"
      @page-change="onPageChange"
    >
      <template #optional="{ record }">
        <a-space>
          <a-checkbox
            v-if="isSelecting"
            :model-value="selectedQuestions.some((q) => q.id === record.id)"
            @change="() => handleSelectionChange(record)"
          >
            {{ getSelectionText(record) }}
          </a-checkbox>
          <a-button v-else type="primary" @click="toQuestionView(record)">
            做题
          </a-button>
        </a-space>
      </template>
      <template #tags="{ record }">
        <a-space wrap>
          <a-tag v-for="(tag, index) of record.tags" :key="index" color="green">
            {{ tag }}
          </a-tag>
        </a-space>
      </template>
      <template #acceptedRate="{ record }">
        {{
          `${
            record.submitNum
              ? ((record.acceptedNum / record.submitNum) * 100).toFixed(2)
              : "0"
          } %(${record.acceptedNum} / ${record.submitNum})`
        }}
      </template>
      <template #createTime="{ record }">
        {{ moment(record.createTime).format("YYYY-MM-DD") }}
      </template>
    </a-table>
    <div v-if="isSelecting" style="margin-top: 16px">
      <a-button type="primary" @click="submitSelection">提交选择</a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watchEffect, watch } from "vue";
import { Question, QuestionControllerService } from "../../../generated";
import message from "@arco-design/web-vue/es/message";
import { useRouter, useRoute, onBeforeRouteLeave } from "vue-router";
import moment from "moment";

const dataList = ref([]);
const total = ref(0);
const searchParams = ref({
  title: "",
  tags: [],
  pageSize: 10,
  current: 1,
});
const selectedQuestions = ref([]);
const isSelecting = ref(false);
const router = useRouter();
const route = useRoute();

const toQuestionView = (record: Question) => {
  router.push({
    path: `/view/question/${record.id}`,
  });
};

const loadData = async () => {
  const res = await QuestionControllerService.listQuestionVoByPageUsingPost1(
    searchParams.value
  );
  if (res.code === 0) {
    dataList.value = res.data.records;
    total.value = res.data.total;
  } else {
    message.error("加载数据失败," + res.message);
  }
};

const onPageChange = (page: number) => {
  searchParams.value = {
    ...searchParams.value,
    current: page,
  };
};

const doSubmit = () => {
  searchParams.value = {
    ...searchParams.value,
    current: 1,
  };
};
const handleSelectionChange = (record: Question) => {
  console.log("处理选择变更, 当前记录:", record);
  console.log("当前选中题目:", selectedQuestions.value);

  const isSelected = selectedQuestions.value.some((q) => q.id === record.id);

  if (isSelected) {
    // 取消选中，需要重新排序
    selectedQuestions.value = selectedQuestions.value
      .filter((q) => q.id !== record.id)
      .map((q, index) => ({
        ...q,
        order: index + 1, // 重新排序
      }));
  } else {
    // 新增选中
    selectedQuestions.value = [
      ...selectedQuestions.value,
      {
        ...record,
        order: selectedQuestions.value.length + 1,
      },
    ];
  }

  // 添加提示消息
  if (isSelected) {
    message.info(`已取消选择题目`);
  } else {
    message.success(`已选择为第 ${selectedQuestions.value.length} 题`);
  }

  console.log("更新后的选中题目:", selectedQuestions.value);
};

const submitSelection = () => {
  if (!selectedQuestions.value?.length) {
    message.warning("请至少选择一道题目");
    return;
  }

  // 确保题目顺序正确
  const orderedQuestions = selectedQuestions.value.map((q, index) => ({
    ...q,
    order: index + 1,
  }));

  try {
    const queryStr = JSON.stringify(orderedQuestions);
    router.push({
      path: "/contest/add",
      query: {
        selectedQuestions: queryStr,
      },
    });
  } catch (error) {
    console.error("提交选择时出错:", error);
    message.error("提交选择失败，请重试");
  }
};

watchEffect(() => {
  loadData();
});

onMounted(() => {
  console.log("组件挂载");
  console.log("路由参数:", route.query);

  // 设置选择模式
  isSelecting.value = route.query.from === "contest";

  // 如果有现有题目，则加载
  const existingQuestionsStr = route.query.existingQuestions as string;
  console.log("现有题目字符串:", existingQuestionsStr);

  if (existingQuestionsStr) {
    try {
      const decodedStr = decodeURIComponent(existingQuestionsStr);
      const parsedQuestions = JSON.parse(decodedStr);
      console.log("解析后的现有题目:", parsedQuestions);

      if (Array.isArray(parsedQuestions)) {
        selectedQuestions.value = parsedQuestions;
        console.log("设置选中题目:", selectedQuestions.value);
      }
    } catch (error) {
      console.error("解析现有题目失败:", error);
      message.error("解析题目数据失败");
      selectedQuestions.value = [];
    }
  } else {
    selectedQuestions.value = [];
  }

  loadData();
});

// 添加路由守卫，确保在离开页面时清空选择
onBeforeRouteLeave((to, from, next) => {
  if (to.path !== "/contest/add") {
    selectedQuestions.value = [];
  }
  next();
});

// 监听选中题目的变化
watch(
  selectedQuestions,
  (newVal) => {
    console.log("选中题目发生变化:", newVal);
  },
  { deep: true }
);

const getSelectionText = (record: Question) => {
  const index = selectedQuestions.value.findIndex((q) => q.id === record.id);
  if (index > -1) {
    return `已选为第 ${index + 1} 题`;
  }
  return `选择 (将作为第 ${selectedQuestions.value.length + 1} 题)`;
};

const columns = [
  {
    title: "题号",
    dataIndex: "id",
  },
  {
    title: "题目名称",
    dataIndex: "title",
  },
  {
    title: "标签",
    slotName: "tags",
  },
  {
    title: "通过率",
    slotName: "acceptedRate",
  },
  {
    title: "创建时间",
    slotName: "createTime",
  },
  {
    slotName: "optional",
  },
];
</script>

<style scoped>
#QuestionsView {
  max-width: 1350px;
  margin: 0 auto;
}
</style>
