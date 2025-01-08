class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return null;
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  put(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      this.cache.delete(this.cache.keys().next().value);
    }
    this.cache.set(key, value);
  }
}

class QuadTree {
  constructor(bounds, capacity = 4) {
    this.bounds = bounds;
    this.capacity = capacity;
    this.points = [];
    this.divided = false;
  }

  subdivide() {
    const x = this.bounds.x;
    const y = this.bounds.y;
    const w = this.bounds.width / 2;
    const h = this.bounds.height / 2;

    this.northwest = new QuadTree({x: x, y: y, width: w, height: h});
    this.northeast = new QuadTree({x: x + w, y: y, width: w, height: h});
    this.southwest = new QuadTree({x: x, y: y + h, width: w, height: h});
    this.southeast = new QuadTree({x: x + w, y: y + h, width: w, height: h});

    this.divided = true;
  }

  insert(point) {
    if (!this.bounds.contains(point)) {
      return false;
    }

    if (this.points.length < this.capacity) {
      this.points.push(point);
      return true;
    }

    if (!this.divided) {
      this.subdivide();
    }

    return (this.northwest.insert(point) ||
            this.northeast.insert(point) ||
            this.southwest.insert(point) ||
            this.southeast.insert(point));
  }

  query(range, found = []) {
    if (!this.bounds.intersects(range)) {
      return found;
    }

    for (let point of this.points) {
      if (range.contains(point)) {
        found.push(point);
      }
    }

    if (this.divided) {
      this.northwest.query(range, found);
      this.northeast.query(range, found);
      this.southwest.query(range, found);
      this.southeast.query(range, found);
    }

    return found;
  }
}

class ClusterCache {
  constructor() {
    this.markersCache = new LRUCache(1000);
    this.clusterCache = new LRUCache(500);
    this.quadTree = null;
  }

  initializeQuadTree(bounds) {
    this.quadTree = new QuadTree(bounds);
  }

  addMarker(marker) {
    const key = `${marker.getLatLng().lat},${marker.getLatLng().lng}`;
    this.markersCache.put(key, marker);
    if (this.quadTree) {
      this.quadTree.insert({
        lat: marker.getLatLng().lat,
        lng: marker.getLatLng().lng,
        marker: marker
      });
    }
  }

  getClusterKey(bounds, zoom) {
    return `${bounds.getNorth()},${bounds.getSouth()},${bounds.getEast()},${bounds.getWest()},${zoom}`;
  }

  getCluster(bounds, zoom) {
    const key = this.getClusterKey(bounds, zoom);
    return this.clusterCache.get(key);
  }

  setCluster(bounds, zoom, cluster) {
    const key = this.getClusterKey(bounds, zoom);
    this.clusterCache.put(key, cluster);
  }

  getMarkersInBounds(bounds) {
    if (!this.quadTree) return [];
    return this.quadTree.query(bounds);
  }

  clear() {
    this.markersCache = new LRUCache(1000);
    this.clusterCache = new LRUCache(500);
    this.quadTree = null;
  }
}

export const clusterCache = new ClusterCache();