<template>
  <div class="images-panel">
    <button
      type="button"
      class="btn-primary collect-button"
      :disabled="loading || exporting"
      @click="collect"
    >
      <span v-if="loading" class="inline-flex items-center gap-1.5">
        <svg class="spinner h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
        采集中...
      </span>
      <span v-else class="inline-flex items-center gap-1.5">
        <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="16" rx="3"></rect>
          <circle cx="8.5" cy="9" r="1.5"></circle>
          <path d="M4 17l5-5 3.5 3 2.5-2.5L20 17"></path>
        </svg>
        获取图片尺寸
      </span>
    </button>

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
        <strong>正在采集页面图片</strong>
        <span>读取展示尺寸、原始尺寸与所在模块...</span>
      </div>
    </div>

    <template v-if="!loading && data">
      <div class="metric-grid">
        <div class="metric-card">
          <span class="metric-value">{{ data.total }}</span>
          <span class="metric-label">图片总数</span>
        </div>
        <div class="metric-card is-warning">
          <span class="metric-value">{{ flagCount.up }}</span>
          <span class="metric-label">被放大</span>
        </div>
        <div class="metric-card is-info">
          <span class="metric-value">{{ flagCount.down }}</span>
          <span class="metric-label">被缩小</span>
        </div>
      </div>

      <p v-if="data.total > data.list.length" class="limit-note">
        已达到采集上限，当前展示并导出前 {{ data.list.length }} 张。
      </p>

      <div class="export-bar surface-card">
        <div class="export-copy">
          <strong>导出结果</strong>
          <span>{{ data.list.length }} 张图片 · 含尺寸与状态</span>
        </div>
        <button
          type="button"
          class="btn-secondary export-button"
          :disabled="loading"
          @click="exportJson"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 3v12M7 10l5 5 5-5M5 21h14"></path>
          </svg>
          JSON
        </button>
        <button
          type="button"
          class="btn-secondary export-button"
          :disabled="loading || exporting"
          @click="exportExcel"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M7 3h7l4 4v14H7z"></path><path d="M14 3v5h5M10 12l4 5M14 12l-4 5"></path>
          </svg>
          {{ exporting ? "导出中" : "Excel" }}
        </button>
      </div>

      <div v-if="data.list.length" class="image-list">
        <article
          v-for="(img, idx) in data.list"
          :key="idx"
          class="surface-card image-item"
        >
          <div class="thumb-wrap">
            <img
              v-if="img.src"
              :src="img.src"
              :alt="img.alt || '图片'"
              class="thumb-image"
              loading="lazy"
            />
            <span v-else class="thumb-placeholder">IMG</span>
            <span class="thumb-kind">{{ img.type === "bg" ? "BG" : "IMG" }}</span>
          </div>

          <div class="image-content">
            <div class="image-head">
              <strong>{{ img.displayWidth }} × {{ img.displayHeight }} px</strong>
              <span class="status-chip" :class="statusMeta(img.status).class">
                {{ statusMeta(img.status).label }}
              </span>
            </div>
            <div class="size-line">
              <span>原始尺寸</span>
              <b>{{ img.naturalWidth }} × {{ img.naturalHeight }} px</b>
            </div>
            <div v-if="img.moduleId || img.alt" class="tag-row">
              <span v-if="img.moduleId" class="mini-tag mono" :title="img.moduleId">{{ img.moduleId }}</span>
              <span v-if="img.alt" class="mini-tag alt-tag" :title="img.alt">{{ img.alt }}</span>
            </div>
            <p v-if="img.src" class="image-url" :title="img.src">{{ img.src }}</p>
            <p v-else class="image-url is-empty">图片地址不可用</p>
          </div>
        </article>
      </div>

      <div v-else class="surface-card empty-card">
        <span class="empty-art" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="16" rx="3"></rect>
            <path d="M4 17l5-5 3.5 3 2.5-2.5L20 17"></path>
          </svg>
        </span>
        <div>
          <strong>页面上没有图片</strong>
          <span>尝试刷新页面后重新采集</span>
        </div>
      </div>
    </template>

    <section v-else-if="!loading" class="surface-card idle-card">
      <span class="idle-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="16" rx="3"></rect>
          <circle cx="8.5" cy="9" r="1.5"></circle>
          <path d="M4 17l5-5 3.5 3 2.5-2.5L20 17"></path>
        </svg>
      </span>
      <div>
        <strong>等待采集</strong>
        <span>检查当前页面的图片显示尺寸与原始尺寸</span>
      </div>
    </section>
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

