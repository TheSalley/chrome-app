// 非 Shopify 主题商店页面才注入 inject.js
if (location.hostname !== "themes.shopify.com") {
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("assets/inject.js");
  (document.head || document.documentElement).appendChild(script);
}

// 在 Shopify 主题商店页面注入“真实主题网址”按钮（插到底部预览条里）
function setupShopifyThemeButton() {
  if (location.hostname !== "themes.shopify.com") return;

  let inserted = false;

  function tryInsert() {
    if (inserted) return true;
    const demoContainer = document.querySelector("#demo-container");
    const realUrl = demoContainer?.getAttribute("data-demo-store-iframe-url-value");
    if (!realUrl) return false;
    const viewDemoButton = document.querySelector('[data-demo-store-responder-target="viewDemoButton"]');
    if (!viewDemoButton) return false;

    inserted = true;
    const btn = document.createElement("a");
    btn.textContent = "真实地址";
    btn.href = realUrl;
    btn.target = "_blank";
    btn.rel = "noopener noreferrer";
    btn.style.padding = "8px 16px";
    btn.style.borderRadius = "999px";
    btn.style.border = "1px solid rgba(15,23,42,0.15)";
    btn.style.background = "#10b981";
    btn.style.color = "#fff";
    btn.style.fontSize = "13px";
    btn.style.fontWeight = "600";
    btn.style.cursor = "pointer";
    btn.style.whiteSpace = "nowrap";
    viewDemoButton.parentElement.insertBefore(btn, viewDemoButton);
    return true;
  }

  // 立即尝试一次
  if (tryInsert()) return;

  // 用 MutationObserver：DOM 一出现目标就插入
  const observer = new MutationObserver(() => {
    if (tryInsert()) observer.disconnect();
  });
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  // 备用：短间隔轮询，最多 15 秒
  const deadline = Date.now() + 15000;
  const timer = setInterval(() => {
    if (inserted || Date.now() > deadline) {
      clearInterval(timer);
      observer.disconnect();
      return;
    }
    if (tryInsert()) {
      clearInterval(timer);
      observer.disconnect();
    }
  }, 150);
}

// 填充内容从设置页读取，未设置时使用默认值。
// 注意：content script 必须自包含，不能引用 Vite 拆分出的共享 chunk。
const FORM_DATA_KEY = "elementorFormData";
const DEFAULT_FORM_DATA = {
  text: "test",
  tel: "13800138000",
  email: "test@example.com",
  textarea: "This is test message",
};

function normalizeFormData(value) {
  const source = value && typeof value === "object" ? value : {};
  return {
    text: typeof source.text === "string" ? source.text : DEFAULT_FORM_DATA.text,
    tel: typeof source.tel === "string" ? source.tel : DEFAULT_FORM_DATA.tel,
    email: typeof source.email === "string" ? source.email : DEFAULT_FORM_DATA.email,
    textarea: typeof source.textarea === "string" ? source.textarea : DEFAULT_FORM_DATA.textarea,
  };
}

let formData = { ...DEFAULT_FORM_DATA };

function setFieldValue(el, value) {
  if (!el || el.value === value) return false;
  el.value = value;
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
}

function shouldSkipField(el) {
  if (!el || !el.isConnected || el.disabled || el.readOnly) return true;
  const type = (el.type || "text").toLowerCase();
  if (["hidden", "submit", "button", "reset", "file", "password", "checkbox", "radio", "search"].includes(type)) {
    return true;
  }
  // 跳过 Elementor 蜜罐/多步骤表单中当前不可见的字段，避免误触反垃圾逻辑
  return el.getClientRects().length === 0;
}

function fillElementorForms() {
  const forms = document.querySelectorAll("form.elementor-form");
  if (!forms.length) return { filled: 0, error: "未找到 Elementor 表单" };
  let filled = 0;
  try {
    forms.forEach((form) => {
      const inputs = form.querySelectorAll("input, textarea");
      inputs.forEach((el) => {
        if (shouldSkipField(el)) return;
        if (el.value && el.value.trim()) return;

        if (el.name === "zendkee_captcha" || el.name === "anti_spam_captcha") {
          const group = el.closest(".elementor-field-group");
          const codeEl = group?.querySelector(".captcha_code");
          if (codeEl && setFieldValue(el, codeEl.textContent?.trim() || "")) filled++;
          return;
        }

        if (el.tagName === "TEXTAREA") {
          if (formData.textarea && setFieldValue(el, formData.textarea)) filled++;
          return;
        }

        const type = (el.type || "text").toLowerCase();
        if (type === "email") {
          if (formData.email && setFieldValue(el, formData.email)) filled++;
        } else if (type === "tel") {
          if (formData.tel && setFieldValue(el, formData.tel)) filled++;
        } else if (type === "text" || type === "url") {
          if (formData.text && setFieldValue(el, formData.text)) filled++;
        }
      });
    });
    return { filled, error: null };
  } catch (err) {
    console.error("表单填充异常", err);
    return { filled, error: String(err) };
  }
}

