chrome.runtime.onInstalled.addListener(() => {
    chrome.action.setBadgeText({
        test: "OFF"
    })
})