<template>
  <div class="wp-panel">
    <div class="action-bar">
      <button
        type="button"
        class="btn-primary check-button"
        :disabled="loading"
        @click="check"
      >
        <span v-if="loading" class="inline-flex items-center gap-1.5">
          <svg class="spinner h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          扫描中...
        </span>
        <span v-else class="inline-flex items-center gap-1.5">
          <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="7"></circle><path d="M16.5 16.5L21 21"></path>
          </svg>
          检测页面
        </span>
      </button>
      <button
        v-if="data && hiddenIds.length && !marked"
        type="button"
        class="btn-secondary warning-button"
        title="在页面上用黑色蒙层标出隐藏板块"
        @click="markHidden"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2.2 12S5.7 5.8 12 5.8 21.8 12 21.8 12 18.3 18.2 12 18.2 2.2 12 2.2 12z"></path>
          <circle cx="12" cy="12" r="2.8"></circle>
          <path d="M3 3l18 18"></path>
        </svg>
        标注隐藏板块
      </button>
      <button
        v-if="marked || h1Marked"
        type="button"
        class="btn-ghost clear-button"
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
      <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <circle cx="12" cy="12" r="9"></circle>
        <path d="M12 8v4M12 16h.01"></path>
      </svg>
      <span>{{ error }}</span>
    </div>

    <div v-if="loading" class="surface-card scan-card">
      <svg class="spinner" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2.5" opacity=".2"></circle>
        <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"></path>
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
            <span class="result-icon" :class="data.noIndex.noindex ? 'is-danger' : 'is-success'" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                <rect x="4" y="10" width="16" height="10" rx="2"></rect>
                <path d="M8 10V7a4 4 0 018 0v3"></path>
              </svg>
            </span>
            <div>
              <span class="eyebrow">Search visibility</span>
              <h3>No-Index 设置</h3>
            </div>
          </div>
          <span
            class="status-chip"
            :class="data.noIndex.noindex ? 'is-danger' : 'is-success'"
          >
            <svg v-if="data.noIndex.noindex" class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.3 3.9L1.8 18a2 2 0 001.7 3h16.9a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"></path><path d="M12 9v4M12 17h.01"></path>
            </svg>
            <svg v-else class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
            <span class="result-icon" :class="hiddenIds.length ? 'is-warning' : 'is-success'" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2.2 12S5.7 5.8 12 5.8 21.8 12 21.8 12 18.3 18.2 12 18.2 2.2 12 2.2 12z"></path>
                <circle cx="12" cy="12" r="2.8"></circle>
                <path d="M3 3l18 18"></path>
              </svg>
            </span>
            <div>
              <span class="eyebrow">Page structure</span>
              <h3>隐藏板块</h3>
            </div>
          </div>
          <span class="status-chip" :class="hiddenIds.length ? 'is-warning' : 'is-success'">
            {{ hiddenIds.length }} 个
          </span>
        </div>

        <p v-if="marked" class="inline-note is-danger">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 6L9 17l-5-5"></path>
          </svg>
          未发现隐藏板块
        </p>
      </article>
    </div>

    <article class="surface-card result-card h1-card">
      <div class="result-head">
        <div class="result-heading">
          <span class="result-icon is-blue" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 6v12M5 6h6M5 18h6M15 6v12M15 9h4M15 12h4M15 15h4"></path>
            </svg>
          </span>
          <div>
            <span class="eyebrow">Heading structure</span>
            <h3>H1 标签</h3>
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
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 21s7-5.2 7-11a7 7 0 10-14 0c0 5.8 7 11 7 11z"></path><circle cx="12" cy="10" r="2.5"></circle>
        </svg>
        已在页面中标出 H1 位置
      </p>

      <div v-if="h1Loading" class="h1-loading">
        <svg class="spinner" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2.5" opacity=".2"></circle>
          <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"></path>
        </svg>
        正在检查 H1...
      </div>
      <p v-else-if="!h1Info.count" class="clean-note is-muted">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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

<style scoped>
.wp-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.action-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.check-button {
  min-width: 116px;
  flex: 1;
}

.action-bar svg {
  width: 14px;
  height: 14px;
}

.warning-button {
  border-color: #fde68a;
  background: var(--warning-soft);
  color: var(--warning);
}

.warning-button:hover:not(:disabled) {
  background: #fef3c7;
  border-color: #fcd34d;
}

.clear-button {
  min-height: 32px;
  padding-inline: 8px;
  font-size: 10.5px;
}

.check-meta {
  display: flex;
  align-items: center;
  gap: 5px;
  padding-left: 2px;
  color: var(--subtle);
  font-size: 10px;
}

