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
                
                <div class="sidebar-section-title" style="padding: 10px 15px 5px; font-size: 12px; text-transform: uppercase; color: var(--muted); font-weight: 700;">Language</div>
                <div class="lang-selector-container" style="padding: 0 10px 10px;">
                    <div class="lang-option" onclick="changeLanguage('hi')" id="opt-hi" style="padding: 10px; border-radius: 8px; cursor: pointer; margin-bottom: 5px; border: 1px solid transparent; transition: 0.2s;">
                        <div style="font-weight: 600; font-size: 14px;">हिन्दी (Sanskrit)</div>
                        <div style="font-size: 11px; opacity: 0.8;">Sanskrit script + Hindi translation</div>
                    </div>
                    <div class="lang-option" onclick="changeLanguage('en_sanskrit')" id="opt-en_sanskrit" style="padding: 10px; border-radius: 8px; cursor: pointer; margin-bottom: 5px; border: 1px solid transparent; transition: 0.2s;">
                        <div style="font-weight: 600; font-size: 14px;">English (Sanskrit)</div>
                        <div style="font-size: 11px; opacity: 0.8;">Sanskrit script + English translation</div>
                    </div>
                    <div class="lang-option" onclick="changeLanguage('en_iast')" id="opt-en_iast" style="padding: 10px; border-radius: 8px; cursor: pointer; border: 1px solid transparent; transition: 0.2s;">
                        <div style="font-weight: 600; font-size: 14px;">English (IAST)</div>
                        <div style="font-size: 11px; opacity: 0.8;">Sanskrit transliteration + English translation</div>
                    </div>
                </div>

                <hr class="sidebar-divider">

                <a href="about.html" class="sidebar-link"><span>🕉️</span> About Project Gita</a>
                <a href="userguide.html" class="sidebar-link"><span>ℹ️</span> How to use</a>
                
                <hr class="sidebar-divider">
                
                <a href="resources.html" class="sidebar-link"><span>📚</span> Resources</a>
                <a href="blogs.html" class="sidebar-link"><span>✍️</span> Blogs</a>
                
                <hr class="sidebar-divider">
                
                <a href="features.html" class="sidebar-link"><span>💡</span> Features</a>
                <a href="contact.html" class="sidebar-link"><span>📧</span> Contact Us</a>
                <a href="support.html" class="sidebar-link" style="color:var(--accent); font-weight: 700;"><span>🙏</span> Leave a tip</a>
                
                <hr class="sidebar-divider">
                <div class="sidebar-link" id="shareBtn" style="cursor:pointer;"><span>📤</span> Share with Friends</div>
                <hr class="sidebar-divider">
            </div>
        </nav>
    `;

    document.body.insertAdjacentHTML('afterbegin', sidebarHTML);

    // --- GLOBALIZED FUNCTIONS ---
    // Attaching to window so index.html and buttons can reach them
    
    window.changeLanguage = (lang) => {
        localStorage.setItem("gita_lang", lang);
        document.documentElement.setAttribute('data-lang', lang);
        window.updateLangUI();
        
        window.dispatchEvent(new CustomEvent('langChanged', { detail: lang }));
        
        if(window.innerWidth < 768) window.toggleMenu();
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
            activeOpt.style.color = "var(--accent)";
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

    // --- Original Logic initialization ---
    window.updateLangUI();
    document.documentElement.setAttribute('data-lang', getStoredLang());

    // --- Share Logic ---
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

    // --- Menu Event Listeners ---
    const openBtn = document.getElementById("openMenu");
    const closeBtn = document.getElementById("closeMenu");
    const overlay = document.getElementById("overlay");

    if (openBtn) openBtn.addEventListener("click", window.toggleMenu);
    if (closeBtn) closeBtn.addEventListener("click", window.toggleMenu);
    if (overlay) overlay.addEventListener("click", window.toggleMenu);
});
