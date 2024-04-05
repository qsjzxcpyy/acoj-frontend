// // initial state
// import { StoreOptions } from "vuex";
// import ACCESS_ENUM from "@/access/ACCESS_ENUM";
// import { UserControllerService } from "../../generated";
//
// export default {
//   namespaced: true,
//   state: () => ({
//     loginUser: {
//       userName: "未登录",
//     },
//   }),
//   actions: {
//     async getLoginUser({ commit, state }, payload) {
//       const res = await UserControllerService.getLoginUserUsingGet();
//       if (res.code === 0) {
//         commit("updateUser", res.data);
//       } else {
//         commit("updateUser", {
//           ...state.loginUser,
//           userRole: ACCESS_ENUM.NOT_LOGIN,
//         });
//       }
//     },
//   },
//   mutations: {
//     updateUser(state, payload) {
//       state.loginUser = payload;
//     },
//   },
// } as StoreOptions<any>;
import { StoreOptions } from "vuex";
import ACCESS_ENUM from "@/access/ACCESS_ENUM";
import { UserControllerService } from "../../generated";

export default {
  namespaced: true,
  state: () => ({
    loginUser: {
      userName: "未登录",
    },
  }),
  actions: {
    async getLoginUser({ commit, state }, payload) {
      const res = await UserControllerService.getLoginUserUsingGet();
      if (res.code === 0) {
        commit("updateUser", res.data);
        // 在获取用户信息后将 loginUser 存储到 sessionStorage
        sessionStorage.setItem("loginUser", JSON.stringify(state.loginUser));
      } else {
        commit("updateUser", {
          ...state.loginUser,
          userRole: ACCESS_ENUM.NOT_LOGIN,
        });
        // 在未登录时也可以选择存储到 sessionStorage
        sessionStorage.setItem("loginUser", JSON.stringify(state.loginUser));
      }
    },
  },
  mutations: {
    updateUser(state, payload) {
      state.loginUser = payload;
    },
  },
} as StoreOptions<any>;
