export const getStorage = async (key) => {
  try {
    const result = await chrome.storage.local.get([key]);
    return result[key] !== undefined ? result[key] : null;
  } catch (error) {
    console.log(`@@@@@ Failed to get ${[key]}:`, error);
  }
};

export const setStorage = async (key, value) => {
  try {
    await chrome.storage.local.set({ [key]: value });
  } catch (error) {
    console.log("@@@@@ Failed to change language:", error);
  }
};
