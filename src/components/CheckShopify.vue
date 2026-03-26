<template>
  <div class="space-y-3">
    <div class="flex items-center gap-2">
      <button
        class="cursor-pointer px-4 py-2 rounded-lg bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600"
        @click="detect"
      >
        检测当前页面
      </button>
      <span v-if="loading" class="text-sm text-gray-500">检测中...</span>
    </div>
    <div v-if="info !== null && !loading" class="rounded-lg border border-gray-200 p-3 text-left text-sm">
      <template v-if="info.isShopify">
        <p class="font-semibold text-green-700 mb-2">当前页面为 Shopify 店铺</p>
        <p><span class="text-gray-500">店铺:</span> {{ info.shop || "—" }}</p>
        <p v-if="info.theme"><span class="text-gray-500">主题:</span> {{ info.theme?.name || info.theme }} (id: {{ info.theme?.id || "—" }})</p>
        <p v-if="info.meta?.handle"><span class="text-gray-500">Handle:</span> {{ info.meta.handle }}</p>
        <!-- <pre v-if="hasMeta" class="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-32">{{ JSON.stringify(info.meta, null, 2) }}</pre> -->
      </template>
      <template v-else>
        <p class="font-semibold text-gray-600">非 Shopify 页面</p>
        <!-- <p v-if="info.error" class="text-gray-500 mt-1">{{ info.error }}</p> -->
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const info = ref(null);
const loading = ref(false);

const hasMeta = computed(() => info.value?.meta && Object.keys(info.value.meta).length > 0);

async function detect() {
  loading.value = true;
  info.value = null;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    loading.value = false;
    info.value = { isShopify: false, error: "无法获取当前标签页" };
    return;
  }
  try {
    const result = await chrome.tabs.sendMessage(tab.id, { action: "judgePage" });
    info.value = result ?? { isShopify: false, error: "未检测到 Shopify，请确保在店铺页面并刷新后重试" };
  } catch (e) {
    info.value = { isShopify: false, error: "请先在目标页面刷新后再点击检测" };
  }
  loading.value = false;
}
</script>
