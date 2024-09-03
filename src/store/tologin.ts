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

export default {
  namespaced: true,
  state: () => ({
    islogin: {
      loginOrnot: false,
    },
  }),
  actions: {
    showLogin({ commit }) {
      commit("setShowLoginDialog", true);
    },
  },
  mutations: {
    setShowLoginDialog(state, payload) {
      state.islogin.loginOrnot = payload;
    },
  },
} as StoreOptions<any>;
