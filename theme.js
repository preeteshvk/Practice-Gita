/**
 * theme.js
 * Handles global dark/light mode persistence across all Gita pages.
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

  // Custom Event: Notifies other scripts (like practice.js) that the theme changed
  // This helps in updating dynamic colors of buttons instantly.
  window.dispatchEvent(new Event('themeChanged'));
}

// Initial Load: Check for saved preference or default to light
const savedTheme = localStorage.getItem("gita_theme") || "light";
applyTheme(savedTheme);

// Toggle Click Handler
if (themeToggle) {
  themeToggle.onclick = () => {
    const isDark = document.body.classList.toggle("dark");
    const newTheme = isDark ? "dark" : "light";
    
    // Update icon
    themeToggle.textContent = isDark ? "☀️" : "🌙";
    
    // Save preference
    localStorage.setItem("gita_theme", newTheme);
    
    // Notify other scripts
    window.dispatchEvent(new Event('themeChanged'));
  };
}