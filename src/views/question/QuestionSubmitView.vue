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
      <template #questionName="{ record }">
        {{ record.questionVO?.title || "未知题目" }}
      </template>
      <template #userName="{ record }">
        {{ record.userVO?.userName || "未知用户" }}
      </template>
      <template #judgeInfo="{ record }">
        {{ record.judgeInfo?.message || "正在评测" }}
      </template>
      <template #timeAndSpace="{ record }">
        {{ record.judgeInfo?.time || 0 }} ms /
        {{ record.judgeInfo?.memory ?? 0 }} KB
      </template>
      <template #createTime="{ record }">
        {{ moment(record.createTime).format("YYYY-MM-DD") }}
      </template>
      <template #code="{ record }">
        <a-link @click="viewCode(record)">查看代码</a-link>
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
import { useRouter, useRoute } from "vue-router";
import moment from "moment";
import { useStore } from "vuex";
import question from "@/store/question";
import store from "@/store";

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
const route = useRoute();

const loadData = async () => {
  const res =
    await QuestionControllerService.listQuestionSubmitByPageUsingPost1(
      searchParams.value
    );
  if (res.code === 0) {
    dataList.value = res.data.records;
    total.value = res.data.total;
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
  // 获取来源页面的信息
  const fromQuestion = route.query.questionId;
  const fromContest = route.query.contestId;
  const returnPath = route.query.returnPath as string;

  // 初始化搜索参数
  searchParams.value = {
    questionId: fromQuestion as string,
    language: undefined,
    sortField: "createTime",
    sortOrder: "descend",
    pageSize: 10,
    current: 1,
  };

  // 保存返回路径到 history state
  if (returnPath) {
    const state = {
      returnPath,
      fromContest,
      fromQuestion,
    };
    history.replaceState(state, "", window.location.href);

    // 添加 popstate 事件监听
    window.onpopstate = (event) => {
      const state = event.state;
      if (state?.returnPath) {
        // 返回到题目详情页
        router.replace(state.returnPath);
      } else {
        // 如果没有保存的路径，返回上一页
        router.go(-1);
      }
    };
  }

  loadData();
});

// 清理事件监听
onBeforeUnmount(() => {
  // 清除事件监听
  window.onpopstate = null;
});

const columns = [
  {
    title: "题目名称",
    slotName: "questionName",
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
    title: "提交者",
    slotName: "userName",
  },
  {
    title: "创建时间",
    slotName: "createTime",
  },
  {
    title: "代码",
    slotName: "code",
    width: 100,
  },
];

const viewCode = (record: any) => {
  // 保存代码到 localStorage
  const codeKey = `submit_code_${record.id}`;
  const saveData = {
    code: record.code,
    language: record.language,
    timestamp: record.createTime,
    questionId: record.questionId,
    from: record.contestId ? "contest" : "normal",
    submitId: record.id,
  };
  localStorage.setItem(codeKey, JSON.stringify(saveData));

  // 跳转到代码查看页面
  router.push({
    path: "/view/saved-code",
    query: {
      codeKey,
    },
  });
};
</script>

<style scoped>
#QuestionsView {
  max-width: 1350px;
  margin: 0 auto;
}
</style>
