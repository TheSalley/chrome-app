<template>
  <div class="wp-panel">
    <div class="action-bar">
      <button
        type="button"
        class="btn btn-primary check-button"
        :disabled="loading"
        @click="check"
      >
        <span v-if="loading" class="inline-flex items-center gap-1.5">
          <svg class="spinner h-4 w-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="42 15"></circle></svg>
          扫描中...
        </span>
        <span v-else class="inline-flex items-center gap-1.5">
          <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="7"></circle><path d="M16.5 16.5L21 21"></path>
          </svg>
          检测页面
        </span>
      </button>
      <button
        v-if="data && hiddenIds.length && !marked"
        type="button"
        class="btn btn-secondary"
        title="在页面上用黑色蒙层标出隐藏板块"
        @click="markHidden"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2.2 12S5.7 5.8 12 5.8 21.8 12 21.8 12 18.3 18.2 12 18.2 2.2 12 2.2 12z"></path>
          <circle cx="12" cy="12" r="2.8"></circle>
          <path d="M3 3l18 18"></path>
        </svg>
        标注隐藏板块
      </button>
      <button
        v-if="marked || h1Marked"
        type="button"
        class="btn btn-ghost clear-button"
        @click="clearMarks"
      >
        清除标记
      </button>
    </div>

    <div v-if="checkedAt" class="check-meta">
      <span class="meta-dot"></span>
      上次检测 {{ checkedAt }}
    </div>

    <div v-if="error" class="error-banner" role="alert">
      <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
        <circle cx="12" cy="12" r="9"></circle>
        <path d="M12 8v4M12 16h.01"></path>
      </svg>
      <span>{{ error }}</span>
    </div>

    <div v-if="loading" class="surface-card scan-card" aria-busy="true">
      <svg class="spinner" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5" opacity=".2"></circle>
        <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
      </svg>
      <div>
        <strong>正在扫描页面结构</strong>
        <span>检查索引设置、隐藏板块与标题结构...</span>
      </div>
    </div>

    <div v-if="!loading && data" class="result-stack">
      <article class="surface-card result-card">
        <div class="result-head">
          <div class="result-heading">
            <span class="icon-box" :class="data.noIndex.noindex ? 'is-danger' : 'is-success'" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="4" y="10" width="16" height="10" rx="2"></rect>
                <path d="M8 10V7a4 4 0 018 0v3"></path>
              </svg>
            </span>
            <div>
              <h2 class="result-title">No-Index 设置</h2>
            </div>
          </div>
          <span
            class="status-chip"
            :class="data.noIndex.noindex ? 'is-danger' : 'is-success'"
          >
            <svg v-if="data.noIndex.noindex" class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.3 3.9L1.8 18a2 2 0 001.7 3h16.9a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"></path><path d="M12 9v4M12 17h.01"></path>
            </svg>
            <svg v-else class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 6L9 17l-5-5"></path>
            </svg>
            {{ data.noIndex.noindex ? "已开启" : "未开启" }}
          </span>
        </div>
        <div class="result-detail">
          <span class="detail-label">robots meta</span>
          <code :title="data.noIndex.metaContent">
            {{ data.noIndex.hasMeta ? data.noIndex.metaContent : "未检测到 robots meta 标签" }}
          </code>
        </div>
      </article>

      <article class="surface-card result-card">
        <div class="result-head">
          <div class="result-heading">
            <span class="icon-box" :class="hiddenIds.length ? 'is-warning' : 'is-success'" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2.2 12S5.7 5.8 12 5.8 21.8 12 21.8 12 18.3 18.2 12 18.2 2.2 12 2.2 12z"></path>
                <circle cx="12" cy="12" r="2.8"></circle>
                <path d="M3 3l18 18"></path>
              </svg>
            </span>
            <div>
              <h2 class="result-title">隐藏板块</h2>
            </div>
          </div>
          <span class="status-chip" :class="hiddenIds.length ? 'is-warning' : 'is-success'">
            {{ hiddenIds.length }} 个
          </span>
        </div>

        <p v-if="marked" class="inline-note is-danger">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="9"></circle><path d="M12 8v4M12 16h.01"></path>
          </svg>
          <span>已在页面上标出隐藏元素（<strong>黑色蒙层</strong>），点击上方“清除标记”恢复</span>
        </p>
        <div v-if="hiddenIds.length" class="id-list">
          <span
            v-for="(item, idx) in hiddenIds"
            :key="idx"
            class="id-chip"
            :title="'隐藏元素: ' + item"
          >{{ item }}</span>
        </div>
        <p v-else class="clean-note is-muted">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 6L9 17l-5-5"></path>
          </svg>
          未发现隐藏板块
        </p>
      </article>
    </div>

    <article class="surface-card result-card h1-card">
      <div class="result-head">
        <div class="result-heading">
          <span class="icon-box is-blue" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 6v12M5 6h6M5 18h6M15 6v12M15 9h4M15 12h4M15 15h4"></path>
            </svg>
          </span>
          <div>
            <h2 class="result-title">H1 标签</h2>
          </div>
        </div>
        <div class="h1-actions">
          <span
            class="status-chip"
            :class="h1Info.count > 1 ? 'is-warning' : (h1Info.count === 1 ? 'is-success' : 'is-neutral')"
          >
            {{ h1Info.count }} 个
          </span>
          <button
            v-if="h1Info.count > 0 && !h1Marked"
            type="button"
            class="text-action"
            @click="markH1"
          >标注</button>
          <button
            v-else-if="h1Marked"
            type="button"
            class="text-action"
            @click="clearH1"
          >清除</button>
        </div>
      </div>

      <p v-if="h1Marked" class="inline-note is-warning">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 21s7-5.2 7-11a7 7 0 10-14 0c0 5.8 7 11 7 11z"></path><circle cx="12" cy="10" r="2.5"></circle>
        </svg>
        已在页面中标出 H1 位置
      </p>

      <div v-if="h1Loading" class="h1-loading">
        <svg class="spinner" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5" opacity=".2"></circle>
          <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
        </svg>
        正在检查 H1...
      </div>
      <p v-else-if="!h1Info.count" class="clean-note is-muted">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="9"></circle><path d="M9 9h.01M15 9h.01M9 15h6"></path>
        </svg>
        未检测到 H1 标签
      </p>
      <div v-else class="h1-list">
        <div
          v-for="item in h1Info.items"
          :key="item.index"
          class="h1-item"
        >
          <div class="h1-item-head">
            <span class="h1-index">H1 #{{ item.index }}</span>
            <span class="h1-desc">{{ item.desc }}</span>
          </div>
          <p :title="item.text">{{ item.text || "(无文本)" }}</p>
        </div>
      </div>
    </article>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

