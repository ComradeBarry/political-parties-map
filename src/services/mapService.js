import { ideologyColors } from '../config/constants';

export const createMarker = (L, party) => {
  const marker = L.marker(party.coordinates, {
    icon: L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="
        background-color: ${ideologyColors[party.ideology]};
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 0 4px rgba(0,0,0,0.3);
      "></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    })
  });

  marker.partyData = party;
  
  const popupContent = createPopupContent(party);
  marker.bindPopup(popupContent, {
    className: 'party-popup',
    maxWidth: 300
  });

  return marker;
};

export const createPopupContent = (party) => {
  return `
    <div class="party-info">
      <h3>${party.name}</h3>
      <p><strong>Pays:</strong> ${party.country}</p>
      <p><strong>Idéologie:</strong> ${party.ideology}</p>
      <p><strong>Fondé en:</strong> ${party.yearFounded}</p>
      ${party.yearDissolved ? `<p><strong>Dissous en:</strong> ${party.yearDissolved}</p>` : ''}
      ${party.description ? `<p>${party.description}</p>` : ''}
    </div>
  `;
};

export const handleMapInteraction = (map, party) => {
  map.flyTo(party.coordinates, map.getZoom() < 6 ? 6 : map.getZoom(), {
    duration: 1
  });
};

export const initializeMap = (L, elementId, options = {}) => {
  const map = L.map(elementId, {
    center: options.center || [20, 0],
    zoom: options.zoom || 2,
    minZoom: 2,
    maxZoom: 18,
    zoomControl: true,
    scrollWheelZoom: true
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 18
  }).addTo(map);

  map.on('zoomend', () => {
    const currentZoom = map.getZoom();
    if (currentZoom < 2) {
      map.setZoom(2);
    }
  });

  return map;
};