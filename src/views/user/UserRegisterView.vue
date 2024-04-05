<template>
  <div id="userRegisterView">
    <h2 style="margin-bottom: 16px">用户注册</h2>
    <a-form
      style="max-width: 700px; margin: 0 auto"
      auto-label-width="true"
      ref="formRef"
      :rules="rules"
      :model="form"
      @submit="handleSubmit"
      label-align="left"
    >
      <a-form-item field="userAccount" label="用户名" validate-trigger="blur">
        <a-input v-model="form.userAccount" placeholder="请输入用户名" />
      </a-form-item>
      <a-form-item
        field="userPassword"
        tooltip="密码不少于8位"
        validate-trigger="blur"
        label="密码"
      >
        <a-input-password
          v-model="form.userPassword"
          placeholder="请输入密码"
        />
      </a-form-item>
      <a-form-item
        field="checkPassword"
        tooltip="密码不少于8位"
        validate-trigger="blur"
        label="确认密码"
      >
        <a-input-password
          v-model="form.checkPassword"
          placeholder="请确认密码"
        />
      </a-form-item>
      <a-form-item>
        <a-space>
          <a-button html-type="submit">注册</a-button>
          <a-button @click="$refs.formRef.resetFields()">重置</a-button>
        </a-space>
      </a-form-item>
    </a-form>
  </div>
</template>
<script setup lang="ts">
import { reactive } from "vue";
import message from "@arco-design/web-vue/es/message";
import { useRouter } from "vue-router";
import { UserControllerService } from "../../../generated";

const router = useRouter();
const form = reactive({
  userAccount: "",
  userPassword: "",
  checkPassword: "",
});
const rules = {
  userAccount: [
    {
      required: true,
      message: "名字未填写",
    },
  ],
  userPassword: [
    {
      required: true,
      message: "密码未填写",
    },
  ],
  checkPassword: [
    {
      required: true,
      message: "密码未填写",
    },
    {
      validator: (value: any, cb: any) => {
        if (value !== form.userPassword) {
          cb("两次输入的密码不相同");
        } else {
          cb();
        }
      },
    },
  ],
};
const handleSubmit = async () => {
  const res = await UserControllerService.userRegisterUsingPost(form);
  if (res.code === 0) {
    alert("注册成功");
    router.push({
      path: "/user/login",
      replace: true,
    });
  } else {
    message.error("注册失败" + res.message);
  }
};
</script>
