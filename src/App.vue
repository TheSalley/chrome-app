<template>
  <div class="app-shell">
    <Home />
  </div>
</template>
<script setup>
import Home from "@/views/Home.vue";
</script>
<style scoped>
/* 尺寸的唯一来源：写死像素，不依赖百分比传递，
   避免 Chrome popup 视口高度与内容互相依赖导致窗口塌缩 */
.app-shell {
  width: 360px;
  height: 600px;
  min-height: 600px;
  overflow: hidden;
  /* background: #10151e; */
  color: var(--color-system-label);
}
</style>