const STATUS_LABELS = {
  normal: "正常",
  downscaled: "被缩小",
  upscaled: "被放大",
  hidden: "未显示",
  unloaded: "未加载",
};

function statusLabel(status) {
  return STATUS_LABELS[status] || status || "";
}

const STATUS_META = {
  normal: { label: "正常", class: "is-success" },
  downscaled: { label: "被缩小", class: "is-info" },
  upscaled: { label: "被放大", class: "is-warning" },
  hidden: { label: "未显示", class: "is-neutral" },
  unloaded: { label: "未加载", class: "is-neutral" },
};

function statusMeta(status) {
  return STATUS_META[status] || { label: status || "未知", class: "is-neutral" };
}

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
    alt: img.alt || "",
    size: `${img.displayWidth}x${img.displayHeight}`,
    naturalSize: img.naturalWidth && img.naturalHeight ? `${img.naturalWidth}x${img.naturalHeight}` : "",
    status: statusLabel(img.status),
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
  "image/avif": "avif",
};
const SUPPORTED_EXTS = ["png", "jpg", "webp", "gif", "bmp", "avif"];

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

// ExcelJS 对 png/jpg 支持最好；WebP/GIF/AVIF/BMP 先转成小尺寸 PNG 缩略图
async function convertToPng(buffer, ext) {
  const mime = ext === "jpg" ? "image/jpeg" : `image/${ext}`;
  const bitmap = await createImageBitmap(new Blob([buffer], { type: mime }));
  try {
    const maxSide = 320;
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas unavailable");
    ctx.drawImage(bitmap, 0, 0, width, height);
    const pngBlob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (result) => (result ? resolve(result) : reject(new Error("png encode failed"))),
        "image/png"
      );
    });
    return { buffer: new Uint8Array(await pngBlob.arrayBuffer()), ext: "png" };
  } finally {
    bitmap.close?.();
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
  const normalizedExt = ext === "jpeg" ? "jpg" : ext;
  const bytes = new Uint8Array(buffer);
  if (normalizedExt === "png" || normalizedExt === "jpg") {
    return { buffer: bytes, ext: normalizedExt };
  }
  return convertToPng(bytes, normalizedExt);
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
      { header: "原始尺寸(px)", key: "naturalSize", width: 16 },
      { header: "状态", key: "status", width: 12 },
      { header: "alt", key: "alt", width: 28 },
      { header: "模块ID", key: "moduleId", width: 16 },
      { header: "类型", key: "type", width: 10 },
    ];
    ws.getRow(1).font = { bold: true };

    const rows = data.value.list.map((img, i) => ({
      index: i + 1,
      img: "",
      src: img.src,
      size: `${img.displayWidth}x${img.displayHeight}`,
      naturalSize: img.naturalWidth && img.naturalHeight ? `${img.naturalWidth}x${img.naturalHeight}` : "",
      status: statusLabel(img.status),
      alt: img.alt || "",
      moduleId: img.moduleId,
      type: img.type === "bg" ? "背景图" : "img",
    }));
    rows.forEach((r) => ws.addRow(r)); // 序号在 A 列，图片列留空由下方 addImage 嵌入

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

<style scoped>
.images-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.collect-button {
  width: 100%;
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
  font-size: 10px;
  line-height: 1.45;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 7px;
}

