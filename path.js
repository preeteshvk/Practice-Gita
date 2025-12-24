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
            position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%);
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

    // Reset flipped state
    flipped = false; 
    updateStarIcon();
    textContainer.innerHTML = "";

    headerText.textContent = (s.type === "pushpika") ? 
        `Adhyay ${s.chapter} Pushpika` : `Adhyay ${s.chapter} · Shloka ${s.verse}`;

    // Counter Display Logic
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
    
    // Front Side: Shloka Container
    const shlokaDiv = document.createElement("div");
    shlokaDiv.id = "view-shloka";
    // Inline style to ensure it starts visible
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

    // Back Side: Translation Container
    const transDiv = document.createElement("div");
    transDiv.id = "view-translation";
    // INLINE CSS is more reliable for the initial hide than setting it later
    transDiv.style.cssText = "display: none; font-style: italic; text-align: center;";
    transDiv.className = "shloka-line";
    transDiv.innerHTML = s.translation_hindi || "अनुवाद उपलब्ध नहीं है।";

    textContainer.appendChild(shlokaDiv);
    textContainer.appendChild(transDiv);

    // Nav Button States
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

    card.scrollTop = 0;
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
                currentAdhyayShlokas = allShlokas.filter(s => 
                    stars.some(st => st.chapter === s.chapter && st.verse === s.verse)
                );
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

starBtn.onclick = toggleStar;
if (flipBtn) flipBtn.onclick = toggleFlip;
nextBtn.onclick = (e) => { e.stopPropagation(); goNext(); };
prevBtn.onclick = (e) => { e.stopPropagation(); goPrev(); };

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
