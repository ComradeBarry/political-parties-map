import React, { useEffect } from 'react';

const MarkerCluster = ({ map, markers, onMarkerClick }) => {
  useEffect(() => {
    if (!map || !window.L) return;

    const clusterGroup = window.L.markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: true,
      zoomToBoundsOnClick: true,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        return window.L.divIcon({
          html: `<div class="marker-cluster"><div>${count}</div></div>`,
          className: 'custom-cluster-icon',
          iconSize: window.L.point(40, 40)
        });
      }
    });

    markers.forEach(marker => {
      marker.on('click', () => onMarkerClick(marker));
      clusterGroup.addLayer(marker);
    });

    map.addLayer(clusterGroup);

    return () => {
      map.removeLayer(clusterGroup);
    };
  }, [map, markers, onMarkerClick]);

  return null;
};

export default MarkerCluster;