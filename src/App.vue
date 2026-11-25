<template>
  <div class="app-shell">
    <Home />
  </div>
</template>
<script setup>
import Home from "@/views/Home.vue";
</script>
<style scoped>
.app-shell {
  width: 360px;
  height: 600px;
  overflow: hidden;
  background: var(--color-system-bg);
  color: var(--color-system-label);
}
</style>
