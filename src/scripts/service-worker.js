// 接收按钮消息
chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
  if (msg.action !== "captureFullPage") {
    return;
  }

  try {
    // 获取当前标签
    const [tab] = await chrome.tabs.query({ 
      active: true, 
      currentWindow: true 
    });

    if (!tab?.id) {
      console.error("无法获取标签页");
      sendResponse({ success: false, error: "无法获取标签页" });
      return;
    }

    const target = { tabId: tab.id };

    // 附加调试器
    await chrome.debugger.attach(target, "1.3");

    // 启用 Page domain
    await chrome.debugger.sendCommand(target, "Page.enable");

    // 等待页面完全加载和渲染
    await chrome.debugger.sendCommand(target, "Page.loadEventFired");
    
    // 额外等待一下确保所有资源加载完成
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 获取页面的完整尺寸
    const metrics = await chrome.debugger.sendCommand(target, "Page.getLayoutMetrics");
    const width = metrics.contentSize.width;
    const height = metrics.contentSize.height;

    // 设置视口为完整页面尺寸
    await chrome.debugger.sendCommand(target, "Emulation.setDeviceMetricsOverride", {
      width: Math.ceil(width),
      height: Math.ceil(height),
      deviceScaleFactor: 1,
      mobile: false,
    });

    // 捕获完整页面截图（包括视口外的内容）
    const result = await chrome.debugger.sendCommand(
      target,
      "Page.captureScreenshot",
      {
        format: "png",
        captureBeyondViewport: true,  // 捕获超出视口的部分
        fromSurface: true,            // 从表面渲染捕获
      },
    );

    // 恢复原始视口尺寸
    await chrome.debugger.sendCommand(target, "Emulation.setDeviceMetricsOverride", {
      width: 0,
      height: 0,
      deviceScaleFactor: 0,
      mobile: false,
    });

    // 分离调试器
    await chrome.debugger.detach(target);

    // 发送截图数据到 content script
    const image = "data:image/png;base64," + result.data;
    
    try {
      // 尝试发送到 content script
      await chrome.tabs.sendMessage(tab.id, {
        action: "download",
        data: image,
      });
    } catch (sendError) {
      console.warn("无法发送到 content script，使用 downloads API", sendError);
      // 备用方案：直接使用 downloads API
      try {
        await chrome.downloads.download({
          url: image,
          filename: `screenshot_${Date.now()}.png`,
          saveAs: false
        });
      } catch (downloadErr) {
        console.error("downloads API 失败", downloadErr);
        // 如果 downloads API 也失败，创建一个临时标签页来触发下载
        const tempUrl = URL.createObjectURL(await (await fetch(image)).blob());
        await chrome.tabs.create({ 
          url: `data:text/html,<a href="${tempUrl}" download="screenshot.png" id="dl">下载</a><script>document.getElementById('dl').click();setTimeout(()=>window.close(),2000);</script>`,
          active: true 
        });
      }
    }

    sendResponse({ success: true });
  } catch (e) {
    console.error("截图失败", e);
    // 确保出错时也分离调试器
    try {
      const [tab] = await chrome.tabs.query({ 
        active: true, 
        currentWindow: true 
      });
      if (tab?.id) {
        await chrome.debugger.detach({ tabId: tab.id });
      }
    } catch (detachError) {
      console.error("分离调试器失败", detachError);
    }
    sendResponse({ success: false, error: e.message });
  }
});
