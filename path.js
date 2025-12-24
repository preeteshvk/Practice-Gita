/**
 * path.js
 * Handles the linear reading logic for Adhyay-Path.
 * Features: Horizontal swipe for navigation, Toggle Translation with Vertical swipes.
 */

let allShlokas = [], currentAdhyayShlokas = [];
let index = 0;
let flipped = false; // Tracks if we are showing the translation
const accentColor = "var(--accent)";

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

const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");

// 1. ADHYAY SELECTION
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
            charans: v.charans,
            translation_hindi: v.hindi_translation,
            type: v.type || "shloka"
        }));
    });

// 3. CORE RENDERING FUNCTION
function loadShloka() {
    const s = currentAdhyayShlokas[index];
    if (!s) return;

    flipped = false; // Reset to shloka view on every new load
    
    // Header & Counter Logic
    if (s.type === "pushpika") {
        headerText.textContent = `Adhyay ${s.chapter} Pushpika`;
        counterDisplay.textContent = ""; 
    } else {
        headerText.textContent = `Adhyay ${s.chapter} · Shloka ${s.verse}`;
        // Exclude pushpika from the total count
        const actualShlokaCount = currentAdhyayShlokas.filter(item => item.type !== "pushpika").length;
        counterDisplay.textContent = `${index + 1} / ${actualShlokaCount}`;
    }
    
    textContainer.innerHTML = "";

    // SANSKRIT VIEW
    const shlokaDiv = document.createElement("div");
    shlokaDiv.id = "view-shloka";
    
    s.charans.forEach((line, i) => {
        const div = document.createElement("div");
        const isSpeaker = s.type !== "pushpika" && 
                         (line.trim().endsWith("उवाच") || line.includes("श्रीभगवानुवाच"));
        
        div.className = isSpeaker ? "shloka-line speaker" : "shloka-line";
        
        let formatted = line.replace(/।।/g, "॥");
        if (isSpeaker) {
            formatted = formatted.replace(/उवाच/g, "उवाच<br>");
        } else {
            formatted = formatted.replace(/।(?![॥।0-9])/g, "।<br>"); 
        }
        div.innerHTML = formatted;
        shlokaDiv.appendChild(div);

        if (s.type === "pushpika" && i === s.charans.length - 1) {
            const namasteDiv = document.createElement("div");
            namasteDiv.textContent = "🙏";
            namasteDiv.style.textAlign = "center";
            namasteDiv.style.marginTop = "15px";
            namasteDiv.style.fontSize = "2.5rem";
            shlokaDiv.appendChild(namasteDiv);
        }
    });

    // TRANSLATION VIEW
    const transDiv = document.createElement("div");
    transDiv.id = "view-translation";
    transDiv.style.display = "none"; 
    transDiv.className = "shloka-line";
    transDiv.style.fontStyle = "italic";
    transDiv.style.color = "var(--text)";
    transDiv.style.textAlign = "center";
    transDiv.innerHTML = s.translation_hindi || "अनुवाद उपलब्ध नहीं है।";

    textContainer.appendChild(shlokaDiv);
    textContainer.appendChild(transDiv);

    // Navigation UI
    prevBtn.style.visibility = (index === 0) ? "hidden" : "visible";
    nextBtn.style.visibility = "visible"; 
    [prevBtn, nextBtn].forEach(btn => {
        const svg = btn.querySelector('svg');
        if (svg) svg.style.fill = accentColor;
    });

    card.scrollTop = 0;
}

// 4. TOGGLE LOGIC
function toggleFlip() {
    const sView = document.getElementById("view-shloka");
    const tView = document.getElementById("view-translation");
    if (!sView || !tView) return;

    flipped = !flipped;

    if (flipped) {
        sView.style.display = "none";
        tView.style.display = "block";
    } else {
        sView.style.display = "block";
        tView.style.display = "none";
    }
}

// 5. NAVIGATION LOGIC
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

// 6. EVENT HANDLERS
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

if (nextBtn) nextBtn.onclick = (e) => { e.stopPropagation(); goNext(); };
if (prevBtn) prevBtn.onclick = (e) => { e.stopPropagation(); goPrev(); };

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

// 7. GESTURES & CONTROLS
let sx = 0, sy = 0;

card.addEventListener("touchstart", e => { 
    sx = e.touches[0].clientX; 
    sy = e.touches[0].clientY; 
}, { passive: false });

card.addEventListener("touchmove", e => { 
    if (e.cancelable) e.preventDefault(); 
}, { passive: false });

card.addEventListener("touchend", e => {
    const dx = e.changedTouches[0].clientX - sx;
    const dy = e.changedTouches[0].clientY - sy;

    // Vertical Swipe (Toggle between Translation and Sanskrit)
    if (Math.abs(dy) > 50) {
        toggleFlip();
    } 
    // Horizontal Swipe (Navigation)
    else if (Math.abs(dx) > 70) {
        if (dx < -70) goNext();
        else if (dx > 70) goPrev();
    }
}, { passive: false });

// Mouse support
let mx = 0, my = 0, down = false;
card.addEventListener("mousedown", e => { 
    down = true; mx = e.clientX; my = e.clientY; 
});
card.addEventListener("mouseup", e => {
    if (!down) return; down = false;
    const dx = e.clientX - mx, dy = e.clientY - my;
    if (Math.abs(dy) > 60) {
        toggleFlip();
    } else if (Math.abs(dx) > 100) {
        if (dx < -100) goNext();
        else goPrev();
    }
});
