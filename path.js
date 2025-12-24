/**
 * path.js
 * Handles dual-mode logic: Linear Adhyay-Path and Starred List Navigation.
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
const textContainer = document.getElementById("shloka-text");
const headerText = document.getElementById("header-text");
const counterDisplay = document.getElementById("counter");
const card = document.getElementById("card");

// Navigation Elements
const starBtn = document.getElementById("star-btn");
const prevBtn = document.getElementById("prev-btn"); // Inner
const nextBtn = document.getElementById("next-btn"); // Inner

const nextContainer = document.querySelector(".next-container"); // Outer Container
const globalPrev = document.getElementById("prev"); // Outer Button
const globalNext = document.getElementById("next"); // Outer Button
const adhyayHeaderBtn = document.getElementById("go-select");

// --- 1. STAR LOGIC ---

function getStarred() {
    return JSON.parse(localStorage.getItem("gita_stars") || "[]");
}

function toggleStar() {
    const s = currentAdhyayShlokas[index];
    if (!s) return;
    
    let stars = getStarred();
    const starId = `${s.chapter}.${s.verse}`;
    const existsIndex = stars.findIndex(item => item.id === starId);
    
    if (existsIndex > -1) {
        stars.splice(existsIndex, 1);
        // Instant removal logic for Starred Mode
        if (isStarredMode) {
            currentAdhyayShlokas.splice(index, 1);
            if (currentAdhyayShlokas.length === 0) {
                localStorage.setItem("gita_stars", JSON.stringify([]));
                window.location.href = "index.html";
                return;
            }
            // Adjust index so it doesn't go out of bounds after removal
            if (index >= currentAdhyayShlokas.length) index = currentAdhyayShlokas.length - 1;
            loadShloka();
        }
    } else {
        stars.push({ id: starId, chapter: s.chapter, verse: s.verse });
        stars.sort((a, b) => (a.chapter - b.chapter) || (a.verse - b.verse));
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

    // 1. Handle the Header Text
    if (s.type === "pushpika") {
        headerText.textContent = `Adhyay ${s.chapter} Pushpika`;
    } else {
        headerText.textContent = `Adhyay ${s.chapter} · Shloka ${s.verse}`;
    }

    // 2. Handle the Counter Display
    if (isStarredMode) {
        // In Starred Mode, ALWAYS show the count (e.g., 1 / 1), even for pushpikas
        counterDisplay.textContent = `${index + 1} / ${currentAdhyayShlokas.length}`;
    } else {
        // In normal Adhyay Path, hide counter for pushpika, show for shlokas
        if (s.type === "pushpika") {
            counterDisplay.textContent = ""; 
        } else {
            const totalShlokas = currentAdhyayShlokas.filter(item => item.type !== "pushpika").length;
            counterDisplay.textContent = `${index + 1} / ${totalShlokas}`;
        }
    }
    
    textContainer.innerHTML = "";
    const shlokaDiv = document.createElement("div");
    shlokaDiv.id = "view-shloka";
    
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
            namasteDiv.style.textAlign = "center";
            namasteDiv.style.marginTop = "15px";
            namasteDiv.style.fontSize = "2.5rem";
            shlokaDiv.appendChild(namasteDiv);
        }
    });

    const transDiv = document.createElement("div");
    transDiv.id = "view-translation";
    transDiv.style.display = "none"; 
    transDiv.className = "shloka-line";
    transDiv.style.fontStyle = "italic";
    transDiv.style.textAlign = "center";
    transDiv.innerHTML = s.translation_hindi || "अनुवाद उपलब्ध नहीं है।";

    textContainer.appendChild(shlokaDiv);
    textContainer.appendChild(transDiv);

    // MODE-BASED UI LOGIC
    if (isStarredMode) {
        // Starred Mode: Inner buttons HIDDEN
        prevBtn.style.visibility = "hidden";
        nextBtn.style.visibility = "hidden";
        if (nextContainer) nextContainer.style.display = "flex";
        if (adhyayHeaderBtn) adhyayHeaderBtn.style.display = "none";

        // Outer Button Boundaries
        if (globalPrev) globalPrev.style.visibility = (index === 0) ? "hidden" : "visible";
        if (globalNext) globalNext.style.visibility = (index === currentAdhyayShlokas.length - 1) ? "hidden" : "visible";

    } else {
        // Adhyay Mode: Inner buttons VISIBLE, Outer buttons HIDDEN
        prevBtn.style.visibility = (index === 0) ? "hidden" : "visible";
        nextBtn.style.visibility = "visible";
        if (nextContainer) nextContainer.style.display = "none";
        if (adhyayHeaderBtn) adhyayHeaderBtn.style.display = "flex";
    }

    card.scrollTop = 0;
}

// --- 3. NAVIGATION ---

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

function toggleFlip() {
    const sView = document.getElementById("view-shloka");
    const tView = document.getElementById("view-translation");
    if (!sView || !tView) return;
    flipped = !flipped;
    sView.style.display = flipped ? "none" : "block";
    tView.style.display = flipped ? "block" : "none";
}

function showCompletion() {
    readingScreen.style.display = "none";
    completionScreen.style.display = "block";
    const currentChapter = currentAdhyayShlokas[0].chapter;
    document.getElementById("completion-msg").textContent = `You have completed reading Adhyay ${currentChapter}.`;
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
                // Filter: Only include shlokas currently in the star list
                currentAdhyayShlokas = allShlokas.filter(s => 
                    stars.some(st => st.chapter === s.chapter && st.verse === s.verse)
                );
                
                // Final safety check: if filter resulted in 0 shlokas, go home
                if (currentAdhyayShlokas.length === 0) {
                    window.location.href = "index.html";
                    return;
                }

                index = 0;
                selectionScreen.style.display = "none";
                readingScreen.style.display = "block";
                loadShloka();
            } else {
                window.location.href = "index.html";
            }
        }
    });

// Adhyay Selection Grid
for (let i = 1; i <= 18; i++) {
    const d = document.createElement("div");
    d.textContent = i;
    d.className = "adhyay-card";
    d.onclick = () => {
        document.querySelectorAll(".adhyay-card").forEach(c => c.classList.remove("selected"));
        d.classList.add("selected");
        if (startBtn) startBtn.disabled = false;
    };
    if (grid) grid.appendChild(d);
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

starBtn.onclick = (e) => { e.stopPropagation(); toggleStar(); };
nextBtn.onclick = (e) => { e.stopPropagation(); goNext(); };
prevBtn.onclick = (e) => { e.stopPropagation(); goPrev(); };

// Outer Navigation
if (globalNext) globalNext.onclick = (e) => { e.stopPropagation(); goNext(); };
if (globalPrev) globalPrev.onclick = (e) => { e.stopPropagation(); goPrev(); };

document.getElementById("btn-restart").onclick = () => {
    index = 0; completionScreen.style.display = "none";
    readingScreen.style.display = "block"; loadShloka();
};

document.getElementById("btn-next-adhyay").onclick = () => {
    const nextCh = currentAdhyayShlokas[0].chapter + 1;
    currentAdhyayShlokas = allShlokas.filter(s => s.chapter === nextCh);
    index = 0; completionScreen.style.display = "none";
    readingScreen.style.display = "block"; loadShloka();
};

// --- 6. GESTURES ---

let sx = 0, sy = 0;
card.addEventListener("touchstart", e => { 
    sx = e.touches[0].clientX; sy = e.touches[0].clientY; 
}, { passive: false });

card.addEventListener("touchmove", e => { 
    if (e.cancelable) e.preventDefault(); 
}, { passive: false });

card.addEventListener("touchend", e => {
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dy) > 50) toggleFlip(); 
    else if (Math.abs(dx) > 70) {
        if (dx < -70) goNext(); 
        else if (dx > 70) goPrev(); 
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
