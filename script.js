let allFiles = [];
let activeTheme = null;
let activeCategory = null;

function injectEmail() {
    const u1 = "github";      
    const u2 = "material";      
    const u3 = "ge";      
    const domain = "gmail";
    const tld = "com";            
    const email = u3 + '.' + u2 + '.' + u1 + "@" + domain + "." + tld;
    const container = document.getElementById('email-placeholder');
    if (container) {
        container.innerHTML = `<a href="mailto:${email}" style="color:#3498db;text-decoration:none;font-weight:bold;">${email}</a>`;
    }
}

async function loadData() {
    try {
        const response = await fetch('files.json?v=' + Date.now());
        allFiles = await response.json();
        renderFilters();
        renderFiles(allFiles);
    } catch (e) {
        console.error("Fehler beim Laden:", e);
    }
}

function renderFilters() {
    const themes = [...new Set(allFiles.flatMap(f => f.themen || []))].sort();
    const categories = [...new Set(allFiles.flatMap(f => f.kategorien || []))].sort();

    const themeList = document.getElementById('theme-filter');
    const catList = document.getElementById('category-filter');

    // "Alle anzeigen" Button für Themen
    themeList.innerHTML = `<li id="all-themes" class="${!activeTheme ? 'active' : ''}" onclick="filterBy('theme', null)">Alle anzeigen</li>` + 
        themes.map(t => `<li class="${activeTheme === t ? 'active' : ''}" onclick="filterBy('theme', '${t}')">${t}</li>`).join('');

    // "Alle anzeigen" Button für Kategorien
    catList.innerHTML = `<li id="all-cats" class="${!activeCategory ? 'active' : ''}" onclick="filterBy('category', null)">Alle anzeigen</li>` + 
        categories.map(c => `<li class="${activeCategory === c ? 'active' : ''}" onclick="filterBy('category', '${c}')">${c}</li>`).join('');
    
    renderActiveFilterBadges();
}

function filterBy(type, value) {
    if (type === 'theme') {
        activeTheme = value;
    } else {
        activeCategory = value;
    }

    const filtered = allFiles.filter(f => {
        const tMatch = !activeTheme || (f.themen && f.themen.includes(activeTheme));
        const cMatch = !activeCategory || (f.kategorien && f.kategorien.includes(activeCategory));
        return tMatch && cMatch;
    });

    renderFilters();
    renderFiles(filtered);
}

function renderActiveFilterBadges() {
    const container = document.getElementById('active-filters-container');
    container.innerHTML = '';

    if (activeTheme) {
        container.innerHTML += `<div class="active-pill">${activeTheme} <span class="remove-filter" onclick="filterBy('theme', null)">×</span></div>`;
    }
    if (activeCategory) {
        container.innerHTML += `<div class="active-pill">${activeCategory} <span class="remove-filter" onclick="filterBy('category', null)">×</span></div>`;
    }
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
        grid.innerHTML = '<p style="padding:20px; color:#64748b;">Kein Material gefunden.</p>';
        return;
    }
    grid.innerHTML = files.map(file => `
        <div class="file-card">
            <div class="card-main-info">
                <div class="card-text-side">
                    <h3 style="margin:0 0 10px 0">${file.name}</h3>
                    <div>${(file.themen || []).map(t => `<span class="theme-label">⬥ ${t}</span>`).join('')}</div>
                    <div style="margin-top:8px; color:#64748b; font-size:0.85rem;">#${(file.kategorien || []).join(' #')}</div>
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
    renderFilters();
    renderFiles(allFiles);
};

window.addEventListener('DOMContentLoaded', () => {
    loadData();
    injectEmail();
});
