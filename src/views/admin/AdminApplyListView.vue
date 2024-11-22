<template>
  <div id="AdminApplyListView">
    <div class="header">
      <h2>管理员申请列表</h2>
      <a-radio-group
        v-model="filterStatus"
        type="button"
        @change="handleFilter"
      >
        <a-radio value="">全部</a-radio>
        <a-radio value="0">待处理</a-radio>
        <a-radio value="1">已通过</a-radio>
        <a-radio value="2">已拒绝</a-radio>
      </a-radio-group>
    </div>

    <a-table
      :loading="loading"
      :columns="columns"
      :data="applyList"
      :pagination="{
        total,
        current: current,
        pageSize: pageSize,
        showTotal: true,
      }"
      @page-change="onPageChange"
    >
      <template #status="{ record }">
        <a-tooltip :content="getStatusColor(record.status).text">
          <a-tag :color="getStatusColor(record.status).color">
            {{ getStatusColor(record.status).text }}
          </a-tag>
        </a-tooltip>
      </template>

      <template #reason="{ record }">
        <a-typography-paragraph :ellipsis="{ rows: 2 }">
          {{ record.reason }}
        </a-typography-paragraph>
      </template>

      <template #operation="{ record }">
        <a-space v-if="record.status === 0">
          <a-popover position="top" trigger="click">
            <template #content>
              <div class="handle-form">
                <a-textarea
                  v-model="handleForm.result"
                  placeholder="请输入处理意见..."
                  :auto-size="{ minRows: 2, maxRows: 4 }"
                />
                <div class="handle-buttons">
                  <a-button
                    type="primary"
                    size="small"
                    @click="handleApply(record, 1)"
                    :loading="handleLoading"
                  >
                    通过
                  </a-button>
                  <a-button
                    type="primary"
                    status="danger"
                    size="small"
                    @click="handleApply(record, 2)"
                    :loading="handleLoading"
                  >
                    拒绝
                  </a-button>
                </div>
              </div>
            </template>
            <a-button type="text">处理申请</a-button>
          </a-popover>
        </a-space>
        <span v-else>
          {{ record.result }}
          <template v-if="record.handleUserVO">
            ({{ record.handleUserVO.userName }})
          </template>
        </span>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Message } from "@arco-design/web-vue";
import { AdminControllerService } from "../../../generated";
import moment from "moment";

const loading = ref(false);
const handleLoading = ref(false);
const current = ref(1);
const pageSize = ref(10);
const total = ref(0);
const filterStatus = ref("");
const applyList = ref([]);

const handleForm = ref({
  result: "",
});

const columns = [
  {
    title: "申请人",
    dataIndex: "userVO.userName",
  },
  {
    title: "申请理由",
    slotName: "reason",
  },
  {
    title: "申请时间",
    dataIndex: "createTime",
    render: ({ record }) =>
      moment(record.createTime).format("YYYY-MM-DD HH:mm:ss"),
  },
  {
    title: "状态",
    slotName: "status",
  },
  {
    title: "处理结果",
    slotName: "operation",
  },
];

const getStatusColor = (status: number) => {
  switch (status) {
    case 0:
      return {
        color: "orange",
        text: "待处理",
      };
    case 1:
      return {
        color: "green",
        text: "已通过",
      };
    case 2:
      return {
        color: "red",
        text: "已拒绝",
      };
    default:
      return {
        color: "gray",
        text: "未知状态",
      };
  }
};

const loadData = async () => {
  try {
    loading.value = true;
    const res = await AdminControllerService.listApplicationsUsingPost1({
      status: filterStatus.value ? Number(filterStatus.value) : undefined,
      current: current.value,
      pageSize: pageSize.value,
    });

    if (res.code === 0 && res.data) {
      applyList.value = res.data.records;
      total.value = res.data.total;
    }
  } catch (error) {
    console.error("加载申请列表失败:", error);
    Message.error("加载申请列表失败");
  } finally {
    loading.value = false;
  }
};

const handleApply = async (record: any, status: number) => {
  if (!handleForm.value.result.trim()) {
    Message.warning("请输入处理意见");
    return;
  }

  try {
    handleLoading.value = true;
    const res = await AdminControllerService.handleApplicationUsingPost1({
      applicationId: record.id,
      status,
      result: handleForm.value.result,
    });

    if (res.code === 0) {
      Message.success(status === 1 ? "已通过申请" : "已拒绝申请");
      handleForm.value.result = "";
      loadData();
    } else {
      Message.error(res.message || "操作失败");
    }
  } catch (error) {
    Message.error("操作失败");
  } finally {
    handleLoading.value = false;
  }
};

const handleFilter = () => {
  current.value = 1;
  loadData();
};

const onPageChange = (page: number) => {
  current.value = page;
  loadData();
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
#AdminApplyListView {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.handle-form {
  min-width: 300px;
  padding: 8px;
}

.handle-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}
</style>
