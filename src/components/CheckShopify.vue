<template>
  <div class="shopify-panel">
    <button
      type="button"
      class="btn-primary detect-button"
      :disabled="loading"
      @click="detect"
    >
      <span v-if="loading" class="inline-flex items-center gap-1.5">
        <svg class="spinner h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
        识别中...
      </span>
      <span v-else class="inline-flex items-center gap-1.5">
        <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 8h14l-1 12H6L5 8z"></path>
          <path d="M9 9V6.7a3 3 0 016 0V9"></path>
        </svg>
        检测当前页面
      </span>
    </button>

    <div v-if="loading" class="surface-card scan-card">
      <svg class="spinner" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2.5" opacity=".2"></circle>
        <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"></path>
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
          <span class="store-icon" :class="info.isShopify ? 'is-success' : 'is-neutral'" aria-hidden="true">
            <svg v-if="info.isShopify" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 8h14l-1 12H6L5 8z"></path>
              <path d="M9 9V6.7a3 3 0 016 0V9"></path>
              <path d="M9 14h6"></path>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="9"></circle>
              <path d="M8.5 8.5l7 7M15.5 8.5l-7 7"></path>
            </svg>
          </span>
          <div>
            <span class="eyebrow">Store profile</span>
            <h3>{{ info.isShopify ? "Shopify 店铺" : "页面检测结果" }}</h3>
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
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
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

<style scoped>
.shopify-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detect-button {
  width: 100%;
}

.scan-card {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 14px;
  border-color: #e7e3fb;
  background: linear-gradient(135deg, #ffffff 0%, #fbfaff 100%);
  color: #7c3aed;
}

.scan-card > svg {
  width: 20px;
  height: 20px;
  flex: none;
  box-sizing: content-box;
  padding: 7px;
  border: 1px solid #e9e4fd;
  border-radius: 10px;
  background: #f6f2ff;
}

.scan-card > div {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
}

.scan-card strong {
  color: var(--text-soft);
  font-size: 11.5px;
  font-weight: 700;
  line-height: 1.35;
}

.scan-card span {
  color: var(--muted);
  font-size: 10.5px;
  line-height: 1.45;
}

.store-card {
  padding: 14px;
}

.store-card.is-negative {
  border-color: #e4eaf2;
  background: linear-gradient(180deg, #ffffff 0%, #fbfcfe 100%);
}

.store-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 9px;
}

.store-heading {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
}

.store-icon {
  display: flex;
  width: 32px;
  height: 32px;
  flex: none;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  border-radius: 10px;
}

.store-icon svg {
  width: 16px;
  height: 16px;
}

.store-icon.is-success {
  border-color: #a7f3d0;
  background: linear-gradient(180deg, #f7fffc 0%, var(--success-soft) 100%);
  color: var(--success);
  box-shadow: inset 0 1px 0 #fff;
}

.store-icon.is-neutral {
  border-color: var(--line);
  background: linear-gradient(180deg, #ffffff 0%, var(--surface-muted) 100%);
  color: var(--muted);
  box-shadow: inset 0 1px 0 #fff;
}

.store-heading h3 {
  margin: 1px 0 0;
  color: var(--text);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 1.35;
}

.detail-list {
  display: flex;
  flex-direction: column;
  margin: 12px 0 0;
  overflow: hidden;
  border: 1px solid #edf1f7;
  border-radius: 10px;
  background: var(--surface-muted);
}

.detail-row {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 8px 10px;
  border-top: 1px solid #edf1f7;
}

.detail-row:first-child {
  border-top: 0;
}

.detail-row dt {
  color: var(--subtle);
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.detail-row dd {
  min-width: 0;
  margin: 0;
  overflow: hidden;
  color: var(--text-soft);
  font-size: 11px;
  font-weight: 650;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail-row dd.mono {
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  font-size: 10.5px;
  font-weight: 500;
}

.id-pill {
  margin-left: 4px;
  padding: 2px 5px;
  border: 1px solid #e2e9f3;
  border-radius: 5px;
  background: #f1f5fa;
  color: var(--muted);
  font-size: 9px;
  font-weight: 700;
}

.negative-title {
  margin: 12px 0 0;
  color: var(--text-soft);
  font-size: 11.5px;
  font-weight: 700;
}

.negative-copy {
  margin: 5px 0 0;
  color: var(--muted);
  font-size: 10.5px;
  line-height: 1.55;
  word-break: break-word;
}

.negative-hint {
  margin: 9px 0 0;
  padding: 8px 9px;
  border-radius: 9px;
  background: var(--surface-muted);
  color: var(--subtle);
  font-size: 10px;
  line-height: 1.55;
}

.idle-card {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 14px;
  border-style: dashed;
  border-color: #dbe5f2;
  background: rgba(255, 255, 255, 0.62);
}

.idle-icon {
  display: flex;
  width: 32px;
  height: 32px;
  flex: none;
  align-items: center;
  justify-content: center;
  border: 1px solid #dbeafe;
  border-radius: 10px;
  background: linear-gradient(180deg, #f8fbff 0%, var(--primary-soft) 100%);
  color: var(--primary);
  box-shadow: inset 0 1px 0 #fff;
}

.idle-icon svg {
  width: 16px;
  height: 16px;
}

.idle-card > div {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.idle-card strong {
  color: var(--text-soft);
  font-size: 11px;
  font-weight: 700;
  line-height: 1.35;
}

.idle-card span {
  color: var(--subtle);
  font-size: 10px;
  line-height: 1.45;
}
</style>
