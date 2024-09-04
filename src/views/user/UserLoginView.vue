<template>
  <div id="userLoginView">
    <h2 style="margin-bottom: 16px">用户登录</h2>
    <a-form
      style="max-width: 700px; margin: 0 auto"
      auto-label-width="true"
      :model="form"
      @submit="handleSubmit"
      label-align="left"
    >
      <a-form-item field="userAccount" label="账号">
        <a-input v-model="form.userAccount" placeholder="请输入账号" />
      </a-form-item>
      <a-form-item field="userPassword" tooltip="密码不少于8位" label="密码">
        <a-input-password
          v-model="form.userPassword"
          placeholder="请输入密码"
        />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 120px"
          >登录
        </a-button>
      </a-form-item>
    </a-form>
    <div class="RegisterButton">
      <a-button
        type="outline"
        status="success"
        size="large"
        @click="doRegister"
        style="width: 120px"
      >
        注册
      </a-button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { reactive } from "vue";
import { UserControllerService, UserLoginRequest } from "../../../generated";
import message from "@arco-design/web-vue/es/message";
import { useStore } from "vuex";
import { useRouter } from "vue-router";

const router = useRouter();
const store = useStore();
const form = reactive({
  userAccount: "",
  userPassword: "",
}) as UserLoginRequest;
const handleSubmit = async () => {
  const res = await UserControllerService.userLoginUsingPost1(form);
  if (res.code === 0) {
    localStorage.setItem("accessToken", res.data.accessToken);
    localStorage.setItem("refreshToken", res.data.refreshToken);
    store.commit("user/updateUser", res.data.userInfo);
    router.push({
      path: "/",
      replace: true,
    });
  } else {
    const userInfo = {
      userName: "未登录",
      userProfile: "",
      userMailbox: "",
    };
    store.commit("user/updateUser", userInfo);
    message.error("登录失败" + res.message);
  }
};
const doRegister = () => {
  router.push({
    path: "register",
  });
};
</script>
<style>
.RegisterButton {
  display: flex;
  justify-content: flex-end;
  margin-top: -350px; /* 调整按钮位置 */
  margin-right: 50px;
}
</style>
