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
}

function updateActiveStyles() {
    document.querySelectorAll('.tag-badge').forEach(el => el.classList.remove('active'));
    const tId = activeTheme === 'all' ? 'theme-all' : `theme-${activeTheme}`;
    const kId = activeKategorie === 'all' ? 'kat-all' : `kat-${activeKategorie}`;
    if (document.getElementById(tId)) document.getElementById(tId).classList.add('active');
    if (document.getElementById(kId)) document.getElementById(kId).classList.add('active');
}

function renderFiles(files) {
    const grid = document.getElementById('content-grid');
    grid.innerHTML = files.length ? '' : '<p>Kein Material gefunden.</p>';

    files.forEach(file => {
        const card = document.createElement('div');
        card.className = 'file-card';
        card.innerHTML = `
            <h3>${file.name}</h3>
            <div class="theme-list">${(file.themen || []).map(t => `<span class="theme-label">${t}</span>`).join('')}</div>
            <div class="card-tags">${(file.kategorien || []).map(k => `<span class="mini-tag">#${k}</span>`).join('')}</div>
            <a href="${file.url}" download class="download-btn">Download</a>
        `;
        grid.appendChild(card);
    });
}
