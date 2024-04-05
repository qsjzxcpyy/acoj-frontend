import router from "@/router";
import store from "@/store";
import ACCESS_ENUM from "@/access/ACCESS_ENUM";
import checkAccess from "@/access/CheckAccess";

router.beforeEach(async (to, from, next) => {
  console.log("登陆用户信息", store.state.user.loginUser);
  let loginUser = store.state.user.loginUser;
  // // 如果之前没登陆过，自动登录
  if (!loginUser || !loginUser.userRole) {
    // 加 await 是为了等用户登录成功之后，再执行后续的代码
    // await store.dispatch("user/getLoginUser");
    loginUser = store.state.user.loginUser;
  }
  const needAccess = (to.meta?.access as string) ?? ACCESS_ENUM.NOT_LOGIN;
  // 要跳转的页面必须要登陆
  if (needAccess !== ACCESS_ENUM.NOT_LOGIN) {
    // 如果没登陆，跳转到登录页面
    if (
      !loginUser ||
      !loginUser.userRole ||
      loginUser.userRole === ACCESS_ENUM.NOT_LOGIN
    ) {
      next(`/user/login?redirect=${to.fullPath}`);
      return;
    }
    // 如果已经登陆了，但是权限不足，那么跳转到无权限页面
    if (!checkAccess(loginUser, needAccess)) {
      next("/noAuth");
      return;
    }
  }
  next();
});
// created() {
//   //刷新时读取刷新前的vuex中state中的login
//   if (sessionStorage.getItem("login")) {
//     this.state.loginUser.replaceState(
//       Object.assign(
//         {},
//         this.state.loginUser,
//         JSON.parse(sessionStorage.getItem("login") as any)
//       )
//     );
//   }
//   //保存vuex中state中的login
//   window.addEventListener("beforeunload", () => {
//     sessionStorage.setItem("login", JSON.stringify(this.state.loginUser));
//   });
// };
