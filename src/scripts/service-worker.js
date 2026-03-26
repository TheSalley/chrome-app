// 接收按钮消息
chrome.runtime.onMessage.addListener(async (msg) => {
  if (msg.action !== "captureFullPage") return;

  // 获取当前标签
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const tabId = tab.id;

  try {
    // 开启调试协议（核心！）
    await chrome.debugger.attach({ tabId }, "1.3");
    await chrome.debugger.sendCommand({ tabId }, "Page.enable");

    // 截取全页！！！
    const { data } = await chrome.debugger.sendCommand(
      { tabId },
      "Page.captureScreenshot",
      {
        format: "png",
        captureBeyondViewport: true  // ✅ 关键：截取整个页面，不止可见区
      }
    );

    // 关闭调试
    await chrome.debugger.detach({ tabId });

    // 转成图片地址
    const dataUrl = `data:image/png;base64,${data}`;

    // 下载
    chrome.downloads.download({
      url: dataUrl,
      filename: `fullpage-${Date.now()}.png`
    });

  } catch (e) {
    console.error("截图失败", e);
    chrome.debugger.detach({ tabId }).catch(() => {});
  }
});