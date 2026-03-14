// Initialize map
const map = L.map('map', {
  zoomControl: false,
  attributionControl: false
}).setView([29.89, -81.31], 13);

const defaultView = { lat: 29.89, lng: -81.31, zoom: 13 };

const tileAttribution = '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const basemapLabels = {
  lines: 'Toner Lines',
  toner: 'Toner',
  lite: 'Toner Lite'
};

const basemaps = {
  lines: L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_toner_lines/{z}/{x}/{y}{r}.png', {
    minZoom: 0,
    maxZoom: 20,
    ext: 'png',
    attribution: tileAttribution,
  }),
  toner: L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}{r}.png', {
    minZoom: 0,
    maxZoom: 20,
    ext: 'png',
    attribution: tileAttribution,
  }),
  lite: L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_toner_lite/{z}/{x}/{y}{r}.png', {
    minZoom: 0,
    maxZoom: 20,
    ext: 'png',
    attribution: tileAttribution,
  }),
};

let activeBasemap = basemaps.lines;
activeBasemap.addTo(map);
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
const locateBtn = document.getElementById('locate-btn');
const status = document.getElementById('status');
const basemapSelect = document.getElementById('basemap-select');
const copyCoordsBtn = document.getElementById('copy-coords');
const copyLinkBtn = document.getElementById('copy-link');
const resetBtn = document.getElementById('reset-btn');
const zoomText = document.getElementById('zoom-text');
const centerReadout = document.getElementById('center-readout');
const styleReadout = document.getElementById('style-readout');
let orientation = 'landscape';
let lastCoords = map.getCenter();
let suggestionTimeout;

// Default placeholder title and coordinates for downtown Saint Augustine
const initialState = getStateFromUrl();
titleInput.value = initialState.title || 'Saint Augustine';
orientation = initialState.orientation || 'landscape';
if (initialState.basemap && basemaps[initialState.basemap]) {
  map.removeLayer(activeBasemap);
  activeBasemap = basemaps[initialState.basemap];
  activeBasemap.addTo(map);
  basemapSelect.value = initialState.basemap;
}
if (initialState.lat && initialState.lng) {
  map.setView([initialState.lat, initialState.lng], initialState.zoom || defaultView.zoom);
}

updateOverlay(map.getCenter().lat, map.getCenter().lng);
setStatus('Build your custom map: search a city, tune style, then export.', 'info');
zoomText.textContent = `Zoom ${map.getZoom()}`;
styleReadout.textContent = `Style: ${basemapLabels[basemapSelect.value] || basemapLabels.lines}`;
updateOrientation();
updateShareUrl();

function getStateFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const lat = Number(params.get('lat'));
  const lng = Number(params.get('lng'));
  const zoom = Number(params.get('z'));
  return {
    lat: Number.isFinite(lat) ? lat : null,
    lng: Number.isFinite(lng) ? lng : null,
    zoom: Number.isFinite(zoom) ? zoom : null,
    title: params.get('title') || '',
    orientation: params.get('orientation') || '',
    basemap: params.get('basemap') || ''
  };
}

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
  titleText.textContent = titleInput.value || 'Untitled Map';
  coordText.textContent = formatCoords(lat, lng);
  centerReadout.textContent = `Center: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  lastCoords = { lat, lng };
}

function setStatus(message, type = 'info') {
  status.textContent = message;
  status.className = type;
}

function updateShareUrl() {
  const center = map.getCenter();
  const params = new URLSearchParams({
    lat: center.lat.toFixed(5),
    lng: center.lng.toFixed(5),
    z: String(map.getZoom()),
    title: titleInput.value || '',
    orientation,
    basemap: basemapSelect.value
  });
  const newUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState({}, '', newUrl);
}

searchInput.addEventListener('input', (e) => {
  clearTimeout(suggestionTimeout);
  const query = e.target.value;

  if (!query) {
    suggestions.innerHTML = '';
    return;
  }

  suggestionTimeout = setTimeout(async () => {
    try {
      const results = await provider.search({ query });
      suggestions.innerHTML = '';
      results.slice(0, 5).forEach((result) => {
        const option = document.createElement('option');
        option.value = result.label;
        suggestions.appendChild(option);
      });
    } catch {
      // Non-blocking: keep typing experience smooth if provider is unavailable.
    }
  }, 250);
});

async function performSearch() {
  const query = searchInput.value;
  if (!query) {
    setStatus('Enter a place name to search.', 'info');
    return;
  }

  try {
    const results = await provider.search({ query });
    if (results.length === 0) {
      setStatus('No matching places found. Try another search.', 'error');
      return;
    }
    const { x, y, label } = results[0];
    map.setView([y, x], 14);
    updateOverlay(y, x);
    updateShareUrl();
    setStatus(`Centered on ${label}.`, 'success');
  } catch {
    setStatus('Search temporarily unavailable. Please try again.', 'error');
  }
}

searchBtn.addEventListener('click', performSearch);
searchInput.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') performSearch();
});

titleInput.addEventListener('input', () => {
  updateOverlay(lastCoords.lat, lastCoords.lng);
  updateShareUrl();
});

// Update coordinates as the map pans
map.on('move', () => {
  const center = map.getCenter();
  updateOverlay(center.lat, center.lng);
  updateShareUrl();
});

map.on('zoomend', () => {
  zoomText.textContent = `Zoom ${map.getZoom()}`;
  updateShareUrl();
});

locateBtn.addEventListener('click', () => {
  if (!navigator.geolocation) {
    setStatus('Geolocation is not supported in this browser.', 'error');
    return;
  }

  setStatus('Fetching your location…', 'info');
  locateBtn.disabled = true;

  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      const { latitude, longitude } = coords;
      map.setView([latitude, longitude], 14);
      updateOverlay(latitude, longitude);
      updateShareUrl();
      setStatus('Centered on your current location.', 'success');
      locateBtn.disabled = false;
    },
    () => {
      setStatus('Unable to fetch your location. Check browser permissions.', 'error');
      locateBtn.disabled = false;
    },
    { enableHighAccuracy: true, timeout: 8000 }
  );
});

basemapSelect.addEventListener('change', (event) => {
  const selected = basemaps[event.target.value];
  if (!selected || selected === activeBasemap) return;
  map.removeLayer(activeBasemap);
  activeBasemap = selected;
  activeBasemap.addTo(map);
  styleReadout.textContent = `Style: ${basemapLabels[event.target.value]}`;
  updateShareUrl();
  setStatus('Basemap updated.', 'success');
});

copyCoordsBtn.addEventListener('click', async () => {
  const coords = formatCoords(lastCoords.lat, lastCoords.lng);
  try {
    await navigator.clipboard.writeText(coords);
    setStatus('Coordinates copied to clipboard.', 'success');
  } catch {
    setStatus('Unable to copy coordinates. Try again.', 'error');
  }
});

copyLinkBtn.addEventListener('click', async () => {
  updateShareUrl();
  try {
    await navigator.clipboard.writeText(window.location.href);
    setStatus('Share link copied. Anyone with it opens this exact map setup.', 'success');
  } catch {
    setStatus('Unable to copy share link. Try again.', 'error');
  }
});

resetBtn.addEventListener('click', () => {
  map.setView([defaultView.lat, defaultView.lng], defaultView.zoom);
  titleInput.value = 'Saint Augustine';
  searchInput.value = '';
  if (basemapSelect.value !== 'lines') {
    map.removeLayer(activeBasemap);
    activeBasemap = basemaps.lines;
    activeBasemap.addTo(map);
    basemapSelect.value = 'lines';
  }
  styleReadout.textContent = `Style: ${basemapLabels.lines}`;
  updateOverlay(defaultView.lat, defaultView.lng);
  updateShareUrl();
  setStatus('View reset to the default map.', 'info');
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
  const previous = orientation;
  orientation = orientation === 'landscape' ? 'portrait' : 'landscape';
  if (previous === 'landscape' && orientation === 'portrait') {
    map.zoomOut();
  }
  updateOrientation();
  updateShareUrl();
});

L.control.scale({ position: 'bottomleft' }).addTo(map);

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
    setStatus('PDF exported successfully.', 'success');
  });
});