function website() {
  if (location.origin !== "https://download.ehaitech.com") return;

  const items = document.querySelectorAll(".layui-form-item");
  const codeEl = items[3]?.querySelector(".layui-input-inline");
  const target = items[4]?.querySelector("input");
  if (!codeEl || !target) return;

  const code = (codeEl.innerText || "").trim();
  if (code && target.value !== code) {
    target.value = code;
    target.dispatchEvent(new Event("input", { bubbles: true }));
    target.dispatchEvent(new Event("change", { bubbles: true }));
  }
}

// 判断是否为 SVG 图片（忽略 .svg 地址与 SVG data URI）
function isSvgImage(src) {
  if (!src) return false;
  if (src.startsWith("data:image/svg+xml")) return true;
  try {
    const pathname = new URL(src).pathname || "";
    return /\.svg$/i.test(pathname);
  } catch {
    return /\.svg(\?|#|$)/i.test(src);
  }
}

// 元素是否位于 Elementor 的页头/页脚模板内（采集图片尺寸时忽略）
function isInHeaderOrFooter(el) {
  if (!el) return false;
  return !!el.closest('[data-elementor-type="header"], [data-elementor-type="footer"]');
}

// 查找图片所属的最外层 Elementor 板块（section / container）
function findOuterElementorBlock(img) {
  const selector = '.elementor-section, [data-element_type="container"]';
  let current = img.closest(selector);
  if (!current) return "";
  let outer = current;
  while (current) {
    outer = current;
    current = current.parentElement ? current.parentElement.closest(selector) : null;
  }
  return outer.getAttribute("data-id") || "";
}

// 解析 background-image 中的 url(...) 列表（忽略 SVG）
function parseBackgroundUrls(bgValue, baseUrl = document.baseURI) {
  const urls = [];
  const regex = /url\(\s*(?:"([^"]*)"|'([^']*)'|([^)'"\s]+))\s*\)/g;
  let match;
  while ((match = regex.exec(bgValue))) {
    let url = match[1] || match[2] || match[3];
    if (!url || url.startsWith("#")) continue;
    try {
      url = new URL(url, baseUrl).href;
    } catch {
      // 保留原始值，后续加载会自行失败
    }
    if (!isSvgImage(url)) urls.push(url);
  }
  return urls;
}

// 采集上限：最多 500 条记录
const MAX_IMAGES = 500;

// 从样式表规则 + 内联样式中收集背景图片任务。
// 直接扫描 CSS 规则中的 background-image: url(...)，不受页面元素数量限制，
// 可覆盖 Elementor post-*.css 等外部样式表生成的背景图。
function findBackgroundTasks() {
  const tasks = [];
  // 同一元素 + 同一 URL 只保留一次（样式表扫描与内联样式兜底会重复命中）
  const seenByElement = new WeakMap();

  const tryAdd = (el, urls) => {
    if (tasks.length >= MAX_IMAGES) return;
    // 忽略页头/页脚模板内的背景图
    if (isInHeaderOrFooter(el)) return;
    let seen = seenByElement.get(el);
    if (!seen) {
      seen = new Set();
      seenByElement.set(el, seen);
    }
    for (const url of new Set(urls)) {
      if (tasks.length >= MAX_IMAGES) break;
      if (seen.has(url)) continue;
      seen.add(url);
      tasks.push({ el, url });
    }
  };

  // 递归遍历规则（处理 @media / @supports 嵌套）
  const walkRules = (rules, baseUrl) => {
    if (!rules) return;
    for (const rule of rules) {
      if (!rule) continue;
      if (tasks.length >= MAX_IMAGES) return;
      // 部分规则（CSSStyleRule 等）访问 cssRules 会抛 SecurityError，需安全判断
      let nested = null;
      try {
        nested = rule.cssRules;
      } catch {
        nested = null;
      }
      if (nested && nested.length > 0) {
        walkRules(nested, baseUrl);
      }

      // @import 规则的资源基准是它自己的 href，而不是外层样式表
      let imported = null;
      try {
        imported = rule.styleSheet;
      } catch {
        imported = null;
      }
      if (imported && imported.cssRules) {
        try {
          walkRules(imported.cssRules, imported.href || baseUrl);
        } catch {
          // 跨域导入的样式表无法读取，跳过
        }
      }

      const bg = rule.style ? rule.style.backgroundImage : "";
      if (!bg || !bg.includes("url(")) continue;
      const urls = parseBackgroundUrls(bg, baseUrl);
      if (!urls.length) continue;

      const selector = rule.selectorText || "";
      const parts = selector.split(",").map((s) => s.trim()).filter(Boolean);
      for (const part of parts) {
        // 去掉伪元素部分，避免 querySelectorAll 抛错
        const base = part
          .replace(/::?(before|after|first-line|first-letter|backdrop|placeholder|selection)(\([^)]*\))?/gi, "")
          .trim();
        if (!base) continue;
        try {
          const els = document.querySelectorAll(base);
          for (const el of els) {
            if (tasks.length >= MAX_IMAGES) return;
            tryAdd(el, urls);
          }
        } catch {
          // 无法解析的选择器跳过
        }
      }
    }
  };

  for (const sheet of Array.from(document.styleSheets)) {
    try {
      walkRules(sheet.cssRules, sheet.href || document.baseURI);
    } catch {
      // 跨域样式表无法读取 cssRules，跳过
    }
  }

  // 内联 background 样式兜底（计算样式，含伪元素）
  const inlineEls = document.querySelectorAll('[style*="background"]');
  for (const el of inlineEls) {
    if (tasks.length >= MAX_IMAGES) break;
    const urls = [];
    for (const pseudo of ["", "::before", "::after"]) {
      const style = getComputedStyle(el, pseudo || null);
      urls.push(...parseBackgroundUrls(style.backgroundImage));
    }
    tryAdd(el, urls);
  }

  return tasks;
}