.metric-card {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 3px;
  padding: 10px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: linear-gradient(180deg, #ffffff 0%, #fcfdff 100%);
  box-shadow: inset 0 1px 0 #fff, var(--shadow-sm);
}

.metric-card.is-warning {
  border-color: #fde68a;
  background: #fffdf5;
}

.metric-card.is-info {
  border-color: #bfdbfe;
  background: #f8fbff;
}

.metric-value {
  color: var(--text);
  font-size: 20px;
  font-weight: 750;
  letter-spacing: -0.04em;
  line-height: 1;
}

.metric-card.is-warning .metric-value {
  color: var(--warning);
}

.metric-card.is-info .metric-value {
  color: var(--primary);
}

.metric-label {
  overflow: hidden;
  color: var(--muted);
  font-size: 10.5px;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.limit-note {
  margin: 0;
  padding: 8px 10px;
  border: 1px solid #fde68a;
  border-radius: 9px;
  background: var(--warning-soft);
  color: var(--warning);
  font-size: 10px;
  line-height: 1.55;
}

.export-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 11px;
}

.export-copy {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 1px;
}

.export-copy strong {
  color: var(--text-soft);
  font-size: 11px;
  font-weight: 700;
}

.export-copy span {
  overflow: hidden;
  color: var(--subtle);
  font-size: 9.5px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.export-button {
  min-height: 32px;
  gap: 4px;
  padding: 5px 9px;
  font-size: 10.5px;
}

.export-button svg {
  width: 12px;
  height: 12px;
}

.image-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.image-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px;
  transition: border-color 0.16s ease, box-shadow 0.16s ease;
}

.image-item:hover {
  border-color: #cbd5e1;
  box-shadow: 0 5px 16px rgba(23, 32, 51, 0.07);
}

.thumb-wrap {
  position: relative;
  width: 56px;
  height: 56px;
  flex: none;
  overflow: hidden;
  border: 1px solid #e5ebf3;
  border-radius: 10px;
  background: var(--surface-muted);
}

.thumb-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumb-placeholder {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  color: var(--subtle);
  font-size: 9px;
  font-weight: 750;
  letter-spacing: 0.08em;
}

.thumb-kind {
  position: absolute;
  right: 3px;
  bottom: 3px;
  padding: 2px 4.5px;
  border-radius: 4px;
  background: rgba(15, 23, 42, 0.72);
  color: #fff;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.04em;
  line-height: 1;
}

.image-content {
  min-width: 0;
  flex: 1;
}

.image-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 7px;
}

.image-head strong {
  min-width: 0;
  overflow: hidden;
  color: var(--text);
  font-size: 11.5px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.size-line {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 4px;
  color: var(--subtle);
  font-size: 10.5px;
  line-height: 1.45;
}

.size-line b {
  color: var(--muted);
  font-weight: 600;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 6px;
}

.mini-tag {
  max-width: 100%;
  overflow: hidden;
  padding: 2px 5.5px;
  border: 1px solid var(--line);
  border-radius: 5px;
  background: var(--surface-muted);
  color: var(--muted);
  font-size: 9.5px;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mini-tag.mono {
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
}

.mini-tag.alt-tag {
  border-color: #dbeafe;
  background: var(--primary-soft);
  color: var(--primary-strong);
}

.image-url {
  margin: 5px 0 0;
  overflow: hidden;
  color: var(--subtle);
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  font-size: 9px;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.image-url.is-empty {
  font-family: inherit;
}

.empty-card,
.idle-card {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 14px;
}

.empty-card {
  border-style: dashed;
  border-color: #dbe5f2;
  background: rgba(255, 255, 255, 0.62);
}

.empty-art,
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

.empty-art svg,
.idle-icon svg {
  width: 16px;
  height: 16px;
}

.empty-card > div,
.idle-card > div {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.empty-card strong,
.idle-card strong {
  color: var(--text-soft);
  font-size: 11px;
  font-weight: 700;
  line-height: 1.35;
}

.empty-card span,
.idle-card span {
  color: var(--subtle);
  font-size: 10px;
  line-height: 1.45;
}

.idle-card {
  border-style: dashed;
  border-color: #dbe5f2;
  background: rgba(255, 255, 255, 0.62);
}
</style>
