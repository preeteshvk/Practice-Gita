/**
 * practice.js
 * Handles Shlokank practice logic: shuffling, timers, hints, and navigation.
 */

let allShlokas = [], shlokas = [];
let index = 0, flipped = false;
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

// 1. UTILITIES
function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
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
    allShlokas = d.map(v => ({ c: v.chapter, v: v.verse, t: v.full_text, charans: v.charans }));
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

function updateShlokaNavVisibility() {
    const s = shlokas[index];
    // Only visible if on Answer page (flipped)
    if (!flipped || !s) {
        prevShlokaBtn.style.visibility = "hidden";
        nextShlokaBtn.style.visibility = "hidden";
        return;
    }

    const chapterVerses = allShlokas.filter(v => v.c === s.c);
    const minV = Math.min(...chapterVerses.map(v => v.v));
    const maxV = Math.max(...chapterVerses.map(v => v.v));

    prevShlokaBtn.style.visibility = (s.v > minV) ? "visible" : "hidden";
    nextShlokaBtn.style.visibility = (s.v < maxV) ? "visible" : "hidden";
}

function navigateAdjacent(step) {
    const current = shlokas[index];
    const target = allShlokas.find(v => v.c === current.c && v.v === (current.v + step));
    if (target) {
        shlokas[index] = target;
        // Pass 'true' to keep the theme/border color constant
        load(true); 
        if (!flipped) toggleFlip();
    }
}


function load(keepColor = false) {
    flipped = false;
    
    // Only the CARD BORDER and the main NEXT/PREV buttons at the bottom 
    // will change colors. Everything else stays constant.
    if (!keepColor) {
        currentAccentColor = borderColors[colorIndex++ % borderColors.length];
        card.style.borderColor = currentAccentColor;
        
        // These are the large bottom-row navigation icons
        svgs.forEach(s => s.style.fill = currentAccentColor);
    }

    // Hint button keeps the dynamic accent to show it's "part of the challenge"
    hintBtn.style.color = currentAccentColor;

    const s = shlokas[index];
    header.textContent = "";
    counterDisplay.textContent = `${index + 1} / ${shlokas.length}`;
    center.textContent = `Adhyay ${s.c} · Shloka ${s.v}`;

    // BUILD SHLOKA HTML
    text.innerHTML = "";
    s.charans.forEach(line => {
        const div = document.createElement("div");
        const isSpeaker = line.trim().endsWith("उवाच");
        div.className = isSpeaker ? "shloka-line speaker" : "shloka-line";
        
        // Removed: div.style.color = currentAccentColor; 
        // (Now handled by .speaker class in CSS using var(--accent))

        let formatted = line.replace(/।।/g, "॥");
        if (isSpeaker) {
            formatted = formatted.replace(/उवाच/g, "उवाच<br>");
        } else {
            formatted = formatted.replace(/।(?![॥।0-9])/g, "।<br>"); 
        }
        div.innerHTML = formatted;
        text.appendChild(div);
    });

    // UI State Resets
    center.style.display = "block";
    text.style.display = "none";
    hint.style.display = "none";
    hintBtn.style.display = "inline";
    hintBtn.classList.remove("active");

    prevBtn.style.visibility = (index === 0) ? "hidden" : "visible";

    startTimer();
    updateShlokaNavVisibility();
}

function toggleFlip() {
    if (!flipped) {
        stopTimer();
        header.textContent = center.textContent;
        center.style.display = "none"; 
        text.style.display = "block";
        hintBtn.style.display = "none"; 
        hint.style.display = "none";
    } else {
        startTimer();
        header.textContent = "";
        center.style.display = "block"; 
        text.style.display = "none";
        hintBtn.style.display = "inline";
    }
    flipped = !flipped;
    updateShlokaNavVisibility();
}

// Navigation Functions
function goSelectScreen() {
    stopTimer();
    document.getElementById("practice-screen").style.display = "none";
    document.getElementById("completion-screen").style.display = "none";
    document.getElementById("selection-screen").style.display = "block";
    if (globalHomeBtn) globalHomeBtn.style.color = "";
    if (goSelectBtn) goSelectBtn.style.color = "";
}

// EVENT HANDLERS
if (startBtn) {
    startBtn.onclick = () => {
        const sel = [...document.querySelectorAll(".adhyay-card.selected")].map(e => +e.textContent);
        shlokas = allShlokas.filter(s => sel.includes(s.c));
        if (shlokas.length === 0) return;
        shuffle(shlokas);
        index = 0;
        document.getElementById("selection-screen").style.display = "none";
        document.getElementById("practice-screen").style.display = "block";
        load();
    };
}

if (flipBtn) flipBtn.onclick = toggleFlip;

if (hintBtn) {
    hintBtn.onclick = () => {
        const lines = [...text.querySelectorAll(".shloka-line")];
        const verseLine = lines.find(l => !l.classList.contains("speaker"));
        if (verseLine) {
            const firstLineText = verseLine.innerHTML.split("<br>")[0].trim();
            hint.textContent = firstLineText.split(" ")[0];
            
            hint.style.display = "block";
            
            // CHANGE: Match the main question text color instead of accent color
            hint.style.color = "var(--text)"; 
            
            // Keep the box border matching the card theme
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
            if (globalHomeBtn) globalHomeBtn.style.color = "";
            if (goSelectBtn) goSelectBtn.style.color = "";
        }
    };
}
if (prevBtn) prevBtn.onclick = () => { if (index > 0) { index--; load(); } };

// 4. TOUCH & MOUSE SWIPE GESTURES
let sx = 0, sy = 0;
card.addEventListener("touchstart", e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: false });
card.addEventListener("touchmove", e => { e.preventDefault(); }, { passive: false });
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

window.addEventListener('themeChanged', () => {
    if (document.getElementById("practice-screen").style.display !== "block") {
        if (globalHomeBtn) globalHomeBtn.style.color = "";
        if (goSelectBtn) goSelectBtn.style.color = "";
    }
});

updateStartState();

if (prevShlokaBtn) prevShlokaBtn.onclick = (e) => { e.stopPropagation(); navigateAdjacent(-1); };
if (nextShlokaBtn) nextShlokaBtn.onclick = (e) => { e.stopPropagation(); navigateAdjacent(1); };
