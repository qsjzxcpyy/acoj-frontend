<template>
  <div id="QuestionsView">
    <h2>题目提交列表</h2>
    <a-form :model="searchParams" layout="inline">
      <a-form-item field="language" label="编程语言">
        <a-select :style="{ width: '320px' }" v-model="searchParams.language">
          <a-option>cpp</a-option>
          <a-option>go</a-option>
          <a-option>java</a-option>
        </a-select>
      </a-form-item>
      <a-form-item field="questionId" label="题目id">
        <a-input
          v-model="searchParams.questionId"
          placeholder="请输入题目id"
          style="min-width: 240px"
        />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="doQuery">查询</a-button>
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
      <template #judgeInfo="{ record }">
        {{ record.judgeInfo.message }}
      </template>
      <template #timeAndSpace="{ record }">
        {{ record.judgeInfo.time }} ms / {{ 110 || record.judgeInfo.memory }} KB
      </template>
      <template #createTime="{ record }">
        {{ moment(record.createTime).format("YYYY-MM-DD") }}
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watchEffect } from "vue";
import {
  QuestionControllerService,
  QuestionSubmitQueryRequest,
} from "../../../generated";
import message from "@arco-design/web-vue/es/message";
import { useRouter } from "vue-router";
import moment from "moment";

const dataList = ref([]);
const total = ref(0);
const searchParams = ref<QuestionSubmitQueryRequest>({
  questionId: undefined,
  language: undefined,
  sortField: "createTime",
  sortOrder: "descend",
  pageSize: 10,
  current: 1,
});

const router = useRouter();
const loadData = async () => {
  const res = await QuestionControllerService.listQuestionSubmitByPageUsingPost(
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
const doQuery = () => {
  searchParams.value = {
    ...searchParams.value,
    current: 1,
  };
};
// const timer = setInterval(() => {
//   loadData();
// }, 5000);
watchEffect(() => {
  loadData();
});
onMounted(() => {
  loadData();
  // //创建定时任务;
  // const timer = setInterval(() => {
  //   loadData();
  // }, 5000);
  //
  // // 监听页面关闭事件
  // onBeforeUnmount(() => {
  //   // 取消定时任务
  //   clearInterval(timer);
  // });
});
const columns = [
  {
    title: "题目id",
    dataIndex: "questionId",
  },
  {
    title: "编程语言",
    dataIndex: "language",
  },

  {
    title: "判题结果",
    slotName: "judgeInfo",
  },
  {
    title: "时间/空间",
    slotName: "timeAndSpace",
  },
  {
    title: "提交者 id",
    dataIndex: "userId",
  },
  {
    title: "创建时间",
    slotName: "createTime",
  },
];
</script>

<style scoped>
#QuestionsView {
  max-width: 1350px;
  margin: 0 auto;
}
</style>
