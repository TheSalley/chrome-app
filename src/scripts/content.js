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
    const realUrl = demoContainer?.getAttribute(
      "data-demo-store-iframe-url-value",
    );
    if (!realUrl) return false;
    const viewDemoButton = document.querySelector(
      '[data-demo-store-responder-target="viewDemoButton"]',
    );
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
      const inputs = form.querySelectorAll(
        "input:not([type=hidden]):not([type=submit]):not([type=button]), textarea",
      );
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
          el.value = el.placeholder
            ? `test: ${el.placeholder}`
            : defaultFormData.text;
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

// 页面加载后根据开关状态自动填充（多次尝试以兼容延迟渲染的表单）
[0, 800, 2000].forEach((delay) => {
  setTimeout(tryFillIfEnabled, delay);
});

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
    chrome.storage.local
      .set({ shopifyInfo: event.data.payload })
      .catch(() => {});
  }
});

chrome.runtime.onMessage.addListener(async (message, _sender, sendResponse) => {
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
  if (message.action === "fillForm") {
    const result = fillElementorForms();
    sendResponse({ ok: true, filled: result.filled, error: result.error });
    return false;
  }
  if (message.action === "judgePage") {
    window.postMessage({ type: "REQUEST_SHOPIFY_INFO" }, "*");
    let responded = false;
    const handler = (event) => {
      if (
        event.source !== window ||
        event.data?.type !== "FROM_PAGE_SHOPIFY_INFO"
      )
        return;
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
