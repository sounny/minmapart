// Initialize map
const map = L.map('map', {
  zoomControl: false,
  attributionControl: false
}).setView([29.89, -81.31], 13);

// Minimal basemap
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const controlsContainer = document.getElementById('controls');
const zoomControl = L.control.zoom().addTo(map);
const attribution = L.control.attribution().addTo(map);
controlsContainer.appendChild(zoomControl.getContainer());
controlsContainer.appendChild(attribution.getContainer());

// Search provider using OpenStreetMap
const provider = new GeoSearch.OpenStreetMapProvider();
const searchInput = document.getElementById('search');
const searchBtn = document.getElementById('search-btn');
const suggestions = document.getElementById('suggestions');
const titleInput = document.getElementById('title');
const titleText = document.getElementById('title-text');
const coordText = document.getElementById('coord-text');
const orientationBtn = document.getElementById('orientation-btn');
let orientation = 'landscape';
let lastCoords = map.getCenter();

function toDMS(deg) {
  const d = Math.floor(Math.abs(deg));
  const minFloat = (Math.abs(deg) - d) * 60;
  const m = Math.floor(minFloat);
  const s = ((minFloat - m) * 60).toFixed(2);
  return `${d}°${m}'${s}"`;
}

function formatCoords(lat, lng) {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${toDMS(lat)}${latDir} ${toDMS(lng)}${lngDir}`;
}

function updateOverlay(lat, lng) {
  titleText.textContent = titleInput.value;
  coordText.textContent = formatCoords(lat, lng);
  lastCoords = {lat, lng};
}

searchInput.addEventListener('input', async (e) => {
  if (!e.target.value) {
    suggestions.innerHTML = '';
    return;
  }
  const results = await provider.search({ query: e.target.value });
  suggestions.innerHTML = '';
  results.slice(0,5).forEach(r => {
    const option = document.createElement('option');
    option.value = r.label;
    suggestions.appendChild(option);
  });
});

async function performSearch() {
  const query = searchInput.value;
  if (!query) return;
  const results = await provider.search({ query });
  if (results.length === 0) return;
  const { x, y } = results[0];
  map.setView([y, x], 14);
  updateOverlay(y, x);
}

searchBtn.addEventListener('click', performSearch);
searchInput.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') performSearch();
});

titleInput.addEventListener('input', () => {
  updateOverlay(lastCoords.lat, lastCoords.lng);
});

function updateOrientation() {
  const preview = document.getElementById('preview');
  if (orientation === 'landscape') {
    preview.style.aspectRatio = '17 / 11';
    orientationBtn.textContent = 'Switch to Portrait';
  } else {
    preview.style.aspectRatio = '11 / 17';
    orientationBtn.textContent = 'Switch to Landscape';
  }
  map.invalidateSize();
}

orientationBtn.addEventListener('click', () => {
  orientation = orientation === 'landscape' ? 'portrait' : 'landscape';
  updateOrientation();
});

updateOrientation();

// Export map and title as PDF
const exportBtn = document.getElementById('export');

exportBtn.addEventListener('click', () => {
  const container = document.getElementById('preview');

  html2canvas(container, { useCORS: true }).then((canvas) => {
    const { jsPDF } = window.jspdf;
    const isLandscape = orientation === 'landscape';
    const pdf = new jsPDF({
      orientation,
      unit: 'in',
      format: isLandscape ? [17, 11] : [11, 17]
    });
    const width = isLandscape ? 17 : 11;
    const height = isLandscape ? 11 : 17;
    pdf.addImage(canvas, 'PNG', 0, 0, width, height);
    pdf.save('map.pdf');
  });
});
