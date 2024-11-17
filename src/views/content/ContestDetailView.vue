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
          <div class="registration-status">
            <a-tag v-if="isRegistered" color="green">
              <template #icon>
                <icon-check />
              </template>
              已报名
            </a-tag>
            <a-tag v-else color="orange">
              <template #icon>
                <icon-exclamation />
              </template>
              未报名
            </a-tag>
          </div>
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
      <a-tabs type="text" :default-active-key="activeTab">
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
          <!-- 比赛未开始时的提示 -->
          <template v-if="!isContestStarted">
            <div class="contest-not-started">
              <a-result
                status="warning"
                :subtitle="`比赛将于 ${moment(contestInfo.startTime).format(
                  'YYYY-MM-DD HH:mm:ss'
                )} 开始`"
              >
                <template #icon>
                  <icon-lock style="font-size: 48px; color: #ff7d00" />
                </template>
                <template #title>
                  比赛尚未开始，题目内容将在开始后显示
                </template>
              </a-result>
            </div>
          </template>

          <!-- 比赛开始后的题目列表 -->
          <a-table
            v-else
            :columns="questionColumns"
            :data="questions"
            :pagination="false"
            :bordered="false"
            size="medium"
          >
            <!-- 题目名称和标签 -->
            <template #title="{ record }">
              <a @click="toQuestionView(record)" class="question-link">
                {{ record.title }}
              </a>
            </template>

            <!-- 题目状态 -->
            <template #status="{ record }">
              <a-tooltip :content="getQuestionStatusText(record)">
                <a-tag :color="getQuestionStatusColor(record)">
                  <template #icon>
                    <icon-check-circle v-if="record.accepted" />
                    <icon-close-circle v-else-if="record.attempted" />
                    <icon-minus-circle v-else />
                  </template>
                  <span class="status-text">
                    <template v-if="record.submitCount > 0">
                      {{ record.submitCount }}次
                    </template>
                    <template v-else> 未尝试 </template>
                  </span>
                </a-tag>
              </a-tooltip>
            </template>

            <!-- 隐藏状态 -->
            <template #hiddenStatus>
              <a-tooltip content="比赛未开始">
                <a-tag color="gray">
                  <template #icon>
                    <icon-lock />
                  </template>
                </a-tag>
              </a-tooltip>
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
          <!-- 添加排行榜头部区域 -->
          <div class="rank-header">
            <div class="rank-title">
              <icon-trophy class="rank-icon" />
              <span>实时排名</span>
            </div>
            <a-button type="outline" @click="refreshRanking">
              <template #icon>
                <icon-refresh />
              </template>
              刷新排名
            </a-button>
          </div>

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

<script setup lang="ts">
import { onMounted, ref, computed, onBeforeUnmount, watch } from "vue";
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
  IconExclamation,
  IconLock,
  IconSync,
} from "@arco-design/web-vue/es/icon";
import {
  ContestControllerService,
  type QuestionSubmitVO,
} from "../../../generated";
import store from "@/store";

// 添加 Timer 类型定义
type Timer = ReturnType<typeof setInterval>;

const route = useRoute();
const router = useRouter();

// 比赛信息
const contestInfo = ref<Contest>({
  id: "",
  title: "",
  startTime: "",
  endTime: "",
  participantCount: 0,
  description: "",
});

const userRank = ref(0);
const questions = ref<ContestQuestion[]>([]);
const rankings = ref([]);

// 是否已报名
const isRegistered = ref(false);

// 添加当前标签页的响应式变量
const activeTab = ref((route.query.activeTab as string) || "1");

// 获取比赛时长
const getDuration = () => {
  const start = moment(contestInfo.value.startTime);
  const end = moment(contestInfo.value.endTime);
  const duration = moment.duration(end.diff(start));
  return `${duration.hours()}小时${duration.minutes()}分钟`;
};

// 判断比赛是否已开始
const isContestStarted = computed(() => {
  const now = moment();
  const startTime = moment(contestInfo.value.startTime);
  return now.isAfter(startTime);
});

// 修改题目表格列定义
const questionColumns = computed(() => {
  // 如果比赛未开始，只显示序号列
  if (!isContestStarted.value) {
    return [
      {
        title: "序号",
        dataIndex: "order",
        width: 80,
      },
      {
        title: "状态",
        slotName: "hiddenStatus",
        width: 100,
      },
    ];
  }

  // 比赛开始后显示完整信息
  return [
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
      width: 120,
    },
    {
      title: "通过/提交",
      slotName: "stats",
      width: 120,
    },
  ];
});

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

// 跳转到题目页
const toQuestionView = (question: any) => {
  router.push({
    path: `/view/question/${question.id}`,
    query: {
      contestId: String(contestInfo.value.id),
    },
  });
};

// 修改题目状态处理逻辑
const loadQuestionStatus = async () => {
  try {
    const contestId = route.params.id as string;
    // 获取用户在比赛中的提交记录
    const submissionsRes =
      await ContestControllerService.getUserContestSubmissionsUsingGet1(
        contestId as any
      );
    console.log("用户提交记录:", submissionsRes);

    if (submissionsRes.code === 0 && submissionsRes.data) {
      // 创建题目状态映射
      const questionStatusMap = new Map();

      // 处理提交记录
      submissionsRes.data.forEach((submission) => {
        const questionId = submission.questionId;
        const status = submission.status; // 获取提交状态
        console.log("题目提交状态:", status, "题目ID:", questionId);

        if (!questionStatusMap.has(questionId)) {
          questionStatusMap.set(questionId, {
            attempted: true,
            accepted: status === 2, // 2 表示通过
            submitCount: 1,
            status: status, // 保存状态码
          });
        } else {
          const currentStatus = questionStatusMap.get(questionId);
          currentStatus.submitCount += 1;
          if (status === 2) {
            // 如果有一次通过就标记为通过
            currentStatus.accepted = true;
          }
          currentStatus.status = status; // 更新最新状态
        }
      });

      // 更新题目列表
      questions.value = questions.value.map((q) => {
        const status = questionStatusMap.get(q.id) || {
          attempted: false,
          accepted: false,
          submitCount: 0,
          status: 0, // 默认状态
        };

        return {
          ...q,
          attempted: status.attempted,
          accepted: status.accepted,
          submitCount: status.submitCount,
          status: status.status, // 添加状态字段
        };
      });

      console.log("更新后的题目列表:", questions.value);
    }
  } catch (error) {
    console.error("加载题目状态失败:", error);
  }
};

// 修改状态文本获取函数
const getQuestionStatusText = (question: ContestQuestion): string => {
  // 根据状态码返回对应文本
  const statusMap: Record<number, string> = {
    0: "未提交",
    1: "待判题",
    2: "成功",
    3: "失败",
    4: "编译错误",
    5: "时间超限",
    6: "内存超限",
    7: "运行错误",
    8: "系统错误",
  };

  if (!question.attempted) {
    return "未提交";
  }

  return `${statusMap[question.status] || "未知状态"} (${
    question.submitCount
  }次提交)`;
};

// 修改状态颜色获取函数
const getQuestionStatusColor = (question: ContestQuestion): string => {
  // 根据状态码返回对应颜色
  const colorMap: Record<number, string> = {
    0: "gray", // 未提交
    1: "blue", // 待判题
    2: "green", // 成功
    3: "red", // 失败
    4: "orange", // 编译错误
    5: "orange", // 时间超限
    6: "orange", // 内存超限
    7: "red", // 运行错误
    8: "red", // 系统错误
  };

  if (!question.attempted) {
    return "gray";
  }

  return colorMap[question.status] || "gray";
};

// 添加路由监听

// 添加路由变化监听
watch(
  () => route.query,
  async (newQuery) => {
    // 如果是从题目提交页面跳转回来（activeTab === "2"）
    if (newQuery.activeTab === "2") {
      console.log("检测到从题目提交页面返回，刷新数据");
      await loadData();
    }
  },
  { deep: true }
);

// 修改 loadData 函数，添加更多日志
const loadData = async () => {
  try {
    const contestId = route.params.id as string;
    console.log("开始加载/刷新比赛详情, id:", contestId);

    const res = await ContestControllerService.getContestByIdUsingGet1(
      contestId as any
    );
    console.log("比赛详情返回:", res);

    if (res.code === 0 && res.data) {
      const detail = res.data;
      console.log("后端返回的原始数据:", detail);

      // 更新比赛基本信息
      contestInfo.value = {
        id: contestId,
        title: detail.name || "",
        description: detail.description || "",
        startTime: detail.startTime || "",
        endTime: detail.endTime || "",
        participantCount: detail.participantCount || 0,
      };
      // 更新题目列表
      if (detail.problems) {
        questions.value = detail.problems.map((p) => ({
          id: String(p.id),
          title: p.title || "",
          content: p.content || "",
          order: p.problemOrder || 0,
          acceptedNum: p.acceptedNum || 0,
          submitNum: p.submitNum || 0,
          tags: p.tags || [],
          accepted: false,
          attempted: false,
          difficulty: "中等" as const,
        }));

        questions.value.sort((a, b) => a.order - b.order);
      }

      // 获取报名状态
      isRegistered.value =
        detail.isRegistered || route.query.registered === "true";

      // 加载题目状态
      await loadQuestionStatus();

      console.log("数据刷新完成");
    }
  } catch (error) {
    console.error("加载/刷新失败，详细错误:", error);
    message.error("加载数据失败");
  }
};

// 修改刷新排名函数
const refreshRanking = async () => {
  try {
    await loadData();
    message.success("排名已更新");
  } catch (error) {
    message.error("更新排名失败");
  }
};

// 在 onMounted 中初始化数据
onMounted(async () => {
  // 如果 URL 中有 activeTab 参数，直接使用
  if (route.query.activeTab) {
    activeTab.value = route.query.activeTab as string;
  }

  await loadData();

  // 只在比赛进行中且在排行榜标签页时才启动定时刷新
  let refreshInterval: Timer | null = null;

  // 监听标签页变化
  const tabs = document.querySelector(".arco-tabs");
  if (tabs) {
    const observer = new MutationObserver(() => {
      const isRankingTab = tabs.querySelector(
        '.arco-tabs-tab-active[title="排行榜"]'
      );
      const status = getStatusText(contestInfo.value);

      // 如果在排行榜标签页且比赛进行中，启动定时刷新
      if (isRankingTab && status === "进行中") {
        if (!refreshInterval) {
          refreshInterval = setInterval(async () => {
            await loadData();
          }, 30000);
        }
      } else {
        // 否则清除定时刷新
        if (refreshInterval) {
          clearInterval(refreshInterval);
          refreshInterval = null;
        }
      }
    });

    observer.observe(tabs, {
      subtree: true,
      childList: true,
      attributes: true,
    });

    // 组件卸载时清理
    onBeforeUnmount(() => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
      observer.disconnect();
    });
  }
});
</script>
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
  display: none;
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
  font-size: 15px;

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
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 4px;
}

.question-tags .arco-tag {
  margin: 0;
  font-size: 12px;
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

.registration-status {
  margin-left: auto;
}

.registration-status .arco-tag {
  padding: 0 12px;
  height: 28px;
  line-height: 26px;
  font-size: 14px;
}

.contest-not-started {
  padding: 40px 0;
  text-align: center;
  background: #fff;
  border-radius: 8px;
}

:deep(.arco-result) {
  padding: 48px 32px;
}

:deep(.arco-result-subtitle) {
  margin-top: 16px;
  color: #86909c;
  font-size: 15px;
}

.start-time {
  color: #86909c;
  margin-top: 8px;
}

.question-status {
  display: flex;
  align-items: center;
  gap: 4px;
}

.status-icon {
  font-size: 16px;
}

.status-accepted {
  color: #00b42a;
}

.status-attempted {
  color: #ff7d00;
}

.status-not-started {
  color: #86909c;
}

.question-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.question-order {
  color: #86909c;
  font-weight: 500;
  min-width: 60px;
}

.question-link {
  color: #165dff;
  text-decoration: none;
  font-weight: 500;
  font-size: 15px;

  &:hover {
    text-decoration: underline;
  }
}

.question-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 4px;
}

.question-tags .arco-tag {
  margin: 0;
  font-size: 12px;
}

.status-text {
  margin-left: 4px;
  font-size: 12px;
}

:deep(.arco-tag) {
  padding: 2px 8px;

  .arco-icon {
    font-size: 14px;
    vertical-align: -2px;
  }
}

:deep(.arco-tag-green) {
  background-color: rgba(0, 180, 42, 0.1);
  border-color: #00b42a;
  color: #00b42a;
}

:deep(.arco-tag-orange) {
  background-color: rgba(255, 125, 0, 0.1);
  border-color: #ff7d00;
  color: #ff7d00;
}

:deep(.arco-tag-gray) {
  background-color: rgba(134, 144, 156, 0.1);
  border-color: #86909c;
  color: #86909c;
}

/* 添加排行榜相关样式 */
.rank-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px;
  background: #f7f8fa;
  border-radius: 8px;
}

.rank-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
  color: #1d2129;
}

.rank-icon {
  font-size: 20px;
  color: #ffb400;
}
</style>