const data = ref(null);
const loading = ref(false);
const error = ref("");

const hiddenIds = computed(() => data.value?.hiddenSections || []);
const checkedAt = ref("");
const marked = ref(false);
const h1Info = ref({ count: 0, items: [] });
const h1Marked = ref(false);
const h1Loading = ref(false);


async function check() {
  loading.value = true;
  error.value = "";
  data.value = null;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    loading.value = false;
    error.value = "无法获取当前标签页";
    return;
  }
  try {
    const result = await chrome.tabs.sendMessage(tab.id, { action: "checkWp", mark: false });
    if (result?.ok) {
      data.value = result;
      checkedAt.value = new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
      marked.value = result.hiddenMarked === true;
      h1Info.value = result.h1 || { count: 0, items: [] };
      h1Marked.value = result.h1Marked === true;
    } else {
      error.value = "页面未响应，请刷新页面后重试";
    }
  } catch (e) {
    error.value = "无法连接到页面，请刷新页面后重试";
  }
  loading.value = false;
}

async function checkH1() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;
  h1Loading.value = true;
  try {
    const result = await chrome.tabs.sendMessage(tab.id, { action: "checkH1" });
    if (result?.ok) {
      h1Info.value = result.h1 || { count: 0, items: [] };
      h1Marked.value = result.h1Marked === true;
    }
  } catch (e) {
    // 页面未响应：保持原状态
  }
  h1Loading.value = false;
}

async function syncMarkStatus() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;
  try {
    const result = await chrome.tabs.sendMessage(tab.id, { action: "getMarkStatus" });
    if (result?.ok) {
      marked.value = result.hiddenMarked === true;
      h1Marked.value = result.h1Marked === true;
    }
  } catch (e) {
    // 页面未响应：保持默认状态
  }
}

async function markHidden() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;
  error.value = "";
  try {
    const result = await chrome.tabs.sendMessage(tab.id, { action: "markHiddenSections" });
    if (result?.ok) {
      marked.value = result.hiddenMarked === true;
      if (!result.marked) error.value = "未发现可标注的隐藏板块";
    } else {
      error.value = "标注失败，请刷新页面后重试";
    }
  } catch (e) {
    error.value = "无法连接到页面，请刷新页面后重试";
  }
}

async function markH1() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;
  error.value = "";
  try {
    const result = await chrome.tabs.sendMessage(tab.id, { action: "markH1" });
    if (result?.ok) {
      h1Marked.value = result.h1Marked === true;
      if (result.h1) h1Info.value = result.h1;
      if (!result.h1Marked) error.value = "未检测到 H1 标签";
    } else {
      error.value = "标注 H1 失败，请刷新页面后重试";
    }
  } catch (e) {
    error.value = "无法连接到页面，请刷新页面后重试";
  }
}

async function clearH1() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;
  try {
    const result = await chrome.tabs.sendMessage(tab.id, { action: "clearH1Marks" });
    if (result?.ok) {
      h1Marked.value = false;
    }
  } catch (e) {
    // 忽略
  }
}

async function clearMarks() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;
  try {
    const [hideResult, h1Result] = await Promise.all([
      chrome.tabs.sendMessage(tab.id, { action: "clearHiddenMarks" }),
      chrome.tabs.sendMessage(tab.id, { action: "clearH1Marks" }),
    ]);
    if (hideResult?.ok) {
      marked.value = false;
    }
    if (h1Result?.ok) {
      h1Marked.value = false;
    }
  } catch (e) {
    // 忽略：页面可能已刷新
  }
}

onMounted(() => {
  syncMarkStatus();
  checkH1();
});
</script>
