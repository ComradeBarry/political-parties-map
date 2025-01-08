import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, Search, Filter, X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const ideologyColors = {
  liberal: '#3498db',
  communist: '#e74c3c',
  green: '#2ecc71',
  conservative: '#2c3e50',
  socialist: '#e67e22',
  nationalist: '#8e44ad',
  centrist: '#95a5a6'
};

const WorldMap = () => {
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [markerClusterGroup, setMarkerClusterGroup] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !map) {
      const L = window.L;
      if (!L) return;

      const newMap = L.map('map').setView([20, 0], 2);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(newMap);

      const clusters = L.markerClusterGroup();
      setMarkerClusterGroup(clusters);
      newMap.addLayer(clusters);

      setMap(newMap);

      return () => {
        newMap.remove();
      };
    }
  }, []);

  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle>Carte des Partis Politiques Mondiaux</CardTitle>
      </CardHeader>
      <CardContent>
        <div id="map" className="w-full h-96 rounded-lg overflow-hidden"></div>
      </CardContent>
    </Card>
  );
};

export default WorldMap;