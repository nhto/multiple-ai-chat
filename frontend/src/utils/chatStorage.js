/**
 * Client-side persistence for chat state using IndexedDB.
 * IndexedDB is used instead of LocalStorage to handle larger data (base64 images).
 */

const DB_NAME = 'multiple-ai-chat-db';
const DB_VERSION = 1;
const STORE_NAME = 'chat-state';
const KEY = 'current';

/**
 * Open IndexedDB connection
 * @returns {Promise<IDBDatabase>}
 */
function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not available'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

/**
 * Load persisted chat state from IndexedDB
 * @param {string[]} validModelIds - List of valid model IDs (to filter out removed models)
 * @returns {Promise<{ messages: Array, modelCount: number, selectedModelIds: string[] } | null>}
 */
export async function loadChatState(validModelIds = []) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(KEY);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        db.close();
        const data = request.result;
        if (!data || !data.state) {
          resolve(null);
          return;
        }
        const { messages = [], modelCount = 3, selectedModelIds = [] } = data.state;
        // Validate selectedModelIds against available models
        const filteredModelIds = validModelIds.length > 0
          ? selectedModelIds.filter((id) => validModelIds.includes(id))
          : selectedModelIds;
        resolve({
          messages: Array.isArray(messages) ? messages : [],
          modelCount: typeof modelCount === 'number' && modelCount >= 2 && modelCount <= 3 ? modelCount : 3,
          selectedModelIds: filteredModelIds.length >= 2 ? filteredModelIds : validModelIds.slice(0, modelCount)
        });
      };
    });
  } catch (err) {
    console.warn('Failed to load chat state from IndexedDB:', err);
    return null;
  }
}

/**
 * Save chat state to IndexedDB (debounced externally if needed)
 * @param {{ messages: Array, modelCount: number, selectedModelIds: string[] }} state
 * @returns {Promise<void>}
 */
export async function saveChatState({ messages = [], modelCount = 3, selectedModelIds = [] }) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put({
        id: KEY,
        state: {
          messages: Array.isArray(messages) ? messages : [],
          modelCount,
          selectedModelIds,
          updatedAt: new Date().toISOString()
        }
      });
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Failed to save chat state to IndexedDB:', err);
  }
}

/**
 * Clear persisted chat state from IndexedDB
 * @returns {Promise<void>}
 */
export async function clearChatState() {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(KEY);
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Failed to clear chat state from IndexedDB:', err);
  }
}
