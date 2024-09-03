import { createStore } from "vuex";
import user from "./user";
import question from "./question";
import tologin from "@/store/tologin";

export default createStore({
  state: {},
  getters: {},
  mutations: {},
  actions: {},
  modules: {
    user,
    question,
    tologin,
  },
});
