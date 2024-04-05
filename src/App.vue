<template>
  <div id="app">
    <template v-if="route.path.startsWith('/user')">
      <router-view />
    </template>
    <template v-else>
      <BasicLayout />
    </template>
  </div>
</template>
<style>
#app {
}
</style>
<script setup lang="ts">
import BasicLayout from "@/Layout/BasicLayout.vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";

const store = useStore();
const route = useRoute();
const savedLoginUser = sessionStorage.getItem("loginUser");
if (savedLoginUser) {
  store.commit("user/updateUser", JSON.parse(savedLoginUser));
}
</script>
