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

// 1. Define our 3 specific formats
const GITA_LANGS = {
    HINDI: 'hi',          // Sanskrit + Hindi
    EN_SANS: 'en_sanskrit', // Sanskrit + English
    EN_IAST: 'en_iast'      // Transliterated + English
};

// 2. Function to update the language globally
function setLanguage(lang) {
    localStorage.setItem("gita_lang", lang);
    document.documentElement.setAttribute('data-lang', lang);
    
    // Refresh the UI if we are on a shloka page
    if (typeof loadShloka === 'function') {
        loadShloka(); 
    }
    
    // Update the Sidebar UI to show what's active
    updateSidebarActiveState(lang);
    
    // Close modal if it's open
    const modal = document.getElementById('lang-modal');
    if(modal) modal.style.display = 'none';
}

// 3. Get saved language or return null
function getLanguage() {
    return localStorage.getItem("gita_lang");
}
