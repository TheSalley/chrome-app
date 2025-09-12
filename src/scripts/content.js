console.log("@@@@@content.js is injected.");

const script = document.createElement("script");
script.src = chrome.runtime.getURL("assets/inject.js");
(document.head || document.documentElement).appendChild(script);

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === "popupOpened") {
    // sendResponse(sessionStorage.getItem("c-Shopify-info"));
  } else if (message.action === "judgePage") {
    // sendResponse(sessionStorage.getItem("c-Shopify-info"));
  }
  return true;
});
