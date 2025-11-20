# Minimal Map Maker

Create simple, poster-style maps right in your browser. Search for a place, set a title and export a high‑resolution PDF.

## Usage

1. Open `index.html` in a modern browser.
2. Search for a location and press **Enter**.
3. Enter a custom title for your poster.
4. Use **Use Current Location** to quickly center the map on where you are.
5. Use **Switch to Portrait** to toggle the preview orientation.
6. Click **Export PDF** to download your map.

Tips:

- A center marker shows exactly where the poster will be framed.
- Status text below the controls confirms searches, geolocation, and errors.

The orientation button updates the preview layout and the exported PDF size.

The project uses [Leaflet](https://leafletjs.com/) for map display, [leaflet-geosearch](https://github.com/smeijer/leaflet-geosearch) for place search, [html2canvas](https://html2canvas.hertzen.com/) to capture the map and [jsPDF](https://github.com/parallax/jsPDF) to generate the PDF.
