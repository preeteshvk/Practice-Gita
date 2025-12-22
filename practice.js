/**
 * practice.js
 * Handles Shlokank practice logic: shuffling, timers, hints, and navigation.
 */

let allShlokas = [], shlokas = [];
let index = 0, flipped = false;
let sessionShloka = null; // Add this to track neighboring shlokas
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


function navigateAdjacent(step) {
    const target = allShlokas.find(v => v.c === sessionShloka.c && v.v === (sessionShloka.v + step));
    if (target) {
        sessionShloka = target; // Update temporary view
        renderShlokaContent(sessionShloka); // Update UI
        
        // Ensure we are on the text side
        if (!flipped) toggleFlip(); 
        else {
            // If already flipped, make sure text is visible (since renderShlokaContent resets to center display)
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

    // Set the session shloka to the current item in the shuffled list
    sessionShloka = shlokas[index]; 
    renderShlokaContent(sessionShloka); // We'll move the rendering to a helper

    prevBtn.style.visibility = (index === 0) ? "hidden" : "visible";
    startTimer();
    updateShlokaNavVisibility();
}

function renderShlokaContent(s) {
    const shlokaInfo = `Adhyay ${s.c} · Shloka ${s.v}`;
    center.textContent = shlokaInfo;
    
    if (flipped) {
        header.textContent = shlokaInfo;
    } else {
        header.textContent = "";
    }

    // NEW: Timer Visibility Logic
    // Hide timer if we are viewing a neighboring shloka
    const isOriginalQuestion = (s.c === shlokas[index].c && s.v === shlokas[index].v);
    if (timerBox) {
        timerBox.style.visibility = isOriginalQuestion ? "visible" : "hidden";
    }

    counterDisplay.textContent = `${index + 1} / ${shlokas.length}`;

    text.innerHTML = "";
    s.charans.forEach(line => {
        const div = document.createElement("div");
        const isSpeaker = line.trim().endsWith("उवाच");
        div.className = isSpeaker ? "shloka-line speaker" : "shloka-line";
        
        let formatted = line.replace(/।।/g, "॥");
        if (isSpeaker) {
            formatted = formatted.replace(/उवाच/g, "उवाच<br>");
        } else {
            formatted = formatted.replace(/।(?![॥।0-9])/g, "।<br>"); 
        }
        div.innerHTML = formatted;
        text.appendChild(div);
    });

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

function updateShlokaNavVisibility() {
    const s = sessionShloka; // Check against the shloka currently being viewed
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

function toggleFlip() {
    if (!flipped) {
        stopTimer();
        flipped = true;
    } else {
        startTimer();
        flipped = false;
        // Reset to original question (Timer will become visible in renderShlokaContent)
        sessionShloka = shlokas[index]; 
    }
    
    renderShlokaContent(sessionShloka);
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
