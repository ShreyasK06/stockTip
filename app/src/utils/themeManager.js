export const updateTheme = (_, isDarkMode) => { // Using _ to indicate unused parameter
  const root = document.documentElement;
  // Set theme attribute on document
  document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');

  // Set primary color (keeping blue as default)
  root.style.setProperty('--primary-color-rgb', '66, 153, 225');

  // Update theme colors
  if (isDarkMode) {
    root.style.setProperty('--background-primary', 'var(--dark-neutral-900)');
    root.style.setProperty('--background-secondary', 'var(--dark-neutral-800)');
    root.style.setProperty('--text-primary', 'var(--light-neutral-100)');
    root.style.setProperty('--text-secondary', 'var(--light-neutral-300)');
    root.style.setProperty('--text-tertiary', 'var(--light-neutral-500)');
  } else {
    root.style.setProperty('--background-primary', 'var(--light-neutral-100)');
    root.style.setProperty('--background-secondary', 'var(--light-neutral-200)');
    root.style.setProperty('--text-primary', 'var(--dark-neutral-900)');
    root.style.setProperty('--text-secondary', 'var(--dark-neutral-700)');
    root.style.setProperty('--text-tertiary', 'var(--dark-neutral-500)');
  }

  // Dispatch theme change event
  window.dispatchEvent(new CustomEvent('themechange', {
    detail: { isDarkMode }
  }));
};




