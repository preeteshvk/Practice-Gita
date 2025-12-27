/**
 * theme.js
 * Handles global dark/light mode persistence, System Sync, PWA navigation,
 * and Multi-language UI translation.
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

/**
 * 5. UI TRANSLATION DATA & LOGIC
 */
const uiTranslations = {
    hi: {
        home: "होम",
        language: "भाषा",
        theme: "थीम",
        about: "प्रोजेक्ट गीता के बारे में",
        how_to_use: "उपयोग कैसे करें",
        resources: "रिसोर्सेज", 
        blogs: "ब्लॉग",
        features: "विशेषताएं",
        contact_us: "संपर्क करें",
        leave_tip: "आपका सहयोग प्रदान करें", 
        share_friends: "शेयर करें", 
        close: "बंद करें",
        back: "पीछे",
        search_shloka: "श्लोक खोजें",
        adhyay_path_title: "अध्याय-पाठ",
        adhyay_path_desc: "गीता के श्लोकों को क्रमवार पढ़ें और दोहराएं।",
        charan_bodha_title: "चरण-बोध",
        charan_bodha_desc: "प्रथम चरण से पूर्ण श्लोक को पहचानें।",
        shlokank_title: "श्लोकांक",
        shlokank_desc: "श्लोक को श्लोक के क्रमांक से पहचानिए", 
        starred_title: "स्टार्ड श्लोकास", 
        starred_desc: "अपने बुकमार्क किए गए श्लोकों को पुनः देखें।",
        no_stars: "अभी तक कोई श्लोक स्टार्ड नहीं है।",
        adhyay_select: "अध्याय चयन",
        all_select: "सभी चुनें",
        start_reading: "पढ़ना शुरू करें",
        start_practice: "अभ्यास शुरू करें",
        quick_jump: "जल्दी से ढूंढें", 
        pick_ch: "अध्याय चुनें",
        pick_vs: "श्लोक चुनें",
        identify_verse: "श्लोक पहचानिये",
        identify_number: "श्लोक संख्या पहचानिये",
        hint: "हिंट",
        flip: "पलटें",
        adhyay: "अध्याय",
        shloka: "श्लोक",
        star: "स्टार्ड", 
        pushpika: "पुष्पिका",
        complete_title: "अध्याय पूर्ण!",
        reread: "अध्याय पुनः पढ़ें",
        next_adhyay: "अगला अध्याय",
        finished: "श्लोक समाप्त!",
        lang_hi_desc: "संस्कृत श्लोक + हिन्दी अनुवाद",
        lang_en_s_desc: "संस्कृत श्लोक + अंग्रेजी अनुवाद",
        lang_en_i_desc: "संस्कृत लिप्यंतरण + अंग्रेजी अनुवाद",
        salutation_footer: "जय श्री कृष्ण! जय गौ माता! 🙏",
        go: "आगे बढ़ें",
        cancel: "रद्द करें",
        practice_complete: "अभ्यास पूर्ण!",
        practice_desc: "आपने सभी चयनित श्लोकों का अभ्यास सफलतापूर्वक पूरा कर लिया है।",
        continue_practice: "अभ्यास जारी रखें",
        back_to_selection: "अध्याय चुनें"
    },
    en_sanskrit: {
        home: "Home",
        language: "Language",
        theme: "Theme",
        about: "About Project Gita",
        how_to_use: "How to use",
        resources: "Resources",
        blogs: "Blogs",
        features: "Features",
        contact_us: "Contact Us",
        leave_tip: "Leave a tip",
        share_friends: "Share with Friends",
        close: "Close",
        back: "Back",
        search_shloka: "Search Shloka",
        adhyay_path_title: "Adhyay-Path",
        adhyay_path_desc: "Read and revise the Gita verse by verse.",
        charan_bodha_title: "Charan-Bodha",
        charan_bodha_desc: "Identify the full verse from its opening phrase.",
        shlokank_title: "Shlokank",
        shlokank_desc: "Identify the full verse from its chapter and verse number.",
        starred_title: "Starred Shlokas",
        starred_desc: "Revisit your bookmarked verses.",
        no_stars: "No bookmarked verses yet.",
        adhyay_select: "Select Adhyay",
        all_select: "Select All",
        start_reading: "Start Reading",
        start_practice: "Start Practice",
        quick_jump: "Quick Jump",
        pick_ch: "Pick Chapter",
        pick_vs: "Pick Shloka",
        identify_verse: "Identify Verse",
        identify_number: "Identify Number",
        hint: "Hint",
        flip: "Flip",
        adhyay: "Adhyay",
        shloka: "Shloka",
        star: "Starred",
        pushpika: "Pushpika",
        complete_title: "Chapter Complete!",
        reread: "Reread Chapter",
        next_adhyay: "Next Chapter",
        finished: "Shlokas Finished!",
        lang_hi_desc: "Sanskrit shlokas + Hindi translation",
        lang_en_s_desc: "Sanskrit shlokas + English translation",
        lang_en_i_desc: "Sanskrit transliteration + English translation",
        salutation_footer: "Jai Shri Krishna! Jai Gau Mata! 🙏",
        go: "Go",
        cancel: "Cancel",
        practice_complete: "Practice Complete!",
        practice_desc: "You have successfully completed the practice for all selected shlokas.",
        continue_practice: "Continue Practicing",
        back_to_selection: "Back to Selection"
    },
    en_iast: {
        home: "Home",
        language: "Language",
        theme: "Theme",
        about: "About Project Gita",
        how_to_use: "How to use",
        resources: "Resources",
        blogs: "Blogs",
        features: "Features",
        contact_us: "Contact Us",
        leave_tip: "Leave a tip",
        share_friends: "Share with Friends",
        close: "Close",
        back: "Back",
        search_shloka: "Search Verse",
        adhyay_path_title: "Adhyāya-Pāṭha",
        adhyay_path_desc: "Read and revise the Gita verse by verse.",
        charan_bodha_title: "Caraṇa-Bodha",
        charan_bodha_desc: "Identify the full verse from its opening phrase.",
        shlokank_title: "Ślokāṅka",
        shlokank_desc: "Identify the full verse from its chapter and verse number.",
        starred_title: "Starred Verses",
        starred_desc: "Revisit your bookmarked verses.",
        no_stars: "No bookmarked verses yet.",
        adhyay_select: "Select Adhyāya",
        all_select: "Select All",
        start_reading: "Start Reading",
        start_practice: "Start Practice",
        quick_jump: "Quick Jump",
        pick_ch: "Pick Chapter",
        pick_vs: "Pick Verse",
        identify_verse: "Identify Verse",
        identify_number: "Identify Number",
        hint: "Hint",
        flip: "Flip",
        adhyay: "Adhyāya",
        shloka: "Verse",
        star: "Starred",
        pushpika: "Puṣpikā",
        complete_title: "Chapter Complete!",
        reread: "Reread Chapter",
        next_adhyay: "Next Adhyāya",
        finished: "Verses Finished!",
        lang_hi_desc: "Sanskrit verses + Hindi translation",
        lang_en_s_desc: "Sanskrit verses + English translation",
        lang_en_i_desc: "IAST transliteration + English translation",
        salutation_footer: "Jai Śrī Kṛṣṇa! Jai Gau Mātā! 🙏",
        go: "Go",
        cancel: "Cancel",
        practice_complete: "Practice Complete!",
        practice_desc: "You have successfully completed the practice for all selected shlokas.",
        continue_practice: "Continue Practicing",
        back_to_selection: "Back to Selection"
    }
};

