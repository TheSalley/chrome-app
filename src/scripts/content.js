console.log("@@@@@content.js is injected.");

// 非 Shopify 主题商店页面才注入 inject.js
if (location.hostname !== "themes.shopify.com") {
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("assets/inject.js");
  (document.head || document.documentElement).appendChild(script);
}

// 根据开关状态在页面加载时自动填充
function tryFillIfEnabled() {
  chrome.storage.local.get(["switchStatus"], (result) => {
    if (result.switchStatus === true) {
      fillElementorForms();
    }
  });
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

// 默认填充数据（可后续从 storage 读取）
const defaultFormData = {
  text: "test",
  tel: "15297614000",
  email: "test@ehaitech.com",
  textarea: "This is test message",
};

function fillElementorForms() {
  const forms = document.querySelectorAll("form.elementor-form");
  if (!forms.length) return { filled: 0, error: "未找到 Elementor 表单" };
  let filled = 0;
  try {
    forms.forEach((form) => {
      const inputs = form.querySelectorAll("input:not([type=hidden]):not([type=submit]):not([type=button]), textarea");
      inputs.forEach((el) => {
        if (el.name === "zendkee_captcha" || el.name === "anti_spam_captcha") {
          const group = el.closest(".elementor-field-group");
          const codeEl = group?.querySelector(".captcha_code");
          if (codeEl) {
            el.value = codeEl.textContent?.trim() || "";
            filled++;
          }
          return;
        }
        if (el.tagName === "TEXTAREA") {
          el.value = defaultFormData.textarea;
          filled++;
          return;
        }
        const type = (el.type || "text").toLowerCase();
        if (type === "email") {
          el.value = defaultFormData.email;
          filled++;
        } else if (type === "tel") {
          el.value = defaultFormData.tel;
          filled++;
        } else if (type === "text" || type === "search") {
          el.value = el.placeholder ? `test: ${el.placeholder}` : defaultFormData.text;
          filled++;
        }
      });
    });
    return { filled, error: null };
  } catch (err) {
    console.log("@@@ 表单填充异常", err);
    return { filled, error: String(err) };
  }
}

function website() {
  if (location.origin === "https://download.ehaitech.com") {
    if (document.querySelectorAll(".layui-form-item")[3].querySelector(".layui-input-inline").innerText.length > 0) {
      let code = document.querySelectorAll(".layui-form-item")[3].querySelector(".layui-input-inline").innerText;

      document.querySelectorAll(".layui-form-item")[4].querySelector("input").value = code;
      // document.querySelectorAll(".layui-form-item")[5].querySelector("button").click();
    }
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
function parseBackgroundUrls(bgValue) {
  const urls = [];
  const regex = /url\(\s*(?:"([^"]*)"|'([^']*)'|([^)'"\s]+))\s*\)/g;
  let match;
  while ((match = regex.exec(bgValue))) {
    const url = match[1] || match[2] || match[3];
    if (url && !isSvgImage(url)) urls.push(url);
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
  const seenUrls = new Set();

  const tryAdd = (el, urls) => {
    if (tasks.length >= MAX_IMAGES) return;
    // 同一元素自身与伪元素重复的 url 只算一次；不同元素可用同一背景图（各自保留 moduleId）
    for (const url of new Set(urls)) {
      if (tasks.length >= MAX_IMAGES) break;
      tasks.push({ el, url });
    }
  };

  // 递归遍历规则（处理 @media / @supports 嵌套）
  const walkRules = (rules) => {
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
        walkRules(nested);
        continue;
      }
      const bg = rule.style ? rule.style.backgroundImage : "";
      if (!bg || !bg.includes("url(")) continue;
      const urls = parseBackgroundUrls(bg);
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
      walkRules(sheet.cssRules);
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

// 统一构造图片条目（尺寸取整到 10px，状态判断用原始值）
function buildImageItem({ src, moduleId, alt, rect, naturalWidth, naturalHeight, type }) {
  const rawWidth = rect.width;
  const rawHeight = rect.height;
  const displayWidth = Math.max(1, Math.round(rawWidth / 10) * 10);
  const displayHeight = Math.max(1, Math.round(rawHeight / 10) * 10);

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
async function collectImageSizes() {
  const list = [];
  const addItem = (item) => {
    if (list.length < MAX_IMAGES) list.push(item);
  };

  // 1) <img> 标签
  const images = Array.from(document.images).filter(
    (img) => !isSvgImage(img.currentSrc || img.src || "")
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

  // 并行加载所有不重复背景图的原始尺寸
  const sizeCache = new Map();
  await Promise.all(
    Array.from(seenUrls).map(async (url) => {
      sizeCache.set(url, await loadNaturalSize(url));
    })
  );

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

  return { total: images.length + bgTasks.length, list };
}

// 页面加载后根据开关状态自动填充（多次尝试以兼容延迟渲染的表单）
[0, 800, 2000].forEach((delay) => setTimeout(tryFillIfEnabled, delay));
setTimeout(website, 2000);

// 监听页面加载，若在 Shopify 主题商店则注入按钮
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupShopifyThemeButton);
} else {
  setupShopifyThemeButton();
}

// 监听开关变化：在 popup 中开启时，当前页也会立刻填充
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && changes.switchStatus?.newValue === true) {
    tryFillIfEnabled();
  }
});

