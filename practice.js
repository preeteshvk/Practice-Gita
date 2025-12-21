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

function formatShloka(rawText) {
    if (rawText.includes("उवाच")) {
        const parts = rawText.split("उवाच");
        const speaker = parts[0] + "उवाच";
        const shlokaBody = parts.slice(1).join("").trim();
        const lines = shlokaBody.split("\n");
        return `${speaker}\n${lines[0] || ""}\n${lines[1] || ""}`.trim();
    }
    return rawText.trim();
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
    allShlokas = d.map(v => ({ c: v.chapter_number, v: v.verse_number, t: v.text.trim() }));
});

function startTimer() {
    clearInterval(timerInterval);
    startTime = Date.now();
    if (timerBox) timerBox.style.color = currentAccentColor;
    if (timerSvg) timerSvg.style.fill = currentAccentColor;
    timerInterval = setInterval(() => {
        timerDisplay.textContent = ((Date.now() - startTime) / 1000).toFixed(1) + "s";
    }, 100);
}

function stopTimer() { clearInterval(timerInterval); }

function load() {
    flipped = false;
    currentAccentColor = borderColors[colorIndex++ % borderColors.length];
    card.style.borderColor = currentAccentColor;
    svgs.forEach(s => s.style.fill = currentAccentColor);
    hintBtn.style.color = currentAccentColor;

    // Sync top buttons with dynamic card color
    if (globalHomeBtn) globalHomeBtn.style.color = currentAccentColor;
    if (goSelectBtn) goSelectBtn.style.color = currentAccentColor;

    const s = shlokas[index];
    header.textContent = "";
    counterDisplay.textContent = `${index + 1} / ${shlokas.length}`;
    center.textContent = `Adhyay ${s.c} · Shloka ${s.v}`;
    text.innerText = formatShloka(s.t);

    center.style.display = "block";
    text.style.display = "none";
    hint.style.display = "none";
    hintBtn.style.display = "inline";
    prevBtn.style.visibility = (index === 0) ? "hidden" : "visible";

    startTimer();
}

function toggleFlip() {
    if (!flipped) {
        stopTimer();
        header.textContent = center.textContent;
        center.style.display = "none"; text.style.display = "block";
        hintBtn.style.display = "none"; hint.style.display = "none";
    } else {
        startTimer();
        header.textContent = "";
        center.style.display = "block"; text.style.display = "none";
        hintBtn.style.display = "inline";
    }
    flipped = !flipped;
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
        hint.textContent = text.innerText.split("\n").filter(l => !l.includes("उवाच"))[0].split(" ")[0];
        hint.style.display = "block";
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

// LISTEN FOR THEME CHANGES (From theme.js)
window.addEventListener('themeChanged', () => {
    // If we are NOT in active practice mode, clear button colors to use CSS defaults
    if (document.getElementById("practice-screen").style.display !== "block") {
        if (globalHomeBtn) globalHomeBtn.style.color = "";
        if (goSelectBtn) goSelectBtn.style.color = "";
    }
});

updateStartState();