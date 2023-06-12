/* 匹配按钮 */
let match_btn = document.querySelector("#match_btn");
/* 打招呼按钮 */
let play_btn = document.querySelector("#play_btn");
/* 招呼信息 */
let str_ipt = document.querySelector("#send_word");

let count_ipt = document.querySelector("#send_count");

let wish_job = document.querySelector("#wish_job");

/* 日志容器  */
let log_box = document.querySelector(".log");

chrome.storage.local.get(["count", "str", "wish_job"], async (data) => {
  if (data) {
    document.querySelector("#send_word").innerHTML = data["str"]
      ? data["str"]
      : "";
    document.querySelector("#send_count").value = data["count"];

    document.querySelector("#wish_job").value = data["wish_job"] ?? "";
  }
});

/* 监听启动招呼指令 */
play_btn.addEventListener("click", async () => {
  const res = await chrome.storage.local.get("is_login");
  if (!res.is_login) {
    return alert("请先去登录");
  }
  let [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  chrome.storage.local.set({
    count: count_ipt.value,
    str: str_ipt.innerHTML,
  });

  chrome.scripting.executeScript({
    target: {
      tabId: tab.id,
    },
    function: run_script,
  });
});

async function run_script(count, str) {
  console.log("开始移动到最后");
  while (
    !(document.querySelector("[role='tfoot']").children[0].textContent ==
      "没有更多了" ||
    document
      .querySelector(".load-tips")
      .innerHTML.includes("出于平台安全性及稳定性考虑"))
  ) {
    await sleep(500);
    document
      .querySelector(".user-list")
      .scrollBy(
        0,
        document.querySelector(".geek-item-wrap").clientHeight * 100
      );
  }

  chrome.storage.local.get(["count", "str"], async (data) => {
    const { count, str } = data;

    let target_obj = null;
    let i = 1;

    while (i <= count) {
      target_obj = Array.from(
        document.querySelectorAll("[role=group] .geek-item")
      )[
        Array.from(document.querySelectorAll("[role=group] .geek-item"))
          .length - 1
      ];

      target_obj.style.background = "lightgreen";

      target_obj.click();
      await sleep(1000);

      let user_name = document.querySelectorAll(
        ".geek-item.selected .geek-name"
      )[0].innerHTML;

      if (document.querySelector("#boss-chat-editor-input")) {
        document.querySelector("#boss-chat-editor-input").innerHTML = str;
      }
      await sleep(1000);
      if (
        document.querySelector("#boss-chat-editor-input").nextElementSibling
      ) {
        document
          .querySelector("#boss-chat-editor-input")
          .nextElementSibling.children[0].click();
        console.log(`第${i} 个， 已发送，${user_name}`);
      }
      // 向扩展发送消息
      chrome.runtime.sendMessage({ data: `第${i} 个， 已发送，${user_name}` });

      i++;
      await sleep(1000);
    }
  });

  function sleep(t) {
    return new Promise((resolve) => {
      setTimeout(resolve, t);
    });
  }
}

match_btn.addEventListener("click", async () => {
  /* 先判断是否登录 */
  const res = await chrome.storage.local.get("is_login");
  if (!res.is_login) {
    return alert("请先去登录");
  }
  let [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  await chrome.storage.local.set({
    wish_job: wish_job.value,
  });

  chrome.scripting.executeScript({
    target: {
      tabId: tab.id,
    },
    function: run_match_script,
  });

  async function run_match_script() {
    console.log("开始移动到最后");
    if (document.querySelector("body").children[0].nodeName === "DIV") {
      document.querySelector("body").children[0].remove();
    }
    const data = await chrome.storage.local.get("wish_job");
    while (
      !(
        document
          .querySelector("iframe")
          .contentWindow.document.querySelector(".nomore") ||
        document
          .querySelector("iframe")
          .contentWindow.document.querySelector(".no-data-refresh")
      )
    ) {
      await sleep(500);
      document.querySelector("iframe").contentWindow.scrollBy(0, 3000);
    }

    if (document.querySelector("[type='checkbox']").checked) {
      document
        .querySelector("iframe")
        .contentWindow.document.querySelectorAll(".active-text")
        .forEach((item) => {
          item.parentElement.parentElement.parentElement.parentElement.style.display =
            "none";
        });
    }

    document
      .querySelector("iframe")
      .contentWindow.document.querySelectorAll(".candidate-card-wrap .col-2")
      .forEach((item) => {
        console.log(item.children[2].textContent);
        if (!item.children[2].textContent.includes(data.wish_job)) {
          item.parentElement.parentElement.parentElement.style.display = "none";
        }
      });
    function sleep(t) {
      return new Promise((resolve) => {
        setTimeout(resolve, t);
      });
    }
  }
});

// 监听来自内容脚本的消息
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.data) {
    console.log("Message from content script:", message.data);
  }
});

// 在弹出窗口中显示接收到的数据
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.data) {
    log_box.innerHTML = `<p>${message.data}</p>`;
  }
});
