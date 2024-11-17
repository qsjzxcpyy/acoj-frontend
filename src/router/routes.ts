import { RouteRecordRaw } from "vue-router";
import UserLayout from "@/Layout/UserLayout.vue";
import UserLoginView from "@/views/user/UserLoginView.vue";
import UserRegisterView from "@/views/user/UserRegisterView.vue";
import UserLogoutView from "@/views/user/UserLogoutView.vue";
import NoAuthView from "@/views/NoAuthView.vue";
import ACCESS_ENUM from "@/access/ACCESS_ENUM";
import QuestionsView from "@/views/question/QuestionsView.vue";
import ViewQuestionView from "@/views/question/ViewQuestionView.vue";
import QuestionSubmitView from "@/views/question/QuestionSubmitView.vue";
import AiView from "@/views/question/AiView.vue";

// 使用动态导入替代静态导入
export const routes: Array<RouteRecordRaw> = [
  {
    path: "/user",
    name: "用户",
    component: UserLayout,
    meta: {
      hideInMeta: true,
    },
    children: [
      {
        path: "/user/login",
        name: "用户登录",
        component: UserLoginView,
      },
      {
        path: "/user/register",
        name: "用户注册",
        component: UserRegisterView,
      },
      {
        path: "/user/logout",
        name: "用户退出",
        component: UserLogoutView,
      },
    ],
  },
  {
    path: "/questions",
    name: "浏览题目",
    component: QuestionsView,
    meta: {
      hideInMenu: (route: any) => route.query.from === "contest",
    },
  },
  {
    path: "/question/submitted",
    name: "浏览题目提交",
    component: QuestionSubmitView,
  },
  {
    path: "/question/ai/ask",
    name: "AI助手",
    component: AiView,
  },
  {
    path: "/view/question/:id",
    name: "在线题目",
    component: ViewQuestionView,
    props: true,
    meta: {
      access: ACCESS_ENUM.USER,
      hideInMeta: true,
    },
  },
  {
    path: "/add/question",
    name: "创建题目",
    component: () => import("@/views/question/AddQuestionView.vue"),
    meta: {
      keepAlive: true,
      access: ACCESS_ENUM.ADMIN,
    },
  },
  {
    path: "/update/question",
    name: "修改题目",
    component: () => import("@/views/question/AddQuestionView.vue"),
    meta: {
      access: ACCESS_ENUM.USER,
      hideInMeta: true,
    },
  },
  {
    path: "/manage/question",
    name: "管理题目",
    component: () => import("@/views/question/ManageQuestionView.vue"),
    meta: {
      access: ACCESS_ENUM.ADMIN,
    },
  },
  {
    path: "/",
    name: "主页",
    component: QuestionsView,
    meta: {
      hideInMeta: true,
    },
  },
  {
    path: "/noAuth",
    name: "无权限",
    component: NoAuthView,
    meta: {
      hideInMeta: true,
    },
  },
  {
    path: "/contest/add",
    name: "添加比赛",
    component: () => import("@/views/content/AddContestView.vue"),
    meta: {
      access: ACCESS_ENUM.ADMIN,
      hideInMeta: true,
    },
  },
  {
    path: "/contest/list",
    name: "比赛列表",
    component: () => import("@/views/content/ContestListView.vue"),
  },
  {
    path: "/contest/select-questions",
    name: "选择比赛题目",
    component: QuestionsView,
    meta: {
      hideInMeta: true,
    },
  },
  {
    path: "/contest/manage",
    name: "管理比赛",
    component: () => import("@/views/content/ManageContestView.vue"),
    meta: {
      access: ACCESS_ENUM.ADMIN,
    },
  },
  {
    path: "/contest/detail/:id",
    name: "比赛详情",
    component: () => import("@/views/content/ContestDetailView.vue"),
    props: true,
    meta: {
      hideInMenu: true,
      hideInMeta: true,
    },
  },
  {
    path: "/view/saved-code",
    name: "查看提交代码",
    component: () => import("@/views/question/ViewSavedCodeView.vue"),
    meta: {
      hideInMenu: true,
      hideInMeta: true,
    },
  },
];
