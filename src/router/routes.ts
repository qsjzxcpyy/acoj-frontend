import { RouteRecordRaw } from "vue-router";
import HomeView from "@/views/ExampleView.vue";
import UserLayout from "@/Layout/UserLayout.vue";
import UserLoginView from "@/views/user/UserLoginView.vue";
import UserRegisterView from "@/views/user/UserRegisterView.vue";
import AdminView from "@/views/AdminView.vue";
import NoAuthView from "@/views/NoAuthView.vue";
import ACCESS_ENUM from "@/access/ACCESS_ENUM";
import AddQuestionView from "@/views/question/AddQuestionView.vue";
import ManageQuestionView from "@/views/question/ManageQuestionView.vue";
import QuestionsView from "@/views/question/QuestionsView.vue";
import ViewQuestionView from "@/views/question/ViewQuestionView.vue";
import QuestionSubmitView from "@/views/question/QuestionSubmitView.vue";
import UserLogoutView from "@/views/user/UserLogoutView.vue";
import AiView from "@/views/question/AiView.vue";
import AddContentView from "@/views/content/AddContentView.vue";

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
    props: true, //动态路由接受的参数，在view中已属性的方式拿到
    meta: {
      access: ACCESS_ENUM.USER,
      hideInMeta: true,
    },
  },
  {
    path: "/add/question",
    name: "创建题目",
    component: AddQuestionView,
    meta: {
      keepAlive: true,
      access: ACCESS_ENUM.ADMIN,
    },
  },
  {
    path: "/update/question",
    name: "修改题目",
    component: AddQuestionView,
    meta: {
      access: ACCESS_ENUM.USER,
      hideInMeta: true,
    },
  },
  {
    path: "/manage/question",
    name: "管理题目",
    component: ManageQuestionView,
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
    component: AddContentView,
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
    },
  },
];
