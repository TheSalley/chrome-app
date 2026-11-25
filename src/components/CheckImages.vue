<template>
  <div class="images-panel">
    <button
      type="button"
      class="btn btn-primary collect-button"
      :disabled="loading || exporting"
      @click="collect"
    >
      <span v-if="loading" class="inline-flex items-center gap-1.5">
        <svg class="spinner h-4 w-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="42 15"></circle></svg>
        采集中...
      </span>
      <span v-else class="inline-flex items-center gap-1.5">
        <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="16" rx="3"></rect>
          <circle cx="8.5" cy="9" r="1.5"></circle>
          <path d="M4 17l5-5 3.5 3 2.5-2.5L20 17"></path>
        </svg>
        获取图片尺寸
      </span>
    </button>

    <div v-if="error" class="error-banner" role="alert">
      <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
        <circle cx="12" cy="12" r="9"></circle>
        <path d="M12 8v4M12 16h.01"></path>
      </svg>
      <span>{{ error }}</span>
    </div>

    <div v-if="loading" class="surface-card scan-card">
      <svg class="spinner" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5" opacity=".2"></circle>
        <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
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
          class="btn btn-secondary export-button"
          :disabled="loading"
          @click="exportJson"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 3v12M7 10l5 5 5-5M5 21h14"></path>
          </svg>
          JSON
        </button>
        <button
          type="button"
          class="btn btn-secondary export-button"
          :disabled="loading || exporting"
          @click="exportExcel"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
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
              <strong>{{ toStandard(img.displayWidth) }} × {{ toStandard(img.displayHeight) }} px</strong>
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
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
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
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
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
import { ref } from "vue";

const data = ref(null);
const loading = ref(false);
const error = ref("");
const exporting = ref(false);
const sourceUrl = ref(""); // 被采集页面的网址，用于导出文件名

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
      sourceUrl.value = tab.url || "";
    } else {
      error.value = "采集失败：" + (result?.error || "页面未响应，请刷新页面后重试");
    }
  } catch (e) {
    error.value = "无法连接到页面，请刷新页面后重试";
  }
  loading.value = false;
}

// 标准分辨率档位：任意数值向上取到最近的档位（如 1910→1920、1270→1280、300→320）
const STANDARD_SIZES = [
  16, 24, 32, 40, 48, 56, 64, 72, 80, 96, 100, 112, 120, 128, 144, 150,
  160, 180, 192, 200, 216, 224, 240, 256, 280, 288, 300, 320, 336, 360,
  375, 384, 390, 400, 414, 432, 448, 450, 480, 500, 512, 540, 576, 600,
  640, 667, 700, 720, 750, 768, 800, 820, 828, 900, 960, 1000, 1024,
  1080, 1125, 1152, 1200, 1280, 1366, 1440, 1500, 1536, 1600, 1680,
  1800, 1920, 2048, 2160, 2400, 2560, 2880, 3000, 3200, 3440, 3840,
  4096, 5120,
];
function toStandard(n) {
  if (!n || n <= 0) return 0;
  const v = Math.round(n);
  for (const s of STANDARD_SIZES) {
    if (v <= s) return s;
  }
  // 超过最大档位：向上取到 100 的倍数
  return Math.ceil(v / 100) * 100;
}

