/**
 * Utility functions for localStorage operations
 */

/**
 * Retrieves data from localStorage
 * @param {string} key - The key to retrieve data for
 * @returns {Object|null} - The retrieved data or null if not found
 */
export const getFromLocalStorage = (key) => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;
    return JSON.parse(item);
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
};

/**
 * Saves data to localStorage
 * @param {string} key - The key to save data under
 * @param {Object} data - The data to save
 */
export const saveToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};
