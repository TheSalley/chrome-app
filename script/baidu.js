let play_btn = document.querySelector("#play_btn");
let news = document.querySelectorAll(".hotsearch-item");
let log = document.querySelector(".log");

play_btn.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  chrome.scripting.executeScript({
    target: {
      tabId: tab.id,
    },
    function: run_script,
  });
});

async function run_script() {
  document.querySelectorAll(".hotsearch-item").forEach(async (item) => {
    const [tab] = await chrome.tabs.query({
      active: true,
      lastFocusedWindow: true,
    });
    await chrome.tabs.sendMessage(
      tab.id,
      item.children[0].children[3].innerHTML
    );
  });
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  console.log("2222:", message);
});
