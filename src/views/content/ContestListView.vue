<template>
  <div id="contestListView">
    <h2>比赛列表</h2>
    <!-- 搜索表单 -->
    <a-form :model="searchParams" layout="inline">
      <a-form-item field="title" label="比赛名称">
        <a-input
          v-model="searchParams.title"
          placeholder="请输入比赛名称"
          style="min-width: 240px"
        />
      </a-form-item>
      <a-form-item field="status" label="比赛状态">
        <a-select
          v-model="searchParams.status"
          placeholder="请选择状态"
          style="min-width: 120px"
          allow-clear
        >
          <a-option :value="1">未开始</a-option>
          <a-option :value="2">进行中</a-option>
          <a-option :value="3">已结束</a-option>
        </a-select>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="doSubmit">查询</a-button>
      </a-form-item>
    </a-form>
    <a-divider size="0" />

    <!-- 比赛列表 -->
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
      <!-- 状态列 -->
      <template #status="{ record }">
        <a-tag :color="getStatusColor(record)">
          {{ getStatusText(record) }}
        </a-tag>
      </template>

      <!-- 时间列 -->
      <template #time="{ record }">
        {{ moment(record.startTime).format("YYYY-MM-DD HH:mm") }}
        <br />
        至
        <br />
        {{ moment(record.endTime).format("YYYY-MM-DD HH:mm") }}
      </template>

      <!-- 题目列表列 -->
      <template #questions="{ record }">
        <div>
          <p>共 {{ record.problems?.length || 0 }} 道题目</p>
        </div>
      </template>

      <!-- 操作列 -->
      <template #optional="{ record }">
        <a-space>
          <!-- 未开始状态 -->
          <template v-if="getStatusText(record) === '未开始'">
            <a-button type="primary" @click="viewContestDetail(record)">
              查看详情
            </a-button>
          </template>

          <!-- 进行中状态 -->
          <template v-else-if="getStatusText(record) === '进行中'">
            <a-button
              type="primary"
              status="success"
              @click="joinContest(record)"
            >
              立即参加
            </a-button>
          </template>

          <!-- 已结束状态 -->
          <template v-else>
            <a-button
              type="primary"
              status="warning"
              @click="viewContestResult(record)"
            >
              查看结果
            </a-button>
          </template>

          <!-- 管理员编辑按钮 -->
          <a-button
            v-if="isAdmin"
            type="secondary"
            @click="updateContest(record)"
          >
            编辑
          </a-button>
        </a-space>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { useRouter } from "vue-router";
import moment from "moment";
import message from "@arco-design/web-vue/es/message";
import {
  ContestVO,
  ContestSearchParams,
  ContestQueryRequest,
} from "@/types/contest";
import { useStore } from "vuex";
import { ContestControllerService } from "../../../generated";

const router = useRouter();
const store = useStore();

const isAdmin = computed(
  () => store.state.user?.loginUser?.userRole === "admin"
);

const dataList = ref<ContestVO[]>([]);
const total = ref(0);

// 修改搜索参数的类型定义
interface SearchParams {
  title: string;
  status: number | undefined;
  pageSize: number;
  current: number;
}

const searchParams = ref<SearchParams>({
  title: "",
  status: undefined,
  pageSize: 10,
  current: 1,
});

// 定义表格列
const columns = [
  {
    title: "比赛名称",
    dataIndex: "name",
  },
  {
    title: "状态",
    slotName: "status",
  },
  {
    title: "时间",
    slotName: "time",
  },
  {
    title: "题目",
    slotName: "questions",
  },
  {
    title: "参赛人数",
    dataIndex: "participantCount",
  },
  {
    title: "创建时间",
    dataIndex: "createTime",
    render: ({ record }: { record: ContestVO }) =>
      moment(record.createTime).format("YYYY-MM-DD HH:mm"),
  },
  {
    title: "操作",
    slotName: "optional",
    width: 200,
  },
];

// 获取比赛状态
const getStatusText = (record: ContestVO): string => {
  const now = moment();
  const startTime = moment(record.startTime);
  const endTime = moment(record.endTime);

  if (now.isBefore(startTime)) {
    return "未开始";
  } else if (now.isAfter(endTime)) {
    return "已结束";
  } else {
    return "进行中";
  }
};

// 获取状态标签颜色
const getStatusColor = (record: ContestVO): string => {
  const status = getStatusText(record);
  const colorMap: Record<string, string> = {
    未开始: "blue",
    进行中: "green",
    已结束: "red",
  };
  return colorMap[status];
};

// 修改加载数据函数
const loadData = async () => {
  try {
    // 构造查询参数，确保所有必要的参数都有值
    const queryParams = {
      name: searchParams.value.title || undefined,
      status: searchParams.value.status,
      pageSize: searchParams.value.pageSize || 10,
      current: searchParams.value.current || 1,
      sortField: "createTime", // 添加排序字段
      sortOrder: "descend", // 添加排序顺序
    };

    console.log("查询参数:", queryParams);
    const res = await ContestControllerService.listContestByPageUsingPost1(
      queryParams
    );
    console.log("查询结果:", res);

    if (res.code === 0 && res.data) {
      dataList.value = res.data.records;
      total.value = res.data.total;
    } else if (res.code === 50030) {
      // token过期，重新登录
      await store.dispatch("user/getLoginUser");
      // 重新加载数据
      const newRes = await ContestControllerService.listContestByPageUsingPost1(
        queryParams
      );
      if (newRes.code === 0 && newRes.data) {
        dataList.value = newRes.data.records;
        total.value = newRes.data.total;
      } else {
        message.error(newRes.message || "加载数据失败");
      }
    } else {
      message.error(res.message || "加载数据失败");
    }
  } catch (error) {
    console.error("加载失败，详细错误:", error);
    message.error("加载数据失败");
  }
};

// 页面变化
const onPageChange = (page: number) => {
  searchParams.value.current = page;
  loadData();
};

// 提交搜索
const doSubmit = () => {
  searchParams.value.current = 1;
  loadData();
};

// 查看比赛详情
const viewContestDetail = (record: ContestVO) => {
  router.push(`/contest/detail/${record.id}`);
};

// 参加比赛
const joinContest = async (record: ContestVO) => {
  try {
    const res = await ContestControllerService.registerContestUsingPost1(
      record.id
    );
    if (res.code === 0) {
      message.success("报名成功");
      // 报名成功后跳转到比赛详情页
      router.push({
        path: `/contest/detail/${record.id}`,
        query: { registered: "true" }, // 传递报名状态
      });
    } else if (res.code === 50001) {
      router.push({
        path: `/contest/detail/${record.id}`,
        query: { registered: "true" }, // 传递报名状态
      });
    } else {
      message.error(res.message || "报名失败");
    }
  } catch (error) {
    console.error("报名失败:", error);
    message.error("操作失败");
  }
};

// 查看比赛结果
const viewContestResult = (record: ContestVO) => {
  router.push(`/contest/result/${record.id}`);
};

// 更新比赛（管理员功能）
const updateContest = (record: ContestVO) => {
  router.push({
    path: "/contest/add",
    query: { id: record.id },
  });
};

// 修改 onMounted
onMounted(() => {
  // 初始化搜索参数
  searchParams.value = {
    title: "",
    status: undefined,
    pageSize: 10,
    current: 1,
  };

  // 加载数据
  loadData();
});
</script>

<style scoped>
#contestListView {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h2 {
  margin-bottom: 24px;
}
</style>
