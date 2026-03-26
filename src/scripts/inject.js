// inject.js - 运行在页面上下文，可访问 window.Shopify
(function () {
  let attempts = 0;
  const maxAttempts = 15;
  const interval = 500;

  function collectShopifyInfo() {
    if (!window.Shopify) return null;
    let meta = window.meta || window.ShopifyAnalytics?.meta || {};
    if (window.meta?.product && typeof location !== "undefined") {
      const handle = location.pathname.split("/").filter(Boolean).pop() || "";
      meta = { ...window.meta, handle };
    }
    return {
      isShopify: true,
      shop: window.Shopify.shop,
      meta,
      theme: window.Shopify.theme || null,
    };
  }

  function sendToContentScript(payload) {
    window.postMessage({ type: "FROM_PAGE_SHOPIFY_INFO", payload }, "*");
  }

  const checkShopify = setInterval(() => {
    attempts++;
    const info = collectShopifyInfo();
    if (info) {
      sendToContentScript(info);
      clearInterval(checkShopify);
    } else if (attempts >= maxAttempts) {
      sendToContentScript({ isShopify: false, error: "未检测到 Shopify 或 meta" });
      clearInterval(checkShopify);
    }
  }, interval);

  // 供 content 主动请求时再检测一次（如 popup 打开时）
  window.addEventListener("message", function (event) {
    if (event.source !== window) return;
    if (event.data?.type === "REQUEST_SHOPIFY_INFO") {
      const info = collectShopifyInfo();
      sendToContentScript(info || { isShopify: false, error: "未检测到 Shopify" });
    }
  });
})();
