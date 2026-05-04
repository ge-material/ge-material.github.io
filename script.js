let allFiles = []; 
let activeTheme = 'all';
let activeKategorie = 'all';

// Startet die App automatisch beim Laden der Seite
window.onload = initApp;

async function initApp() {
    const grid = document.getElementById('content-grid');
    try {
		const response = await fetch('files.json?v=' + Date.now());
        
        if (!response.ok) {
            grid.innerHTML = `<p style="color:red">Fehler: files.json wurde nicht gefunden.</p>`;
            return;
        }

        allFiles = await response.json();
        
        renderNav();
        applyFilters(); 
    } catch (error) {
        console.error("Script-Fehler:", error);
        grid.innerHTML = `<p style="color:red">Kritischer Fehler beim Laden der Daten.</p>`;
    }
}

/**
 * Erstellt die Navigations-Bubbles in der Sidebar
 */
function renderNav() {
    const themeCloud = document.getElementById('theme-cloud');
    const tagCloud = document.getElementById('tag-cloud');

    if (!themeCloud || !tagCloud) return;

    // Eindeutige Themen und Kategorien sammeln
    const themen = [...new Set(allFiles.flatMap(f => f.themen || []))].sort();
    const kategorien = [...new Set(allFiles.flatMap(f => f.kategorien || []))].sort();

    // Themen-Cloud
    themeCloud.innerHTML = '<span class="tag-badge" id="theme-all" onclick="setFilter(\'theme\', \'all\')">Alle anzeigen</span>';
    themen.forEach(t => {
        const span = document.createElement('span');
        span.className = 'tag-badge';
        span.id = `theme-${t}`;
        span.textContent = t;
        span.onclick = () => setFilter('theme', t);
        themeCloud.appendChild(span);
    });

    // Kategorien-Cloud
    tagCloud.innerHTML = '<span class="tag-badge" id="kat-all" onclick="setFilter(\'kat\', \'all\')">Alle anzeigen</span>';
    kategorien.forEach(k => {
        const span = document.createElement('span');
        span.className = 'tag-badge';
        span.id = `kat-${k}`;
        span.textContent = k;
        span.onclick = () => setFilter('kat', k);
        tagCloud.appendChild(span);
    });
}

/**
 * Setzt den Filter-Status und löst die Filterung aus
 */
function setFilter(type, value) {
    if (type === 'theme') activeTheme = value;
    if (type === 'kat') activeKategorie = value;
    applyFilters();
}

/**
 * Filtert die Liste und aktualisiert die gesamte UI
 */
function applyFilters() {
    const filtered = allFiles.filter(f => {
        const matchTheme = (activeTheme === 'all' || (f.themen || []).includes(activeTheme));
        const matchKat = (activeKategorie === 'all' || (f.kategorien || []).includes(activeKategorie));
        return matchTheme && matchKat;
    });

    renderFiles(filtered);
    updateActiveStyles();
    renderFilterChips();
}

/**
 * Erzeugt die anklickbaren Filter-Chips oberhalb der Ergebnisse
 */
function renderFilterChips() {
    const statusText = document.getElementById('filter-status-text');
    const chipsContainer = document.getElementById('active-chips');
    
    if (!statusText || !chipsContainer) return;
    
    chipsContainer.innerHTML = '';

    if (activeTheme === 'all' && activeKategorie === 'all') {
        statusText.textContent = "Alle Materialien werden angezeigt";
    } else {
        statusText.textContent = "Aktive Filter (klicken zum Entfernen):";
        
        if (activeTheme !== 'all') {
            const chip = document.createElement('div');
            chip.className = 'filter-chip';
            chip.innerHTML = `Thema: ${activeTheme} <span class="close-icon">×</span>`;
            chip.onclick = () => setFilter('theme', 'all');
            chipsContainer.appendChild(chip);
        }

        if (activeKategorie !== 'all') {
            const chip = document.createElement('div');
            chip.className = 'filter-chip';
            chip.innerHTML = `Kategorie: ${activeKategorie} <span class="close-icon">×</span>`;
            chip.onclick = () => setFilter('kat', 'all');
            chipsContainer.appendChild(chip);
        }
    }
}

/**
 * Markiert die aktiven Badges in der Sidebar blau
 */
function updateActiveStyles() {
    document.querySelectorAll('.tag-badge').forEach(el => el.classList.remove('active'));
    
    const tId = activeTheme === 'all' ? 'theme-all' : `theme-${activeTheme}`;
    const kId = activeKategorie === 'all' ? 'kat-all' : `kat-${activeKategorie}`;
    
    if (document.getElementById(tId)) document.getElementById(tId).classList.add('active');
    if (document.getElementById(kId)) document.getElementById(kId).classList.add('active');
}

/**
 * Logik für die kleine Bildvorschau (rechts) oder Audio-Player
 */
function getPreviewHTML(file) {
    const fileNameWithExt = file.url.split('/').pop();
    const fileName = fileNameWithExt.substring(0, fileNameWithExt.lastIndexOf('.'));
    const previewUrl = `preview/${fileName}.jpg`;
    const ext = fileNameWithExt.split('.').pop().toLowerCase();

    // Falls Audio: Direkt den Player anzeigen
    if (['mp3', 'wav', 'ogg'].includes(ext)) {
        return `<div class="audio-box">
                    <audio controls><source src="${file.url}" type="audio/${ext}"></audio>
                </div>`;
    }

    // Für alle anderen: Suche im preview-Ordner nach [dateiname].jpg
    // onerror versteckt das Element, falls kein Bild existiert
    return `<div class="card-preview" id="preview-box-${fileName}">
                <img src="${previewUrl}" alt="" onerror="this.parentElement.style.display='none'">
            </div>`;
}

/**
 * Erstellt die Karten im Inhaltsbereich
 */
function renderFiles(files) {
    const grid = document.getElementById('content-grid');
    if (!grid) return;
    grid.innerHTML = ''; 

    if (files.length === 0) {
        grid.innerHTML = "<p>Kein Material für diese Kombination gefunden.</p>";
        return;
    }

    files.forEach(file => {
        const card = document.createElement('div');
        card.className = 'file-card';
        
        // Kompaktes Layout: Info links, Bild rechts, Buttons unten
        card.innerHTML = `
            <div class="card-main-info">
                <div class="card-text-side">
                    <h3>${file.name}</h3>
                    <div class="theme-list">
                        ${(file.themen || []).map(t => `<span class="theme-label">${t}</span>`).join('')}
                    </div>
                    <div class="card-tags">
                        ${(file.kategorien || []).map(k => `<span class="mini-tag">#${k}</span>`).join('')}
                    </div>
                </div>
                ${getPreviewHTML(file)}
            </div>
            
            <div class="action-buttons">
                <a href="${file.url}" target="_blank" class="preview-btn">Ansehen</a>
                <a href="${file.url}" download class="download-btn">Download</a>
            </div>
        `;
        grid.appendChild(card);
    });
}
