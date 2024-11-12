<template>
  <div id="contestDetailView">
    <!-- 比赛标题区域 -->
    <div class="contest-header">
      <div class="header-main">
        <div class="title-section">
          <h1>{{ contestInfo.title }}</h1>
          <a-tag :color="getStatusColor(contestInfo)" class="status-tag">
            {{ getStatusText(contestInfo) }}
          </a-tag>
        </div>
        <div class="header-info">
          <div class="info-item">
            <icon-calendar class="info-icon" />
            <span
              >开始时间：{{
                moment(contestInfo.startTime).format("YYYY-MM-DD HH:mm")
              }}</span
            >
          </div>
          <div class="info-item">
            <icon-clock-circle class="info-icon" />
            <span
              >结束时间：{{
                moment(contestInfo.endTime).format("YYYY-MM-DD HH:mm")
              }}</span
            >
          </div>
          <div class="info-item">
            <icon-hourglass class="info-icon" />
            <span>比赛时长：{{ getDuration() }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 比赛统计信息 -->
    <div class="contest-stats">
      <div class="stat-card">
        <icon-user-group class="stat-icon" />
        <div class="stat-info">
          <div class="stat-value">{{ contestInfo.participantCount }}</div>
          <div class="stat-label">参赛人数</div>
        </div>
      </div>
      <div class="stat-card">
        <icon-trophy class="stat-icon" />
        <div class="stat-info">
          <div class="stat-value">{{ userRank }}</div>
          <div class="stat-label">当前排名</div>
        </div>
      </div>
      <div class="stat-card">
        <icon-check-circle class="stat-icon" />
        <div class="stat-info">
          <div class="stat-value">
            {{ questions.filter((q) => q.accepted).length }}/{{
              questions.length
            }}
          </div>
          <div class="stat-label">已解决</div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="contest-main">
      <a-tabs type="text">
        <template #extra>
          <div class="tab-extra">
            <a-space>
              <a-button type="outline">
                <template #icon>
                  <icon-refresh />
                </template>
                刷新排名
              </a-button>
            </a-space>
          </div>
        </template>

        <!-- 比赛详情标签页 -->
        <a-tab-pane key="1" title="比赛说明">
          <div class="contest-description">
            <a-typography-paragraph>
              {{ contestInfo.description }}
            </a-typography-paragraph>
          </div>
        </a-tab-pane>

        <!-- 题目列表标签页 -->
        <a-tab-pane key="2" title="题目">
          <a-table
            :columns="questionColumns"
            :data="questions"
            :pagination="false"
            :bordered="false"
            size="medium"
          >
            <!-- 题目状态 -->
            <template #status="{ record }">
              <a-tag :color="getQuestionStatusColor(record)">
                {{ getQuestionStatusText(record) }}
              </a-tag>
            </template>

            <!-- 题目名称和标签 -->
            <template #title="{ record }">
              <a-space>
                <span class="question-order">{{ record.order }}.</span>
                <a @click="toQuestionView(record)" class="question-link">
                  {{ record.title }}
                </a>
                <div class="question-tags">
                  <a-tag
                    v-for="tag in record.tags"
                    :key="tag"
                    size="small"
                    color="arcoblue"
                  >
                    {{ tag }}
                  </a-tag>
                  <a-tag :color="getQuestionStatusColor(record)" size="small">
                    <template #icon>
                      <icon-check v-if="record.accepted" />
                      <icon-close v-else-if="record.attempted" />
                      <icon-minus v-else />
                    </template>
                    {{ getQuestionStatusText(record) }}
                  </a-tag>
                </div>
              </a-space>
            </template>

            <!-- 通过统计 -->
            <template #stats="{ record }">
              <a-tooltip>
                <template #content>
                  通过率:
                  {{
                    (
                      (record.acceptedNum / (record.submitNum || 1)) *
                      100
                    ).toFixed(1)
                  }}%
                </template>
                <a-space>
                  <span class="accepted-count">{{ record.acceptedNum }}</span>
                  <span class="divider">/</span>
                  <span class="submit-count">{{ record.submitNum }}</span>
                </a-space>
              </a-tooltip>
            </template>
          </a-table>
        </a-tab-pane>

        <!-- 排行榜标签页 -->
        <a-tab-pane key="3" title="排行榜">
          <a-table
            :columns="rankColumns"
            :data="rankings"
            :pagination="false"
            :bordered="false"
            size="medium"
          >
            <template #user="{ record }">
              <a-space>
                <a-avatar
                  v-if="record.userAvatar"
                  :size="24"
                  :src="record.userAvatar"
                />
                {{ record.userName }}
              </a-space>
            </template>
            <template #questionTimes="{ record }">
              <div class="question-times">
                <template
                  v-for="(time, index) in record.questionTimes"
                  :key="index"
                >
                  <a-tooltip
                    v-if="time"
                    :content="
                      formatQuestionTime(time, record.penalties?.[index])
                    "
                  >
                    <a-tag :color="getQuestionTimeColor(time)">
                      {{ formatDuration(time) }}
                    </a-tag>
                  </a-tooltip>
                  <a-tag v-else color="gray">-</a-tag>
                </template>
              </div>
            </template>
          </a-table>
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>

<style scoped>
#contestDetailView {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;
}