// 异步获取图片原始尺寸（失败或超时返回 null）
function loadNaturalSize(src, timeout = 8000) {
  return new Promise((resolve) => {
    const img = new Image();
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      resolve(
        img.naturalWidth && img.naturalHeight
          ? { w: img.naturalWidth, h: img.naturalHeight }
          : null
      );
    };
    img.onload = finish;
    img.onerror = finish;
    setTimeout(finish, timeout);
    img.src = src;
  });
}

// 限制背景图尺寸探测的并发数，避免一次性发起数百个图片请求。
async function loadNaturalSizes(urls, concurrency = 8) {
  const list = Array.from(urls);
  const result = new Map();
  let next = 0;

  const worker = async () => {
    while (next < list.length) {
      const url = list[next++];
      result.set(url, await loadNaturalSize(url));
    }
  };

  const workerCount = Math.min(concurrency, list.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return result;
}

// 统一构造图片条目（尺寸取整到 10px，状态判断用原始值）
function buildImageItem({ src, moduleId, alt, rect, naturalWidth, naturalHeight, type }) {
  const rawWidth = rect.width;
  const rawHeight = rect.height;
  const displayWidth = rawWidth > 0 ? Math.max(10, Math.round(rawWidth / 10) * 10) : 0;
  const displayHeight = rawHeight > 0 ? Math.max(10, Math.round(rawHeight / 10) * 10) : 0;

  let status = "normal";
  if (!naturalWidth || !naturalHeight) {
    status = "unloaded"; // 未加载完成或加载失败
  } else if (rawWidth <= 0 || rawHeight <= 0) {
    status = "hidden"; // 未显示（隐藏/不可见）
  } else {
    const ratio = naturalWidth / rawWidth;
    if (ratio > 1.05) {
      status = "downscaled"; // 原始尺寸大于显示尺寸（被缩小）
    } else if (ratio < 0.95) {
      status = "upscaled"; // 显示尺寸大于原始尺寸（被放大）
    }
  }

  return {
    src,
    moduleId,
    alt: alt || "",
    displayWidth,
    displayHeight,
    naturalWidth,
    naturalHeight,
    status,
    type,
  };
}

// 收集页面图片的真实尺寸信息（忽略 SVG）：<img> 标签 + CSS 背景图片
// 去重口径：同一模块（最外层 Elementor 板块）内，相同图片 URL 只保留一条；
// 不同模块中的相同图片仍分别统计。
async function collectImageSizes() {
  const list = [];
  const seenKeys = new Set(); // "moduleId\u0000src" 组合，模块内按 URL 去重
  const addItem = (item) => {
    if (list.length >= MAX_IMAGES) return;
    const key = (item.moduleId || "") + "\u0000" + (item.src || "");
    if (seenKeys.has(key)) return;
    seenKeys.add(key);
    list.push(item);
  };

  // 1) <img> 标签（忽略 SVG 与页头/页脚模板内的图片）
  const images = Array.from(document.images).filter(
    (img) =>
      !isSvgImage(img.currentSrc || img.src || "") && !isInHeaderOrFooter(img)
  );
  for (const img of images) {
    if (list.length >= MAX_IMAGES) break;
    addItem(
      buildImageItem({
        src: img.currentSrc || img.src || "",
        moduleId: findOuterElementorBlock(img),
        alt: img.alt || "",
        rect: img.getBoundingClientRect(),
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        type: "img",
      })
    );
  }

  // 2) CSS 背景图片：全量扫描元素自身与伪元素的背景图
  const bgTasks = findBackgroundTasks();
  const seenUrls = new Set(bgTasks.map((task) => task.url));

  // 限制并发加载所有不重复背景图的原始尺寸
  const sizeCache = await loadNaturalSizes(seenUrls);

  for (const { el, url } of bgTasks) {
    if (list.length >= MAX_IMAGES) break;
    const natural = sizeCache.get(url);
    addItem(
      buildImageItem({
        src: url,
        moduleId: findOuterElementorBlock(el),
        alt: "",
        rect: el.getBoundingClientRect(),
        naturalWidth: natural?.w || 0,
        naturalHeight: natural?.h || 0,
        type: "bg",
      })
    );
  }

  return { total: list.length, list };
}

// 页面加载后根据开关状态自动填充；只填空白字段，避免覆盖用户输入
function debounce(fn, delay = 200) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

let autoFillObserver = null;
let autoFillStopTimer = null;
let autoFillEnabled = false;

function stopAutoFillWatcher() {
  if (autoFillObserver) autoFillObserver.disconnect();
  autoFillObserver = null;
  if (autoFillStopTimer) clearTimeout(autoFillStopTimer);
  autoFillStopTimer = null;
}

function startAutoFillWatcher() {
  if (!autoFillEnabled || autoFillObserver) return;

  const fill = debounce(() => {
    if (autoFillEnabled) fillElementorForms();
  }, 200);
  fill();

  autoFillObserver = new MutationObserver(() => {
    if (autoFillEnabled && document.querySelector("form.elementor-form")) fill();
  });
  autoFillObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["class", "style", "hidden"],
  });
  autoFillStopTimer = setTimeout(stopAutoFillWatcher, 15000);
}

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local") return;
  if (changes[FORM_DATA_KEY]) {
    formData = normalizeFormData(changes[FORM_DATA_KEY].newValue);
  }
  if (changes[CAPTCHA_AUTO_KEY]) {
    captchaAutoEnabled = changes[CAPTCHA_AUTO_KEY].newValue !== false;
    if (captchaAutoEnabled) startCaptchaAutoFill();
    else stopCaptchaAutoFill();
  }
  if (changes.switchStatus) {
    autoFillEnabled = changes.switchStatus.newValue === true;
    if (autoFillEnabled) {
      chrome.storage.local.get([FORM_DATA_KEY], (result) => {
        formData = normalizeFormData(result[FORM_DATA_KEY]);
        startAutoFillWatcher();
      });
    } else {
      stopAutoFillWatcher();
    }
  }
});

