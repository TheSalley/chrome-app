<template>
  <div class="space-y-3">
    <div class="flex items-center gap-2">
      <button
        class="cursor-pointer px-4 py-2 rounded-lg bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600"
        @click="collect"
      >
        获取图片尺寸
      </button>
      <button
        v-if="data"
        class="cursor-pointer px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50"
        :disabled="loading"
        @click="exportJson"
      >
        导出JSON
      </button>
      <button
        v-if="data"
        class="cursor-pointer px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
        :disabled="loading || exporting"
        @click="exportExcel"
      >
        {{ exporting ? "导出中..." : "导出Excel" }}
      </button>
      <span v-if="loading" class="text-sm text-gray-500">采集中...</span>
    </div>

    <div v-if="error" class="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
      {{ error }}
    </div>

    <div v-if="!loading && data" class="rounded-lg border border-gray-200 bg-white p-3 text-sm">
      <p class="mb-2 text-gray-600">
        共 <strong class="text-gray-900">{{ data.total }}</strong> 张图片，以下展示最多
        <strong class="text-gray-900">{{ data.list.length }}</strong> 张
        <span v-if="flagCount.up">，<strong class="text-amber-600">{{ flagCount.up }}</strong> 张被放大</span>
        <span v-if="flagCount.down">，<strong class="text-blue-600">{{ flagCount.down }}</strong> 张被缩小</span>
      </p>

      <div class="max-h-[300px] overflow-y-auto space-y-2">
        <div
          v-for="(img, idx) in data.list"
          :key="idx"
          class="rounded border border-gray-100 bg-gray-50 p-2"
        >
          <img
            v-if="img.src"
            :src="img.src"
            :alt="img.alt || '图片'"
            class="mb-1 h-12 w-12 rounded object-cover border border-gray-200"
            loading="lazy"
          />
          <div class="flex items-center gap-1.5 flex-wrap">
            <span
              v-if="img.type === 'bg'"
              class="rounded bg-purple-100 px-1.5 py-0.5 text-xs text-purple-700"
            >背景图</span>
            <span
              v-else
              class="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600"
            >img</span>
            <span class="font-medium text-gray-800">
              {{ img.displayWidth }} × {{ img.displayHeight }} px
            </span>
            <span class="text-gray-400">/</span>
            <span class="text-gray-500">原始 {{ img.naturalWidth }} × {{ img.naturalHeight }}</span>
            <span
              v-if="img.status === 'hidden'"
              class="rounded bg-gray-200 px-1.5 py-0.5 text-xs text-gray-600"
            >未显示</span>
            <span
              v-else-if="img.status === 'unloaded'"
              class="rounded bg-gray-200 px-1.5 py-0.5 text-xs text-gray-600"
            >未加载</span>
            <span
              v-else-if="img.status === 'downscaled'"
              class="rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700"
            >被缩小</span>
            <span
              v-else-if="img.status === 'upscaled'"
              class="rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-700"
            >被放大</span>
            <span v-else class="rounded bg-green-100 px-1.5 py-0.5 text-xs text-green-700">正常</span>
          </div>
          <p v-if="img.moduleId" class="truncate text-xs text-gray-400">模块ID: {{ img.moduleId }}</p>
          <p v-if="img.alt" class="truncate text-xs text-gray-400" :title="img.alt">alt: {{ img.alt }}</p>
          <p v-if="!img.moduleId" class="text-xs text-gray-300">非 Elementor 板块内图片</p>
          <p v-if="img.src" class="truncate text-xs text-gray-400" :title="img.src">{{ img.src }}</p>
        </div>
        <p v-if="!data.list.length" class="text-gray-500">页面上没有图片</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const data = ref(null);
const loading = ref(false);
const error = ref("");
const exporting = ref(false);

const flagCount = computed(() => {
  const list = data.value?.list || [];
  return {
    up: list.filter((img) => img.status === "upscaled").length,
    down: list.filter((img) => img.status === "downscaled").length,
  };
});

async function collect() {
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
    const result = await chrome.tabs.sendMessage(tab.id, { action: "collectImages" });
    if (result?.ok) {
      data.value = result;
    } else {
      error.value = "采集失败：" + (result?.error || "页面未响应，请刷新页面后重试");
    }
  } catch (e) {
    error.value = "无法连接到页面，请刷新页面后重试";
  }
  loading.value = false;
}

