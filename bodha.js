/**
 * bodha.js
 * Handles Charan Bodha practice logic: Identify verse from first charan.
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
const starBtn = document.getElementById("star-btn"); // Added Star Btn
const nextBtn = document.getElementById("next");
const prevBtn = document.getElementById("prev");
const prevShlokaBtn = document.getElementById("prev-shloka");
const nextShlokaBtn = document.getElementById("next-shloka");
const timerDisplay = document.getElementById("timer");
const timerBox = document.getElementById("timer-box");
const timerSvg = timerBox ? timerBox.querySelector('svg') : null;
const svgs = document.querySelectorAll(".icon-svg");
const globalHomeBtn = document.getElementById("go-home");
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

// 3. CORE LOGIC
fetch("verse.json").then(r => r.json()).then(d => {
    allShlokas = d.map(v => ({ 
        c: v.chapter, 
        v: v.verse, 
        t: v.full_text, 
        charans: v.charans,
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
        updateStarIcon(); // Sync star on navigation
        
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
    hintBtn.style.color = currentAccentColor;
    sessionShloka = shlokas[index]; 
    renderShlokaContent(sessionShloka);
    updateStarIcon(); // Sync star on load
    prevBtn.style.visibility = (index === 0) ? "hidden" : "visible";
    startTimer();
    updateShlokaNavVisibility();
}

function renderShlokaContent(s) {
    const isPushpika = s.type === "pushpika" || s.v === 999;

    if (isPushpika) {
        center.innerHTML = `<div style="font-size: 1.1em; font-style: italic; opacity: 0.8;">Chapter Conclusion...</div>`;
        header.textContent = flipped ? `Adhyay ${s.c} Pushpika` : "Pushpika";
    } else {
        // 1. Filter out speaker lines
        const actualVerseLines = s.charans.filter(line => 
            !line.trim().endsWith("उवाच") && !line.includes("श्रीभगवानुवाच")
        );

        const firstLine = actualVerseLines[0] || "";
        let firstCharan = "";
        let secondCharan = "";

        // 2. LOGIC: Extract Hint (Handles comma at end of line like 2.5)
        if (firstLine.includes(',')) {
            const parts = firstLine.split(',');
            firstCharan = parts[0].trim();
            // If comma is at the end, parts[1] is empty. If so, take the next line.
            secondCharan = (parts[1] && parts[1].trim().length > 0) 
                           ? parts[1].trim() 
                           : (actualVerseLines[1] ? actualVerseLines[1].trim() : "");
        } else {
            // No comma at all, hint is definitely the next line
            firstCharan = firstLine.trim();
            secondCharan = actualVerseLines[1] ? actualVerseLines[1].trim() : "";
        }

        // 3. Clean up for display
        const cleanFirst = firstCharan.replace(/[॥।\d.]/g, "").trim();
        const cleanSecond = secondCharan.replace(/[॥।\d.]/g, "").trim();

        center.innerHTML = `<div style="font-size: 1.2em; font-weight: 500;">${cleanFirst}...</div>`;
        header.textContent = flipped ? `Adhyay ${s.c} · Shloka ${s.v}` : "Identify the Verse";
        
        hint.textContent = cleanSecond || "---"; 
    }

    // --- Remaining logic stays exactly as in your previous working code ---
    counterDisplay.textContent = `${index + 1} / ${shlokas.length}`;
    const isOriginalQuestion = (s.c === shlokas[index].c && s.v === shlokas[index].v);
    if (timerBox) {
        timerBox.style.visibility = (isOriginalQuestion && !isPushpika) ? "visible" : "hidden";
    }

    text.innerHTML = "";
    s.charans.forEach((line, i) => {
        const div = document.createElement("div");
        const isSpeaker = !isPushpika && (line.trim().endsWith("उवाच") || line.includes("श्रीभगवानुवाच"));
        div.className = isSpeaker ? "shloka-line speaker" : "shloka-line";
        let formatted = line.replace(/।।/g, "॥");
        if (isSpeaker) {
            formatted = formatted.replace(/(उवाच)/g, "$1<br>");
        } else {
            formatted = formatted.replace(/।(?![॥।0-9])/g, "।<br>"); 
        }
        div.innerHTML = formatted;
        text.appendChild(div);

        if (isPushpika && i === s.charans.length - 1) {
            const namasteDiv = document.createElement("div");
            namasteDiv.textContent = "🙏";
            namasteDiv.style.cssText = "text-align:center; margin-top:10px; font-size:2.5rem; width:100%;";
            text.appendChild(namasteDiv);
        }
    });

    if (!flipped) {
        center.style.display = "block";
        text.style.display = "none";
        hintBtn.style.display = isPushpika ? "none" : "inline";
    } else {
        center.style.display = "none";
        text.style.display = "block";
        hintBtn.style.display = "none";
    }
    hint.style.display = "none";
    hintBtn.classList.remove("active");
}

if (hintBtn) {
    hintBtn.onclick = () => {
        hint.style.display = "block";
        hint.style.color = "var(--text)"; 
        hint.style.borderColor = currentAccentColor; 
        hintBtn.classList.add("active");
    };
}

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
    updateStarIcon(); // Sync star on flip
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
if (starBtn) starBtn.onclick = toggleStar; // Set Star Listener

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

// 4. GESTURES
let sx = 0, sy = 0;
card.addEventListener("touchstart", e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: false });
card.addEventListener("touchmove", e => { 
    const dx = Math.abs(e.touches[0].clientX - sx);
    const dy = Math.abs(e.touches[0].clientY - sy);
    if (dx > 10 || dy > 10) e.preventDefault(); 
}, { passive: false });

card.addEventListener("touchend", e => {
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dy) > 50) toggleFlip();
    else if (dx < -60) nextBtn.click();
    else if (dx > 60) prevBtn.click();
}, { passive: false });

let mx = 0, my = 0, down = false;
card.addEventListener("mousedown", e => { down = true; mx = e.clientX; my = e.clientY; });
card.addEventListener("mouseup", e => {
    if (!down) return; down = false;
    const dx = e.clientX - mx, dy = e.clientY - my;
    if (Math.abs(dy) > 60) toggleFlip();
    else if (dx < -80) nextBtn.click();
    else if (dx > 80) prevBtn.click();
});

if (prevShlokaBtn) prevShlokaBtn.onclick = (e) => { e.stopPropagation(); navigateAdjacent(-1); };
if (nextShlokaBtn) nextShlokaBtn.onclick = (e) => { e.stopPropagation(); navigateAdjacent(1); };

updateStartState();
