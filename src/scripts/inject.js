// inject.js - 运行在页面上下文，可访问 window.Shopify
// 只在 content script 主动请求时检测，避免每个页面启动定时轮询和写全局存储。
(function () {
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

  window.addEventListener("message", function (event) {
    if (event.source !== window) return;
    if (event.data?.type !== "REQUEST_SHOPIFY_INFO") return;
    const info = collectShopifyInfo();
    sendToContentScript(info || { isShopify: false, error: "未检测到 Shopify" });
  });
})();