chrome.storage.local.get(["switchStatus", FORM_DATA_KEY], (result) => {
  formData = normalizeFormData(result[FORM_DATA_KEY]);
  autoFillEnabled = result.switchStatus === true;
  if (autoFillEnabled) startAutoFillWatcher();
});
setTimeout(website, 2000);

// 监听页面加载，若在 Shopify 主题商店则注入按钮
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupShopifyThemeButton);
} else {
  setupShopifyThemeButton();
}

// 检查页面 no-index 状态（合并 robots / googlebot / bingbot meta）
function getNoIndexStatus() {
  const metas = Array.from(document.querySelectorAll("meta[name]")).filter((meta) =>
    /^(robots|googlebot|bingbot)$/i.test(meta.getAttribute("name") || "")
  );
  const contents = metas.map((meta) => (meta.content || "").trim()).filter(Boolean);
  const content = contents.join(", ");
  const tokens = content.toLowerCase().split(/[\s,]+/);
  const noindex = tokens.includes("noindex") || tokens.includes("none");
  return {
    noindex,
    metaContent: content,
    hasMeta: metas.length > 0,
  };
}

function describeHiddenSection(el) {
  const parts = [el.tagName.toLowerCase()];
  const id = el.getAttribute("id");
  if (id) parts.push("#" + id);
  const cls = (el.className && typeof el.className === "string") ? el.className : "";
  const meaningful = cls.split(/\s+/).filter((c) => c && !c.startsWith("elementor-hidden-"));
  if (meaningful.length) parts.push("." + meaningful.slice(0, 3).join("."));
  return parts.join("");
}

// 返回隐藏元素的标识描述：tag + #id + 相关 class
function getHiddenSections(elements = findHiddenSectionEls()) {
  return elements.map(describeHiddenSection);
}

// ===== 隐藏板块页面标记（强制显示 + 黑色蒙层） =====
let hiddenMarkActive = false;

// 清除已添加的标记，恢复元素原始样式
function clearHiddenSectionMarks() {
  if (!hiddenMarkActive) return 0;
  const overlays = document.querySelectorAll(".wp-tools-hidden-mask");
  let cleared = 0;
  overlays.forEach((overlay) => {
    const el = overlay.parentElement;
    let orig = {};
    try {
      orig = overlay.dataset.origStyle ? JSON.parse(overlay.dataset.origStyle) : {};
    } catch (_) {
      orig = {};
    }
    if (el) {
      if (orig.display !== undefined) el.style.display = orig.display;
      if (orig.visibility !== undefined) el.style.visibility = orig.visibility;
      if (orig.opacity !== undefined) el.style.opacity = orig.opacity;
      if (orig.position !== undefined) el.style.position = orig.position;
    }
    overlay.remove();
    cleared++;
  });
  hiddenMarkActive = false;
  return cleared;
}

