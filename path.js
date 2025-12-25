/**
 * path.js
 * Handles dual-mode logic: Linear Adhyay-Path and Starred List Navigation.
 * Includes Smart-Scroll Gesture logic for multi-line text accessibility.
 */

if (new URLSearchParams(window.location.search).get("mode") === "starred") {
    const selScreen = document.getElementById("selection-screen");
    if (selScreen) selScreen.style.display = "none";
}

let allShlokas = [], currentAdhyayShlokas = [];
let index = 0;
let flipped = false; 
let isStarredMode = false;
const accentColor = "var(--accent)";

// DOM Elements
const grid = document.getElementById("grid");
const startBtn = document.getElementById("start");
const readingScreen = document.getElementById("reading-screen");
const selectionScreen = document.getElementById("selection-screen");
const completionScreen = document.getElementById("completion-screen");
const textContainer = document.getElementById("shloka-text"); // The .shloka-text div
const cardBody = document.querySelector(".card-body");        // The scrollable container
const headerText = document.getElementById("header-text");
const counterDisplay = document.getElementById("counter");
const card = document.getElementById("card");

// Navigation Elements
const starBtn = document.getElementById("star-btn");
const flipBtn = document.getElementById("flip"); 
const prevBtn = document.getElementById("prev-btn"); 
const nextBtn = document.getElementById("next-btn"); 

const nextContainer = document.querySelector(".next-container"); 
const globalPrev = document.getElementById("prev"); 
const globalNext = document.getElementById("next"); 
const adhyayHeaderBtn = document.getElementById("go-select");

// --- 1. STAR & TOAST LOGIC ---

function getStarred() {
    return JSON.parse(localStorage.getItem("gita_stars") || "[]");
}

