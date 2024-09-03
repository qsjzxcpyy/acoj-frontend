// 路由导航守卫代码
import router from "@/router";
import store from "@/store";
import ACCESS_ENUM from "@/access/ACCESS_ENUM";
import checkAccess from "@/access/CheckAccess";

router.beforeEach((to, from, next) => {
  const loginUser = store.state.user.loginUser;
  const needAccess = (to.meta?.access as string) ?? ACCESS_ENUM.NOT_LOGIN;
  const accessToken = localStorage.getItem("accessToken");
  if (
    !loginUser ||
    !loginUser.userRole ||
    loginUser.userRole === ACCESS_ENUM.NOT_LOGIN
  ) {
    store.commit("tologin/setShowLoginDialog", false);
  }
  if (
    (accessToken === null || accessToken === "") &&
    (to.name === "浏览题目" || to.name === "浏览题目提交" || to.name === "主页")
  ) {
    next();
  } else if (
    !loginUser ||
    !loginUser.userRole ||
    loginUser.userRole === ACCESS_ENUM.NOT_LOGIN
  ) {
    store.dispatch("user/getLoginUser").then(() => {
      next();
    });
  } else {
    next();
  }

  // if (needAccess !== ACCESS_ENUM.NOT_LOGIN) {
  //   if (!checkAccess(loginUser, needAccess)) {
  //     next("/noAuth");
  //   } else {
  //     next();
  //   }
  // } else {
  //   next();
  // }
});
