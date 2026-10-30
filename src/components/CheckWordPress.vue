<template>
  <div class="space-y-3">
    <!-- 操作区 -->
    <div class="flex items-center gap-3">
      <button
        class="cursor-pointer px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-sm font-semibold shadow-md shadow-indigo-200 transition-all hover:shadow-lg hover:shadow-indigo-300 hover:from-indigo-600 hover:to-violet-600 active:scale-95 disabled:opacity-60"
        :disabled="loading"
        @click="check"
      >
        <span v-if="loading" class="inline-flex items-center gap-1.5">
          <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          检测中...
        </span>
        <span v-else class="inline-flex items-center gap-1.5">
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="7"></circle><line x1="16.5" y1="16.5" x2="21" y2="21"></line>
          </svg>
          检测
        </span>
      </button>
      <button
        v-if="marked"
        class="cursor-pointer px-4 py-2 rounded-xl bg-white border border-gray-300 text-gray-600 text-sm font-medium transition-all hover:bg-gray-50 hover:border-gray-400 active:scale-95"
        @click="clearMarks"
      >
        清除标记
      </button>
      <span v-if="checkedAt" class="text-xs text-gray-400">上次检测 {{ checkedAt }}</span>
    </div>

    <div v-if="error" class="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 flex items-center gap-2">
      <svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      {{ error }}
    </div>

    <div v-if="!loading && data" class="space-y-3">
      <!-- No-Index 结果 -->
      <div class="rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md">
        <div class="flex items-center">
          <div class="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2"></rect><path d="M7 11V7a5 5 0 0110 0v4"></path>
            </svg>
          </div>
          <span
            class="rounded-full px-2.5 py-1 text-xs font-semibold inline-flex items-center gap-1"
            :class="data.noIndex.noindex
              ? 'bg-red-100 text-red-700 border border-red-300 shadow-sm'
              : 'bg-emerald-100 text-emerald-700 border border-emerald-200'"
          >
            <svg v-if="data.noIndex.noindex" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <svg v-else class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            {{ data.noIndex.noindex ? "已开启 No-Index" : "未开启 No-Index" }}
          </span>
        </div>
        <p class="mt-2 text-xs text-gray-500 truncate" :title="data.noIndex.metaContent">
          {{ data.noIndex.hasMeta ? `robots: ${data.noIndex.metaContent}` : "未检测到 robots meta 标签" }}
        </p>
      </div>

      <!-- 隐藏板块结果 -->
      <div class="rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0112 20a10.07 10.07 0 01-5.94-2.06"></path>
              <path d="M9.9 4.24A9.12 9.12 0 0112 4a10.07 10.07 0 017.06 2.94"></path>
              <path d="M2 12c1.6-2.4 3.7-4.5 6-5.9"></path><path d="M22 12c-1.6-2.4-3.7-4.5-6-5.9"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
            隐藏板块
          </div>
          <span
            class="rounded-full px-2.5 py-1 text-xs font-semibold inline-flex items-center gap-1"
            :class="hiddenIds.length > 0 ? 'bg-amber-100 text-amber-700 border border-amber-300' : 'bg-gray-100 text-gray-500 border border-gray-200'"
          >
            {{ hiddenIds.length }} 个
          </span>
        </div>

        <div class="mt-2">
          <p v-if="marked" class="mb-2 text-xs text-red-600 flex items-center gap-1.5">
            <svg class="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            已在页面上标出隐藏元素（黑色蒙层），点击上方"清除标记"恢复
          </p>
          <p v-if="!hiddenIds.length" class="text-xs text-gray-400 flex items-center gap-1.5">
            <svg class="h-3.5 w-3.5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle><path d="M8 12l3 3 5-6"></path>
            </svg>
            未发现隐藏板块
          </p>
          <div v-else class="flex flex-wrap gap-1.5">
            <span
              v-for="(item, idx) in hiddenIds"
              :key="idx"
              class="rounded-lg bg-amber-50 border border-amber-200 px-2 py-1 text-xs font-mono text-amber-800"
              :title="'隐藏元素: ' + item"
            >{{ item }}</span>
          </div>
        </div>
      </div>
    </div>
    <!-- H1 标签（独立自动检查） -->
    <div class="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
          <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 7v10"></path><path d="M4 7h7"></path><path d="M4 17h7"></path><path d="M15 7v10"></path><path d="M15 7h4"></path><path d="M15 12h4"></path><path d="M15 17h4"></path>
          </svg>
          H1 标签
        </div>
        <div class="flex items-center gap-2">
          <span
            class="rounded-full px-2.5 py-1 text-xs font-semibold inline-flex items-center gap-1"
            :class="h1Info.count > 1 ? 'bg-amber-100 text-amber-700 border border-amber-300' : (h1Info.count === 1 ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-500 border border-gray-200')"
          >
            {{ h1Info.count }} 个
          </span>
          <button
            v-if="h1Marked"
            class="text-xs text-orange-600 underline cursor-pointer whitespace-nowrap"
            @click="clearH1"
          >
            清除 H1 标注
          </button>
        </div>
      </div>
      <div class="mt-2">
        <p v-if="h1Marked" class="mb-2 text-xs text-orange-600 flex items-center gap-1.5">
          <svg class="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          已在页面上标出 H1 位置（橙色高亮框 + 角标）
        </p>
        <p v-if="h1Loading" class="text-xs text-gray-400 flex items-center gap-1.5">
          <svg class="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          正在检查 H1...
        </p>
        <p v-else-if="!h1Info.count" class="text-xs text-gray-400 flex items-center gap-1.5">
          <svg class="h-3.5 w-3.5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          未检测到 H1 标签
        </p>
        <div v-else class="space-y-1.5">
          <div
            v-for="item in h1Info.items"
            :key="item.index"
            class="rounded-lg bg-orange-50 border border-orange-200 px-2.5 py-1.5 text-xs"
          >
            <div class="flex items-center gap-2">
              <span class="rounded bg-orange-600 text-white font-bold px-1.5 py-0.5 text-[10px] leading-none">H1 #{{ item.index }}</span>
              <span class="font-mono text-orange-800">{{ item.desc }}</span>
            </div>
            <p class="mt-1 text-gray-600 break-words line-clamp-2" :title="item.text">{{ item.text || "(无文本)" }}</p>
          </div>
        </div>
      </div>
    </div>

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
    const result = await chrome.tabs.sendMessage(tab.id, { action: "checkWp" });
    if (result?.ok) {
      data.value = result;
      checkedAt.value = new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
      marked.value = (result.marked || 0) > 0;
      h1Info.value = result.h1 || { count: 0, items: [] };
      h1Marked.value = (result.h1Marked || 0) > 0;
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
      h1Marked.value = (result.h1Marked || 0) > 0;
    }
  } catch (e) {
    // 页面未响应：保持原状态
  }
  h1Loading.value = false;
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

onMounted(() => {
  checkH1();
});
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
</script>
