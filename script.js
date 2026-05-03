let allFiles = []; 
let activeTheme = 'all';
let activeKategorie = 'all';

window.onload = initApp;

async function initApp() {
    try {
        const response = await fetch('files.json');
        allFiles = await response.json();
        renderNav();
        applyFilters(); 
    } catch (error) {
        document.getElementById('content-grid').innerHTML = "Fehler beim Laden der JSON-Datei.";
    }
}

function renderNav() {
    const themeCloud = document.getElementById('theme-cloud');
    const tagCloud = document.getElementById('tag-cloud');
    const themen = [...new Set(allFiles.flatMap(f => f.themen || []))].sort();
    const kategorien = [...new Set(allFiles.flatMap(f => f.kategorien || []))].sort();

    themeCloud.innerHTML = '<span class="tag-badge" id="theme-all" onclick="setFilter(\'theme\', \'all\')">Alle anzeigen</span>';
    themen.forEach(t => {
        const span = document.createElement('span');
        span.className = 'tag-badge';
        span.id = `theme-${t}`;
        span.textContent = t;
        span.onclick = () => setFilter('theme', t);
        themeCloud.appendChild(span);
    });

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

function setFilter(type, value) {
    if (type === 'theme') activeTheme = value;
    if (type === 'kat') activeKategorie = value;
    applyFilters();
}

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

function renderFilterChips() {
    const statusText = document.getElementById('filter-status-text');
    const chipsContainer = document.getElementById('active-chips');
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

function updateActiveStyles() {
    document.querySelectorAll('.tag-badge').forEach(el => el.classList.remove('active'));
    const tId = activeTheme === 'all' ? 'theme-all' : `theme-${activeTheme}`;
    const kId = activeKategorie === 'all' ? 'kat-all' : `kat-${activeKategorie}`;
    if (document.getElementById(tId)) document.getElementById(tId).classList.add('active');
    if (document.getElementById(kId)) document.getElementById(kId).classList.add('active');
}

// LOGIK FÜR AUTOMATISCHE VORSCHAU AUS DEM "PREVIEW" ORDNER
function getPreviewHTML(file) {
    // Extrahiere den Dateinamen ohne Endung (z.B. "geschichte" aus "files/geschichte.pdf")
    const fileNameWithExt = file.url.split('/').pop();
    const fileName = fileNameWithExt.substring(0, fileNameWithExt.lastIndexOf('.'));
    const previewUrl = `preview/${fileName}.jpg`;
    const ext = fileNameWithExt.split('.').pop().toLowerCase();

    // Trick: Wir laden ein Bild und nutzen 'onerror', um den Bereich zu verstecken, falls kein JPG existiert
    let previewElement = `<div class="card-preview" id="preview-box-${fileName}">
                            <img src="${previewUrl}" alt="Vorschau" onerror="this.parentElement.style.display='none'">
                          </div>`;

    // Bei Audio-Dateien laden wir trotzdem zusätzlich den Player, falls gewünscht
    if (['mp3', 'wav', 'ogg'].includes(ext)) {
        return `<div class="card-preview audio-box">
                    <audio controls><source src="${file.url}" type="audio/${ext}"></audio>
                </div>`;
    }

    return previewElement;
}

function renderFiles(files) {
    const grid = document.getElementById('content-grid');
    grid.innerHTML = files.length ? '' : '<p>Kein Material gefunden.</p>';

    files.forEach(file => {
        const card = document.createElement('div');
        card.className = 'file-card';
        card.innerHTML = `
            ${getPreviewHTML(file)}
            <div class="card-content">
                <h3>${file.name}</h3>
                <div class="theme-list">${(file.themen || []).map(t => `<span class="theme-label">${t}</span>`).join('')}</div>
                <div class="card-tags">${(file.kategorien || []).map(k => `<span class="mini-tag">#${k}</span>`).join('')}</div>
                <div class="action-buttons">
                    <a href="${file.url}" target="_blank" class="preview-btn">Ansehen</a>
                    <a href="${file.url}" download class="download-btn">Download</a>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}
