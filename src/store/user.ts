import { StoreOptions, useStore } from "vuex";
import { UserControllerService } from "../../generated";
import { useRouter } from "vue-router";

export default {
  namespaced: true,
  state: () => ({
    loginUser: {
      userName: "未登录",
      userProfile: "",
      userMailbox: "",
      userRole: "",
    },
  }),
  actions: {
    async getLoginUser({ commit, state }) {
      const router = useRouter(); // 获取路由实例
      const store = useStore();
      try {
        const res = await UserControllerService.getLoginUserUsingGet1();

        if (res.code === 0) {
          commit("updateUser", res.data);
          sessionStorage.setItem("loginUser", JSON.stringify(state.loginUser));
        } else if (res.code === 40100) {
          // router.push(`/user/login`);
          store.commit("tologin/setShowLoginDialog", true);
        } else {
          const refreshToken = localStorage.getItem("refreshToken");
          const res1 = await UserControllerService.refreshTokenUsingPost1(
            refreshToken as any
          );

          if (res1.code === 0) {
            commit("updateUser", res1.data.userInfo);
            localStorage.setItem("accessToken", res1.data.accessToken);
            localStorage.setItem("refreshToken", res1.data.refreshToken);
          } else if (res1.code === 50020) {
            state.loginUser = {
              userName: "未登录",
              userProfile: "",
              userMailbox: "",
            };
            localStorage.removeItem("accessToken"); // 移除 localStorage 中的 accessToken
            localStorage.removeItem("refreshToken"); // 移除 localStorage 中的 refreshToken
            sessionStorage.removeItem("loginUser");
            store.dispatch("tologin/showLogin");
          }
        }
      } catch (error) {
        console.error("An error occurred:", error);
      }
    },
  },
  mutations: {
    updateUser(state, payload) {
      state.loginUser = {
        ...state.loginUser,
        userName: payload.userName,
        userProfile: payload.userProfile,
        userMailbox: payload.userMailbox,
        userRole: payload.userRole,
      };
      state.loginUser = payload;
    },
  },
} as StoreOptions<any>;