function showToast(msg) {
    let toast = document.getElementById("toast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toast";
        toast.style.cssText = `
            position: fixed; bottom: 40px; left: 50%; transform: translateX(-50%);
            background: var(--accent); color: white; padding: 10px 20px;
            border-radius: 50px; z-index: 2000; font-size: 14px;
            transition: opacity 0.3s; pointer-events: none; opacity: 0;
        `;
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = "1";
    setTimeout(() => { toast.style.opacity = "0"; }, 2000);
}

function toggleStar(e) {
    if (e) e.stopPropagation();
    const s = currentAdhyayShlokas[index];
    if (!s) return;
    
    let stars = getStarred();
    const starId = `${s.chapter}.${s.verse}`;
    const existsIndex = stars.findIndex(item => item.id === starId);
    
    if (existsIndex > -1) {
        stars.splice(existsIndex, 1);
        showToast("Removed from Starred List");
        if (isStarredMode) {
            currentAdhyayShlokas.splice(index, 1);
            if (currentAdhyayShlokas.length === 0) {
                localStorage.setItem("gita_stars", JSON.stringify([]));
                window.location.href = "index.html";
                return;
            }
            if (index >= currentAdhyayShlokas.length) index = currentAdhyayShlokas.length - 1;
            loadShloka();
            return;
        }
    } else {
        stars.push({ id: starId, chapter: s.chapter, verse: s.verse });
        stars.sort((a, b) => (a.chapter - b.chapter) || (a.verse - b.verse));
        showToast("Added to Starred List");
    }
    
    localStorage.setItem("gita_stars", JSON.stringify(stars));
    updateStarIcon();
}

function updateStarIcon() {
    if (!starBtn) return;
    const s = currentAdhyayShlokas[index];
    if (!s) return;
    const stars = getStarred();
    const starId = `${s.chapter}.${s.verse}`;
    starBtn.textContent = stars.some(item => item.id === starId) ? "★" : "☆";
}

// --- 2. CORE RENDERING ---

function loadShloka() {
    const s = currentAdhyayShlokas[index];
    if (!s) return;

    flipped = false; 
    updateStarIcon();
    
    // Clear and show textContainer (shloka-text)
    textContainer.innerHTML = "";
    textContainer.style.display = "block";

    headerText.textContent = (s.type === "pushpika") ? `Pushpika` : ` ${s.chapter} · ${s.verse}`;

    if (isStarredMode) {
        counterDisplay.textContent = `${index + 1} / ${currentAdhyayShlokas.length}`;
    } else {
        if (s.type === "pushpika") {
            counterDisplay.textContent = ""; 
        } else {
            const totalShlokas = currentAdhyayShlokas.filter(item => item.type !== "pushpika").length;
            counterDisplay.textContent = `${index + 1} / ${totalShlokas}`;
        }
    }
    
    // Front Side
    const shlokaDiv = document.createElement("div");
    shlokaDiv.id = "view-shloka";
    shlokaDiv.style.display = "block"; 
    
    s.charans.forEach((line, i) => {
        const div = document.createElement("div");
        const isSpeaker = s.type !== "pushpika" && (line.trim().endsWith("उवाच") || line.includes("श्रीभगवानुवाच"));
        div.className = isSpeaker ? "shloka-line speaker" : "shloka-line";
        let formatted = line.replace(/।।/g, "॥").replace(/।(?![॥।0-9])/g, "।<br>");
        if (isSpeaker) formatted = formatted.replace(/उवाच/g, "उवाच<br>");
        div.innerHTML = formatted;
        shlokaDiv.appendChild(div);

        if (s.type === "pushpika" && i === s.charans.length - 1) {
            const namasteDiv = document.createElement("div");
            namasteDiv.textContent = "🙏";
            namasteDiv.style.cssText = "text-align:center; margin-top:15px; font-size:2.5rem;";
            shlokaDiv.appendChild(namasteDiv);
        }
    });

    // Back Side
    const transDiv = document.createElement("div");
    transDiv.id = "view-translation";
    transDiv.style.cssText = "display: none; font-style: italic; text-align: center;";
    transDiv.className = "shloka-line";
    transDiv.innerHTML = s.translation_hindi || "अनुवाद उपलब्ध नहीं है।";

    textContainer.appendChild(shlokaDiv);
    textContainer.appendChild(transDiv);

    if (isStarredMode) {
        prevBtn.style.visibility = "hidden";
        nextBtn.style.visibility = "hidden";
        if (nextContainer) nextContainer.style.display = "flex";
        if (adhyayHeaderBtn) adhyayHeaderBtn.style.display = "none";
        if (globalPrev) globalPrev.style.visibility = (index === 0) ? "hidden" : "visible";
        if (globalNext) globalNext.style.visibility = (index === currentAdhyayShlokas.length - 1) ? "hidden" : "visible";
    } else {
        prevBtn.style.visibility = (index === 0) ? "hidden" : "visible";
        nextBtn.style.visibility = "visible";
        if (nextContainer) nextContainer.style.display = "none";
        if (adhyayHeaderBtn) adhyayHeaderBtn.style.display = "flex";
    }

    // Reset scroll of the body to top
    cardBody.scrollTop = 0;
}

// --- 3. NAVIGATION ---

function toggleFlip(e) {
    if (e) e.stopPropagation();
    const sView = document.getElementById("view-shloka");
    const tView = document.getElementById("view-translation");
    if (!sView || !tView) return;
    
    flipped = !flipped;
    sView.style.display = flipped ? "none" : "block";
    tView.style.display = flipped ? "block" : "none";
    
    // Reset scroll so they start at the top of the translation/shloka
    cardBody.scrollTop = 0;
}

function goNext() {
    if (index < currentAdhyayShlokas.length - 1) {
        index++;
        loadShloka();
    } else if (!isStarredMode) {
        showCompletion();
    }
}

function goPrev() {
    if (index > 0) {
        index--;
        loadShloka();
    }
}

function showCompletion() {
    readingScreen.style.display = "none";
    completionScreen.style.display = "block";
    const currentChapter = currentAdhyayShlokas[0].chapter;
    const msg = document.getElementById("completion-msg");
    if(msg) msg.textContent = `You have completed reading Adhyay ${currentChapter}.`;
    const nBtn = document.getElementById("btn-next-adhyay");
    if (nBtn) nBtn.style.display = (currentChapter < 18) ? "block" : "none";
}

// --- 4. INITIALIZATION ---

fetch("verse.json")
    .then(r => r.json())
    .then(d => {
        allShlokas = d.map(v => ({ 
            chapter: v.chapter, verse: v.verse, charans: v.charans,
            translation_hindi: v.hindi_translation, type: v.type || "shloka"
        }));

        const params = new URLSearchParams(window.location.search);
        if (params.get("mode") === "starred") {
            isStarredMode = true;
            const stars = getStarred();
            if (stars.length > 0) {
                currentAdhyayShlokas = allShlokas.filter(s => 
                    stars.some(st => st.chapter === s.chapter && st.verse === s.verse)
                );
                if (currentAdhyayShlokas.length === 0) {
                    window.location.href = "index.html";
                    return;
                }
                index = 0;
                if(selectionScreen) selectionScreen.style.display = "none";
                if(readingScreen) readingScreen.style.display = "block";
                loadShloka();
            } else {
                window.location.href = "index.html";
            }
        }
    });

if (grid) {
    for (let i = 1; i <= 18; i++) {
        const d = document.createElement("div");
        d.textContent = i;
        d.className = "adhyay-card";
        d.onclick = () => {
            document.querySelectorAll(".adhyay-card").forEach(c => c.classList.remove("selected"));
            d.classList.add("selected");
            if (startBtn) startBtn.disabled = false;
        };
        grid.appendChild(d);
    }
}

// --- 5. EVENT HANDLERS ---

if (startBtn) {
    startBtn.onclick = () => {
        const selected = document.querySelector(".adhyay-card.selected");
        if (!selected) return;
        currentAdhyayShlokas = allShlokas.filter(s => s.chapter === parseInt(selected.textContent));
        index = 0;
        isStarredMode = false;
        selectionScreen.style.display = "none";
        readingScreen.style.display = "block";
        loadShloka();
    };
}

if(starBtn) starBtn.onclick = toggleStar;
if (flipBtn) flipBtn.onclick = toggleFlip;
if(nextBtn) nextBtn.onclick = (e) => { e.stopPropagation(); goNext(); };
if(prevBtn) prevBtn.onclick = (e) => { e.stopPropagation(); goPrev(); };

if (globalNext) globalNext.onclick = (e) => { e.stopPropagation(); goNext(); };
if (globalPrev) globalPrev.onclick = (e) => { e.stopPropagation(); goPrev(); };

const restartBtn = document.getElementById("btn-restart");
if(restartBtn) restartBtn.onclick = () => {
    index = 0; completionScreen.style.display = "none";
    readingScreen.style.display = "block"; loadShloka();
};

const nextAdhyayBtn = document.getElementById("btn-next-adhyay");
if(nextAdhyayBtn) nextAdhyayBtn.onclick = () => {
    const nextCh = currentAdhyayShlokas[0].chapter + 1;
    currentAdhyayShlokas = allShlokas.filter(s => s.chapter === nextCh);
    index = 0; completionScreen.style.display = "none";
    readingScreen.style.display = "block"; loadShloka();
};

// --- 6. GESTURES (SMART-SCROLL & BUTTON ACCESS) ---

let sx = 0, sy = 0, startTime = 0;

card.addEventListener("touchstart", e => { 
    sx = e.touches[0].clientX; 
    sy = e.touches[0].clientY; 
    startTime = Date.now();
}, { passive: true });

card.addEventListener("touchmove", e => { 
    const dx = Math.abs(e.touches[0].clientX - sx);
    const dy = Math.abs(e.touches[0].clientY - sy);
    
    // 1. If horizontal swipe (navigation), lock the page to prevent diagonal jumping
    if (dx > dy && dx > 5) {
        if (e.cancelable) e.preventDefault(); 
        return;
    }

    // 2. Vertical Scroll Logic
    const isTouchingCardBody = e.target.closest('.card-body');
    if (isTouchingCardBody) {
        const isAtTop = cardBody.scrollTop <= 0;
        const isAtBottom = (cardBody.scrollTop + cardBody.clientHeight) >= (cardBody.scrollHeight - 1);

        // If user is in the MIDDLE of reading a long translation, 
        // prevent the whole page from moving.
        if (!isAtTop && !isAtBottom) {
            // We want ONLY the card-body to move, not the background.
            // Note: overscroll-behavior: contain in CSS handles most of this.
        }
    }
    // If they touch buttons OUTSIDE the card, we don't preventDefault,
    // so the page scrolls naturally.
}, { passive: false });

card.addEventListener("touchend", e => {
    const dx = e.changedTouches[0].clientX - sx;
    const dy = e.changedTouches[0].clientY - sy;
    const duration = Date.now() - startTime;

    // A. Horizontal Swipe (Go to Next/Prev Shloka)
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < -70) goNext(); 
        else if (dx > 70) goPrev();
        return;
    }

    // B. Vertical Intent (Flip Card)
    // Threshold: Must be faster than 300ms and move more than 60px
    if (Math.abs(dy) > 60 && duration < 300) {
        const isAtTop = cardBody.scrollTop <= 10;
        const isAtBottom = (cardBody.scrollTop + cardBody.clientHeight) >= (cardBody.scrollHeight - 10);

        if (dy < 0 && isAtBottom) {
            // Swipe UP at the bottom -> Flip
            toggleFlip();
        } else if (dy > 0 && isAtTop) {
            // Swipe DOWN at the top -> Flip
            toggleFlip();
        }
    }
}, { passive: false });

// Mouse support
let mx = 0, my = 0, down = false;
card.addEventListener("mousedown", e => { down = true; mx = e.clientX; my = e.clientY; });
card.addEventListener("mouseup", e => {
    if (!down) return; down = false;
    const dx = e.clientX - mx, dy = e.clientY - my;
    if (Math.abs(dy) > 60) toggleFlip();
    else if (Math.abs(dx) > 100) {
        if (dx < -100) goNext(); else goPrev();
    }
});
