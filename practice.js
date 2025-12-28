/**
 * practice.js
 * Handles Shlokank practice logic: shuffling, timers, hints, and navigation.
 * Integrated with dynamic language selection and CSS stickers.
 */

let allShlokas = [], shlokas = [];
let index = 0, flipped = false;
let sessionShloka = null; 
let timerInterval, startTime;
let currentAccentColor = "";
const borderColors = ["#d32f2f", "#6398BB", "#F54927", "#ad1457", "#6a1b9a", "#00695c"];
let colorIndex = 0;

// DOM Elements
const grid = document.getElementById("grid");
const toggle = document.getElementById("toggle");
const startBtn = document.getElementById("start");
const card = document.getElementById("card");
const header = document.getElementById("header-text");
const counterDisplay = document.getElementById("counter");
const center = document.getElementById("center-text");
const text = document.getElementById("shloka-text");
const hint = document.getElementById("hint");
const hintBtn = document.getElementById("hint-btn");
const flipBtn = document.getElementById("flip");
const starBtn = document.getElementById("star-btn");
const nextBtn = document.getElementById("next");
const prevBtn = document.getElementById("prev");
const prevShlokaBtn = document.getElementById("prev-shloka");
const nextShlokaBtn = document.getElementById("next-shloka");
const timerDisplay = document.getElementById("timer");
const timerBox = document.getElementById("timer-box");
const timerSvg = timerBox ? timerBox.querySelector('svg') : null;
const svgs = document.querySelectorAll(".icon-svg");
const globalHomeBtn = document.getElementById("go-home"); // RESTORED
const goSelectBtn = document.getElementById("go-select");

// 1. UTILITIES & STAR LOGIC
function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
}

function getStarred() {
    return JSON.parse(localStorage.getItem("gita_stars") || "[]");
}

function updateStarIcon() {
    if (!starBtn || !sessionShloka) return;
    const stars = getStarred();
    const starId = `${sessionShloka.c}.${sessionShloka.v}`;
    starBtn.textContent = stars.some(item => item.id === starId) ? "★" : "☆";
}

function toggleStar(e) {
    if (e) e.stopPropagation();
    if (!sessionShloka) return;
    let stars = getStarred();
    const starId = `${sessionShloka.c}.${sessionShloka.v}`;
    const existsIndex = stars.findIndex(item => item.id === starId);
    if (existsIndex > -1) {
        stars.splice(existsIndex, 1);
        showToast("Removed from Starred List");
    } else {
        stars.push({ id: starId, chapter: sessionShloka.c, verse: sessionShloka.v });
        stars.sort((a, b) => (a.chapter - b.chapter) || (a.verse - b.verse));
        showToast("Added to Starred List");
    }
    localStorage.setItem("gita_stars", JSON.stringify(stars));
    updateStarIcon();
}