.contest-header {
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.header-main {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e5e6eb;
}

.title-section h1 {
  margin: 0;
  font-size: 32px;
  font-weight: bold;
  color: #1d2129;
}

.status-tag {
  padding: 0 16px;
  height: 32px;
  line-height: 30px;
  font-size: 16px;
  font-weight: 500;
}

.header-info {
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
  padding-top: 4px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #4e5969;
  font-size: 15px;
}

.info-icon {
  font-size: 18px;
  color: #86909c;
}

.contest-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 32px;
  color: #165dff;
  padding: 16px;
  background: rgba(22, 93, 255, 0.1);
  border-radius: 16px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #1d2129;
  line-height: 1.2;
}

.stat-label {
  font-size: 15px;
  color: #86909c;
  margin-top: 6px;
}

.contest-main {
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

:deep(.arco-tabs) {
  .arco-tabs-nav {
    margin-bottom: 24px;

    .arco-tabs-tab {
      font-size: 16px;
      padding: 12px 24px;

      &.arco-tabs-tab-active {
        font-weight: 600;
      }
    }
  }
}

.tab-extra {
  margin-right: 16px;
}

:deep(.arco-table) {
  .arco-table-th {
    background-color: #f7f8fa;
    font-size: 15px;
    padding: 16px;
  }

  .arco-table-td {
    padding: 16px;
    font-size: 14px;
  }

  .arco-table-tr:hover {
    background-color: #f2f3f5;
  }
}

.question-link {
  color: #165dff;
  text-decoration: none;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
}

.question-times {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

:deep(.arco-tag) {
  margin-right: 4px;
}

:deep(.arco-icon) {
  margin-right: 4px;
}

.accepted-count {
  color: #00b42a;
  font-weight: 500;
}

.submit-count {
  color: #86909c;
}

.divider {
  color: #86909c;
  margin: 0 2px;
}

.question-order {
  color: #86909c;
  font-weight: 500;
  min-width: 30px;
}

.question-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  align-items: center;
}

.contest-title {
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.contest-title h1 {
  margin: 0;
  font-size: 28px;
  font-weight: bold;
  color: #1d2129;
}
</style>

<script setup lang="ts">
import { onMounted, ref, computed, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import moment from "moment";
import message from "@arco-design/web-vue/es/message";
import { Contest, ContestQuestion } from "@/types/contest";
import {
  IconCalendar,
  IconClockCircle,
  IconHourglass,
  IconUserGroup,
  IconTrophy,
  IconCheckCircle,
  IconCheck,
  IconClose,
  IconMinus,
  IconRefresh,
} from "@arco-design/web-vue/es/icon";

const route = useRoute();
const router = useRouter();

// 比赛信息
const contestInfo = ref<Contest>({
  id: 0,
  title: "",
  startTime: "",
  endTime: "",
  participantCount: 0,
  description: "",
});

const userRank = ref(0);
const questions = ref<ContestQuestion[]>([]);
const rankings = ref([]);

// 获取比赛时长
const getDuration = () => {
  const start = moment(contestInfo.value.startTime);
  const end = moment(contestInfo.value.endTime);
  const duration = moment.duration(end.diff(start));
  return `${duration.hours()}小时${duration.minutes()}分钟`;
};

// 题目表格列定义
const questionColumns = [
  {
    title: "序号",
    dataIndex: "order",
    width: 80,
  },
  {
    title: "题目名称",
    slotName: "title",
  },
  {
    title: "状态",
    slotName: "status",
    width: 100,
  },
  {
    title: "通过/提交",
    slotName: "stats",
    width: 120,
  },
];

// 排名表格列定义
const rankColumns = [
  {
    title: "排名",
    dataIndex: "rank",
    width: 80,
  },
  {
    title: "选手",
    slotName: "user",
    width: 200,
  },
  {
    title: "得分",
    dataIndex: "score",
    width: 100,
  },
  {
    title: "罚时",
    dataIndex: "penalty",
    width: 100,
    render: ({ record }) => `${record.penalty}分钟`,
  },
  {
    title: "题目完成时间",
    slotName: "questionTimes",
  },
];

// 获取比赛状态
const getStatusText = (contest: Contest): string => {
  const now = moment();
  const startTime = moment(contest.startTime);
  const endTime = moment(contest.endTime);

  if (now.isBefore(startTime)) {
    return "未开始";
  } else if (now.isAfter(endTime)) {
    return "已结束";
  } else {
    return "进行中";
  }
};

// 获取状态标签颜色
const getStatusColor = (contest: Contest): string => {
  const status = getStatusText(contest);
  const colorMap: Record<string, string> = {
    未开始: "blue",
    进行中: "green",
    已结束: "red",
  };
  return colorMap[status];
};

// 格式化持续时间
const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0
    ? `${hours}:${mins.toString().padStart(2, "0")}`
    : `${mins}分钟`;
};

// 格式化题目完成时间提示
const formatQuestionTime = (time: number, penalties?: number): string => {
  return `用时：${formatDuration(time)}${
    penalties ? `\n尝试次数：${penalties}` : ""
  }`;
};

// 获取题目完成时间的标签颜色
const getQuestionTimeColor = (time: number): string => {
  if (time <= 60) return "green";
  if (time <= 120) return "blue";
  return "orange";
};

// 跳转到题目页面
const toQuestionView = (question: any) => {
  router.push({
    path: `/view/question/${question.id}`,
    query: {
      contestId: contestInfo.value.id,
    },
  });
};

// 加载数据
const loadData = async () => {
  try {
    const contestId = route.params.id;
    // TODO: 替换为实际的 API 调用
    // const res = await ContestControllerService.getContestDetailUsingGet(contestId);
    // if (res.code === 0) {
    //   contestInfo.value = res.data.contestInfo;
    //   questions.value = res.data.questions;
    //   rankings.value = res.data.rankings;
    //   userRank.value = res.data.userRank;
    // }
  } catch (error) {
    message.error("加载比赛信息失败");
  }
};

onMounted(async () => {
  await loadData();

  // 定时刷新排名
  const rankingInterval = setInterval(() => {
    const status = getStatusText(contestInfo.value);
    if (status === "进行中") {
      loadData();
    }
  }, 30000); // 每30秒刷新一次

  onBeforeUnmount(() => {
    clearInterval(rankingInterval);
  });
});

// 获取题目状态文本
const getQuestionStatusText = (question: ContestQuestion): string => {
  if (question.accepted) {
    return "已通过";
  }
  if (question.attempted) {
    return "尝试中";
  }
  return "未开始";
};

// 获取题目状态颜色
const getQuestionStatusColor = (question: ContestQuestion): string => {
  const statusMap: Record<string, string> = {
    已通过: "green",
    尝试中: "orange",
    未开始: "gray",
  };
  return statusMap[getQuestionStatusText(question)];
};
</script>
