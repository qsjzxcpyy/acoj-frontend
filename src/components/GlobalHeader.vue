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
            <img class="logo" src="../assets/logo.jpg" />
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
        <a-button type="outline" @click="doLoginOrRegisterOrlogout">
          {{ userDisplayName }}
        </a-button>
      </div>
    </a-col>

    <a-modal
      v-model:visible="showLogoutDialog"
      @ok="logout"
      @cancel="showLogoutDialog = false"
    >
      <a-descriptions
        style="margin-top: 20px"
        :data="data"
        :size="size"
        :column="1"
        :label-style="labelStyle"
        :value-style="valueStyle"
      >
        <template #value="{ value }">
          <template v-if="value === 'admin-apply'">
            <div class="admin-apply-section">
              <a-button type="primary" size="small" @click="showApplyModal">
                申请成为管理员
              </a-button>
            </div>
          </template>
          <template v-else-if="value === 'admin-apply-record'">
            <a-link @click="goToApplyRecord">查看申请记录</a-link>
          </template>
          <template v-else>
            {{ value }}
          </template>
        </template>
      </a-descriptions>
      <template #footer>
        <a-button @click="showLogoutDialog = false">取消</a-button>
        <a-button type="primary" @click="logout">退出</a-button>
      </template>
    </a-modal>
    <div>
      <!-- 登录弹窗 -->
      <a-modal
        v-model:visible="showLoginDialog"
        :style="{ height: 'auto' }"
        @ok="doUserLogin"
        @cancel="showLoginDialog = false"
      >
        <h3 style="margin-bottom: 16px; margin-top: 1px; text-align: center">
          用户登录
        </h3>
        <a-form
          style="max-width: 700px; margin: 0 auto"
          auto-label-width="true"
          :model="form"
          @submit="doUserLogin"
          label-align="left"
          :rules="rules"
          ref="formRef"
        >
          <a-form-item
            field="userAccount"
            label="用户名"
            validate-trigger="blur"
          >
            <a-input v-model="form.userAccount" placeholder="请输入用户名" />
          </a-form-item>
          <a-form-item
            field="userPassword"
            tooltip="密码不少于8位"
            label="密码"
            validate-trigger="blur"
          >
            <a-input-password
              v-model="form.userPassword"
              placeholder="请输入密码"
            />
          </a-form-item>
        </a-form>

        <a-button
          type="outline"
          status="success"
          size="small"
          style="width: 80px"
          @click="openRegisterDialog"
        >
          注册
        </a-button>
        <a-button
          type="outline"
          status="success"
          size="small"
          style="width: 80px; margin-left: 300px"
          @click="$refs.formRef.resetFields()"
          >重置
        </a-button>
        <template #footer>
          <a-button @click="showLoginDialog = false">取消</a-button>
          <a-button type="primary" @click="doUserLogin">登录</a-button>
        </template>
      </a-modal>
      <!--      注册弹窗-->
      <a-modal
        v-model:visible="showRegisterDialog"
        :style="{ height: 'auto' }"
        @ok="doRegister"
        @cancel="showRegisterDialog = false"
      >
        <h3 style="margin-bottom: 16px; margin-top: 1px; text-align: center">
          用户注册
        </h3>
        <a-form
          style="max-width: 700px; margin: 0 auto"
          auto-label-width="true"
          :model="form_register"
          @submit="doRegister"
          label-align="left"
          :rules="rules_register"
        >
          <a-form-item
            field="userAccount"
            label="用户名"
            validate-trigger="blur"
          >
            <a-input
              v-model="form_register.userAccount"
              placeholder="请输入用户名"
            />
          </a-form-item>
          <a-form-item
            field="userPassword"
            tooltip="密码不少于8位"
            label="密码"
            validate-trigger="blur"
          >
            <a-input-password
              v-model="form_register.userPassword"
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
              v-model="form_register.checkPassword"
              placeholder="请确认密码"
            />
          </a-form-item>
          <a-form-item
            field="userMailbox"
            label="邮箱地址"
            validate-trigger="blur"
          >
            <a-input
              v-model="form_register.userMailbox"
              placeholder="请输入邮箱地址"
            />
          </a-form-item>
        </a-form>
        <a-button
          type="outline"
          status="success"
          size="small"
          style="width: 80px"
          @click="to_loginDialog"
        >
          登录
        </a-button>
        <a-button
          type="outline"
          status="success"
          size="small"
          style="width: 80px; margin-left: 300px"
          @click="clearReactiveObject(form_register)"
          >重置
        </a-button>
        <template #footer>
          <a-button @click="showRegisterDialog = false">取消</a-button>
          <a-button type="primary" @click="doRegister">注册</a-button>
        </template>
      </a-modal>

      <!-- 添加申请管理员的对话框 -->
      <a-modal
        v-model:visible="applyModalVisible"
        title="申请成为管理员"
        @before-ok="handleApply"
        @cancel="applyModalVisible = false"
        :ok-loading="applyLoading"
      >
        <a-form :model="applyForm" ref="applyFormRef" :rules="applyRules">
          <a-form-item field="reason" label="申请理由">
            <a-textarea
              v-model="applyForm.reason"
              placeholder="请详细说明申请成为管理员的理由"
              :auto-size="{ minRows: 3, maxRows: 5 }"
              allow-clear
            />
          </a-form-item>
        </a-form>
      </a-modal>
    </div>
  </a-row>
