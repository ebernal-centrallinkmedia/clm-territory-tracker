import { useEffect, useRef } from 'react';
import { STATUS_COLORS } from '../utils/constants';

// Pure Leaflet (no react-leaflet) for full control
let L = null;

function getL() {
  if (!L) L = window.L;
  return L;
}

function createPin(status) {
  const color = STATUS_COLORS[status] || '#94a3b8';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
    <path d="M14 0C6.27 0 0 6.27 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.27 21.73 0 14 0z" fill="${color}" stroke="white" stroke-width="2"/>
    <circle cx="14" cy="14" r="6" fill="white" opacity="0.9"/>
  </svg>`;
  return getL().divIcon({
    html: svg,
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -36],
    className: '',
  });
}

export default function MapComponent({ businesses, selectedId, onSelect, onMapClick }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const clusterRef = useRef(null);

  // Init map
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;
    const L = getL();
    if (!L) return;

    const map = L.map(containerRef.current, {
      center: [32.7767, -96.7970], // Dallas
      zoom: 13,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Zoom control top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Click to add
    map.on('click', (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    });

    // Cluster group
    if (L.markerClusterGroup) {
      const cluster = L.markerClusterGroup({
        maxClusterRadius: 60,
        iconCreateFunction: (cluster) => {
          const count = cluster.getChildCount();
          return L.divIcon({
            html: `<div style="width:36px;height:36px;border-radius:50%;background:#0a1628;color:white;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;border:2px solid #14b8c8;">${count}</div>`,
            className: '',
            iconSize: [36, 36],
          });
        }
      });
      map.addLayer(cluster);
      clusterRef.current = cluster;
    }

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // Sync markers
  useEffect(() => {
    const map = mapRef.current;
    const L = getL();
    if (!map || !L) return;

    const cluster = clusterRef.current;
    const existing = markersRef.current;
    const newIds = new Set(businesses.filter(b => b.lat && b.lng).map(b => b.id));

    // Remove stale
    Object.keys(existing).forEach(id => {
      if (!newIds.has(id)) {
        if (cluster) cluster.removeLayer(existing[id]);
        else existing[id].remove();
        delete existing[id];
      }
    });

    // Add/update
    businesses.forEach(b => {
      if (!b.lat || !b.lng) return;
      if (existing[b.id]) {
        existing[b.id].setIcon(createPin(b.status));
        return;
      }
      const marker = L.marker([b.lat, b.lng], { icon: createPin(b.status) });
      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        onSelect(b.id);
      });
      marker.bindTooltip(b.name, { direction: 'top', offset: [0, -32], className: '' });
      if (cluster) cluster.addLayer(marker);
      else marker.addTo(map);
      existing[b.id] = marker;
    });
  }, [businesses]);

  // Fly to selected
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedId) return;
    const b = businesses.find(x => x.id === selectedId);
    if (b?.lat && b?.lng) {
      map.flyTo([b.lat, b.lng], 16, { duration: 0.8 });
    }
  }, [selectedId]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
  );
}
