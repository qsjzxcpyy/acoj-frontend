import { StoreOptions } from "vuex";

export default {
  namespaced: true,

  // 使用函数返回初始状态
  state: () => ({
    updateCode: {
      code: "dfadsf",
    },
  }),
  // 定义 mutations
  mutations: {
    setCode(state, code: string) {
      state.updateCode.code = code;
      console.log("Editor store - 代码已设置:", code);
    },
  },

  // 定义 actions
  actions: {
    updateCode({ commit }, code: string) {
      try {
        commit("setCode", code);
        console.log("Editor store - 代码已更新:", code);
      } catch (error) {
        console.error("Editor store - 更新代码失败:", error);
      }
    },
  },
} as StoreOptions<any>;
