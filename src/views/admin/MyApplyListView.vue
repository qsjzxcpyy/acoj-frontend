<template>
  <div id="MyApplyListView">
    <h2>我的申请记录</h2>
    <a-table
      :loading="loading"
      :columns="columns"
      :data="applyList"
      :pagination="false"
    >
      <template #status="{ record }">
        <a-tooltip :content="getStatusColor(record.status).text">
          <a-tag :color="getStatusColor(record.status).color">
            {{ getStatusColor(record.status).text }}
          </a-tag>
        </a-tooltip>
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
const applyList = ref([]);

const columns = [
  {
    title: "申请时间",
    dataIndex: "createTime",
    render: ({ record }) =>
      moment(record.createTime).format("YYYY-MM-DD HH:mm:ss"),
  },
  {
    title: "申请理由",
    dataIndex: "reason",
  },
  {
    title: "状态",
    slotName: "status",
  },
  {
    title: "处理结果",
    dataIndex: "result",
    render: ({ record }) =>
      record.result
        ? `${record.result} ${
            record.handleUserVO
              ? `(处理人：${record.handleUserVO.userName})`
              : ""
          }`
        : "-",
  },
];

const getStatusColor = (status: number) => {
  switch (status) {
    case 0: // 待处理
      return {
        color: "orange",
        text: "待处理",
      };
    case 1: // 已通过
      return {
        color: "green",
        text: "已通过",
      };
    case 2: // 已拒绝
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
    const res = await AdminControllerService.getMyApplicationsUsingGet1();
    if (res.code === 0 && res.data) {
      applyList.value = res.data;
    }
  } catch (error) {
    console.error("加载申请记录失败:", error);
    Message.error("加载申请记录失败");
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
#MyApplyListView {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
</style>
