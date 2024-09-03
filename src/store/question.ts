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
import { QuestionControllerService } from "../../generated";

export default {
  namespaced: true,
  state: () => ({
    questionSubmit: {
      RequestToken: "",
    },
  }),
  actions: {
    async getRequestToken({ commit, state }, payload) {
      const res = await QuestionControllerService.getRequestTokenUsingGet1();
      if (res.code === 0) {
        commit("updateToken", res.data);
        // 在获取用户信息后将 loginUser 存储到 sessionStorage
        sessionStorage.setItem(
          "RequestToken",
          JSON.stringify(state.questionSubmit.RequestToken)
        );
      } else {
        console.log("RequestToken获取失败");
      }
    },
  },
  mutations: {
    updateToken(state, payload) {
      state.questionSubmit.RequestToken = payload;
    },
  },
} as StoreOptions<any>;
