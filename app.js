// Inventario PWA - App principal
const PLATFORM_ORDER = ['PS5', 'PS4', 'NINTENDO 2', 'NINTENDO', 'XBOX', 'CONSOLAS', 'ACCESORIOS'];
const PLATFORM_LABELS = {
  'PS5': 'PS5',
  'PS4': 'PS4',
  'NINTENDO 2': 'Switch 2',
  'NINTENDO': 'Switch',
  'XBOX': 'Xbox',
  'CONSOLAS': 'Consolas',
  'ACCESORIOS': 'Accesorios'
};

let inventory = {};
let currentPlatform = 'ALL';
let searchQuery = '';
let exchangeRate = 6.96;

// DOM
const tabsEl = document.getElementById('tabs');
const contentEl = document.getElementById('content');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearch');
const rateInput = document.getElementById('rateInput');
const statsEl = document.getElementById('stats');
const installBtn = document.getElementById('installBtn');

// Load rate from localStorage
const savedRate = localStorage.getItem('usd_bob_rate');
if (savedRate) {
  exchangeRate = parseFloat(savedRate) || 6.96;
  rateInput.value = exchangeRate;
}

// ========== Data ==========
async function loadInventory() {
  try {
    const res = await fetch('inventory.json');
    inventory = await res.json();
    renderTabs();
    renderContent();
    updateStats();
  } catch (err) {
    contentEl.innerHTML = `<div class="empty-state"><div class="icon">⚠️</div>Error cargando inventario</div>`;
    console.error(err);
  }
}

// ========== Tabs ==========
function renderTabs() {
  const totalItems = Object.values(inventory).reduce((s, arr) => s + arr.length, 0);
  let html = `<button class="tab ${currentPlatform === 'ALL' ? 'active' : ''}" data-platform="ALL">Todos <span class="count">(${totalItems})</span></button>`;

  for (const p of PLATFORM_ORDER) {
    const items = inventory[p] || [];
    if (items.length === 0 && p === 'ACCESORIOS') continue;
    const label = PLATFORM_LABELS[p] || p;
    html += `<button class="tab ${currentPlatform === p ? 'active' : ''}" data-platform="${p}">${label} <span class="count">(${items.length})</span></button>`;
  }
  tabsEl.innerHTML = html;

  tabsEl.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => {
      currentPlatform = btn.dataset.platform;
      renderTabs();
      renderContent();
    });
  });
}

// ========== Render ==========
function formatPrice(usd) {
  if (usd == null || isNaN(usd)) return '<span class="no-price">—</span>';
  const bob = (usd * exchangeRate).toFixed(0);
  return `
    <div class="price-usd">$${usd.toFixed(0)}</div>
    <div class="price-bob">Bs ${bob}</div>
  `;
}

function highlightText(text, query) {
  if (!query) return escapeHtml(text);
  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
  return escapeHtml(text).replace(regex, '<span class="highlight">$1</span>');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function filterItems(items, query) {
  if (!query) return items;
  const q = query.toLowerCase().trim();
  return items.filter(item => item.nombre.toLowerCase().includes(q));
}

function renderGameCard(item, platform) {
  const qtyClass = item.cantidad > 0 ? 'has-stock' : 'no-stock';
  const outClass = item.cantidad === 0 ? 'out-of-stock' : '';
  const platformLabel = currentPlatform === 'ALL' ? `<div class="game-platform">${PLATFORM_LABELS[platform] || platform}</div>` : '';

  return `
    <article class="game-card ${outClass}">
      <div class="qty ${qtyClass}">${item.cantidad}</div>
      <div class="game-info">
        <div class="game-name">${highlightText(item.nombre, searchQuery)}</div>
        ${platformLabel}
      </div>
      <div class="prices">
        ${formatPrice(item.precio_unitario)}
      </div>
    </article>
  `;
}

function renderContent() {
  let html = '';
  let totalShown = 0;

  if (currentPlatform === 'ALL') {
    for (const p of PLATFORM_ORDER) {
      const items = filterItems(inventory[p] || [], searchQuery);
      if (items.length === 0) continue;
      totalShown += items.length;
      html += `<div class="section-title">${PLATFORM_LABELS[p] || p} (${items.length})</div>`;
      html += `<div class="game-list">`;
      // Sort: in stock first, then by name
      items.sort((a, b) => {
        if (a.cantidad > 0 && b.cantidad === 0) return -1;
        if (a.cantidad === 0 && b.cantidad > 0) return 1;
        return a.nombre.localeCompare(b.nombre);
      });
      for (const item of items) {
        html += renderGameCard(item, p);
      }
      html += `</div>`;
    }
  } else {
    const items = filterItems(inventory[currentPlatform] || [], searchQuery);
    totalShown = items.length;
    if (items.length === 0) {
      html = `<div class="empty-state"><div class="icon">🔍</div>No se encontraron juegos</div>`;
    } else {
      items.sort((a, b) => {
        if (a.cantidad > 0 && b.cantidad === 0) return -1;
        if (a.cantidad === 0 && b.cantidad > 0) return 1;
        return a.nombre.localeCompare(b.nombre);
      });
      html += `<div class="game-list">`;
      for (const item of items) {
        html += renderGameCard(item, currentPlatform);
      }
      html += `</div>`;
    }
  }

  if (totalShown === 0 && searchQuery) {
    html = `<div class="empty-state"><div class="icon">🔍</div>No hay resultados para "${escapeHtml(searchQuery)}"</div>`;
  } else if (totalShown === 0) {
    html = `<div class="empty-state"><div class="icon">📦</div>Sin productos en esta sección</div>`;
  }

  contentEl.innerHTML = html;
  updateStats(totalShown);
}

function updateStats(shown) {
  let totalGames = 0;
  let totalUnits = 0;
  for (const items of Object.values(inventory)) {
    totalGames += items.length;
    totalUnits += items.reduce((s, i) => s + (i.cantidad || 0), 0);
  }
  if (shown != null && searchQuery) {
    statsEl.textContent = `${shown} resultados · ${totalUnits} unidades en total`;
  } else {
    statsEl.textContent = `${totalGames} juegos · ${totalUnits} unidades en stock`;
  }
}

// ========== Events ==========
searchInput.addEventListener('input', () => {
  searchQuery = searchInput.value;
  clearSearchBtn.classList.toggle('hidden', !searchQuery);
  renderContent();
});

clearSearchBtn.addEventListener('click', () => {
  searchInput.value = '';
  searchQuery = '';
  clearSearchBtn.classList.add('hidden');
  renderContent();
  searchInput.focus();
});

rateInput.addEventListener('change', () => {
  exchangeRate = parseFloat(rateInput.value) || 6.96;
  localStorage.setItem('usd_bob_rate', exchangeRate);
  renderContent();
});

rateInput.addEventListener('input', () => {
  exchangeRate = parseFloat(rateInput.value) || 6.96;
  localStorage.setItem('usd_bob_rate', exchangeRate);
  renderContent();
});

// ========== PWA Install ==========
let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.classList.remove('hidden');
});

installBtn.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  if (outcome === 'accepted') {
    installBtn.classList.add('hidden');
  }
  deferredPrompt = null;
});

// Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(err => console.log('SW failed', err));
  });
}

// Init
loadInventory();