// 查找隐藏板块（同时包含 desktop 与 mobile 隐藏 class）
function findHiddenSectionEls() {
  return Array.from(
    document.querySelectorAll(".elementor-hidden-desktop.elementor-hidden-mobile")
  );
}

// 强制显示隐藏板块，并添加黑色蒙层
function markHiddenSections(hidden = findHiddenSectionEls()) {
  clearHiddenSectionMarks();
  hidden.forEach((el) => {
    // 记录原始 inline 样式以便恢复
    const orig = {
      display: el.style.display,
      visibility: el.style.visibility,
      opacity: el.style.opacity,
      position: el.style.position,
    };
    // 强制显示（覆盖 Elementor 媒体查询的隐藏规则）
    el.style.setProperty("display", "block", "important");
    el.style.setProperty("visibility", "visible", "important");
    el.style.setProperty("opacity", "1", "important");
    el.style.setProperty("position", "relative", "important");

    // 黑色蒙层遮罩
    const overlay = document.createElement("div");
    overlay.className = "wp-tools-hidden-mask";
    overlay.setAttribute("aria-hidden", "true");
    overlay.dataset.origStyle = JSON.stringify(orig);
    overlay.style.cssText =
      "position:absolute;inset:0;background:rgba(0,0,0,0.65);" +
      "z-index:999999;display:flex;align-items:center;justify-content:center;" +
      "pointer-events:none;border:2px dashed #ef4444;box-sizing:border-box;";

    const label = document.createElement("span");
    const tagName = el.tagName.toLowerCase(); const elId = el.getAttribute("id");
    label.textContent = "隐藏元素 " + tagName + (elId ? "#" + elId : "");
    label.style.cssText =
      "color:#fff;font-size:13px;font-weight:700;" +
      "background:rgba(220,38,38,0.85);padding:4px 10px;border-radius:6px;" +
      "box-shadow:0 2px 8px rgba(0,0,0,0.5);";

    overlay.appendChild(label);
    el.appendChild(overlay);
  });
  hiddenMarkActive = hidden.length > 0;
  return hidden.length;
}
// ===== H1 标签统计与页面标注 =====
let h1MarkActive = false;

// 清除 H1 标注
function clearH1Marks() {
  if (!h1MarkActive) return 0;
  const badges = document.querySelectorAll(".wp-tools-h1-badge");
  let cleared = 0;
  badges.forEach((badge) => {
    const el = badge.parentElement;
    let orig = {};
    try {
      orig = badge.dataset.orig ? JSON.parse(badge.dataset.orig) : {};
    } catch (_) {
      orig = { position: badge.dataset.origPos };
    }
    if (el) {
      if (orig.position !== undefined) el.style.position = orig.position;
      if (orig.outline !== undefined) el.style.outline = orig.outline;
      if (orig.outlineOffset !== undefined) el.style.outlineOffset = orig.outlineOffset;
    }
    badge.remove();
    cleared++;
  });
  h1MarkActive = false;
  return cleared;
}

// 统计页面 H1 标签信息（数量 + 文本 + 定位描述）
function getH1Info() {
  const h1s = Array.from(document.querySelectorAll("h1"));
  return {
    count: h1s.length,
    items: h1s.map((el, index) => {
      const text = Array.from(el.childNodes)
        .filter((node) => !(node.nodeType === 1 && node.classList.contains("wp-tools-h1-badge")))
        .map((node) => node.textContent || "")
        .join("")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 80);
      const elId = el.getAttribute("id");
      const cls = typeof el.className === "string" ? el.className.trim() : "";
      const meaningful = cls.split(/\s+/).filter((c) => c && !c.startsWith("elementor-hidden-"));
      const clsDesc = meaningful.length ? "." + meaningful.slice(0, 3).join(".") : "";
      return {
        index: index + 1,
        text,
        desc: "h1" + (elId ? "#" + elId : "") + clsDesc,
      };
    }),
  };
}

// 在每个 H1 上添加醒目标注（橙色虚线高亮框 + 大号角标）
function markH1Tags() {
  clearH1Marks();
  const h1s = Array.from(document.querySelectorAll("h1"));
  h1s.forEach((el, index) => {
    const badge = document.createElement("span");
    badge.className = "wp-tools-h1-badge";
    badge.setAttribute("aria-hidden", "true");
    badge.dataset.orig = JSON.stringify({
      position: el.style.position,
      outline: el.style.outline,
      outlineOffset: el.style.outlineOffset,
    });
    if (getComputedStyle(el).position === "static") {
      el.style.position = "relative";
    }
    el.style.setProperty("outline", "3px dashed #ff7a00", "important");
    el.style.setProperty("outline-offset", "3px", "important");

    badge.style.cssText =
      "position:absolute;top:4px;right:4px;z-index:2147483647;" +
      "background:#ff6a00;color:#fff;font-size:13px;font-weight:800;" +
      "padding:5px 12px;border-radius:8px;border:2px solid #fff;" +
      "letter-spacing:0.5px;line-height:1.2;box-shadow:0 3px 10px rgba(0,0,0,0.45);" +
      "pointer-events:none;user-select:none;";
    badge.textContent = "H1 #" + (index + 1);
    el.appendChild(badge);
  });
  h1MarkActive = h1s.length > 0;
  return h1s.length;
}