function exportJson() {
  if (!data.value) return;
  const items = data.value.list.map((img) => ({
    src: img.src,
    size: `${img.displayWidth}x${img.displayHeight}`,
    moduleId: img.moduleId,
    type: img.type || "img",
  }));
  const blob = new Blob([JSON.stringify(items, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `images_sizes_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

// 支持的图片扩展名（与 exceljs 兼容）
const MIME_EXT_MAP = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/bmp": "bmp",
};
const SUPPORTED_EXTS = ["png", "jpg", "webp", "gif", "bmp"];

function guessExtFromUrl(url) {
  try {
    const pathname = new URL(url).pathname;
    const m = pathname.match(/\.([a-z0-9]{2,4})$/i);
    return m ? m[1].toLowerCase() : "";
  } catch {
    const m = url.match(/\.([a-z0-9]{2,4})(\?|#|$)/i);
    return m ? m[1].toLowerCase() : "";
  }
}

// 下载图片并返回 { buffer: Uint8Array, ext }；格式不支持时抛错（由调用方跳过）
async function fetchImageData(url, timeout = 15000) {
  const res = await fetch(url, { signal: AbortSignal.timeout(timeout) });
  if (!res.ok) throw new Error("HTTP " + res.status);
  const blob = await res.blob();
  const buffer = await blob.arrayBuffer();
  if (!buffer || !buffer.byteLength) throw new Error("empty image");
  const mime = (blob.type || "").toLowerCase();
  const ext = MIME_EXT_MAP[mime] || guessExtFromUrl(url);
  if (!ext || !SUPPORTED_EXTS.includes(ext)) {
    throw new Error("unsupported type: " + (mime || url));
  }
  return { buffer: new Uint8Array(buffer), ext: ext === "jpeg" ? "jpg" : ext };
}

async function exportExcel() {
  if (!data.value || exporting.value) return;
  exporting.value = true;
  try {
    const ExcelJS = (await import("exceljs")).default;
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("图片尺寸");

    ws.columns = [
      { header: "序号", key: "index", width: 8 },
      { header: "图片", key: "img", width: 20 },
      { header: "URL", key: "src", width: 60 },
      { header: "尺寸(px)", key: "size", width: 14 },
      { header: "模块ID", key: "moduleId", width: 16 },
      { header: "类型", key: "type", width: 10 },
    ];
    ws.getRow(1).font = { bold: true };

    const rows = data.value.list.map((img, i) => ({
      index: i + 1,
      img: "",
      src: img.src,
      size: `${img.displayWidth}x${img.displayHeight}`,
      moduleId: img.moduleId,
      type: img.type === "bg" ? "背景图" : "img",
    }));
    rows.forEach((r) => ws.addRow(r));    // 序号在 A 列，图片列留空由下方 addImage 嵌入

    // 下载图片（并发上限 6，单图失败/格式不支持则跳过，不中断导出）
    const imgs = new Array(data.value.list.length);
    let nextIdx = 0;
    const worker = async () => {
      while (nextIdx < data.value.list.length) {
        const i = nextIdx++;
        try {
          imgs[i] = await fetchImageData(data.value.list[i].src);
        } catch {
          imgs[i] = null;
        }
      }
    };
    await Promise.all(
      Array.from({ length: Math.min(6, data.value.list.length) }, () => worker())
    );

    imgs.forEach((img, i) => {
      if (!img) return;
      const row = i + 2;
      const imageId = wb.addImage({ buffer: img.buffer, extension: img.ext });
      // 锚定到第2列第 row 行单元格，覆盖整个单元格（上下留 2px 边距）
      ws.addImage(imageId, {
        tl: { col: 1, row: row - 1 },
        ext: { width: 80, height: 60 },
        editAs: "oneCell",
      });
    });

    // 行高：容纳图片（60px + 边距 ≈ 72px）
    for (let i = 2; i <= rows.length + 1; i++) {
      ws.getRow(i).height = 60;
    }

    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `images_sizes_${Date.now()}.xlsx`;
    a.click();
    URL.revokeObjectURL(a.href);
  } catch (e) {
    console.error("导出Excel失败", e);
    error.value = "导出Excel失败：" + (e?.message || e);
  } finally {
    exporting.value = false;
  }
}
</script>