let allFiles = [];
let activeTheme = null;
let activeCategory = null;

// E-Mail-Schutz
function injectEmail() {
    const user = "kontakt";      // Bitte anpassen
    const domain = "ge-material"; // Bitte anpassen
    const tld = "at";            // Bitte anpassen
    const email = user + "@" + domain + "." + tld;
    const container = document.getElementById('email-placeholder');
    if (container) {
        container.innerHTML = `<a href="mailto:${email}">${email}</a>`;
    }
}

async function loadData() {
    try {
        const response = await fetch('files.json?v=' + Date.now());
        allFiles = await response.json();
        renderFilters();
        renderFiles(allFiles);
    } catch (e) {
        console.error("Ladefehler:", e);
    }
}

function renderFilters() {
    const themes = [...new Set(allFiles.flatMap(f => f.themen || []))].sort();
    const categories = [...new Set(allFiles.flatMap(f => f.kategorien || []))].sort();

    const themeList = document.getElementById('theme-filter');
    const catList = document.getElementById('category-filter');

    themeList.innerHTML = themes.map(t => 
        `<li onclick="filterBy('theme', '${t}', this)">${t}</li>`).join('');
    catList.innerHTML = categories.map(c => 
        `<li onclick="filterBy('category', '${c}', this)">${c}</li>`).join('');
}

function filterBy(type, value, element) {
    if (type === 'theme') {
        const isSame = (activeTheme === value);
        // Alle aktiven Klassen in dieser Gruppe entfernen
        document.querySelectorAll('#theme-filter li').forEach(li => li.classList.remove('active'));
        // Wenn es ein neuer Filter ist, setzen und Klasse hinzufügen
        activeTheme = isSame ? null : value;
        if (activeTheme) element.classList.add('active');
    } else {
        const isSame = (activeCategory === value);
        document.querySelectorAll('#category-filter li').forEach(li => li.classList.remove('active'));
        activeCategory = isSame ? null : value;
        if (activeCategory) element.classList.add('active');
    }

    const filtered = allFiles.filter(f => {
        const tMatch = !activeTheme || (f.themen && f.themen.includes(activeTheme));
        const cMatch = !activeCategory || (f.kategorien && f.kategorien.includes(activeCategory));
        return tMatch && cMatch;
    });
    renderFiles(filtered);
}

function getPreviewHTML(file) {
    const ext = file.url.split('.').pop().toLowerCase();
    const fileName = file.url.split('/').pop().split('.')[0];
    if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) {
        return `<div class="card-preview"><img src="${file.url}" alt="Vorschau"></div>`;
    }
    return `<div class="card-preview"><img src="preview/${fileName}.jpg" onerror="this.parentElement.style.display='none'"></div>`;
}

function renderFiles(files) {
    const grid = document.getElementById('content-grid');
    if (files.length === 0) {
        grid.innerHTML = '<p style="padding:20px; color:#64748b;">Kein Material für diese Filterkombination gefunden.</p>';
        return;
    }
    grid.innerHTML = files.map(file => `
        <div class="file-card">
            <div class="card-main-info">
                <div class="card-text-side">
                    <h3 style="margin:0 0 10px 0">${file.name}</h3>
                    <div>${(file.themen || []).map(t => `<span class="theme-label">${t}</span>`).join('')}</div>
                    <div style="margin-top:8px">${(file.kategorien || []).map(k => `<span class="mini-tag">#${k}</span>`).join('')}</div>
                    ${file.info ? `<div class="card-info">${file.info}</div>` : ''}
                </div>
                ${getPreviewHTML(file)}
            </div>
            <div class="action-buttons">
                <a href="${file.url}" target="_blank" class="preview-btn">Ansehen</a>
                <a href="${file.url}" download class="download-btn">Download</a>
            </div>
        </div>
    `).join('');
}

document.getElementById('reset-filter').onclick = () => {
    activeTheme = null;
    activeCategory = null;
    document.querySelectorAll('.filter-list li').forEach(li => li.classList.remove('active'));
    renderFiles(allFiles);
};

window.addEventListener('DOMContentLoaded', () => {
    loadData();
    injectEmail();
});
