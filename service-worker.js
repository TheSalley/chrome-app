console.log("脚本加载中...");

// 监听插件启动事件和安装事件
chrome.runtime.onStartup.addListener(() => {
  console.log("扩展启动");
});
chrome.runtime.onInstalled.addListener(() => {
  console.log("扩展安装");
});

// 检查并清除过期的数据
async function clearStorageIfExpired() {
  const result = await chrome.storage.local.get("timestamp");
  let timestamp = result.timestamp;
  if (timestamp) {
    let oneDayInMilliseconds = 24 * 60 * 60 * 1000; // 一天的毫秒数
    let currentTime = Date.now();
    if (currentTime - timestamp >= oneDayInMilliseconds) {
      chrome.storage.local.clear(() => {
        console.log("清空存储");
      });
    } else {
      await chrome.storage.local.set({
        is_login: false,
      });
    }
  } else {
    await chrome.storage.local.set({
      is_login: false,
    });
  }
}

await chrome.scripting.insertCSS({
  target: { tabId: tab.id },
  files: ["css/match.css"],
});
