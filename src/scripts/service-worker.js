// 新标签页开关：开启时把新标签页导航到日历 Todo 页；关闭时恢复默认新标签页
const NEW_TAB_TODO_KEY = "newTabTodo";
const CALENDAR_URL = chrome.runtime.getURL("calendar.html");
const restoringTabs = new Set();

async function isNewTabTodoEnabled() {
  try {
    const result = await chrome.storage.local.get([NEW_TAB_TODO_KEY]);
    return result[NEW_TAB_TODO_KEY] === true;
  } catch (e) {
    console.error("读取新标签页设置失败", e);
    return false;
  }
}

function isNewTabUrl(url) {
  return /^(chrome|edge):\/\/(newtab|new-tab-page)(?:[/?#]|$)/i.test(url || "");
}

function isCalendarUrl(url) {
  return (url || "").startsWith(CALENDAR_URL);
}

// Chrome 不保证扩展可以导航到 chrome://newtab，失败时创建一个默认新标签页并关闭旧标签
async function restoreDefaultNewTab(tabId, active = false) {
  if (restoringTabs.has(tabId)) return;
  restoringTabs.add(tabId);
  try {
    try {
      await chrome.tabs.update(tabId, { url: "chrome://newtab/" });
      return;
    } catch (_) {
      // fall through
    }
    try {
      await chrome.tabs.create({ active });
    } catch (e) {
      console.error("创建默认新标签页失败", e);
      return;
    }
    try {
      await chrome.tabs.remove(tabId);
    } catch (e) {
      console.error("关闭日历标签页失败", e);
    }
  } finally {
    restoringTabs.delete(tabId);
  }
}

async function applyNewTabSetting(enabled) {
  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    if (!tab.id) continue;
    const url = tab.url || tab.pendingUrl || "";
    if (enabled && isNewTabUrl(url)) {
      try {
        await chrome.tabs.update(tab.id, { url: CALENDAR_URL });
      } catch (e) {
        console.error("打开日历 Todo 新标签页失败", e);
      }
    } else if (!enabled && isCalendarUrl(url)) {
      await restoreDefaultNewTab(tab.id, tab.active === true);
    }
  }
}

chrome.tabs.onCreated.addListener(async (tab) => {
  if (!tab.id) return;
  const url = tab.url || tab.pendingUrl || "";
  if (!isNewTabUrl(url)) return;
  if (await isNewTabTodoEnabled()) {
    try {
      await chrome.tabs.update(tab.id, { url: CALENDAR_URL });
    } catch (e) {
      console.error("打开日历 Todo 新标签页失败", e);
    }
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  const url = changeInfo.url || tab.url || "";
  if (!url) return;
  const enabled = await isNewTabTodoEnabled();
  if (isCalendarUrl(url)) {
    if (!enabled) await restoreDefaultNewTab(tabId, tab.active === true);
    return;
  }
  if (enabled && isNewTabUrl(url)) {
    try {
      await chrome.tabs.update(tabId, { url: CALENDAR_URL });
    } catch (e) {
      console.error("打开日历 Todo 新标签页失败", e);
    }
  }
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local" || !changes[NEW_TAB_TODO_KEY]) return;
  const enabled = changes[NEW_TAB_TODO_KEY].newValue === true;
  applyNewTabSetting(enabled).catch((e) => console.error("应用新标签页设置失败", e));
});

chrome.runtime.onStartup.addListener(() => {
  isNewTabTodoEnabled()
    .then(applyNewTabSetting)
    .catch((e) => console.error("恢复新标签页设置失败", e));
});

chrome.runtime.onInstalled.addListener(() => {
  isNewTabTodoEnabled()
    .then(applyNewTabSetting)
    .catch((e) => console.error("初始化新标签页设置失败", e));
});
