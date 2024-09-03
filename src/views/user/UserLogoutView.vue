<template>
  <div class="logout-dialog">
    <div class="user-info">
      <p>用户信息：</p>
      <p>{{ store.state.user?.loginUser?.userName }}</p>
    </div>
    <button @click="logout">退出</button>
  </div>
</template>

<script setup lang="ts">
import { useStore } from "vuex";
import { UserControllerService } from "../../../generated";

const store = useStore();
const logout = () => {
  UserControllerService.userLogoutUsingPost1();
  alert("退出成功!");
};
</script>

<style scoped></style>
