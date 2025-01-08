import React, { useState, useEffect, useCallback } from 'react';
import { MapPin } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import MarkerCluster from './MarkerCluster';
import { createMarker, handleMapInteraction, initializeMap } from '../../services/mapService';
import { mapConfig } from '../../config/constants';
import '../../styles/map.css';

const WorldMap = ({ parties = [] }) => {
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [selectedParty, setSelectedParty] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !map) {
      const L = window.L;
      if (!L) return;

      const newMap = initializeMap(L, 'map', mapConfig);
      setMap(newMap);

      return () => {
        newMap.remove();
      };
    }
  }, []);

  useEffect(() => {
    if (!map || !window.L) return;

    const newMarkers = parties.map(party => 
      createMarker(window.L, party)
    );

    setMarkers(newMarkers);
  }, [map, parties]);

  const handleMarkerClick = useCallback((marker) => {
    const party = marker.partyData;
    setSelectedParty(party);
    handleMapInteraction(map, party);
  }, [map]);

  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle>Carte des Partis Politiques Mondiaux</CardTitle>
      </CardHeader>
      <CardContent>
        <div id="map" className="w-full h-96 rounded-lg overflow-hidden shadow-lg"></div>
        <MarkerCluster 
          map={map} 
          markers={markers} 
          onMarkerClick={handleMarkerClick}
        />
        {selectedParty && (
          <div className="mt-4 p-4 bg-white rounded-lg shadow">
            <h3 className="text-lg font-bold">{selectedParty.name}</h3>
            <p className="text-gray-600">{selectedParty.country}</p>
            <div className="mt-2">
              <p><span className="font-medium">Idéologie:</span> {selectedParty.ideology}</p>
              <p><span className="font-medium">Fondé en:</span> {selectedParty.yearFounded}</p>
              {selectedParty.yearDissolved && (
                <p><span className="font-medium">Dissous en:</span> {selectedParty.yearDissolved}</p>
              )}
            </div>
            {selectedParty.description && (
              <p className="mt-2 text-sm text-gray-700">{selectedParty.description}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WorldMap;