function checkWpPage(mark = false) {
  const noIndex = getNoIndexStatus();
  const hiddenElements = findHiddenSectionEls();
  const hiddenSections = getHiddenSections(hiddenElements);
  const h1 = getH1Info();
  if (mark) {
    markHiddenSections(hiddenElements);
    markH1Tags();
  }
  return {
    ok: true,
    noIndex,
    hiddenSections,
    marked: hiddenMarkActive ? hiddenElements.length : 0,
    hiddenMarked: hiddenMarkActive,
    h1,
    h1Marked: h1MarkActive,
  };
}

// ===== 验证码识别：供 popup 调用的取图 / 回填接口 =====
function waitForCaptchaImage(img, timeout = 8000) {
  if (img.complete && img.naturalWidth) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      img.removeEventListener("load", done);
      img.removeEventListener("error", fail);
      clearTimeout(timer);
    };
    const done = () => {
      cleanup();
      resolve();
    };
    const fail = () => {
      cleanup();
      reject(new Error("验证码图片加载失败"));
    };
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("验证码图片加载超时"));
    }, timeout);
    img.addEventListener("load", done, { once: true });
    img.addEventListener("error", fail, { once: true });
  });
}

async function grabCaptchaImage() {
  const button = document.querySelector(".captcha-button");
  if (!button) return { ok: false, error: "当前页面未找到 .captcha-button" };
  const img = button.tagName === "IMG" ? button : button.querySelector("img");
  if (!img) return { ok: false, error: ".captcha-button 内未找到 img" };

  await waitForCaptchaImage(img);
  const src = img.currentSrc || img.src || "";
  // data URI 直接回传，避免重新请求导致验证码被刷新
  if (src.startsWith("data:")) {
    return { ok: true, dataUrl: src, width: img.naturalWidth, height: img.naturalHeight };
  }
  // 用 canvas 重绘已显示的图片：不重新请求 URL（很多验证码 URL 每请求一次就换图）
  try {
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth || 120;
    canvas.height = img.naturalHeight || 40;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("无法创建画布");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return {
      ok: true,
      dataUrl: canvas.toDataURL("image/png"),
      width: canvas.width,
      height: canvas.height,
    };
  } catch (err) {
    return {
      ok: false,
      error: "验证码图片跨域，无法读取像素：" + String(err?.message || err),
    };
  }
}

function fillCaptchaInput(code) {
  const field = document.querySelector(".captcha-field");
  if (!field) return { ok: false, error: "当前页面未找到 .captcha-field" };
  const input = field.matches("input, textarea")
    ? field
    : field.querySelector("input, textarea");
  if (!input) return { ok: false, error: ".captcha-field 下未找到 input" };
  if (input.disabled || input.readOnly) {
    return { ok: false, error: "验证码输入框不可编辑" };
  }
  // 用原生 setter 写入，兼容 Vue v-model / React 受控组件
  const proto =
    input.tagName === "TEXTAREA"
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
  if (setter) setter.call(input, code);
  else input.value = code;
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
  return { ok: true, filled: true, value: input.value };
}

// ===== SVG 点阵验证码解析（内联，content script 必须自包含） =====
// 与 src/utils/captchaDecode.js 保持同步：每个数字由 3 列 × 5 行小方块组成，
// transform 里的 rotate 只是视觉变换，不改变 path 坐标，所以解析源码能精确还原。
const CAPTCHA_TEMPLATES = [
  "111101101101111", // 0
  "010110010010111", // 1
  "111001111100111", // 2
  "111001111001111", // 3
  "101101111001001", // 4
  "111100111001111", // 5
  "111100111101111", // 6
  "111001001001001", // 7
  "111101111101111", // 8
  "111101111001111", // 9
];

function captchaParseGrid(d) {
  const cells = [];
  const re = /[Mm]\s*(-?\d+(?:\.\d+)?)[ ,]+(-?\d+(?:\.\d+)?)[hH]5[vV]5[hH]-?5[zZ]?/g;
  let m;
  while ((m = re.exec(d))) cells.push({ x: parseFloat(m[1]), y: parseFloat(m[2]) });
  if (!cells.length) return null;
  const xs = [...new Set(cells.map((c) => c.x))].sort((a, b) => a - b);
  const ys = [...new Set(cells.map((c) => c.y))].sort((a, b) => a - b);
  return {
    grid: ys.map((y) =>
      xs.map((x) => (cells.some((c) => c.x === x && c.y === y) ? "1" : "0")).join("")
    ),
    cols: xs.length,
    rows: ys.length,
  };
}

