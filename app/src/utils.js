/**
 * Utility functions for localStorage operations and market status
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

/**
 * Checks if the US stock market is currently open
 * @returns {Object} - Object containing isOpen status and nextEvent information
 */
export const checkMarketStatus = () => {
  // Get current date and time in Eastern Time (ET)
  const now = new Date();
  const etOptions = { timeZone: 'America/New_York' };
  const etDateString = now.toLocaleString('en-US', etOptions);
  const etDate = new Date(etDateString);

  // Extract day of week, hours, and minutes
  const dayOfWeek = etDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const hours = etDate.getHours();
  const minutes = etDate.getMinutes();
  const currentTimeInMinutes = hours * 60 + minutes;

  // Market is closed on weekends
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    // Calculate next opening
    let daysUntilOpen;
    if (dayOfWeek === 0) { // Sunday
      daysUntilOpen = 1; // Next opening is Monday
    } else { // Saturday
      daysUntilOpen = 2; // Next opening is Monday
    }

    return {
      isOpen: false,
      status: 'Closed (Weekend)',
      nextEvent: `Opens in ${daysUntilOpen} day${daysUntilOpen > 1 ? 's' : ''} at 9:30 AM ET`
    };
  }

  // Regular trading hours: 9:30 AM to 4:00 PM ET, Monday to Friday
  const marketOpenInMinutes = 9 * 60 + 30; // 9:30 AM
  const marketCloseInMinutes = 16 * 60; // 4:00 PM

  // Check if market is open
  if (currentTimeInMinutes >= marketOpenInMinutes && currentTimeInMinutes < marketCloseInMinutes) {
    // Calculate time until close
    const minutesUntilClose = marketCloseInMinutes - currentTimeInMinutes;
    const hoursUntilClose = Math.floor(minutesUntilClose / 60);
    const remainingMinutes = minutesUntilClose % 60;

    let timeUntilClose = '';
    if (hoursUntilClose > 0) {
      timeUntilClose += `${hoursUntilClose} hour${hoursUntilClose > 1 ? 's' : ''} `;
    }
    if (remainingMinutes > 0 || hoursUntilClose === 0) {
      timeUntilClose += `${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}`;
    }

    return {
      isOpen: true,
      status: 'Open',
      nextEvent: `Closes in ${timeUntilClose}`
    };
  } else {
    // Market is closed
    if (currentTimeInMinutes < marketOpenInMinutes) {
      // Pre-market (morning before open)
      const minutesUntilOpen = marketOpenInMinutes - currentTimeInMinutes;
      const hoursUntilOpen = Math.floor(minutesUntilOpen / 60);
      const remainingMinutes = minutesUntilOpen % 60;

      let timeUntilOpen = '';
      if (hoursUntilOpen > 0) {
        timeUntilOpen += `${hoursUntilOpen} hour${hoursUntilOpen > 1 ? 's' : ''} `;
      }
      if (remainingMinutes > 0 || hoursUntilOpen === 0) {
        timeUntilOpen += `${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}`;
      }

      return {
        isOpen: false,
        status: 'Closed (Pre-market)',
        nextEvent: `Opens in ${timeUntilOpen}`
      };
    } else {
      // After-hours (evening after close)
      // Calculate time until next opening (next day)
      if (dayOfWeek === 5) { // Friday
        // Next opening is Monday
        return {
          isOpen: false,
          status: 'Closed (After-hours)',
          nextEvent: 'Opens on Monday at 9:30 AM ET'
        };
      } else {
        // Next opening is tomorrow
        return {
          isOpen: false,
          status: 'Closed (After-hours)',
          nextEvent: 'Opens tomorrow at 9:30 AM ET'
        };
      }
    }
  }
};
