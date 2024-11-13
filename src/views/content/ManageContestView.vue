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

      <!-- 题目列表列 -->
      <template #questions="{ record }">
        <div>
          <p>共 {{ record.problems?.length || 0 }} 道题目</p>
        </div>
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
import { Contest, ContestSearchParams, ContestVO } from "@/types/contest";
import { ContestControllerService } from "../../../generated";
import store from "@/store";

const router = useRouter();
const dataList = ref<ContestVO[]>([]);
const total = ref(0);
const searchParams = ref<ContestSearchParams>({
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
    fixed: "right",
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

// 加载数据
const loadData = async () => {
  try {
    let res = await ContestControllerService.listContestByPageUsingPost1({
      title: searchParams.value.title,
      status: searchParams.value.status,
      current: searchParams.value.current,
      pageSize: searchParams.value.pageSize,
    });
    if (res.code === 50030) {
      // 在其他地方调用
      store.dispatch("user/getLoginUser");
      await ContestControllerService.listContestByPageUsingPost1({
        title: searchParams.value.title,
        status: searchParams.value.status,
        current: searchParams.value.current,
        pageSize: searchParams.value.pageSize,
      });
    }

    if (res.code === 0 && res.data) {
      dataList.value = res.data.records;
      total.value = res.data.total;
    } else {
      message.error(res.message || "加载数据失败");
    }
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

// 更新比赛前先获取比赛详情
const updateContest = async (record: ContestVO) => {
  try {
    // 先获取比赛详情
    const res = await ContestControllerService.getContestByIdUsingGet1(
      record.id
    );
    if (res.code === 0 && res.data) {
      // 清除之前可能存在的表单状态
      localStorage.removeItem("contestFormState");
      localStorage.removeItem("selectedContestQuestions");

      // 保存比赛基本信息到 localStorage
      const formState = {
        id: res.data.id,
        title: res.data.name,
        description: res.data.description,
        startTime: res.data.startTime,
        endTime: res.data.endTime,
      };
      localStorage.setItem("contestFormState", JSON.stringify(formState));

      // 保存题目信息到 localStorage
      if (res.data.problems) {
        localStorage.setItem(
          "selectedContestQuestions",
          JSON.stringify(res.data.problems)
        );
      }

      // 跳转到编辑页面
      router.push({
        path: "/contest/add",
        query: { id: String(res.data.id) }, // 确保 id 是字符串类型
      });
    } else {
      message.error(res.message || "获取比赛详情失败");
    }
  } catch (error) {
    message.error("获取比赛详情失败");
    console.error("获取比赛详情失败:", error);
  }
};

// 删除比赛
const deleteContest = async (record: ContestVO) => {
  try {
    const res = await ContestControllerService.deleteContestUsingPost1(
      record.id
    );
    if (res.code === 0) {
      message.success("删除成功");
      // 重新加载数据
      loadData();
    } else {
      message.error(res.message || "删除失败");
    }
  } catch (error) {
    message.error("删除失败");
    console.error("删除失败:", error);
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

.question-tooltip-item {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
}

.question-score {
  margin-left: 16px;
  color: #86909c;
}
</style>
