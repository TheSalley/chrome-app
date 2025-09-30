console.log("@@@@@content.js is injected.");

const script = document.createElement("script");
script.src = chrome.runtime.getURL("assets/inject.js");
(document.head || document.documentElement).appendChild(script);

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === "popupOpened") {
    console.log(message.data.isChecked);
    if (message.data.isChecked) {
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
        console.log("@@@ 表单填充异常", error);
      }
    } else {
      console.log("quxiao");
      document
        .querySelectorAll("form.elementor-form .elementor-field")
        .forEach((i) => {
          i.value = "";
          // fields.forEach((i) => {
          //   i.value = "";
        });
    }

    // else if (message.action === "judgePage") {
    //   // sendResponse(sessionStorage.getItem("c-Shopify-info"));
    // }
    return true;
  }

  if (message.action === "checkButtons") {
    // 核心检测逻辑
    function checkButtons() {
      const buttons = Array.from(
        document.querySelectorAll("a.elementor-button")
      );
      let disabledCount = 0;

      buttons.forEach((btn) => {
        const rect = btn.getBoundingClientRect();
        if (!btn.offsetParent) return;
        // 保存原始文本（只保存一次）
        if (!btn.dataset.originText) {
          btn.dataset.originText = btn.innerText.trim();
        }

        // 每次检测前恢复状态
        btn.style.backgroundColor = "";
        btn.innerText = btn.dataset.originText;

        // 判断按钮是否失效
        const href = btn.getAttribute("href");
        if ((!href || href === "#") && !btn.onclick) {
          disabledCount++;
          btn.style.backgroundColor = "#f44336";
          btn.innerText = "不生效";
        }
      });

      return disabledCount;
    }

    // 延迟/重试检测（页面异步渲染用）
    function tryCheckButtons(retries = 5, interval = 300) {
      let attempt = 0;

      function attemptCheck() {
        const disabledCount = checkButtons();
        // 如果检测到失效按钮，或者达到最大重试次数就发送结果
        if (disabledCount || attempt >= retries) {
          sendResponse({ ok: true, disabledCount });
        } else {
          attempt++;
          setTimeout(attemptCheck, interval);
        }
      }

      attemptCheck();
    }

    // 调用
    tryCheckButtons();

    // 表示异步响应
    return true;
  }
});