</template>

<script setup lang="ts">
import { routes } from "@/router/routes";
import { useRouter } from "vue-router";
import { computed, CSSProperties, reactive, ref, watch } from "vue";
import { useStore } from "vuex";
import checkAccess from "@/access/CheckAccess";
import {
  AdminControllerService,
  UserControllerService,
  UserLoginRequest,
} from "../../generated";
import message from "@arco-design/web-vue/es/message";
import axios from "axios";
import { Message } from "@arco-design/web-vue";

const showLoginDialog = ref(false);
const showRegisterDialog = ref(false);
const applyRules = {
  reason: [
    { required: true, message: "请输入申请理由" },
    {
      validator: (value: string, cb: any) => {
        if (!value || !value.trim()) {
          return cb("申请理由不能为空");
        }
        cb();
      },
    },
  ],
};
const size = ref("medium");
const router = useRouter();
const store = useStore();
const showLogoutDialog = ref(false);
const labelStyle = {
  color: "blue",
  fontWeight: "bold",
  // 其他 label 样式...
} as CSSProperties;
const valueStyle = {
  color: "green",
  fontStyle: "italic",
  // 其他 value 样式...
} as CSSProperties;

const getUserRole = () => {
  const userRole = store.state.user.loginUser.userRole;
  if (userRole === "admin") {
    return "管理员";
  } else if (userRole === "user") {
    return "普通用户";
  } else if (userRole === "superAdmin") {
    return "超级管理员";
  }
};

const data = computed(() => {
  const baseData = [
    {
      label: "用户名",
      value: store.state.user.loginUser.userName,
    },
    {
      label: "邮箱地址",
      value: store.state.user.loginUser.userMailbox,
    },
    {
      label: "用户身份",
      value: getUserRole(),
    },
  ];

  if (store.state.user.loginUser.userRole === "user") {
    baseData.push({
      label: "管理员申请",
      value: "admin-apply",
    });
    baseData.push({
      label: "申请管理员记录",
      value: "admin-apply-record",
    });
  }

  return baseData;
});

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
const showLogin = () => {
  showLoginDialog.value = true;
};
const doMenuClick = (key: string) => {
  router.push({
    path: key,
  });
};

const doLoginOrRegisterOrlogout = () => {
  if (!store.state.user?.loginUser.userRole) {
    showLoginDialog.value = true;
  } else {
    updateData();
    showLogoutDialog.value = true;
  }
};
const form = reactive({
  userAccount: "",
  userPassword: "",
}) as UserLoginRequest;

const form_register = reactive({
  userAccount: "",
  userPassword: "",
  checkPassword: "",
  userMailbox: "",
});
const clearReactiveObject = (obj: { [x: string]: string }) => {
  Object.keys(obj).forEach((key) => {
    obj[key] = ""; // 将属性值设置为空
  });
};
const doRegister = async () => {
  const res = await UserControllerService.userRegisterUsingPost1(form_register);
  if (res.code === 0) {
    alert("注册成功");
    clearReactiveObject(form_register);
    showRegisterDialog.value = false;
    showLoginDialog.value = true;
  } else {
    if (res.code === 40100) {
      const userInfo = {
        userName: "未登录",
        userProfile: "",
        userMailbox: "",
      };
      store.commit("user/updateUser", userInfo);
    }
    message.error("加载数据失败," + res.message);
  }
};
const to_loginDialog = () => {
  clearReactiveObject(form_register);
  showRegisterDialog.value = false;
  showLoginDialog.value = true;
};
const openRegisterDialog = () => {
  showLoginDialog.value = false;
  form.userAccount = "";
  form.userPassword = "";
  showRegisterDialog.value = true;
};
const doUserLogin = async () => {
  const res = await UserControllerService.userLoginUsingPost1(form);
  if (res.code === 0) {
    message.success("登录成功");
    localStorage.setItem("accessToken", res.data.accessToken);
    localStorage.setItem("refreshToken", res.data.refreshToken);
    store.commit("user/updateUser", res.data.userInfo);
    form.userAccount = "";
    form.userPassword = "";
    showLoginDialog.value = false;
    // 刷新当前路由页面
    // router.go(0);
    window.location.reload();
    updateData();
  } else {
    showLoginDialog.value = false;
    const userInfo = {
      userName: "未登录",
      userProfile: "",
      userMailbox: "",
    };
    store.commit("user/updateUser", userInfo);

    message.error("登录失败" + res.message);
  }
};

