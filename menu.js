document.addEventListener("DOMContentLoaded", () => {
    const sidebarHTML = `
        <div class="overlay" id="overlay"></div>
        <nav class="sidebar" id="sidebar">
           <div class="sidebar-header">
    <h2>Project Gita</h2>
    <div id="closeMenu" aria-label="Close Menu">✕</div>
</div>
            <div class="sidebar-links">
                <a href="about.html" class="sidebar-link"><span>🕉️</span> About Project Gita</a>
                <a href="guide.html" class="sidebar-link"><span>ℹ️</span> How to use</a>
                
                <hr class="sidebar-divider">
                
                <a href="resources.html" class="sidebar-link"><span>📚</span> Resources</a>
                <a href="blogs.html" class="sidebar-link"><span>✍️</span> Blogs</a>
                
                <hr class="sidebar-divider">
                
                <a href="request.html" class="sidebar-link"><span>💡</span> Features</a>
                <a href="contact.html" class="sidebar-link"><span>📧</span> Contact Us</a>
                <a href="support.html" class="sidebar-link" style="color:var(--accent); font-weight: 700;"><span>🙏</span> Leave a tip</a>
                
                <hr class="sidebar-divider">
            </div>
        </nav>
    `;

    // Insert sidebar into the body
    document.body.insertAdjacentHTML('afterbegin', sidebarHTML);

    const openBtn = document.getElementById("openMenu");
    const closeBtn = document.getElementById("closeMenu");
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay");

    const toggleMenu = () => {
        sidebar.classList.toggle("active");
        overlay.classList.toggle("active");
    };

    if (openBtn) openBtn.addEventListener("click", toggleMenu);
    if (closeBtn) closeBtn.addEventListener("click", toggleMenu);
    if (overlay) overlay.addEventListener("click", toggleMenu);
});