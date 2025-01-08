import React, { useEffect, useRef, useMemo } from 'react';
import { ideologyColors } from '../../config/constants';

const CHUNK_SIZE = 500; // Nombre de marqueurs à ajouter par lot
const CHUNK_DELAY = 10; // Délai en ms entre chaque lot

const OptimizedMarkerCluster = ({ map, parties, onMarkerClick }) => {
  const clusterRef = useRef(null);
  const markersRef = useRef([]);

  // Mémoriser la configuration du cluster
  const clusterOptions = useMemo(() => ({
    chunkedLoading: true,
    maxClusterRadius: (zoom) => {
      // Ajuster dynamiquement le rayon de clustering selon le zoom
      if (zoom <= 4) return 80;
      if (zoom <= 6) return 60;
      if (zoom <= 8) return 40;
      return 20;
    },
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false, // Désactivé pour les performances
    zoomToBoundsOnClick: true,
    removeOutsideVisibleBounds: true, // Optimisation importante
    disableClusteringAtZoom: 19,
    iconCreateFunction: (cluster) => {
      const count = cluster.getChildCount();
      const markers = cluster.getAllChildMarkers();
      
      // Calculer l'idéologie dominante dans le cluster
      const ideologyCounts = markers.reduce((acc, marker) => {
        const ideology = marker.partyData.ideology;
        acc[ideology] = (acc[ideology] || 0) + 1;
        return acc;
      }, {});

      const dominantIdeology = Object.entries(ideologyCounts)
        .reduce((a, b) => (b[1] > a[1] ? b : a))[0];

      // Calculer la taille du cluster en fonction du nombre de marqueurs
      const size = count < 10 ? 30 : count < 100 ? 40 : 50;

      return window.L.divIcon({
        html: `
          <div class="cluster-icon" style="
            width: ${size}px;
            height: ${size}px;
            background-color: ${ideologyColors[dominantIdeology]};
            opacity: 0.9;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            border: 2px solid white;
            box-shadow: 0 0 5px rgba(0,0,0,0.3);
          ">
            ${count}
          </div>
        `,
        className: 'custom-cluster-icon',
        iconSize: window.L.point(size, size),
        iconAnchor: window.L.point(size/2, size/2)
      });
    }
  }), []);

  // Fonction pour créer un marqueur optimisé
  const createOptimizedMarker = (party) => {
    const marker = window.L.marker(party.coordinates, {
      icon: window.L.divIcon({
        className: 'custom-party-marker',
        html: `
          <div style="
            width: 10px;
            height: 10px;
            background-color: ${ideologyColors[party.ideology]};
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 0 4px rgba(0,0,0,0.2);
          "></div>
        `,
        iconSize: [10, 10],
        iconAnchor: [5, 5]
      })
    });

    marker.partyData = party;
    return marker;
  };

  // Effet pour gérer l'initialisation et la mise à jour des clusters
  useEffect(() => {
    if (!map || !window.L) return;

    // Initialiser le groupe de clusters s'il n'existe pas
    if (!clusterRef.current) {
      clusterRef.current = window.L.markerClusterGroup(clusterOptions);
      map.addLayer(clusterRef.current);
    }

    // Nettoyer les anciens marqueurs
    if (markersRef.current.length > 0) {
      clusterRef.current.clearLayers();
      markersRef.current = [];
    }

    // Créer les nouveaux marqueurs de manière optimisée
    const newMarkers = parties.map(party => {
      const marker = createOptimizedMarker(party);
      marker.on('click', () => onMarkerClick(marker));
      return marker;
    });

    // Ajouter les marqueurs par lots
    const addMarkersInChunks = (markers, chunkIndex = 0) => {
      const chunk = markers.slice(
        chunkIndex * CHUNK_SIZE,
        (chunkIndex + 1) * CHUNK_SIZE
      );

      if (chunk.length === 0) return;

      clusterRef.current.addLayers(chunk);
      markersRef.current.push(...chunk);

      if (chunkIndex * CHUNK_SIZE < markers.length) {
        setTimeout(() => {
          addMarkersInChunks(markers, chunkIndex + 1);
        }, CHUNK_DELAY);
      }
    };

    addMarkersInChunks(newMarkers);

    // Nettoyage
    return () => {
      if (clusterRef.current) {
        map.removeLayer(clusterRef.current);
        clusterRef.current = null;
        markersRef.current = [];
      }
    };
  }, [map, parties, onMarkerClick, clusterOptions]);

  return null;
};

export default OptimizedMarkerCluster;