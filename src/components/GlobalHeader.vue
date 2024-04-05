<template>
  <a-row id="global-header" align="center" :wrap="false">
    <a-col flex="auto">
      <a-menu
        mode="horizontal"
        :selected-keys="selectedKeys"
        @menu-item-click="doMenuClick"
      >
        <a-menu-item
          key="0"
          :style="{ padding: 0, marginRight: '38px' }"
          disabled
        >
          <div class="title-bar">
            <img class="loge" src="../assets/logo.jpg" />
            <div class="title">AC_OJ</div>
          </div>
        </a-menu-item>
        <a-menu-item v-for="item in visibleRoutes" :key="item.path">
          {{ item.name }}
        </a-menu-item>
      </a-menu>
    </a-col>
    <a-col flex="100px">
      <div>
        <a-button
          type="outline"
          @click="doLoginOrRegister"
          :disabled="store.state.user?.loginUser.userRole"
        >
          {{ store.state.user?.loginUser?.userName ?? "未登录" }}
        </a-button>
      </div>
    </a-col>
  </a-row>
</template>

<script setup lang="ts">
import { routes } from "@/router/routes";
import { useRouter } from "vue-router";
import { computed, ref } from "vue";
import { useStore } from "vuex";
import checkAccess from "@/access/CheckAccess";

const router = useRouter();
const store = useStore();

const visibleRoutes = computed(() => {
  return routes.filter((item, index) => {
    if (item.meta?.hideInMeta) return false;
    if (
      !checkAccess(store.state.user.loginUser, item?.meta?.access as string)
    ) {
      return false;
    }
    return true;
  });
});

const doMenuClick = (key: string) => {
  router.push({
    path: key,
  });
};
const doLoginOrRegister = () => {
  router.push({
    path: "user/login",
  });
};
const selectedKeys = ref(["/"]);
router.afterEach((to, from, failure) => {
  selectedKeys.value = [to.path];
});
//利用vuex调用方法更改全局属性
// setTimeout(() => {
//   store.dispatch("user/getLoginUser", {
//     userName: "xxxx",
//     userRole: "admin",
//   });
// }, 3000);
</script>

<style scoped>
.title-bar {
  display: flex;
  align-items: center;
}

.loge {
  height: 48px;
}

.title {
  color: #444;
  margin-left: 16px;
}
</style>