function captchaNormalizeGrid(grid, cols, rows) {
  if (cols === 3 && rows === 5) return grid;
  const out = [];
  for (let r = 0; r < 5; r++) {
    let line = "";
    const sy = Math.min(rows - 1, Math.floor((r * rows) / 5));
    for (let c = 0; c < 3; c++) {
      const sx = Math.min(cols - 1, Math.floor((c * cols) / 3));
      line += grid[sy]?.[sx] === "1" ? "1" : "0";
    }
    out.push(line);
  }
  return out;
}

function captchaMatchDigit(grid) {
  const flat = grid.join("");
  let best = 0;
  let bestDist = Infinity;
  for (let d = 0; d < 10; d++) {
    let dist = 0;
    for (let i = 0; i < 15; i++) if ((flat[i] || "0") !== CAPTCHA_TEMPLATES[d][i]) dist++;
    if (dist < bestDist) {
      bestDist = dist;
      best = d;
    }
  }
  return bestDist <= 4 ? String(best) : "?";
}

function decodeSvgCaptchaInline(dataUrl) {
  if (!dataUrl || typeof dataUrl !== "string") return null;
  let svg = null;
  const prefix = "data:image/svg+xml;base64,";
  if (dataUrl.startsWith(prefix)) {
    try { svg = atob(dataUrl.slice(prefix.length)); } catch { return null; }
  } else if (/^data:image\/svg\+xml/.test(dataUrl)) {
    const comma = dataUrl.indexOf(",");
    if (comma < 0) return null;
    try { svg = decodeURIComponent(dataUrl.slice(comma + 1)); } catch { return null; }
  } else {
    return null;
  }
  const paths = [];
  const re = /<path\b([^>]*)>/gi;
  let m;
  while ((m = re.exec(svg))) {
    const attrs = m[1];
    const d = /\bd\s*=\s*"([^"]*)"/i.exec(attrs)?.[1];
    if (!d) continue;
    const tr = /\btransform\s*=\s*"([^"]*)"/i.exec(attrs)?.[1] || "";
    const tx = /translate\(\s*(-?[\d.]+)/.exec(tr);
    paths.push({ d, x: tx ? parseFloat(tx[1]) : 0 });
  }
  if (!paths.length) return null;
  paths.sort((a, b) => a.x - b.x);
  const digits = [];
  for (const p of paths) {
    const parsed = captchaParseGrid(p.d);
    if (!parsed) return null;
    digits.push(captchaMatchDigit(captchaNormalizeGrid(parsed.grid, parsed.cols, parsed.rows)));
  }
  return digits.includes("?") ? null : digits.join("");
}

// ===== 验证码自动识别填充（页面内常驻，无需打开插件） =====
const CAPTCHA_AUTO_KEY = "captchaAutoFill";
let captchaAutoEnabled = true; // 默认开启
let captchaObserver = null;
let captchaPollTimer = null;

// 穿透 open shadow DOM 查找元素
function captchaDeepQuery(selector, root = document) {
  const hit = root.querySelector(selector);
  if (hit) return hit;
  for (const el of root.querySelectorAll("*")) {
    if (el.shadowRoot) {
      const inner = captchaDeepQuery(selector, el.shadowRoot);
      if (inner) return inner;
    }
  }
  return null;
}

function captchaReadState() {
  const button = captchaDeepQuery(".captcha-button");
  if (!button) return null;
  const img = button.tagName === "IMG" ? button : captchaDeepQuery("img", button);
  if (!img) return null;
  const src = img.currentSrc || img.src || "";
  // 只对 SVG data URI 做精确解析；栅格图交给 popup 的 OCR 兜底
  if (!/^data:image\/svg\+xml/.test(src)) return null;
  return { code: decodeSvgCaptchaInline(src), field: captchaDeepQuery(".captcha-field") };
}

function autoFillCaptcha() {
  if (!captchaAutoEnabled) return false;
  const state = captchaReadState();
  if (!state?.code || !state.field) return false;
  const field = state.field;
  const input = field.matches("input, textarea")
    ? field
    : captchaDeepQuery("input, textarea", field);
  if (!input || input.disabled || input.readOnly) return false;
  // 以 input 当前值为准，而不是记录上次填过的 src/code：
  // 页面组件可能在填充后重置 input，此时必须重新填入。
  if (input.value === state.code) return true;
  const result = fillCaptchaInput(state.code);
  if (result.ok) {
    // 竞态兜底：页面 JS 常在稍后完成初始化并清空 input，
    // 延迟复核时重新解析当前验证码，避免填入过期的值。
    [150, 600, 1600].forEach((delay) => {
      setTimeout(() => {
        if (!captchaAutoEnabled) return;
        const later = captchaReadState();
        if (!later?.code || !later.field) return;
        const laterInput = later.field.matches("input, textarea")
          ? later.field
          : captchaDeepQuery("input, textarea", later.field);
        if (
          laterInput &&
          !laterInput.disabled &&
          !laterInput.readOnly &&
          laterInput.value !== later.code
        ) {
          fillCaptchaInput(later.code);
        }
      }, delay);
    });
  }
  return result.ok;
}

