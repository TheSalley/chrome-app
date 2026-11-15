export const getStorage = async (key) => {
  try {
    const result = await chrome.storage.local.get([key]);
    return result[key] !== undefined ? result[key] : null;
  } catch (error) {
    console.error(`Failed to read storage key "${key}"`, error);
    return null;
  }
};

export const setStorage = async (key, value) => {
  try {
    await chrome.storage.local.set({ [key]: value });
    return true;
  } catch (error) {
    console.error(`Failed to write storage key "${key}"`, error);
    return false;
  }
};