const updateData = () => {
  data.value[0] = store.state.user.loginUser.userName;
  data.value[1] = store.state.user.loginUser.userMailbox;
  data.value[2] = getUserRole() as any;
};
const logout = () => {
  const res = {
    userName: "未登录",
  };
  // 执行退出逻辑
  // 例如清空用户信息、跳转到登录页等
  const accessToken = localStorage.getItem("accessToken");
  axios.interceptors.request.use(
    function (config) {
      console.log("logout_accessToken" + accessToken);
      if (accessToken != null && accessToken != "") {
        config.headers["token_access"] = accessToken;
      } else {
        console.log("logout, accessToken 为空");
      }
      return config;
    },
    function (error) {
      // Do something with request error
      return Promise.reject(error);
    }
  );
  UserControllerService.userLogoutUsingPost1();
  store.commit("user/updateUser", res);
  localStorage.removeItem("accessToken"); // 移除 localStorage 中的 accessToken
  localStorage.removeItem("refreshToken"); // 移除 localStorage 中的 refreshToken
  sessionStorage.removeItem("loginUser");
  showLogoutDialog.value = false;
  router.push({
    path: "/",
    replace: true,
  });
};

const selectedKeys = ref(["/"]);
router.afterEach((to, from, failure) => {
  selectedKeys.value = [to.path];
});

const userDisplayName = computed(() => {
  return store.state.user?.loginUser?.userName ?? "未登录";
});

const rules = {
  userAccount: [
    {
      required: true,
      message: "用户名未填写",
    },
  ],
  userPassword: [
    {
      required: true,
      message: "密码未填写",
    },
  ],
};

const rules_register = {
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
      message: "确认密码未填写",
    },
    {
      validator: (value: any, cb: any) => {
        if (value !== form_register.userPassword) {
          cb("两次输入的密码不相同");
        } else {
          cb();
        }
      },
    },
  ],
  userMailbox: [
    {
      type: "email",
      required: true,
    },
  ],
};

const isLogin = ref(store.state.tologin.islogin.loginOrnot);

// 监听 isLogin 的变化
watch(
  () => store.state.tologin.islogin.loginOrnot,
  (newValue, oldValue) => {
    if (!oldValue && newValue) {
      // 当 isLogin 从 false 变为 true 时触发登录弹框显示
      showLoginDialog.value = true;
    }
  }
);

// 添加申请管理员相关的响��式变量
const applyModalVisible = ref(false);
const applyLoading = ref(false);
const applyForm = reactive({
  reason: "",
});
const applyFormRef = ref();

// 显示申请对话框
const showApplyModal = () => {
  showLogoutDialog.value = false;
  applyModalVisible.value = true;
  applyForm.reason = "";
};

// 修改处理申请提交的函数
const handleApply = async (done: (closed: boolean) => void) => {
  if (!applyForm.reason || !applyForm.reason.trim()) {
    Message.warning("请输入申请理由");
    done(false); // 阻止对话框关闭
    return;
  }

  applyLoading.value = true;
  const res = await AdminControllerService.applyForAdminUsingPost1({
    reason: applyForm.reason.trim(),
  });

  if (res.code === 0) {
    Message.success("申请已提交");
    done(true); // 申请成功时允许对话框关闭
    // 可以跳转到申请记录页面
    // router.push("/admin/apply-list");
  } else {
    Message.error(res.message || "申请失败");
    done(false); // 申请失败时阻止对话框关闭
  }

  applyLoading.value = false;
};

const goToApplyRecord = () => {
  showLogoutDialog.value = false; // 关闭用户信息弹框
  router.push("/admin/my-apply-list"); // 跳转到个人申请记录页面
};
</script>

<style scoped>
.title-bar {
  display: flex;
  align-items: center;
}

.logo {
  height: 48px;
}

.title {
  color: #444;
  margin-left: 16px;
}

.admin-apply-section {
  display: flex;
  align-items: center;
  gap: 16px;
}
</style>