function startCaptchaAutoFill() {
  if (captchaObserver || !captchaAutoEnabled) return;
  autoFillCaptcha();
  captchaObserver = new MutationObserver(() => { autoFillCaptcha(); });
  captchaObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["src", "class", "value"],
  });
  // 轮询兜底：应对不触发 DOM 变更的验证码刷新
  captchaPollTimer = setInterval(autoFillCaptcha, 600);
}

function stopCaptchaAutoFill() {
  if (captchaObserver) {
    captchaObserver.disconnect();
    captchaObserver = null;
  }
  if (captchaPollTimer) {
    clearInterval(captchaPollTimer);
    captchaPollTimer = null;
  }
}

// 默认先启动，避免 storage 异步读取期间漏掉早期验证码；用户关闭后再停止
startCaptchaAutoFill();
chrome.storage.local.get([CAPTCHA_AUTO_KEY], (result) => {
  captchaAutoEnabled = result[CAPTCHA_AUTO_KEY] !== false;
  if (captchaAutoEnabled) startCaptchaAutoFill();
  else stopCaptchaAutoFill();
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === "popupOpened") {
    const shouldFill = message.data?.isChecked === true;
    if (shouldFill) {
      const result = fillElementorForms();
      sendResponse({ ok: true, filled: result.filled, error: result.error });
    } else {
      sendResponse({ ok: true, filled: 0 });
    }
    return false;
  }
  if (message.action === "collectImages") {
    collectImageSizes()
      .then((result) => {
        sendResponse({ ok: true, ...result });
      })
      .catch((err) => {
        console.error("collectImages 采集失败", err);
        sendResponse({ ok: false, error: String(err?.message || err) });
      });
    return true;
  }
  if (message.action === "checkWp") {
    sendResponse(checkWpPage(message.mark === true));
    return false;
  }
  if (message.action === "markHiddenSections") {
    const hidden = findHiddenSectionEls();
    sendResponse({
      ok: true,
      marked: markHiddenSections(hidden),
      hiddenMarked: hiddenMarkActive,
    });
    return false;
  }
  if (message.action === "markH1") {
    const count = markH1Tags();
    sendResponse({ ok: true, h1Marked: count > 0, h1: getH1Info() });
    return false;
  }
  if (message.action === "checkH1") {
    const h1 = getH1Info();
    let h1Marked = h1MarkActive;
    if (message.mark === true) h1Marked = markH1Tags() > 0;
    sendResponse({ ok: true, h1, h1Marked });
    return false;
  }
  if (message.action === "getMarkStatus") {
    sendResponse({ ok: true, hiddenMarked: hiddenMarkActive, h1Marked: h1MarkActive });
    return false;
  }
  if (message.action === "clearHiddenMarks") {
    sendResponse({ ok: true, cleared: clearHiddenSectionMarks() });
    return false;
  }
  if (message.action === "clearH1Marks") {
    sendResponse({ ok: true, cleared: clearH1Marks() });
    return false;
  }
  if (message.action === "grabCaptcha") {
    grabCaptchaImage()
      .then((result) => sendResponse(result))
      .catch((err) => sendResponse({ ok: false, error: String(err?.message || err) }));
    return true;
  }
  if (message.action === "fillCaptcha") {
    try {
      sendResponse(fillCaptchaInput(String(message.code || "")));
    } catch (err) {
      sendResponse({ ok: false, error: String(err?.message || err) });
    }
    return false;
  }
  if (message.action === "judgePage") {
    let responded = false;
    let retryTimer = null;
    const handler = (event) => {
      if (event.source !== window || event.data?.type !== "FROM_PAGE_SHOPIFY_INFO") return;
      if (responded) return;
      responded = true;
      if (retryTimer) clearInterval(retryTimer);
      window.removeEventListener("message", handler);
      sendResponse(event.data.payload);
    };
    window.addEventListener("message", handler);
    const request = () => window.postMessage({ type: "REQUEST_SHOPIFY_INFO" }, "*");
    request();
    retryTimer = setInterval(() => {
      if (!responded) request();
    }, 400);
    setTimeout(() => {
      if (responded) return;
      responded = true;
      if (retryTimer) clearInterval(retryTimer);
      window.removeEventListener("message", handler);
      sendResponse({ isShopify: false, error: "未检测到 Shopify 或页面未响应，请刷新后重试" });
    }, 3000);
    return true;
  }
  return false;
});
