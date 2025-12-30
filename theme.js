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
        features: "फीचर्स (विशेषताएं)",
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
        back_to_selection: "अध्याय चुनें",
        // Features Page Hindi
        features_hero_subtitle: "आधुनिक तकनीक के साथ आध्यात्मिक निपुणता की ओर एक यात्रा।",
        tag_global: "वैश्विक पहुंच",
        tag_practice: "अभ्यास संग्रह",
        tag_ux: "आधुनिक अनुभव",
        feat_lang_title: "बहुभाषी सहायता (Multi-language Support):",
        feat_lang_desc: "संस्कृत श्लोक, हिन्दी और अंग्रेजी अनुवाद के साथ। वैश्विक पहुंच के लिए इसमें IAST लिप्यंतरण (Transliteration) भी शामिल है।",
        feat_pwa_title: "PWA सपोर्ट:",
        feat_pwa_desc: "इसे Android और iOS पर एक नेटिव ऐप की तरह इंस्टॉल करें। यह बिना इंटरनेट (Offline) भी काम करता है।",
        feat_modes_title: "श्लोकांक और चरण-बोध:",
        feat_modes_desc: "श्लोक संख्या या प्रथम चरण के माध्यम से श्लोकों को पहचानने का विशेष अभ्यास मोड। इसमें शब्द और चरण के हिंट (Hints) भी शामिल हैं।",
        feat_path_title: "अध्याय-पाठ:",
        feat_path_desc: "श्लोकों को क्रमवार पढ़ने का मोड, जिसमें 'Quick Jump' की सुविधा है ताकि आप किसी भी श्लोक से पढ़ना शुरू कर सकें।",
        feat_star_title: "स्टार्ड श्लोक (Starred Verses):",
        feat_star_desc: "कठिन या महत्वपूर्ण श्लोकों को बुकमार्क करें ताकि आप उनका बाद में पुनरीक्षण (Revision) कर सकें।",
        feat_gesture_title: "स्मार्ट जेस्चर (Smart Gestures):",
        feat_gesture_desc: "कार्ड्स को पलटने के लिए ऊपर/नीचे स्वाइप करें, और श्लोकों के बीच नेविगेट करने के लिए दाएं/बाएं स्वाइप करें।",
        feat_timer_title: "ऑटो-टाइमर:",
        feat_timer_desc: "समय-आधारित अभ्यास के लिए स्वचालित टाइमर, जो श्लोक सामने आते ही शुरू होता है और कार्ड पलटते ही रुक जाता है।",
        feat_night_title: "सिस्टम-सिंक्ड डार्क मोड:",
        feat_night_desc: "एक सुंदर डार्क थीम जो आपके डिवाइस की सेटिंग्स के साथ अपने आप तालमेल बिठा लेती है।",
        suggest_title: "नया फीचर सुझाएं",
        suggest_desc: "क्या आपके पास प्रोजेक्ट गीता को बेहतर बनाने का कोई विचार है?",
        btn_request: "फीचर का अनुरोध करें",
        resources_subtitle: "श्रीमद भगवद गीता से संबंधित उपयोगी रिसोर्सेज, जो मेरी आध्यात्मिक यात्रा में प्रेरणादायक रहे हैं।",
        tab_all: "सभी",
        tab_videos: "वीडियो",
        tab_prayers: "प्रार्थनाएँ",
        tab_blogs: "लेख और ब्लॉग",
        res_gita_advice_title: "गीता का मार्गदर्शन",
        res_gita_advice_desc: "विद्यार्थियों और युवाओं के लिए जीवन की चुनौतियों से निपटने हेतु विशेष मार्गदर्शन।",
        search_resources: "सर्च...",

        about_story_title: "हमारी कहानी",
        about_greeting: "नमस्ते",
        about_p1: "<strong>प्रोजेक्ट गीता</strong> की शुरुआत एक सरल संकल्प के साथ हुई थी: अपनी माताजी को <strong>गीता परिवार</strong> द्वारा आयोजित <em>श्लोकांक</em> परीक्षा की तैयारी में सहायता करना।",
        about_p2: "एक माँ की मदद के उद्देश्य से शुरू हुआ यह छोटा सा प्रयास आज एक विस्तृत संग्रह बन चुका है। इसमें श्रीमद भगवद गीता के सभी 700 श्लोकों और 18 पुष्पिकाओं के अभ्यास के लिए विभिन्न तरीके उपलब्ध हैं, ताकि कोई भी इन कालजयी श्लोकों में निपुणता प्राप्त कर सके।",
        about_thanks: "हम गीता परिवार और उन सभी लेखकों का आभार व्यक्त करते हैं जिनके प्रयासों और सामग्री ने इस प्रोजेक्ट को प्रेरित किया।",
        about_contact_title: "संपर्क और सहयोग",
        contact_desc: "किसी भी प्रश्न या सुझाव के लिए हमसे संपर्क करें।",
        support_init_title: "आपका सहयोग प्रदान करें",
        support_init_desc: "इस प्रोजेक्ट को निःशुल्क और अधिक लोगों तक पहुँचाने में हमारी मदद करें।",
        feat_list_title: "फीचर्स (विशेषताओं) की सूची",
        feat_list_desc: "देखें कि इस ऐप में कौन-कौन सी सुविधाएँ उपलब्ध हैं।",

        suggest_subtitle: "सामुदायिक फीडबैक",
        suggest_title_h1: "फीचर का सुझाव दें",
        suggest_desc_p: "आपके विचार प्रोजेक्ट गीता के भविष्य को आकार देने में मदद करते हैं। हम प्रत्येक सुझाव को पढ़ते हैं।",
        label_feat_title: "फीचर का शीर्षक",
        ph_feat_title: "जैसे: संस्कृत श्लोक ऑडियो",
        label_feat_how: "यह कैसे काम करेगा?",
        ph_feat_how: "फीचर का वर्णन करें और बताएं कि यह आपको सीखने में कैसे मदद करती है...",
        btn_draft_email: "ईमेल ड्राफ्ट करें",
        suggest_footer_note: '"ईमेल ड्राफ्ट करें" पर क्लिक करने से आपका ईमेल ऐप खुल जाएगा। हमारे सर्वर पर कोई डेटा स्टोर नहीं किया जाता है।',
        back_to_list: "← फीचर्स (विशेषताओं) की सूची पर वापस जाएं",
        email_greeting: "नमस्ते प्रोजेक्ट गीता टीम,\n\nमेरा एक सुझाव है:\n",
        email_footer: "\n\nप्रोजेक्ट गीता वेब ऐप से भेजा गया"
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
        leave_tip: "Support the Initiative",
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
        back_to_selection: "Back to Selection",
        // Features Page English (Sanskrit)
        features_hero_subtitle: "The journey of building a modern tool for spiritual mastery.",
        tag_global: "Global Access",
        tag_practice: "Practice Ecosystem",
        tag_ux: "Modern UX",
        feat_lang_title: "Multi-language Support:",
        feat_lang_desc: "Sanskrit shlokas with translations in Hindi and English, plus IAST transliteration for global reach.",
        feat_pwa_title: "PWA Ready:",
        feat_pwa_desc: "Installable on Android and iOS to work like a native app with offline capabilities.",
        feat_modes_title: "Shlokank & Charan Bodha:",
        feat_modes_desc: "Specialized practice modes to identify verses by number or by their first charan. Includes hints which shows first word or second charan respectively.",
        feat_path_title: "Adhyay Path:",
        feat_path_desc: "Sequential reading mode with 'Quick Jump' functionality to start reading from any specific shloka.",
        feat_star_title: "Starred Verses:",
        feat_star_desc: "Bookmark difficult or meaningful shlokas for quick revision.",
        feat_gesture_title: "Smart Gestures:",
        feat_gesture_desc: "Swipe up/down to flip cards, and left/right to navigate between shlokas or practice questions.",
        feat_timer_title: "Auto-Timer:",
        feat_timer_desc: "Automatic timer starts on question display and stops on flip for time-based practice.",
        feat_night_title: "System-Synced Night Mode:",
        feat_night_desc: "Beautiful dark theme that syncs with your device settings.",
        suggest_title: "Suggest a Feature",
        suggest_desc: "Have an idea to make Project Gita better?",
        btn_request: "Request Feature",
        resources_subtitle: "Includes all resources related to Bhagavad Gita which I have found meaningful.",
        tab_all: "All",
        tab_videos: "Videos",
        tab_prayers: "Prayers",
        tab_blogs: "Blogs and Articles",
        res_gita_advice_title: "Gita Advice",
        res_gita_advice_desc: "Practical advice for students and young people based on Gita.",
        search_resources: "Search...",

        about_story_title: "Our Story",
        about_greeting: "Namaste",
        about_p1: "<strong>Project Gita</strong> began with a simple desire: to help my mother prepare for her <em>Shlokanka</em> examination conducted by <strong>Gita Parivar</strong>.",
        about_p2: "What started as a tool for a mother has grown into a comprehensive repository with different practice modes for all 700 Verses and 18 Pushpikas, designed for anyone seeking to master these timeless verses.",
        about_thanks: "We thank Gita Parivar and the authors for their efforts and the content that inspired this project.",
        about_contact_title: "Contact & Support",
        contact_desc: "Reach out for queries or feedback.",
        support_init_title: "Support the Initiative",
        support_init_desc: "Help us make this project available to more people freely.",
        feat_list_title: "Features List",
        feat_list_desc: "See what all features the functionality has.",

        suggest_subtitle: "Community Feedback",
        suggest_title_h1: "Suggest a Feature",
        suggest_desc_p: "Your ideas help shape the future of Project Gita. We read every suggestion.",
        label_feat_title: "Feature Title",
        ph_feat_title: "e.g., Sanskrit Shloka Audio",
        label_feat_how: "How would this work?",
        ph_feat_how: "Describe the feature and how it helps you learn...",
        btn_draft_email: "Draft Email",
        suggest_footer_note: 'Clicking "Draft Email" will open your default email app. No data is stored on our servers.',
        back_to_list: "← Back to feature list",
        email_greeting: "Hi Project Gita Team,\n\nI have a feature suggestion:\n",
        email_footer: "\n\nSent from Project Gita Web App"
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
        leave_tip: "Support the Initiative",
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
        back_to_selection: "Back to Selection",
        // Features Page English (IAST)
        features_hero_subtitle: "The journey of building a modern tool for spiritual mastery.",
        tag_global: "Global Access",
        tag_practice: "Practice Ecosystem",
        tag_ux: "Modern UX",
        feat_lang_title: "Multi-language Support:",
        feat_lang_desc: "Sanskrit verses with translations in Hindi and English, plus IAST transliteration for global reach.",
        feat_pwa_title: "PWA Ready:",
        feat_pwa_desc: "Installable on Android and iOS to work like a native app with offline capabilities.",
        feat_modes_title: "Ślokāṅka & Caraṇa Bodha:",
        feat_modes_desc: "Specialized practice modes to identify verses by number or by their first caraṇa. Includes hints which shows first word or second caraṇa respectively.",
        feat_path_title: "Adhyāya Path:",
        feat_path_desc: "Sequential reading mode with 'Quick Jump' functionality to start reading from any specific verse.",
        feat_star_title: "Starred Verses:",
        feat_star_desc: "Bookmark difficult or meaningful verses for quick revision.",
        feat_gesture_title: "Smart Gestures:",
        feat_gesture_desc: "Swipe up/down to flip cards, and left/right to navigate between verses or practice questions.",
        feat_timer_title: "Auto-Timer:",
        feat_timer_desc: "Automatic timer starts on question display and stops on flip for time-based practice.",
        feat_night_title: "System-Synced Night Mode:",
        feat_night_desc: "Beautiful dark theme that syncs with your device settings.",
        suggest_title: "Suggest a Feature",
        suggest_desc: "Have an idea to make Project Gita better?",
        btn_request: "Request Feature",
        resources_subtitle: "Includes all resources related to Bhagavad Gita which I have found meaningful.",
        tab_all: "All",
        tab_videos: "Videos",
        tab_prayers: "Prayers",
        tab_blogs: "Blogs and Articles",
        res_gita_advice_title: "Gita Advice",
        res_gita_advice_desc: "Practical advice for students and young people based on Gita.",
        search_resources: "Search...",

        about_story_title: "Our Story",
        about_greeting: "Namaste",
        about_p1: "<strong>Project Gita</strong> began with a simple desire: to help my mother prepare for her <em>Shlokanka</em> examination conducted by <strong>Gita Parivar</strong>.",
        about_p2: "What started as a tool for a mother has grown into a comprehensive repository with different practice modes for all 700 Verses and 18 Pushpikas, designed for anyone seeking to master these timeless verses.",
        about_thanks: "We thank Gita Parivar and the authors for their efforts and the content that inspired this project.",
        about_contact_title: "Contact & Support",
        contact_desc: "Reach out for queries or feedback.",
        support_init_title: "Support the Initiative",
        support_init_desc: "Help us make this project available to more people freely.",
        feat_list_title: "Features List",
        feat_list_desc: "See what all features the functionality has.",

        suggest_subtitle: "Community Feedback",
        suggest_title_h1: "Suggest a Feature",
        suggest_desc_p: "Your ideas help shape the future of Project Gita. We read every suggestion.",
        label_feat_title: "Feature Title",
        ph_feat_title: "e.g., Sanskrit Shloka Audio",
        label_feat_how: "How would this work?",
        ph_feat_how: "Describe the feature and how it helps you learn...",
        btn_draft_email: "Draft Email",
        suggest_footer_note: 'Clicking "Draft Email" will open your default email app. No data is stored on our servers.',
        back_to_list: "← Back to feature list",
        email_greeting: "Hi Project Gita Team,\n\nI have a feature suggestion:\n",
        email_footer: "\n\nSent from Project Gita Web App"

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
        const translation = t[key];

        if (translation) {
            // 1. Handle Input Placeholders
            if (el.tagName === 'INPUT'|| el.tagName === 'TEXTAREA') {
                el.placeholder = translation;
            } 
            // 2. Handle Paragraphs/Headers with Formatting (bold/italics)
            else if (translation.includes('<')) {
                el.innerHTML = translation;
            }
            // 3. Handle Simple Text (Fastest performance)
            else {
                el.textContent = translation;
            }
        }
    });
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
