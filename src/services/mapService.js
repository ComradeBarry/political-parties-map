export const createMarker = (L, party, ideologyColors) => {
  return L.marker(party.coordinates, {
    icon: L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: ${ideologyColors[party.ideology]}; 
                        width: 10px; 
                        height: 10px; 
                        border-radius: 50%; 
                        border: 2px solid white;"></div>`
    })
  });
};

export const createPopupContent = (party) => {
  return `
    <div class="popup-content">
      <h3 class="font-bold">${party.name}</h3>
      <p>${party.country}</p>
      <p>Fondé en ${party.yearFounded}</p>
      ${party.yearDissolved ? `<p>Dissous en ${party.yearDissolved}</p>` : ''}
    </div>
  `;
};