.meta-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.error-icon {
  width: 14px;
  height: 14px;
  flex: none;
  margin-top: 1px;
}

.scan-card {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 14px;
  border-color: #dbe7f6;
  background: linear-gradient(135deg, #ffffff 0%, #f7fbff 100%);
  color: var(--primary);
}

.scan-card > svg {
  width: 20px;
  height: 20px;
  flex: none;
  box-sizing: content-box;
  padding: 7px;
  border: 1px solid #dbeafe;
  border-radius: 10px;
  background: var(--primary-soft);
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

.result-stack {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.result-card {
  padding: 13px;
}

.result-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 9px;
}

.result-heading {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 9px;
}

.result-icon {
  display: flex;
  width: 32px;
  height: 32px;
  flex: none;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  border-radius: 10px;
}

.result-icon svg {
  width: 16px;
  height: 16px;
}

.result-icon.is-blue {
  border-color: #dbeafe;
  background: linear-gradient(180deg, #f8fbff 0%, var(--primary-soft) 100%);
  color: var(--primary);
  box-shadow: inset 0 1px 0 #fff;
}

.result-icon.is-success {
  border-color: #a7f3d0;
  background: linear-gradient(180deg, #f7fffc 0%, var(--success-soft) 100%);
  color: var(--success);
  box-shadow: inset 0 1px 0 #fff;
}

.result-icon.is-warning {
  border-color: #fde68a;
  background: linear-gradient(180deg, #fffdf7 0%, var(--warning-soft) 100%);
  color: var(--warning);
  box-shadow: inset 0 1px 0 #fff;
}

.result-icon.is-danger {
  border-color: #fecdd3;
  background: linear-gradient(180deg, #fffafb 0%, var(--danger-soft) 100%);
  color: var(--danger);
  box-shadow: inset 0 1px 0 #fff;
}

.result-heading h3 {
  margin: 1px 0 0;
  color: var(--text);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 1.35;
}

.status-chip svg {
  width: 11px;
  height: 11px;
}

.result-detail {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 10px;
  padding: 9px 10px;
  border: 1px solid #edf1f7;
  border-radius: 9px;
  background: var(--surface-muted);
}

.detail-label {
  flex: none;
  color: var(--subtle);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.result-detail code {
  min-width: 0;
  overflow: hidden;
  color: var(--text-soft);
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  font-size: 10.5px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.inline-note {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin: 9px 0 0;
  padding: 8px 9px;
  border-radius: 9px;
  font-size: 10.5px;
  line-height: 1.55;
}

.inline-note svg {
  width: 12px;
  height: 12px;
  flex: none;
  margin-top: 1px;
}

.inline-note.is-warning {
  background: var(--warning-soft);
  color: var(--warning);
}

.inline-note.is-danger {
  border: 1px solid #fecdd3;
  background: var(--danger-soft);
  color: var(--danger);
  font-weight: 500;
}

.inline-note strong {
  font-weight: 800;
}

.id-list {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 10px;
}

.id-chip {
  max-width: 100%;
  overflow: hidden;
  padding: 4px 7.5px;
  border: 1px solid #fde68a;
  border-radius: 8px;
  background: #fffbeb;
  color: #92400e;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  font-size: 10px;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.clean-note {
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 10px 0 0;
  color: var(--success);
  font-size: 10.5px;
  line-height: 1.45;
}

.clean-note svg {
  width: 12px;
  height: 12px;
  flex: none;
}

.clean-note.is-muted {
  color: var(--muted);
}

.clean-note.is-muted svg {
  color: var(--success);
}

.h1-actions {
  display: flex;
  flex: none;
  align-items: center;
  gap: 5px;
}

.text-action {
  padding: 3px 0;
  border: 0;
  background: transparent;
  color: var(--primary);
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
}

.text-action:hover {
  color: var(--primary-strong);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.h1-loading {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  color: var(--subtle);
  font-size: 10px;
}

.h1-loading svg {
  width: 13px;
  height: 13px;
  color: var(--primary);
}

.h1-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 10px;
}

.h1-item {
  padding: 8px 9px;
  border: 1px solid #ffedd5;
  border-radius: 9px;
  background: #fffaf5;
}

.h1-item-head {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.h1-index {
  flex: none;
  padding: 2.5px 5.5px;
  border-radius: 5px;
  background: #ea580c;
  color: #fff;
  font-size: 9.5px;
  font-weight: 800;
  line-height: 1.2;
}

.h1-desc {
  min-width: 0;
  overflow: hidden;
  color: #9a3412;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.h1-item p {
  display: -webkit-box;
  margin: 5px 0 0;
  overflow: hidden;
  color: var(--muted);
  font-size: 10.5px;
  line-height: 1.45;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
</style>
