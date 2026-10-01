/**
 * HIDDEN CATS - Storage Manager
 * Handles local storage persistence with fallback in-memory store
 */

const StorageManager = (() => {
  const PREFIX = 'hiddencats_';
  let memoryStore = {};

  const isLocalStorageAvailable = () => {
    try {
      const testKey = '__test__';
      window.localStorage.setItem(testKey, testKey);
      window.localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  };

  const useLS = isLocalStorageAvailable();

  const get = (key, defaultValue = null) => {
    try {
      if (useLS) {
        const item = window.localStorage.getItem(PREFIX + key);
        return item ? JSON.parse(item) : defaultValue;
      }
      return memoryStore[PREFIX + key] !== undefined ? memoryStore[PREFIX + key] : defaultValue;
    } catch (err) {
      console.warn('Storage read error for key:', key, err);
      return defaultValue;
    }
  };

  const set = (key, value) => {
    try {
      if (useLS) {
        window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
      } else {
        memoryStore[PREFIX + key] = value;
      }
      return true;
    } catch (err) {
      console.warn('Storage write error for key:', key, err);
      return false;
    }
  };

  const remove = (key) => {
    try {
      if (useLS) {
        window.localStorage.removeItem(PREFIX + key);
      } else {
        delete memoryStore[PREFIX + key];
      }
    } catch (err) {
      console.warn('Storage remove error:', err);
    }
  };

  return { get, set, remove };
})();
