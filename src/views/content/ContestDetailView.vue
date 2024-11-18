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
              <MdViewer :value="contestInfo.description || ''" />
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
              <a-tooltip :content="getStatusTooltip(record)">
                <a-tag :color="getQuestionStatusColor(record)">
                  {{ getQuestionStatusText(record) }}
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
              <div class="stats-wrapper">
                <a-tooltip
                  :content="`通过率: ${(
                    (record.acceptedNum / (record.submitNum || 1)) *
                    100
                  ).toFixed(1)}%`"
                >
                  <div class="stats-container">
                    <div class="stat-number accepted">
                      {{ record.acceptedNum }}
                    </div>
                    <span class="divider">/</span>
                    <div class="stat-number submitted">
                      {{ record.submitNum }}
                    </div>
                  </div>
                </a-tooltip>
              </div>
            </template>
          </a-table>
        </a-tab-pane>

        <!-- 排行榜标签页 -->
        <a-tab-pane key="3" title="排行榜">
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
            :pagination="{
              total: rankingPagination.total,
              current: rankingPagination.current,
              pageSize: rankingPagination.pageSize,
              showTotal: true,
            }"
            :bordered="false"
            size="medium"
            @page-change="handleRankingPageChange"
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
            <template #problemDetails="{ record }">
              <div class="problem-details">
                <template
                  v-for="problem in record.problemDetails"
                  :key="problem.problemId"
                >
                  <a-tooltip>
                    <template #content>
                      {{ problem.problemTitle }}
                      <br />
                      提交次数: {{ problem.submitCount }}
                      <br />
                      {{
                        problem.accepted
                          ? `通过时间: ${problem.firstAcceptedTime}分钟`
                          : "未通过"
                      }}
                      {{
                        problem.penaltyTime > 0
                          ? `罚时: ${problem.penaltyTime}分钟`
                          : ""
                      }}
                    </template>
                    <a-tag
                      :color="
                        problem.accepted
                          ? 'green'
                          : problem.submitCount > 0
                          ? 'red'
                          : 'gray'
                      "
                      class="problem-tag"
                    >
                      {{ problem.problemOrder }}
                      <template v-if="problem.accepted">
                        <icon-check class="status-icon" />
                      </template>
                      <template v-else-if="problem.submitCount > 0">
                        <icon-close class="status-icon" />
                      </template>
                      <template v-else>
                        <icon-minus class="status-icon" />
                      </template>
                    </a-tag>
                  </a-tooltip>
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
import MdViewer from "@/components/MdViewer.vue";

// 添加 Timer 类型定义
type Timer = ReturnType<typeof setInterval>;

const route = useRoute();
const router = useRouter();

// 添加 RankingItem 接口定义
interface RankingItem {
  rank: number;
  userName: string;
  userAvatar: string;
  totalScore: number;
  totalTime: number;
  penaltyTime: number;
  solvedProblems: number;
  problemDetails: {
    problemId: string;
    problemOrder: number;
    problemTitle: string;
    accepted: boolean;
    submitCount: number;
    firstAcceptedTime: number;
    penaltyTime: number;
  }[];
}

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
const rankings = ref<RankingItem[]>([]);

// 是否已报名
const isRegistered = ref(false);

// 添加当前标签页的响应式变量
const activeTab = ref(route.query.activeTab?.toString() || "1");

// 添加分页相关的响应式变量
const rankingPagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
});

// 获取比赛时长
const getDuration = () => {
  const start = moment(contestInfo.value.startTime);
  const end = moment(contestInfo.value.endTime);
  const duration = moment.duration(end.diff(start));

  // 计算总小时数和剩余分钟数
  const totalMinutes = duration.asMinutes();
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.floor(totalMinutes % 60);

  return hours > 0
    ? `${hours}小时${minutes > 0 ? minutes + "分钟" : ""}`
    : `${minutes}分钟`;
};

// 判断比赛是否已开始
const isContestStarted = computed(() => {
  const now = moment();
  const startTime = moment(contestInfo.value.startTime);
  return now.isAfter(startTime);
});

// 修改题目表格列定义
const questionColumns = computed(() => {
  // 如果比赛未开始，显示序号列
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
      title: "题名称",
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
      render: ({ record }) => `${record.acceptedNum}/${record.submitNum}`,
    },
  ];
});

// 修改排名表格列定义
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
    title: "总分",
    dataIndex: "totalScore",
    width: 100,
  },
  {
    title: "总用时",
    dataIndex: "totalTime",
    width: 100,
    render: ({ record }) => `${record.totalTime}分钟`,
  },
  {
    title: "罚时",
    dataIndex: "penaltyTime",
    width: 100,
    render: ({ record }) => `${record.penaltyTime}分钟`,
  },
  {
    title: "解题详情",
    slotName: "problemDetails",
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

// 获取态标签颜色
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

// 修改题目状态文本获取函数
const getQuestionStatusText = (question: ContestQuestion): string => {
  if (question.accepted) {
    return "✓"; // 通过显示对勾
  } else if (question.attempted) {
    return "✗"; // 未通过显示叉
  } else {
    return "-"; // 未尝试显示横
  }
};

// 修改状态颜色获取函数
const getQuestionStatusColor = (question: ContestQuestion): string => {
  if (question.accepted) {
    return "green"; // 通过为绿色
  } else if (question.attempted) {
    return "red"; // 未通过为红色
  } else {
    return "gray"; // 未尝试为灰色
  }
};

// 获取状态提示文本
const getStatusTooltip = (question: ContestQuestion): string => {
  if (question.accepted) {
    return `已通过 (尝试次数: ${question.attemptCount || 1})`;
  } else if (question.attempted) {
    return `未通过 (尝试次数: ${question.attemptCount || 1})`;
  } else {
    return "未尝试";
  }
};

// 修改 loadQuestionStatus 函数
const loadQuestionStatus = async () => {
  try {
    const contestId = route.params.id as string;
    // 获取用户在比赛中的提交记录
    let submissionsRes =
      await ContestControllerService.getUserContestSubmissionsUsingGet1(
        contestId as any
      );
    console.log("用户提交记录:", submissionsRes);

    if (submissionsRes.code === 50030) {
      // 在其他地方调用
      store.dispatch("user/getLoginUser");
      submissionsRes =
        await ContestControllerService.getUserContestSubmissionsUsingGet1(
          contestId as any
        );
    }
    let res1 =
      await ContestControllerService.getContestProblemStatisticsUsingGet1(
        contestId as any
      );
    if (res1.code === 50030) {
      // 在其他地方调用
      store.dispatch("user/getLoginUser");
      res1 =
        await ContestControllerService.getContestProblemStatisticsUsingGet1(
          contestId as any
        );
    }

    const questionStatusMap = new Map();
    if (submissionsRes.code === 0 && submissionsRes.data) {
      // 创建题目状态映射

      // 处理提交记录
      submissionsRes.data.forEach((submission) => {
        const questionId = submission.questionId;
        let questionStatus = {
          attempted: false,
          accepted: false,
          submitCount: 0,
        };
        questionStatus.accepted = submission.accepted as boolean;
        questionStatus.attempted = (submission.submitCount as number) > 0;
        questionStatus.submitCount = submission.submitCount as number;
        questionStatusMap.set(questionId, questionStatus);
      });
    }

    const totalQuestionStatusMap = new Map();

    if (res1.code === 0 && res1.data) {
      res1.data.forEach((problem) => {
        totalQuestionStatusMap.set(problem.problemId, {
          acceptedCount: problem.acceptedCount || 0,
          acceptedRate: problem.acceptedRate || 0,
          submitCount: problem.totalSubmissions || 0,
        });
      });
    }

    // 更新题目列表
    questions.value = questions.value.map((q) => {
      const status = questionStatusMap.get(q.id) || {
        attempted: false,
        accepted: false,
        submitNum: 0,
      };
      const totalStatus = totalQuestionStatusMap.get(q.id) || {
        acceptedCount: 0,
        acceptedRate: 0,
        attemptCount: 0,
      };
      return {
        ...q,
        attempted: status.attempted,
        accepted: status.accepted,
        attemptCount: status.submitCount,
        acceptedNum: totalStatus.acceptedCount,
        submitNum: totalStatus.submitCount,
      };
    });

    console.log("更新后的题目列表:", questions.value);
  } catch (error) {
    console.error("加载题目状态失败:", error);
  }
};

// 修改加载排名数据的函数
const loadRankings = async () => {
  try {
    const contestId = route.params.id;
    let res = await ContestControllerService.getContestRankDetailUsingGet1(
      contestId as any,
      rankingPagination.value.current,
      rankingPagination.value.pageSize
    );
    console.log("排名数据返回:", res);
    if (res.code === 50030) {
      // 在其他地方调用
      store.dispatch("user/getLoginUser");
      res = await ContestControllerService.getContestRankDetailUsingGet1(
        contestId as any,
        rankingPagination.value.current,
        rankingPagination.value.pageSize
      );
    }
    if (res.code === 0 && res.data) {
      // 处理排名数据
      rankings.value = res.data.records.map((item, index) => ({
        rank:
          (rankingPagination.value.current - 1) *
            rankingPagination.value.pageSize +
          index +
          1,
        userName: item.userVO?.userName || "未知用户",
        userAvatar: item.userVO?.userAvatar || "",
        totalScore: item.totalScore || 0,
        totalTime: item.totalTime || 0,
        penaltyTime: item.penaltyTime || 0,
        solvedProblems: item.solvedProblems || 0,
        problemDetails: item.problemDetails || [],
      }));
      // 更新总数
      rankingPagination.value.total = res.data.total;

      // 处理用户排名
      let userRankRes =
        await ContestControllerService.getMyContestRankUsingGet1(
          contestId as any
        );
      if (userRankRes.code === 50030) {
        // 在其他地方调用
        store.dispatch("user/getLoginUser");
        userRankRes = await ContestControllerService.getMyContestRankUsingGet1(
          contestId as any
        );
      }
      if (userRankRes.code === 0 && userRankRes.data) {
        userRank.value = userRankRes.data.rank || 0;
      }

      console.log("处理后的排名数据:", rankings.value);
    }
  } catch (error) {
    console.error("加载排名数据失败:", error);
    message.error("加载排名数据失败");
  }
};

// 添加分页变化处理函数
const handleRankingPageChange = async (page: number) => {
  rankingPagination.value.current = page;
  await loadRankings();
};

// 修改刷新排名函数
const refreshRanking = async () => {
  try {
    await loadRankings();
    message.success("排名已更新");
  } catch (error) {
    message.error("更新排名失败");
  }
};
// 修改 loadData 函数，添加排名数据的加载
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
          difficulty: "" as const,
        }));

        questions.value.sort((a, b) => a.order - b.order);
      }

      // 获取报名状态
      isRegistered.value =
        detail.isRegistered || route.query.registered === "true";

      // 加载题目状态
      await loadQuestionStatus();

      // 加载排名数据
      await loadRankings();

      console.log("数刷新完成");
    }
  } catch (error) {
    console.error("加载/刷新失败，详细错误:", error);
    message.error("加载数据失败");
  }
};

// 添加延迟执行函数
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// 修改路由监听
watch(
  [() => route.query, () => route.params],
  async ([newQuery, newParams], [oldQuery, oldParams]) => {
    console.log("路由变化检测 - 新查询参数:", newQuery);
    console.log("路由变化检测 - 旧查询参数:", oldQuery);

    if (
      newQuery.activeTab === "2" ||
      newParams.id !== oldParams?.id ||
      newQuery.questionId !== oldQuery?.questionId
    ) {
      // 延迟500毫秒后执行
      await delay(1100);
      await loadData();

      // 更新当前激活的标签页
      if (newQuery.activeTab) {
        activeTab.value = newQuery.activeTab.toString();
      }
    }
  },
  { deep: true, immediate: true }
);

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

  // 如果有指定的题目ID，可以进行相应的处理
  const questionId = route.query.questionId;
  if (questionId) {
    // 可以在这里理特定题目的高亮或滚动等
    console.log("需要定位到题目:", questionId);
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
  padding: 10px;
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
  display: inline-block;
  background-color: #52c41a;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
  min-width: 32px;
  text-align: center;
}

.submit-count {
  display: inline-block;
  background-color: #1890ff;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
  min-width: 32px;
  text-align: center;
}

.divider {
  color: #8c8c8c;
  margin: 0 4px;
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

.stats-wrapper {
  display: inline-flex;
  align-items: center;
}

.stats-container {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.stats-container:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.stat-number {
  min-width: 32px;
  padding: 2px 8px;
  border-radius: 4px;
  text-align: center;
  font-weight: 500;
  transition: all 0.3s;
  color: #fff;
}

.stat-number.accepted {
  background-color: #52c41a;
}

.stats-container:hover .stat-number.accepted {
  background-color: #389e0d;
  transform: translateY(-2px);
}

.stat-number.submitted {
  background-color: #1890ff;
}

.stats-container:hover .stat-number.submitted {
  background-color: #096dd9;
  transform: translateY(-2px);
}

.divider {
  color: #8c8c8c;
  margin: 0 2px;
  font-weight: bold;
  user-select: none;
}

.problem-details {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.problem-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-width: 40px;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.problem-tag:hover {
  transform: translateY(-2px);
}

.status-icon {
  font-size: 12px;
}

:deep(.arco-tag-green) {
  background-color: rgba(82, 196, 26, 0.1);
  border-color: rgb(82, 196, 26);
  color: rgb(82, 196, 26);
}

:deep(.arco-tag-green:hover) {
  background-color: rgb(82, 196, 26);
  color: white;
}

:deep(.arco-tag-red) {
  background-color: rgba(255, 77, 79, 0.1);
  border-color: rgb(255, 77, 79);
  color: rgb(255, 77, 79);
}

:deep(.arco-tag-red:hover) {
  background-color: rgb(255, 77, 79);
  color: white;
}

:deep(.arco-tag-gray) {
  background-color: rgba(134, 144, 156, 0.1);
  border-color: rgb(134, 144, 156);
  color: rgb(134, 144, 156);
}

:deep(.arco-tag-gray:hover) {
  background-color: rgb(134, 144, 156);
  color: white;
}
</style>
