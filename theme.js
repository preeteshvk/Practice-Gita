/**
 * theme.js
 * Handles global dark/light mode persistence, System Sync, and PWA navigation.
 */

const themeToggle = document.getElementById("themeToggle");

/**
 * Applies the theme to the body and updates the toggle icon.
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

/**
 * 1. INITIAL LOAD LOGIC
 * Checks LocalStorage first, then falls back to System Preference
 */
const savedTheme = localStorage.getItem("gita_theme");
const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)");

if (savedTheme) {
  // If user previously picked a theme, use that
  applyTheme(savedTheme);
} else {
  // Otherwise, follow the device setting
  applyTheme(systemPrefersDark.matches ? "dark" : "light");
}

/**
 * 2. LIVE SYSTEM SYNC
 * Updates theme automatically if device settings change (e.g., sunset/sunrise)
 * only if the user hasn't manually set a preference.
 */
systemPrefersDark.addEventListener("change", (e) => {
  if (!localStorage.getItem("gita_theme")) {
    applyTheme(e.matches ? "dark" : "light");
  }
});

/**
 * 3. MANUAL TOGGLE
 * Saves choice to localStorage to override system preference
 */
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
 * 4. PWA NAVIGATION FIX
 */
if (("standalone" in window.navigator) && window.navigator.standalone) {
  document.addEventListener('click', (e) => {
    const targetLink = e.target.closest('a');
    if (targetLink && targetLink.href) {
      const isInternal = targetLink.href.includes(window.location.hostname);
      const isNotNewTab = targetLink.target !== "_blank";
      if (isInternal && isNotNewTab) {
        e.preventDefault();
        window.location.href = targetLink.href;
      }
    }
  }, false);
}
