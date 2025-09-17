console.log("@@@@@content.js is injected.");

const script = document.createElement("script");
script.src = chrome.runtime.getURL("assets/inject.js");
(document.head || document.documentElement).appendChild(script);

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === "popupOpened") {
    try {
      document
      .querySelectorAll("form.elementor-form .elementor-field")
      .forEach((i) => {
        let obj = {
          text: `test: ${i.placeholder}`,
          tel: "15297614000",
          email: "test@ehaitech.com",
          textarea: "This is test message",
        };
        i.value = obj[i.type];
        if (i.name == "zendkee_captcha") {
          i.value = i
            .closest(".elementor-field-group")
            .querySelector(".captcha_code").textContent;
        }
      });
    } catch (error) {
      console.log('@@@ 表单填充异常', error);
    }
    
  } else if (message.action === "judgePage") {
    // sendResponse(sessionStorage.getItem("c-Shopify-info"));
  }
  return true;
});
