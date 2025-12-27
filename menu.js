document.addEventListener("DOMContentLoaded", () => {
    // 1. Helper function to get current language
    const getStoredLang = () => localStorage.getItem("gita_lang") || 'hi';

    const sidebarHTML = `
        <div class="overlay" id="overlay"></div>
        <nav class="sidebar" id="sidebar">
            <div class="sidebar-header">
                <h2>Project Gita</h2>
                <div id="closeMenu" aria-label="Close Menu">✕</div>
            </div>
            <div class="sidebar-links">
                
                <div class="sidebar-section-title" data-cap="language">Language</div>
                <div class="lang-selector-container">
                    <div class="lang-option" onclick="setLanguage('hi')" id="opt-hi">
                        <div class="lang-name">हिन्दी (Sanskrit)</div>
                        <div class="lang-desc" data-cap="lang_hi_desc">Sanskrit shlokas + Hindi translation</div>
                    </div>
                    
                    <div class="lang-option" onclick="setLanguage('en_sanskrit')" id="opt-en_sanskrit">
                        <div class="lang-name">English (Sanskrit)</div>
                        <div class="lang-desc" data-cap="lang_en_s_desc">Sanskrit shlokas + English translation</div>
                    </div>
                    
                    <div class="lang-option" onclick="setLanguage('en_iast')" id="opt-en_iast">
                        <div class="lang-name">English (IAST)</div>
                        <div class="lang-desc" data-cap="lang_en_i_desc">Sanskrit transliteration + English translation</div>
                    </div>
                </div>

                <hr class="sidebar-divider">

                <a href="about.html" class="sidebar-link">
                    <span>🕉️</span> <span data-cap="about">About Project Gita</span>
                </a>
                <a href="userguide.html" class="sidebar-link">
                    <span>ℹ️</span> <span data-cap="how_to_use">How to use</span>
                </a>
                
                <hr class="sidebar-divider">
                
                <a href="resources.html" class="sidebar-link">
                    <span>📚</span> <span data-cap="resources">Resources</span>
                </a>
                <a href="blogs.html" class="sidebar-link">
                    <span>✍️</span> <span data-cap="blogs">Blogs</span>
                </a>
                
                <hr class="sidebar-divider">
                
                <a href="features.html" class="sidebar-link">
                    <span>💡</span> <span data-cap="features">Features</span>
                </a>
                <a href="contact.html" class="sidebar-link">
                    <span>📧</span> <span data-cap="contact_us">Contact Us</span>
                </a>
                <a href="support.html" class="sidebar-link" style="color:var(--accent); font-weight: 700;">
                    <span>🙏</span> <span data-cap="leave_tip">Leave a tip</span>
                </a>
                
                <hr class="sidebar-divider">
                <div class="sidebar-link" id="shareBtn" style="cursor:pointer;">
                    <span>📤</span> <span data-cap="share_friends">Share with Friends</span>
                </div>
                
                <hr class="sidebar-divider">

                <div style="text-align: center; padding: 20px 10px; font-size: 14px; font-weight: 600; color: var(--text); opacity: 0.7; line-height: 1.4;" data-cap="salutation_footer">
                    Jai Shri Krishna! Jai Gau Mata! 🙏
                </div>
            </div>
        </nav>
    `;

    document.body.insertAdjacentHTML('afterbegin', sidebarHTML);

    // --- GLOBALIZED FUNCTIONS ---
    
    window.setLanguage = (lang) => {
        localStorage.setItem("gita_lang", lang);
        document.documentElement.setAttribute('data-lang', lang);
        
        window.updateLangUI();
        
        if (typeof applyUILanguage === 'function') {
            applyUILanguage();
        }

        const modalButtons = document.querySelectorAll('.lang-options button');
        modalButtons.forEach(btn => btn.classList.remove('selected')); 
        
        const clickedBtn = Array.from(modalButtons).find(b => b.getAttribute('onclick')?.includes(lang));
        if (clickedBtn) {
            clickedBtn.classList.add('selected'); 
        }

        const modal = document.getElementById('lang-modal');
        if (modal) {
            setTimeout(() => {
                modal.style.opacity = '0'; 
                setTimeout(() => {
                    modal.style.display = 'none';
                    modal.style.opacity = '1'; 
                }, 200);
            }, 400); 
        }

        window.dispatchEvent(new CustomEvent('langChanged', { detail: lang }));
        
        if(window.innerWidth < 768) {
            const sidebar = document.getElementById("sidebar");
            if (sidebar && sidebar.classList.contains('active')) window.toggleMenu();
        }
    };

    window.updateLangUI = () => {
        const current = getStoredLang();
        
        document.querySelectorAll('.lang-option').forEach(opt => {
            opt.style.background = "transparent";
            opt.style.borderColor = "transparent";
            opt.style.color = "var(--text)";
        });
        
        const activeOpt = document.getElementById(`opt-${current}`);
        if (activeOpt) {
            activeOpt.style.border = "1px solid var(--accent)";
           activeOpt.style.setProperty('color', 'var(--accent)', 'important');
            activeOpt.style.background = "rgba(128, 128, 128, 0.1)"; 
        }
    };

    window.toggleMenu = () => {
        const sidebar = document.getElementById("sidebar");
        const overlay = document.getElementById("overlay");
        if (sidebar && overlay) {
            sidebar.classList.toggle("active");
            overlay.classList.toggle("active");
        }
    };

    // --- Initialization ---
    window.updateLangUI();
    document.documentElement.setAttribute('data-lang', getStoredLang());
    
    if (typeof applyUILanguage === 'function') applyUILanguage();

    // --- Event Listeners ---
    const shareButton = document.getElementById('shareBtn');
    if (shareButton) {
        shareButton.addEventListener('click', async () => {
            const shareData = {
                title: 'Project Gita',
                text: 'Experience the wisdom of Shrimad Bhagwad Gita in a modern, minimalistic way.',
                url: 'https://preeteshvk.github.io/Practice-Gita/'
            };
            if (navigator.share) {
                try { await navigator.share(shareData); } 
                catch (err) { console.log("Share sheet closed"); }
            } else {
                try {
                    await navigator.clipboard.writeText(shareData.url);
                    alert("Link copied to clipboard!"); 
                } catch (err) { console.error("Failed to copy: ", err); }
            }
        });
    }

    const openBtn = document.getElementById("openMenu");
    const closeBtn = document.getElementById("closeMenu");
    const overlay = document.getElementById("overlay");

    if (openBtn) openBtn.addEventListener("click", window.toggleMenu);
    if (closeBtn) closeBtn.addEventListener("click", window.toggleMenu);
    if (overlay) overlay.addEventListener("click", window.toggleMenu);
});