function showToast(msg) {
    let toast = document.getElementById("toast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toast";
        toast.style.cssText = `position: fixed; bottom: 40px; left: 50%; transform: translateX(-50%); background: var(--accent); color: white; padding: 10px 20px; border-radius: 50px; z-index: 2000; font-size: 14px; transition: opacity 0.3s; pointer-events: none; opacity: 0;`;
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = "1";
    setTimeout(() => { toast.style.opacity = "0"; }, 2000);
}

// 2. SELECTION SCREEN LOGIC
for (let i = 1; i <= 18; i++) {
    const d = document.createElement("div");
    d.textContent = i;
    d.className = "adhyay-card selected";
    d.onclick = () => { d.classList.toggle("selected"); syncToggle(); updateStartState(); };
    if (grid) grid.appendChild(d);
}

if (toggle) {
    toggle.onclick = () => {
        toggle.classList.toggle("active");
        const on = toggle.classList.contains("active");
        document.querySelectorAll(".adhyay-card").forEach(c => c.classList.toggle("selected", on));
        updateStartState();
    };
}

function syncToggle() {
    if (toggle) toggle.classList.toggle("active", [...document.querySelectorAll(".adhyay-card")].every(c => c.classList.contains("selected")));
}

function updateStartState() {
    if (startBtn) startBtn.disabled = document.querySelectorAll(".adhyay-card.selected").length === 0;
}

// 3. CORE PRACTICE LOGIC
fetch("verse.json").then(r => r.json()).then(d => {
    allShlokas = d.map(v => ({ 
        c: v.chapter, 
        v: v.verse, 
        charans: v.charans,
        english_transliteration: v.english_transliteration,
        type: v.type || "shloka" 
    }));
});

function startTimer() {
    clearInterval(timerInterval);
    timerDisplay.textContent = "0.0s"; 
    startTime = Date.now();
    if (timerBox) timerBox.style.color = currentAccentColor;
    if (timerSvg) timerSvg.style.fill = currentAccentColor;
    timerInterval = setInterval(() => {
        timerDisplay.textContent = ((Date.now() - startTime) / 1000).toFixed(1) + "s";
    }, 100);
}

function stopTimer() { clearInterval(timerInterval); }

function navigateAdjacent(step) {
    const chapterVerses = allShlokas.filter(v => v.c === sessionShloka.c).sort((a, b) => a.v - b.v);
    const currentIndex = chapterVerses.findIndex(v => v.v === sessionShloka.v);
    const target = chapterVerses[currentIndex + step];
    if (target) {
        sessionShloka = target; 
        renderShlokaContent(sessionShloka); 
        updateStarIcon();
        if (!flipped) toggleFlip(); 
        else {
            center.style.display = "none";
            text.style.display = "block";
            hintBtn.style.display = "none";
        }
        updateShlokaNavVisibility();
    }
}

function load(keepColor = false) {
    flipped = false;
    if (!keepColor) {
        currentAccentColor = borderColors[colorIndex++ % borderColors.length];
        card.style.borderColor = currentAccentColor;
        svgs.forEach(s => s.style.fill = currentAccentColor);
    }
    hintBtn.style.color =  "var(--text)";
    sessionShloka = shlokas[index]; 
    renderShlokaContent(sessionShloka);
    updateStarIcon();
    prevBtn.style.visibility = (index === 0) ? "hidden" : "visible";
    startTimer();
    updateShlokaNavVisibility();
}

function renderShlokaContent(s) {
    if (!s) return;
    const currentLang = localStorage.getItem("gita_lang") || 'hi';
    const isEnglish = (currentLang === 'en_sanskrit' || currentLang === 'en_iast');
    const isPushpika = s.type === "pushpika" || s.v === 999;

    // Reset Classes
    text.classList.remove("is-shloka", "is-pushpika");
    
    // Logic for language change: Header titles
    const shlokaInfo = isPushpika 
        ? (isEnglish ? `Adhyay ${s.c} Pushpika` : `अध्याय ${s.c} पुष्पिका`) 
        : (isEnglish ? `Adhyay ${s.c} · Verse ${s.v}` : `अध्याय ${s.c} · श्लोक ${s.v}`);
    
    center.textContent = shlokaInfo;
    header.textContent = flipped ? shlokaInfo : "";

    const isOriginalQuestion = (s.c === shlokas[index].c && s.v === shlokas[index].v);
    if (timerBox) {
        timerBox.style.visibility = (isOriginalQuestion && !isPushpika) ? "visible" : "hidden";
    }

    counterDisplay.textContent = `${index + 1} / ${shlokas.length}`;
    text.innerHTML = "";

    if (flipped) {
        // Logic for Pushpika/Shloka identification
        if (isPushpika) {
            text.classList.add("is-pushpika");
            text.setAttribute("data-label", isEnglish ? "PUSHPÍKĀ" : "पुष्पिका");
        } else {
            text.classList.add("is-shloka");
            text.setAttribute("data-label", isEnglish ? "VERSE" : "श्लोक");
        }

        const lines = (currentLang === 'en_iast' && s.english_transliteration) ? s.english_transliteration : s.charans;

        lines.forEach((line, i) => {
            const div = document.createElement("div");
            const isSpeaker = !isPushpika && (
                line.trim().endsWith("उवाच") || 
                line.includes("श्रीभगवानुवाच") ||
                line.toLowerCase().includes("uvāca")
            );
            div.className = isSpeaker ? "shloka-line speaker" : "shloka-line";
            
            let formatted = line.replace(/।।/g, "॥");
            if (isSpeaker) {
                formatted = formatted.replace(/(उवाच|uvāca)/gi, "$1<br>");
            } else {
                formatted = formatted.replace(/।(?![॥।0-9])/g, "।<br>"); 
            }
            div.innerHTML = formatted;
            text.appendChild(div);

            if (isPushpika && i === lines.length - 1) {
                const namasteDiv = document.createElement("div");
                namasteDiv.textContent = "🙏";
                namasteDiv.style.cssText = "text-align:center; margin-top:10px; font-size:2.5rem; width:100%;";
                text.appendChild(namasteDiv);
            }
        });
    }

    if (!flipped) {
        center.style.display = "block";
        text.style.display = "none";
        hintBtn.style.display = "inline";
    } else {
        center.style.display = "none";
        text.style.display = "block";
        hintBtn.style.display = "none";
    }
    hint.style.display = "none";
    hintBtn.classList.remove("active");
}

window.addEventListener('langChanged', () => {
    if (sessionShloka) renderShlokaContent(sessionShloka);
});

function updateShlokaNavVisibility() {
    const s = sessionShloka; 
    if (!flipped || !s) {
        prevShlokaBtn.style.visibility = "hidden";
        nextShlokaBtn.style.visibility = "hidden";
        return;
    }
    const chapterVerses = allShlokas.filter(v => v.c === s.c).sort((a, b) => a.v - b.v);
    const currentIndex = chapterVerses.findIndex(v => v.v === s.v);
    prevShlokaBtn.style.visibility = (currentIndex > 0) ? "visible" : "hidden";
    nextShlokaBtn.style.visibility = (currentIndex < chapterVerses.length - 1) ? "visible" : "hidden";
}

function toggleFlip() {
    if (!flipped) {
        stopTimer();
        flipped = true;
    } else {
        startTimer();
        flipped = false;
        sessionShloka = shlokas[index]; 
    }
    renderShlokaContent(sessionShloka);
    updateStarIcon();
    updateShlokaNavVisibility();
}

function goSelectScreen() {
    stopTimer();
    document.getElementById("practice-screen").style.display = "none";
    document.getElementById("completion-screen").style.display = "none";
    document.getElementById("selection-screen").style.display = "block";
}

// EVENT HANDLERS
if (startBtn) {
    startBtn.onclick = () => {
        const sel = [...document.querySelectorAll(".adhyay-card.selected")].map(e => +e.textContent);
        shlokas = allShlokas.filter(s => sel.includes(s.c) && s.type !== "pushpika");
        if (shlokas.length === 0) return;
        shuffle(shlokas);
        index = 0;
        document.getElementById("selection-screen").style.display = "none";
        document.getElementById("practice-screen").style.display = "block";
        load();
    };
}

if (flipBtn) flipBtn.onclick = toggleFlip;
if (starBtn) starBtn.onclick = toggleStar;
if (globalHomeBtn) globalHomeBtn.onclick = () => { window.location.href = "index.html"; }; // RESTORED

if (hintBtn) {
    hintBtn.onclick = () => {
        const currentLang = localStorage.getItem("gita_lang") || 'hi';
        const lines = (currentLang === 'en_iast' && sessionShloka.english_transliteration) 
            ? sessionShloka.english_transliteration 
            : sessionShloka.charans;

        const firstVerseLine = lines.find(l => {
            const low = l.toLowerCase();
            return !(low.includes("uvāca") || low.includes("उवाच") || low.includes("श्रीभगवानुवाच"));
        });
        if (firstVerseLine) {
            hint.textContent = firstVerseLine.trim().split(" ")[0];
            hint.style.display = "block";
            hint.style.color = "var(--text)"; 
            hint.style.borderColor = currentAccentColor; 
            hintBtn.classList.add("active");
        }
    };
}

if (goSelectBtn) goSelectBtn.onclick = goSelectScreen;
if (document.getElementById("btn-home-complete")) document.getElementById("btn-home-complete").onclick = goSelectScreen;
if (document.getElementById("btn-restart")) {
    document.getElementById("btn-restart").onclick = () => {
        shuffle(shlokas);
        index = 0;
        document.getElementById("completion-screen").style.display = "none";
        document.getElementById("practice-screen").style.display = "block";
        load();
    };
}

if (nextBtn) {
    nextBtn.onclick = () => {
        if (index < shlokas.length - 1) { index++; load(); }
        else {
            stopTimer();
            document.getElementById("practice-screen").style.display = "none";
            document.getElementById("completion-screen").style.display = "block";
        }
    };
}
if (prevBtn) prevBtn.onclick = () => { if (index > 0) { index--; load(); } };

// 4. TOUCH & MOUSE SWIPE GESTURES
let sx = 0, sy = 0, gestureStartTime = 0;
const T_BUFFER = 10; 
const cardBody = document.querySelector(".card-body");

card.addEventListener("touchstart", e => { 
    sx = e.touches[0].clientX; sy = e.touches[0].clientY; gestureStartTime = Date.now();
}, { passive: true });

card.addEventListener("touchmove", e => { 
    const dx = Math.abs(e.touches[0].clientX - sx);
    const dy = Math.abs(e.touches[0].clientY - sy);
    const currentY = e.touches[0].clientY;
    const isScrollable = cardBody.scrollHeight > cardBody.clientHeight;
    if (!isScrollable) { if (e.cancelable) e.preventDefault(); return; }
    if (dx > dy && dx > 5) { if (e.cancelable) e.preventDefault(); return; }
    const isTouchingCardBody = e.target.closest('.card-body');
    if (isTouchingCardBody) {
        const isAtTop = cardBody.scrollTop <= 0;
        const isAtBottom = (cardBody.scrollTop + cardBody.clientHeight) >= (cardBody.scrollHeight - 1);
        if ((isAtTop && (currentY > sy)) || (isAtBottom && (currentY < sy))) {
            if (e.cancelable) e.preventDefault();
        }
    }
}, { passive: false });

card.addEventListener("touchend", e => {
    const dx = e.changedTouches[0].clientX - sx;
    const dy = e.changedTouches[0].clientY - sy;
    const duration = Date.now() - gestureStartTime;
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < -70) nextBtn.click(); else if (dx > 70) prevBtn.click();
        return;
    }
    if (Math.abs(dy) > 60 && duration < 300) {
        const isScrollable = cardBody.scrollHeight > cardBody.clientHeight;
        if (!isScrollable) toggleFlip();
        else {
            const isAtTop = cardBody.scrollTop <= T_BUFFER;
            const isAtBottom = (cardBody.scrollTop + cardBody.clientHeight) >= (cardBody.scrollHeight - T_BUFFER);
            if (dy < -60 && isAtBottom) toggleFlip();
            else if (dy > 60 && isAtTop) toggleFlip();
        }
    }
}, { passive: false });

let mx = 0, my = 0, down = false;
card.addEventListener("mousedown", e => { down = true; mx = e.clientX; my = e.clientY; });
card.addEventListener("mouseup", e => {
    if (!down) return; down = false;
    const dx = e.clientX - mx, dy = e.clientY - my;
    if (Math.abs(dy) > 60) toggleFlip();
    else if (Math.abs(dx) > 100) { if (dx < -100) nextBtn.click(); else prevBtn.click(); }
});

if (prevShlokaBtn) prevShlokaBtn.onclick = (e) => { e.stopPropagation(); navigateAdjacent(-1); };
if (nextShlokaBtn) nextShlokaBtn.onclick = (e) => { e.stopPropagation(); navigateAdjacent(1); };

updateStartState();