// 生成导出文件名：被采集页面 URL + 格式化时间（20261118-143015）
function buildExportFileName(ext) {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  const ts = `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
  // 保留完整地址，仅把文件名非法字符替换为 -
  let urlPart = (sourceUrl.value || "").trim();
  if (urlPart) {
    urlPart = urlPart.replace(/[\\/:*?"<>|&=#%\s]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  }
  const base = urlPart ? `${urlPart}_${ts}` : `images_sizes_${ts}`;
  return `${base}.${ext}`;
}

function exportJson() {
  if (!data.value) return;
  const items = data.value.list.map((img) => ({
    src: img.src,
    alt: img.alt || "",
    size: img.displayWidth && img.displayHeight ? `${toStandard(img.displayWidth)}x${toStandard(img.displayHeight)}` : "",
    size15: img.displayWidth && img.displayHeight ? `${toStandard(img.displayWidth * 1.5)}x${toStandard(img.displayHeight * 1.5)}` : "",
    size2: img.displayWidth && img.displayHeight ? `${toStandard(img.displayWidth * 2)}x${toStandard(img.displayHeight * 2)}` : "",
    naturalSize: img.naturalWidth && img.naturalHeight ? `${img.naturalWidth}x${img.naturalHeight}` : "",
    status: statusLabel(img.status),
    moduleId: img.moduleId,
    type: img.type || "img",
  }));
  const blob = new Blob([JSON.stringify(items, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = buildExportFileName("json");
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
    return { buffer: new Uint8Array(await pngBlob.arrayBuffer()), ext: "png", width, height };
  } finally {
    bitmap.close?.();
  }
}

// 把图片等比缩放并居中绘制到指定尺寸的透明画布上（contain 模式，铺满可用空间且不变形）
async function composeThumb(buffer, ext, boxW, boxH) {
  const mime = ext === "jpg" ? "image/jpeg" : `image/${ext}`;
  const bitmap = await createImageBitmap(new Blob([buffer], { type: mime }));
  try {
    const scale = Math.min(boxW / bitmap.width, boxH / bitmap.height) || 1;
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = boxW;
    canvas.height = boxH;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas unavailable");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, Math.round((boxW - w) / 2), Math.round((boxH - h) / 2), w, h);
    const pngBlob = await new Promise((resolve, reject) => {
      canvas.toBlob((r) => (r ? resolve(r) : reject(new Error("png encode failed"))), "image/png");
    });
    return new Uint8Array(await pngBlob.arrayBuffer());
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

    // 倍图尺寸：基于页面显示尺寸 × 倍率（仅当显示尺寸存在时计算），结果向上取标准档位
    const timesSize = (w, h, factor) => {
      if (!w || !h) return "";
      return `${toStandard(w * factor)}x${toStandard(h * factor)}`;
    };

    ws.columns = [
      { header: "序号", key: "index", width: 7 },
      { header: "图片", key: "img", width: 15 },
      { header: "URL", key: "src", width: 58 },
      { header: "尺寸(px)", key: "size", width: 14 },
      { header: "1.5倍图尺寸(px)", key: "size15", width: 17 },
      { header: "2倍图尺寸(px)", key: "size2", width: 16 },
    ];

    // 导出列表：排除“未显示”的图片
    const exportList = data.value.list.filter((img) => img.status !== "hidden");

    const rows = exportList.map((img, i) => ({
      index: i + 1,
      img: "",
      src: img.src,
      size: img.displayWidth && img.displayHeight ? `${toStandard(img.displayWidth)}x${toStandard(img.displayHeight)}` : "",
      size15: timesSize(img.displayWidth, img.displayHeight, 1.5),
      size2: timesSize(img.displayWidth, img.displayHeight, 2),
    }));
    rows.forEach((r) => ws.addRow(r)); // 序号在 A 列，图片列留空由下方 addImage 嵌入

    // 下载图片（并发上限 6，单图失败/格式不支持则跳过，不中断导出）
    const imgs = new Array(exportList.length);
    let nextIdx = 0;
    const worker = async () => {
      while (nextIdx < exportList.length) {
        const i = nextIdx++;
        try {
          imgs[i] = await fetchImageData(exportList[i].src);
        } catch {
          imgs[i] = null;
        }
      }
    };
    await Promise.all(
      Array.from({ length: Math.min(6, exportList.length) }, () => worker())
    );

    // 图片列几何：缩略图铺满单元格可用区域（宽度≈列宽，高度=行高内容区），按比例 contain，不变形
    const IMG_COL_WIDTH_CHARS = 15; // 图片列宽（Excel 字符单位，≈110px）
    const IMG_COL_PX = IMG_COL_WIDTH_CHARS * 7 + 5; // 换算为像素宽（≈110px）
    const IMG_CONTENT_H_PX = 84; // 图片可用高度（px）
    const IMG_PAD_PX = 10; // 单元格上下内边距（px）
    const THUMB_W_PX = IMG_COL_PX; // 缩略图画布宽 = 列宽
    const THUMB_H_PX = IMG_CONTENT_H_PX; // 缩略图画布高 = 内容区高

    for (let i = 0; i < imgs.length; i++) {
      const img = imgs[i];
      if (!img) continue;
      const row = i + 2;
      let thumbBuf = img.buffer;
      try {
        thumbBuf = await composeThumb(img.buffer, img.ext, THUMB_W_PX, THUMB_H_PX);
      } catch {
        // 合成失败则退回原图，按内容区尺寸贴入（可能变形）
      }
      const imageId = wb.addImage({ buffer: thumbBuf, extension: "png" });
      ws.addImage(imageId, {
        tl: { col: 1, row: row - 1 },
        ext: { width: THUMB_W_PX, height: THUMB_H_PX },
        editAs: "oneCell",
      });
    }

    // 行高：容纳图片 + 上下留白
    const IMG_ROW_HEIGHT_PX = IMG_CONTENT_H_PX + IMG_PAD_PX * 2;
    for (let i = 2; i <= rows.length + 1; i++) {
      // ExcelJS 行高单位为 point，1px ≈ 0.75pt
      ws.getRow(i).height = Math.round(IMG_ROW_HEIGHT_PX * 0.75);
    }

    // ===== 美化 =====
    const COL_COUNT = ws.columns.length;
    const HEADER_FILL = "FF1E3A5F"; // 深蓝
    const ZEBRA_FILL = "FFF3F6FB"; // 浅蓝灰斑马纹
    const BORDER_COLOR = { argb: "FFD6DEE8" };
    const thinBorder = {
      top: { style: "thin", color: BORDER_COLOR },
      left: { style: "thin", color: BORDER_COLOR },
      bottom: { style: "thin", color: BORDER_COLOR },
      right: { style: "thin", color: BORDER_COLOR },
    };

    // 表头
    const headerRow = ws.getRow(1);
    headerRow.height = 26;
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, size: 11, color: { argb: "FFFFFFFF" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: HEADER_FILL } };
      cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
      cell.border = thinBorder;
    });
    // 冻结首行 + 启用筛选
    ws.views = [{ state: "frozen", ySplit: 1 }];
    ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: COL_COUNT } };

    // 数据行
    const IMG_CELL_FILL = "FFF6F8FB"; // 图片列固定浅灰底，作为缩略图衬底
    for (let r = 2; r <= rows.length + 1; r++) {
      const row = ws.getRow(r);
      const isZebra = r % 2 === 1; // 奇数数据行加底色
      for (let c = 1; c <= COL_COUNT; c++) {
        const cell = row.getCell(c);
        cell.border = thinBorder;
        const key = ws.columns[c - 1]?.key;
        if (key === "img") {
          // 图片列：统一浅灰衬底 + 居中
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: IMG_CELL_FILL } };
          cell.alignment = { vertical: "middle", horizontal: "center" };
          continue;
        }
        if (isZebra) {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: ZEBRA_FILL } };
        }
        // 数字/短列居中，文本左对齐
        if (["index", "size", "size15", "size2"].includes(key)) {
          cell.alignment = { vertical: "middle", horizontal: "center" };
        } else {
          cell.alignment = { vertical: "middle", horizontal: "left" };
        }
      }
      // URL 列字体略小、灰色
      row.getCell(3).font = { size: 9, color: { argb: "FF64748B" } };
    }

    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = buildExportFileName("xlsx");
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
