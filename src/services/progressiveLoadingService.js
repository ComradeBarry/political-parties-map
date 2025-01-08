class ProgressiveLoader {
  constructor(map, chunkSize = 500) {
    this.map = map;
    this.chunkSize = chunkSize;
    this.loadQueue = [];
    this.isLoading = false;
    this.visibleMarkers = new Set();
    this.loadedBounds = new Set();
  }

  addToQueue(markers, priority = 0) {
    const chunks = this.chunkArray(markers, this.chunkSize);
    chunks.forEach((chunk, index) => {
      this.loadQueue.push({
        markers: chunk,
        priority: priority - index // Les premiers chunks ont une priorité plus élevée
      });
    });
    this.loadQueue.sort((a, b) => b.priority - a.priority);
    if (!this.isLoading) {
      this.processQueue();
    }
  }

  chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  async processQueue() {
    if (this.loadQueue.length === 0 || this.isLoading) return;

    this.isLoading = true;
    const chunk = this.loadQueue.shift();

    await new Promise(resolve => setTimeout(resolve, 0)); // Yield to main thread

    chunk.markers.forEach(marker => {
      if (this.isMarkerInView(marker)) {
        marker.addTo(this.map);
        this.visibleMarkers.add(marker);
      }
    });

    this.isLoading = false;
    if (this.loadQueue.length > 0) {
      requestAnimationFrame(() => this.processQueue());
    }
  }

  isMarkerInView(marker) {
    return this.map.getBounds().contains(marker.getLatLng());
  }

  handleMapMovement() {
    const currentBounds = this.map.getBounds();
    const boundsKey = this.getBoundsKey(currentBounds);

    if (!this.loadedBounds.has(boundsKey)) {
      this.loadedBounds.add(boundsKey);
      this.preloadAdjacentAreas(currentBounds);
    }

    // Vérifier et mettre à jour les marqueurs visibles
    this.updateVisibleMarkers();
  }

  preloadAdjacentAreas(bounds) {
    const padding = 0.1; // 10% de padding autour de la zone visible
    const north = bounds.getNorth();
    const south = bounds.getSouth();
    const east = bounds.getEast();
    const west = bounds.getWest();
    const latPadding = (north - south) * padding;
    const lngPadding = (east - west) * padding;

    const extendedBounds = {
      north: north + latPadding,
      south: south - latPadding,
      east: east + lngPadding,
      west: west - lngPadding
    };

    // Ajouter les marqueurs de la zone étendue à la file de chargement
    const markersToLoad = this.getMarkersInBounds(extendedBounds);
    this.addToQueue(markersToLoad, 1);
  }

  updateVisibleMarkers() {
    const currentBounds = this.map.getBounds();
    
    // Retirer les marqueurs qui ne sont plus visibles
    for (const marker of this.visibleMarkers) {
      if (!this.isMarkerInView(marker)) {
        marker.remove();
        this.visibleMarkers.delete(marker);
      }
    }

    // Ajouter les nouveaux marqueurs visibles
    const newVisibleMarkers = this.getMarkersInBounds(currentBounds)
      .filter(marker => !this.visibleMarkers.has(marker));
    
    this.addToQueue(newVisibleMarkers, 2);
  }

  getBoundsKey(bounds) {
    const precision = 2; // Précision pour le regroupement des zones
    return `${bounds.getNorth().toFixed(precision)},${bounds.getSouth().toFixed(precision)},` +
           `${bounds.getEast().toFixed(precision)},${bounds.getWest().toFixed(precision)}`;
  }

  getMarkersInBounds(bounds) {
    // Cette méthode devrait être implémentée pour utiliser le QuadTree du cacheService
    // Retourne les marqueurs dans les limites données
    return [];
  }

  clearQueue() {
    this.loadQueue = [];
    this.isLoading = false;
  }
}

export const createProgressiveLoader = (map) => {
  return new ProgressiveLoader(map);
};