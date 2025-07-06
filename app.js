// Initialize map
const map = L.map('map').setView([29.89, -81.31], 13);

// Minimal basemap
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: ''
}).addTo(map);

// Search provider using OpenStreetMap
const provider = new GeoSearch.OpenStreetMapProvider();
const searchInput = document.getElementById('search');

searchInput.addEventListener('keyup', async (e) => {
  if (e.key !== 'Enter') return;
  const results = await provider.search({ query: e.target.value });
  if (results.length === 0) return;
  const { x, y } = results[0];
  map.setView([y, x], 14);
  L.marker([y, x]).addTo(map);
});

// Export map and title as PDF
const exportBtn = document.getElementById('export');
const titleInput = document.getElementById('title');

exportBtn.addEventListener('click', () => {
  const container = document.getElementById('map');
  const titleText = titleInput.value;

  // Create temporary title overlay
  const titleDiv = document.createElement('div');
  titleDiv.style.position = 'absolute';
  titleDiv.style.top = '10px';
  titleDiv.style.left = '50%';
  titleDiv.style.transform = 'translateX(-50%)';
  titleDiv.style.fontSize = '18px';
  titleDiv.style.fontWeight = 'bold';
  titleDiv.style.pointerEvents = 'none';
  titleDiv.innerText = titleText;
  container.appendChild(titleDiv);

  // Render map + title to canvas
  html2canvas(container, { useCORS: true }).then((canvas) => {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'pt',
      format: [canvas.width, canvas.height]
    });
    pdf.addImage(canvas, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save('map.pdf');
    container.removeChild(titleDiv);
  });
});
