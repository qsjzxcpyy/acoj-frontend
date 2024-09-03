<template>
  <div id="basicLayout">
    <a-layout style="min-height: 100vh">
      <a-layout-header class="header">
        <GlobalHeader />
      </a-layout-header>
      <a-layout-content class="content">
        <router-view />
      </a-layout-content>
      <a-layout-footer class="footer">
        <a href="https://beian.miit.gov.cn/" target="_blank">
          冀ICP备2024075438号-1
        </a>
      </a-layout-footer>
    </a-layout>
  </div>
</template>
<style scoped>
#basicLayout {
}

#basicLayout .header {
  margin-bottom: 16px;
  box-shadow: #eee 1px 1px 5px;
}

#basicLayout .content {
  background: linear-gradient(to right, #fefefe, #ffff);
  padding: 20px;
  margin-bottom: 16px;
}

#basicLayout .footer {
  background: linear-gradient(to right, #fefefe, #ffff);
  position: sticky;
  bottom: 0;
  right: 0;
  left: 0;
  text-align: center;
  padding: 16px;
}
</style>
<script setup lang="ts">
import GlobalHeader from "@/components/GlobalHeader.vue";
</script>
