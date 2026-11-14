const SEVERITY = {
  critica:  { label: 'Crítica',  color: '#ef4444', r: 11 },
  alta:     { label: 'Alta',     color: '#f59e0b', r: 9 },
  moderada: { label: 'Moderada', color: '#38bdf8', r: 8 },
};

const map = L.map('map', { zoomControl: true, attributionControl: true })
  .setView([-20.385, -40.325], 12);

const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas';
L.tileLayer(`${ESRI}/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}`, {
  attribution: 'Tiles &copy; Esri &mdash; Esri, HERE, Garmin, &copy; OpenStreetMap',
  maxZoom: 16,
}).addTo(map);
L.tileLayer(`${ESRI}/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}`, {
  maxZoom: 16, pane: 'shadowPane',
}).addTo(map);

// --- stats ---
const totalBairros = DATA.reduce((s, z) => s + z.bairros.length, 0);
document.getElementById('stats').innerHTML = `
  <div class="stat"><b>${DATA.length}</b><span>zonas</span></div>
  <div class="stat"><b>${totalBairros}</b><span>bairros</span></div>
  <div class="stat"><b style="color:var(--critica)">${DATA.filter(z => z.severity === 'critica').length}</b><span>críticas</span></div>`;

// --- legend ---
document.getElementById('legend').innerHTML = '<h4>Incidência</h4>' +
  Object.values(SEVERITY).map(s =>
    `<div class="legend-row"><span class="legend-dot" style="background:${s.color}"></span>${s.label}</div>`
  ).join('');

// --- markers + sidebar ---
const zoneList = document.getElementById('zoneList');
const layerGroups = {};

DATA.forEach(zone => {
  const sev = SEVERITY[zone.severity];
  const group = L.layerGroup();

  zone.bairros.forEach(b => {
    const m = L.circleMarker([b.lat, b.lng], {
      radius: sev.r,
      color: sev.color,
      weight: 1.5,
      fillColor: sev.color,
      fillOpacity: 0.28,
    });
    m.bindPopup(`
      <div class="popup">
        <span class="zone-tag" style="color:${sev.color}">${sev.label} · ${zone.name}</span>
        <h3>${b.name}</h3>
        <p><b>Bacia:</b> ${zone.basin}</p>
      </div>`);
    group.addLayer(m);
  });

  // soft halo around the zone using its bounds
  if (zone.bairros.length > 2) {
    const lats = zone.bairros.map(b => b.lat), lngs = zone.bairros.map(b => b.lng);
    const cx = lats.reduce((a, b) => a + b) / lats.length;
    const cy = lngs.reduce((a, b) => a + b) / lngs.length;
    const rad = Math.max(...zone.bairros.map(b => Math.hypot(b.lat - cx, b.lng - cy))) * 111000 + 600;
    group.addLayer(L.circle([cx, cy], {
      radius: rad, color: sev.color, weight: 1, dashArray: '6 6',
      fillColor: sev.color, fillOpacity: 0.05, interactive: false,
    }));
  }

  group.addTo(map);
  layerGroups[zone.id] = group;

  const card = document.createElement('div');
  card.className = 'zone';
  card.style.setProperty('--zc', sev.color);
  card.innerHTML = `
    <div class="zone-top">
      <span class="zone-name">${zone.name}</span>
      <span class="badge">${sev.label}</span>
    </div>
    <div class="zone-basin">${zone.basin}</div>
    <p class="zone-why">${zone.why}</p>
    <div class="zone-detail">
      <ul class="evidence">${zone.evidence.map(e => `<li>${e}</li>`).join('')}</ul>
      <div class="chips">${zone.bairros.map(b => `<span class="chip">${b.name}</span>`).join('')}</div>
      <div class="count">${zone.bairros.length} bairros</div>
    </div>`;

  card.addEventListener('click', () => {
    document.querySelectorAll('.zone').forEach(el => el.classList.remove('active'));
    card.classList.toggle('open');
    card.classList.add('active');
    const bounds = L.latLngBounds(zone.bairros.map(b => [b.lat, b.lng]));
    map.flyToBounds(bounds.pad(0.25), { duration: 0.9 });
  });

  zoneList.appendChild(card);
});

// fit all on load
const all = DATA.flatMap(z => z.bairros.map(b => [b.lat, b.lng]));
map.fitBounds(L.latLngBounds(all).pad(0.08));
