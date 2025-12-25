/**
 * theme.js
 * Handles global dark/light mode persistence and PWA navigation.
 */

const themeToggle = document.getElementById("themeToggle");

/**
 * Applies the theme to the body and updates the toggle icon.
 * @param {string} theme - 'dark' or 'light'
 */
function applyTheme(theme) {
  if (theme === "dark") {
    document.body.classList.add("dark");
    if (themeToggle) themeToggle.textContent = "☀️";
  } else {
    document.body.classList.remove("dark");
    if (themeToggle) themeToggle.textContent = "🌙";
  }
  window.dispatchEvent(new Event('themeChanged'));
}

// Initial Load
const savedTheme = localStorage.getItem("gita_theme") || "light";
applyTheme(savedTheme);

if (themeToggle) {
  themeToggle.onclick = () => {
    const isDark = document.body.classList.toggle("dark");
    const newTheme = isDark ? "dark" : "light";
    themeToggle.textContent = isDark ? "☀️" : "🌙";
    localStorage.setItem("gita_theme", newTheme);
    window.dispatchEvent(new Event('themeChanged'));
  };
}

/**
 * PWA NAVIGATION FIX (For iPhone Standalone Mode)
 * Ensures that clicking links (Home, Adhyay, etc.) does not open 
 * the Safari browser UI.
 */
if (("standalone" in window.navigator) && window.navigator.standalone) {
  document.addEventListener('click', (e) => {
    // Look for the closest link element from the click target
    const targetLink = e.target.closest('a');
    
    if (targetLink && targetLink.href) {
      // Internal links only: prevent default behavior and navigate manually
      const isInternal = targetLink.href.includes(window.location.hostname);
      const isNotNewTab = targetLink.target !== "_blank";

      if (isInternal && isNotNewTab) {
        e.preventDefault();
        window.location.href = targetLink.href;
      }
    }
  }, false);
}
