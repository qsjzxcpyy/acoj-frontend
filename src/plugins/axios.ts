// Add a request interceptor
import axios from "axios";
import { useStore } from "vuex";
import store from "@/store";

const store1 = useStore();
axios.interceptors.request.use(
  function (config) {
    const token = store.state.question.questionSubmit.RequestToken;
    if (token != null && token != "") {
      config.headers["RequestToken"] = token;
    } else {
      console.log("拦截器,request获取存放的token为空");
    }

    const accessToken = localStorage.getItem("accessToken");
    if (accessToken != null && accessToken != "") {
      config.headers["token_access"] = accessToken;
    } else {
      console.log("拦截器,accessToken为空");
    }
    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  }
);

// Add a response interceptor
axios.interceptors.response.use(
  function (response) {
    if (response.data === null) {
      console.log("response拦截器 data为null");
    }
    return response;
  },
  function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    return Promise.reject(error);
  }
);