/**
 * Automatically updates all HTML elements with the 'data-cap' attribute.
 */
function applyUILanguage() {
    const lang = localStorage.getItem("gita_lang") || 'hi';
    const t = uiTranslations[lang];
    if (!t) return;

    document.querySelectorAll('[data-cap]').forEach(el => {
        const key = el.getAttribute('data-cap');
        if (t[key]) {
            el.textContent = t[key];
        }
    });

    const searchInput = document.querySelector('.search-bar input');
    if (searchInput && t.search_shloka) searchInput.placeholder = t.search_shloka;
}

// 1. Define Language Constants
const GITA_LANGS = {
    HINDI: 'hi',          
    EN_SANS: 'en_sanskrit', 
    EN_IAST: 'en_iast'      
};

// 2. Function to update the language globally
function setLanguage(lang) {
    localStorage.setItem("gita_lang", lang);
    document.documentElement.setAttribute('data-lang', lang);
    
    // Refresh static text labels
    applyUILanguage();
    
    // Refresh the content if we are on a shloka page
    if (typeof loadShloka === 'function') {
        loadShloka(); 
    }
    
    // Refresh sidebar state (if menu.js is loaded)
    if (typeof updateLangUI === 'function') {
        updateLangUI();
    }
    
    // Close modal if it's open
    const modal = document.getElementById('lang-modal');
    if(modal) {
        setTimeout(() => {
            modal.style.display = 'none';
        }, 400);
    }

    window.dispatchEvent(new CustomEvent('langChanged', { detail: lang }));
}

// 3. Helper to get saved language
function getLanguage() {
    return localStorage.getItem("gita_lang") || 'hi';
}

// Initial UI Translation on load
document.addEventListener("DOMContentLoaded", applyUILanguage);
