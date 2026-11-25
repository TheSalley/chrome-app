<template>
  <div class="shopify-panel">
    <button
      type="button"
      class="btn btn-primary detect-button"
      :disabled="loading"
      @click="detect"
    >
      <span v-if="loading" class="inline-flex items-center gap-1.5">
        <svg class="spinner h-4 w-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="42 15"></circle></svg>
        识别中...
      </span>
      <span v-else class="inline-flex items-center gap-1.5">
        <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 8h14l-1 12H6L5 8z"></path>
          <path d="M9 9V6.7a3 3 0 016 0V9"></path>
        </svg>
        检测当前页面
      </span>
    </button>

    <div v-if="loading" class="surface-card scan-card">
      <svg class="spinner" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5" opacity=".2"></circle>
        <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
      </svg>
      <div>
        <strong>正在读取店铺信息</strong>
        <span>识别 Shopify 环境、主题与页面标识...</span>
      </div>
    </div>

    <section
      v-else-if="info !== null"
      class="surface-card store-card"
      :class="{ 'is-negative': !info.isShopify }"
    >
      <div class="store-head">
        <div class="store-heading">
          <span class="icon-box" :class="info.isShopify ? 'is-success' : 'is-neutral'" aria-hidden="true">
            <svg v-if="info.isShopify" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 8h14l-1 12H6L5 8z"></path>
              <path d="M9 9V6.7a3 3 0 016 0V9"></path>
              <path d="M9 14h6"></path>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="9"></circle>
              <path d="M8.5 8.5l7 7M15.5 8.5l-7 7"></path>
            </svg>
          </span>
          <div>
            <h3 class="result-title">{{ info.isShopify ? "Shopify 店铺" : "页面检测结果" }}</h3>
          </div>
        </div>
        <span class="status-chip" :class="info.isShopify ? 'is-success' : 'is-neutral'">
          {{ info.isShopify ? "已识别" : "未识别" }}
        </span>
      </div>

      <template v-if="info.isShopify">
        <dl class="detail-list">
          <div class="detail-row">
            <dt>店铺域名</dt>
            <dd :title="info.shop || '—'">{{ info.shop || "—" }}</dd>
          </div>
          <div v-if="info.theme" class="detail-row">
            <dt>当前主题</dt>
            <dd :title="info.theme?.name || info.theme">
              {{ info.theme?.name || info.theme }}
              <span class="id-pill">ID {{ info.theme?.id || "—" }}</span>
            </dd>
          </div>
          <div v-if="info.meta?.handle" class="detail-row">
            <dt>页面 Handle</dt>
            <dd class="mono" :title="info.meta.handle">{{ info.meta.handle }}</dd>
          </div>
        </dl>
      </template>

      <template v-else>
        <p class="negative-title">
          {{ info.error ? "未检测到 Shopify" : "当前页面不是 Shopify 店铺" }}
        </p>
        <p v-if="info.error" class="negative-copy">{{ info.error }}</p>
        <p class="negative-hint">请打开 Shopify 店铺前台页面，刷新后重新检测。</p>
      </template>
    </section>

    <section v-else class="surface-card idle-card">
      <span class="idle-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 8h14l-1 12H6L5 8z"></path>
          <path d="M9 9V6.7a3 3 0 016 0V9"></path>
        </svg>
      </span>
      <div>
        <strong>等待检测</strong>
        <span>在当前标签页打开店铺后开始识别</span>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from "vue";

const info = ref(null);
const loading = ref(false);

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
