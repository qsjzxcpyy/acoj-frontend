<template>
  <div id="manageContestView">
    <h2>比赛管理</h2>
    <!-- 搜索和操作区域 -->
    <div class="operation-area">
      <a-form :model="searchParams" layout="inline">
        <a-form-item field="title" label="比赛名称">
          <a-input
            v-model="searchParams.title"
            placeholder="请输入比赛名称"
            style="min-width: 240px"
          />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="doSubmit">查询</a-button>
            <a-button type="primary" @click="toAddContest">创建比赛</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </div>

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

      <!-- 操作列 -->
      <template #optional="{ record }">
        <a-space>
          <a-button type="primary" @click="updateContest(record)">
            编辑
          </a-button>
          <a-popconfirm
            content="确定要删除这个比赛吗？"
            @ok="deleteContest(record)"
          >
            <a-button type="primary" status="danger"> 删除</a-button>
          </a-popconfirm>
        </a-space>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import moment from "moment";
import message from "@arco-design/web-vue/es/message";
import { Contest, ContestSearchParams } from "@/types/contest";

const router = useRouter();
const dataList = ref<Contest[]>([]);
const total = ref(0);
const searchParams = ref<ContestSearchParams>({
  title: "",
  pageSize: 10,
  current: 1,
});

// 定义表格列
const columns = [
  {
    title: "比赛名称",
    dataIndex: "title",
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
    title: "参赛人数",
    dataIndex: "participantCount",
  },
  {
    title: "创建时间",
    dataIndex: "createTime",
    render: ({ record }) =>
      moment(record.createTime).format("YYYY-MM-DD HH:mm"),
  },
  {
    title: "操作",
    slotName: "optional",
    width: 200,
    fixed: "right",
  },
];

// 获取比赛状态
const getStatusText = (record: Contest): string => {
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
const getStatusColor = (record: Contest): string => {
  const status = getStatusText(record);
  const colorMap: Record<string, string> = {
    未开始: "blue",
    进行中: "green",
    已结束: "red",
  };
  return colorMap[status];
};

// 加载数据
const loadData = async () => {
  try {
    // TODO: 替换为实际的 API 调用
    // const res = await ContestControllerService.listContestByPageUsingPost(searchParams.value);
    // if (res.code === 0) {
    //   dataList.value = res.data.records;
    //   total.value = res.data.total;
    // }
  } catch (error) {
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

// 跳转到创建比赛页面
const toAddContest = () => {
  router.push("/contest/add");
};

// 更新比赛
const updateContest = (record: Contest) => {
  router.push({
    path: "/contest/add",
    query: { id: record.id },
  });
};

// 删除比赛
const deleteContest = async (record: Contest) => {
  try {
    // TODO: 替换为实际的 API 调用
    // const res = await ContestControllerService.deleteContestUsingPost(record.id);
    // if (res.code === 0) {
    message.success("删除成功");
    loadData(); // 重新加载数据
    // }
  } catch (error) {
    message.error("删除失败");
  }
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
#manageContestView {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h2 {
  margin-bottom: 24px;
}

.operation-area {
  margin-bottom: 16px;
}
</style>
