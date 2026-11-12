// 新标签页开关：开启时把新标签页导航到日历 Todo 页；关闭/未设置时保持浏览器默认新标签页
const NEW_TAB_TODO_KEY = "newTabTodo";
const CALENDAR_URL = chrome.runtime.getURL("calendar.html");

async function isNewTabTodoEnabled(){
  try{
    const result = await chrome.storage.local.get([NEW_TAB_TODO_KEY]);
    return result[NEW_TAB_TODO_KEY] === true;
  }catch(e){
    return false;
  }
}

function isNewTabPage(tab){
  const url = tab.url || tab.pendingUrl || "";
  return (
    !url ||
    url === "about:blank" ||
    url.startsWith("chrome://newtab") ||
    url.startsWith("edge://newtab")
  );
}

chrome.tabs.onCreated.addListener(async (tab) => {
  if (!tab.id || !isNewTabPage(tab)) return;
  if (await isNewTabTodoEnabled()) {
    try {
      await chrome.tabs.update(tab.id, { url: CALENDAR_URL });
    } catch (e) {
      console.error("打开日历 Todo 新标签页失败", e);
    }
  }
});

// 兜底：开关关闭且标签页是扩展自己的日历页时，改回默认新标签页（无 override 后不会被重定向，不会循环）
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  const url = tab.url || changeInfo.url || "";
  if (url.startsWith(CALENDAR_URL) && !(await isNewTabTodoEnabled())) {
    try {
      await chrome.tabs.update(tabId, { url: "chrome://newtab/" });
    } catch (e) {
      console.error("还原默认新标签页失败", e);
    }
  }
});
