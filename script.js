let allFiles = [];
let activeTheme = null;
let activeCategory = null;

// E-Mail-Schutz: Adresse erst beim Laden zusammensetzen
function injectEmail() {
    const user = "kontakt";       // HIER DEINEN NUTZERNAMEN EINTRAGEN
    const domain = "ge-material"; // HIER DEINE DOMAIN EINTRAGEN
    const tld = "at";             // HIER DEINE ENDUNG EINTRAGEN
    
    const email = user + "@" + domain + "." + tld;
    const container = document.getElementById('email-placeholder');
    
    if (container) {
        const a = document.createElement('a');
        a.href = "mailto:" + email;
        a.textContent = email;
        a.style.fontWeight = "bold";
        container.appendChild(a);
    }
}

async function loadData() {
    try {
        // Cache-Buster sorgt dafür, dass die JSON immer frisch geladen wird
        const response = await fetch('files.json?v=' + Date.now());
        allFiles = await response.json();
        renderFilters();
        renderFiles(allFiles);
    } catch (e) {
        console.error("JSON konnte nicht geladen werden:", e);
    }
}

function renderFilters() {
    const themes = [...new Set(allFiles.flatMap(f => f.themen || []))].sort();
    const categories = [...new Set(allFiles.flatMap(f => f.kategorien || []))].sort();

    document.getElementById('theme-filter').innerHTML = themes.map(t => 
        `<li onclick="filterBy('theme', '${t}', this)">${t}</li>`).join('');
    document.getElementById('category-filter').innerHTML = categories.map(c => 
        `<li onclick="filterBy('category', '${c}', this)">${c}</li>`).join('');
}

function filterBy(type, value, element) {
    if (type === 'theme') {
        document.querySelectorAll('#theme-filter li').forEach(li => li.classList.remove('active'));
        activeTheme = (activeTheme === value) ? null : value;
        if (activeTheme) element.classList.add('active');
    } else {
        document.querySelectorAll('#category-filter li').forEach(li => li.classList.remove('active'));
        activeCategory = (activeCategory === value) ? null : value;
        if (activeCategory) element.classList.add('active');
    }

    const filtered = allFiles.filter(f => {
        const tMatch = !activeTheme || f.themen.includes(activeTheme);
        const cMatch = !activeCategory || f.kategorien.includes(activeCategory);
        return tMatch && cMatch;
    });
    renderFiles(filtered);
}

function getPreviewHTML(file) {
    const ext = file.url.split('.').pop().toLowerCase();
    const fileName = file.url.split('/').pop().split('.')[0];

    // Wenn es ein Bild ist, nimm es direkt als Vorschau
    if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) {
        return `<div class="card-preview"><img src="${file.url}" alt="Vorschau"></div>`;
    }
    // Für PDFs: Suche im preview-Ordner nach dem JPG
    return `<div class="card-preview"><img src="preview/${fileName}.jpg" onerror="this.parentElement.style.display='none'"></div>`;
}

function renderFiles(files) {
    const grid = document.getElementById('content-grid');
    grid.innerHTML = files.map(file => `
        <div class="file-card">
            <div class="card-main-info">
                <div class="card-text-side">
                    <h3 style="margin:0 0 10px 0">${file.name}</h3>
                    <div class="theme-list">
                        ${(file.themen || []).map(t => `<span class="theme-label">${t}</span>`).join('')}
                    </div>
                    <div style="margin-top:8px">
                        ${(file.kategorien || []).map(k => `<span class="mini-tag">#${k}</span>`).join('')}
                    </div>
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
    activeTheme = null; activeCategory = null;
    document.querySelectorAll('.sidebar li').forEach(li => li.classList.remove('active'));
    renderFiles(allFiles);
};

window.addEventListener('DOMContentLoaded', () => {
    loadData();
    injectEmail();
});
