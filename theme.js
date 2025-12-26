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
    // SYNC SYSTEM UI (Picker Wheel, Scrollbars)
    document.documentElement.style.colorScheme = "dark"; 
    if (themeToggle) themeToggle.textContent = "☀️";
  } else {
    document.body.classList.remove("dark");
    // SYNC SYSTEM UI (Picker Wheel, Scrollbars)
    document.documentElement.style.colorScheme = "light";
    if (themeToggle) themeToggle.textContent = "🌙";
  }
  window.dispatchEvent(new Event('themeChanged'));
}

/**
 * 1. INITIAL LOAD LOGIC
 */
const savedTheme = localStorage.getItem("gita_theme");
const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)");

if (savedTheme) {
  applyTheme(savedTheme);
} else {
  applyTheme(systemPrefersDark.matches ? "dark" : "light");
}

/**
 * 2. LIVE SYSTEM SYNC
 */
systemPrefersDark.addEventListener("change", (e) => {
  if (!localStorage.getItem("gita_theme")) {
    applyTheme(e.matches ? "dark" : "light");
  }
});

/**
 * 3. MANUAL TOGGLE
 */
if (themeToggle) {
  themeToggle.onclick = () => {
    const isDark = document.body.classList.toggle("dark");
    const newTheme = isDark ? "dark" : "light";
    
    // UPDATE SYSTEM UI COLOR SCHEME ON MANUAL CLICK
    document.documentElement.style.colorScheme = newTheme;
    
    themeToggle.textContent = isDark ? "☀️" : "🌙";
    localStorage.setItem("gita_theme", newTheme);
    window.dispatchEvent(new Event('themeChanged'));
  };
}

/**
 * 4. PWA NAVIGATION FIX (Remains unchanged)
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
