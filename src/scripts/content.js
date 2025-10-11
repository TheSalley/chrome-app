console.log("@@@@@content.js is injected.");

const script = document.createElement("script");
script.src = chrome.runtime.getURL("assets/inject.js");
(document.head || document.documentElement).appendChild(script);

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === "popupOpened") {
    // console.log(message.data.isChecked);
    // if (message.data.isChecked) {
    //   try {
    //     document
    //       .querySelectorAll("form.elementor-form .elementor-field")
    //       .forEach((i) => {
    //         let obj = {
    //           text: `test: ${i.placeholder}`,
    //           tel: "15297614000",
    //           email: "test@ehaitech.com",
    //           textarea: "This is test message",
    //         };
    //         i.value = obj[i.type];
    //         if (i.name == "zendkee_captcha") {
    //           i.value = i
    //             .closest(".elementor-field-group")
    //             .querySelector(".captcha_code").textContent;
    //         }
    //       });
    //   } catch (error) {
    //     console.log("@@@ 表单填充异常", error);
    //   }
    // } else {
    //   console.log("quxiao");
    //   document
    //     .querySelectorAll("form.elementor-form .elementor-field")
    //     .forEach((i) => {
    //       i.value = "";
    //       // fields.forEach((i) => {
    //       //   i.value = "";
    //     });
    // }

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

(function () {
  try {
    function isWordPress() {
      // 1) meta generator
      const meta = document.querySelector('meta[name="generator"]');
      if (meta && /wordpress/i.test(meta.content)) return true;

      // 2) 脚本 / 链接中有 wp-content / wp-includes
      const allSrcs = Array.from(
        document.querySelectorAll("script[src], link[href]")
      )
        .map((n) => n.src || n.href)
        .filter(Boolean)
        .join(" ");
      if (/wp-content|wp-includes|\/wp-admin\//i.test(allSrcs)) return true;

      // 3) 全局 window.wp 或 wpApiSettings 等（某些 theme/plugin 会挂载）
      if (window.wp || window.wpApiSettings || window.ajaxurl) return true;

      // 4) body 或 html class 包含常见 WP 标识
      const cls =
        document.documentElement.className +
        " " +
        ((document.body && document.body.className) || "");
      if (/wp-|wordpress|wp-admin/i.test(cls)) return true;

      // 否则认为不是 WordPress
      return false;
    }

    // 2. 决定是否注入/运行你的主逻辑
    if (!isWordPress()) {
      // 非 WP 页面，不执行任何业务代码（尽量减少误伤）
      return;
    }

    // 3. （可选）检查扩展设置：若用户/你曾在 storage 里关闭自动注入则跳过
    chrome.storage?.local?.get?.(["switchStatus"], (res = {}) => {
      console.log('5555', res)
      if (res.switchStatus) {
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
      }
    });
  } catch (err) {
    console.error("content-check-run error", err);
  }
})();