// 接收来自 inject.js（页面上下文）的 Shopify 检测结果
window.addEventListener("message", (event) => {
  if (event.source !== window) return;
  if (event.data?.type === "FROM_PAGE_SHOPIFY_INFO") {
    chrome.storage.local.set({ shopifyInfo: event.data.payload }).catch(() => {});
  }
});

// 检查页面 no-index 状态
function getNoIndexStatus() {
  const meta = document.querySelector('meta[name="robots"]');
  const content = (meta?.content || "").toLowerCase();
  const noindex = content.includes("noindex");
  return {
    noindex,
    metaContent: meta ? meta.content : "",
    hasMeta: !!meta,
  };
}

// 返回隐藏元素的标识描述：tag + #id + 相关 class
function getHiddenSections() {
  return findHiddenSectionEls().map((el) => {
    const parts = [el.tagName.toLowerCase()];
    const id = el.getAttribute("id");
    if (id) parts.push("#" + id);
    const cls = (el.className && typeof el.className === "string") ? el.className : "";
    const meaningful = cls.split(/\s+/).filter((c) => c && !c.startsWith("elementor-hidden-"));
    if (meaningful.length) parts.push("." + meaningful.slice(0, 3).join("."));
    return parts.join("");
  });
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
    const orig = overlay.dataset.origStyle ? JSON.parse(overlay.dataset.origStyle) : {};
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
    document.querySelectorAll('*')
  ).filter((el) => {
    const cls = (el.className && typeof el.className === "string") ? el.className : "";
    return (
      cls.includes("elementor-hidden-desktop") &&
      cls.includes("elementor-hidden-mobile")
    );
  });
}

// 强制显示隐藏板块，并添加黑色蒙层
function markHiddenSections() {
  clearHiddenSectionMarks();
  const hidden = findHiddenSectionEls();
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
      const text = (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 80);
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
    const badge = document.createElement("div");
    badge.className = "wp-tools-h1-badge";
    badge.dataset.orig = JSON.stringify({
      position: el.style.position,
      outline: el.style.outline,
      outlineOffset: el.style.outlineOffset,
    });
    if (!el.style.position || el.style.position === "static") {
      el.style.position = "relative";
    }
    el.style.setProperty("outline", "3px dashed #ff7a00", "important");
    el.style.setProperty("outline-offset", "3px", "important");

    badge.style.cssText =
      "position:absolute;top:4px;right:4px;z-index:2147483647;" +
      "background:#ff6a00;color:#fff;font-size:13px;font-weight:800;" +
      "padding:5px 12px;border-radius:8px;border:2px solid #fff;" +
      "letter-spacing:0.5px;line-height:1.2;box-shadow:0 3px 10px rgba(0,0,0,0.45);" +
      "pointer-events:none;";
    badge.textContent = "H1 #" + (index + 1);
    el.appendChild(badge);
  });
  h1MarkActive = h1s.length > 0;
  return h1s.length;
}


function checkWpPage(mark = true) {
  let marked = 0;
  let h1Marked = 0;
  if (mark) {
    marked = markHiddenSections();
    h1Marked = markH1Tags();
  }
  return {
    ok: true,
    noIndex: getNoIndexStatus(),
    hiddenSections: getHiddenSections(),
    marked,
    h1: getH1Info(),
    h1Marked,
  };
}

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
    sendResponse(checkWpPage(message.mark !== false));
    return false;
  }
  if (message.action === "checkH1") {
    sendResponse({ ok: true, h1: getH1Info(), h1Marked: markH1Tags() });
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
  if (message.action === "judgePage") {
    window.postMessage({ type: "REQUEST_SHOPIFY_INFO" }, "*");
    let responded = false;
    const handler = (event) => {
      if (event.source !== window || event.data?.type !== "FROM_PAGE_SHOPIFY_INFO") return;
      if (responded) return;
      responded = true;
      window.removeEventListener("message", handler);
      const payload = event.data.payload;
      chrome.storage.local.set({ shopifyInfo: payload }).catch(() => {});
      sendResponse(payload);
    };
    window.addEventListener("message", handler);
    setTimeout(() => {
      if (responded) return;
      responded = true;
      window.removeEventListener("message", handler);
      chrome.storage.local.get(["shopifyInfo"], (result) => {
        sendResponse(result.shopifyInfo ?? null);
      });
    }, 2500);
    return true;
  }
  return false;
});
