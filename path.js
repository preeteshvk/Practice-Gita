/**
 * path.js
 * Handles the linear reading logic for Adhyay-Path.
 */

let allShlokas = [], currentAdhyayShlokas = [];
let index = 0;
const accentColor = "var(--accent)"; // Branding color

// DOM Elements
const grid = document.getElementById("grid");
const startBtn = document.getElementById("start");
const readingScreen = document.getElementById("reading-screen");
const selectionScreen = document.getElementById("selection-screen");
const completionScreen = document.getElementById("completion-screen");
const textContainer = document.getElementById("shloka-text");
const headerText = document.getElementById("header-text");
const counterDisplay = document.getElementById("counter");
const card = document.getElementById("card");

// Navigation Elements
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");

// 1. ADHYAY SELECTION (Single Select Logic)
for (let i = 1; i <= 18; i++) {
    const d = document.createElement("div");
    d.textContent = i;
    d.className = "adhyay-card";
    d.onclick = () => {
        document.querySelectorAll(".adhyay-card").forEach(c => c.classList.remove("selected"));
        d.classList.add("selected");
        startBtn.disabled = false;
    };
    if (grid) grid.appendChild(d);
}

// 2. DATA FETCHING
fetch("verse.json")
    .then(r => r.json())
    .then(d => {
        allShlokas = d.map(v => ({ 
            chapter: v.chapter, 
            verse: v.verse, 
            charans: v.charans 
        }));
    });

// 3. CORE RENDERING FUNCTION
function loadShloka() {
    const s = currentAdhyayShlokas[index];
    
    // Update Header & Counter
    headerText.textContent = `Adhyay ${s.chapter} · Shloka ${s.verse}`;
    counterDisplay.textContent = `${index + 1} / ${currentAdhyayShlokas.length}`;
    
    // Build Shloka Text
    textContainer.innerHTML = "";
    s.charans.forEach(line => {
        const div = document.createElement("div");
        const isSpeaker = line.trim().endsWith("उवाच") || line.includes("श्रीभगवानुवाच");
        div.className = isSpeaker ? "shloka-line speaker" : "shloka-line";
        
        let formatted = line.replace(/।।/g, "॥");
        if (isSpeaker) {
            formatted = formatted.replace(/उवाच/g, "उवाच<br>");
        } else {
            formatted = formatted.replace(/।(?![॥।0-9])/g, "।<br>"); 
        }
        div.innerHTML = formatted;
        textContainer.appendChild(div);
    });

    // Handle Button Visibility & Color
    prevBtn.style.visibility = (index === 0) ? "hidden" : "visible";
    nextBtn.style.visibility = "visible"; // Ensure right arrow is always visible

    // Apply color to the SVGs explicitly
    [prevBtn, nextBtn].forEach(btn => {
        const svg = btn.querySelector('svg');
        if (svg) svg.style.fill = accentColor;
    });

    card.scrollTop = 0;
}

// 4. NAVIGATION LOGIC
function goNext() {
    if (index < currentAdhyayShlokas.length - 1) {
        index++;
        loadShloka();
    } else {
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
    document.getElementById("completion-msg").textContent = `You have completed reading Adhyay ${currentChapter}.`;
    
    const nextAdhyayBtn = document.getElementById("btn-next-adhyay");
    if (nextAdhyayBtn) {
        nextAdhyayBtn.style.display = (currentChapter < 18) ? "block" : "none";
    }
}

// 5. EVENT HANDLERS
if (startBtn) {
    startBtn.onclick = () => {
        const selected = document.querySelector(".adhyay-card.selected");
        if (!selected) return;
        
        const adhyayNum = parseInt(selected.textContent);
        currentAdhyayShlokas = allShlokas.filter(s => s.chapter === adhyayNum);
        
        index = 0;
        selectionScreen.style.display = "none";
        readingScreen.style.display = "block";
        loadShloka();
    };
}

// Attach click events
if (nextBtn) nextBtn.onclick = (e) => { e.stopPropagation(); goNext(); };
if (prevBtn) prevBtn.onclick = (e) => { e.stopPropagation(); goPrev(); };

// Completion Actions
document.getElementById("btn-restart").onclick = () => {
    index = 0;
    completionScreen.style.display = "none";
    readingScreen.style.display = "block";
    loadShloka();
};

document.getElementById("btn-next-adhyay").onclick = () => {
    const currentChapter = currentAdhyayShlokas[0].chapter;
    currentAdhyayShlokas = allShlokas.filter(s => s.chapter === currentChapter + 1);
    index = 0;
    completionScreen.style.display = "none";
    readingScreen.style.display = "block";
    loadShloka();
};

// 6. GESTURES
let sx = 0;

// 1. Change passive to false to allow us to "lock" the screen
card.addEventListener("touchstart", e => { 
    sx = e.touches[0].clientX; 
}, { passive: false });

// 2. Add touchmove to stop the browser from dragging the text/card
card.addEventListener("touchmove", e => { 
    if (e.cancelable) e.preventDefault(); 
}, { passive: false });

card.addEventListener("touchend", e => {
    const dx = e.changedTouches[0].clientX - sx;
    if (dx < -70) {
        goNext();
    } else if (dx > 70) {
        goPrev();
    }
}, { passive: false });

// Mouse logic remains mostly same but added safety
let mx = 0, down = false;
card.addEventListener("mousedown", e => { 
    down = true; 
    mx = e.clientX; 
});

card.addEventListener("mouseup", e => {
    if (!down) return; 
    down = false;
    const dx = e.clientX - mx;
    if (dx < -100) goNext();
    if (dx > 100) goPrev();
});
