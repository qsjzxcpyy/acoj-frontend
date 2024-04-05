<template>
  <div id="userLayout">
    <a-layout style="min-height: 100vh">
      <a-layout-header class="header">
        <a-space>
          <img src="../assets/logo.jpg" class="logo" />
          <div class="title">AC_OJ</div>
        </a-space>
      </a-layout-header>
      <a-layout-content class="content">
        <router-view />
      </a-layout-content>
      <a-layout-footer class="footer">Fun Coding</a-layout-footer>
    </a-layout>
  </div>
</template>
<style scoped>
#userLayout {
  text-align: center;
  background: url("../assets/loginLayout_background.jpg");
}

#userLayout .logo {
  height: 64px;
  width: 64px;
}

.title {
  color: #444;
  margin-left: 16px;
}

#userLayout .header {
  margin-top: 70px;
}

#userLayout .content {
  padding: 20px;
  margin-top: 50px;
  margin-bottom: 16px;
}

#userLayout .footer {
  position: sticky;
  bottom: 0;
  right: 0;
  left: 0;
  text-align: center;
  padding: 16px;
}
</style>
<script setup lang="ts"></script>
