"use strict";
// MapLibre ve GIS Sınırı

let map;
let marker;
let buildingSourceId = null;
let targetRadarRadius = 0;

export function initMap(containerId, startLng, startLat) {
    map = new maplibregl.Map({
        container: containerId,
        style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
        center: [startLng, startLat],
        zoom: 16.5,
        minZoom: 8,
        maxBounds: [
            [-124.5, 46.0], // Güneybatı (SW) Washington/King County kısıtı
            [-120.0, 49.0]  // Kuzeydoğu (NE) kısıtı
        ],
        renderWorldCopies: false,
        pitch: 45,
        bearing: -15
    });

    return map;
}

export function createModernMarker(startLng, startLat) {
    const el = document.createElement('div');
    el.className = 'smooth-marker';
    el.innerHTML = `
        <div class="marker-card" id="marker-price">Konum Seçin</div>
        <div class="marker-pin"></div>
    `;

    marker = new maplibregl.Marker({
        element: el,
        anchor: 'bottom'
    }).setLngLat([startLng, startLat]).addTo(map);
    
    return marker;
}

export function setupMapLayers(kingCountyPolygon, houseGeoJSON, startLng, startLat) {
    const initializeLayers = () => {
        const sources = map.getStyle().sources;
        let vectorSourceId = null;
        let labelLayerId;

        for (const id in sources) {
            if (sources[id].type === 'vector') {
                vectorSourceId = id;
                break;
            }
        }

        // Güvenli Katman Ekleme Fonksiyonu
        const safeAddLayer = (layerObj, before) => {
            if (before && map.getLayer(before)) {
                map.addLayer(layerObj, before);
            } else if (labelLayerId && map.getLayer(labelLayerId)) {
                map.addLayer(layerObj, labelLayerId);
            } else {
                map.addLayer(layerObj);
            }
        };

        if (vectorSourceId) {
            const layers = map.getStyle().layers;
            for (let i = 0; i < layers.length; i++) {
                if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
                    labelLayerId = layers[i].id;
                    break;
                }
            }
        }

        if (vectorSourceId) {
            buildingSourceId = vectorSourceId;

            // 3D Binalar (Zemin Ana Katman - Sadece Görsel)
            safeAddLayer({
                'id': '3d-buildings',
                'source': vectorSourceId,
                'source-layer': 'building',
                'type': 'fill-extrusion',
                'minzoom': 13,
                'paint': {
                    'fill-extrusion-color': [
                        'interpolate', ['linear'], ['coalesce', ['get', 'height'], 0],
                        0, '#1e293b',
                        30, '#334155',
                        80, '#475569',
                        180, '#94a3b8',
                        300, '#e2e8f0'
                    ],
                    'fill-extrusion-height': ['coalesce', ['get', 'render_height'], ['get', 'height'], 12],
                    'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], ['get', 'min_height'], 0],
                    'fill-extrusion-opacity': 0.4
                }
            }, labelLayerId);
        }

        // King County Focus Mask
        if (kingCountyPolygon) {
            const focusMask = turf.mask(kingCountyPolygon.features[0]);
            
            map.addSource('focus-mask-source', {
                type: 'geojson',
                data: focusMask
            });

            safeAddLayer({
                'id': 'focus-mask-fill',
                'type': 'fill',
                'source': 'focus-mask-source',
                'paint': { 'fill-color': '#000000', 'fill-opacity': 0.75 }
            }, labelLayerId);

            map.addSource('kc-precise-boundary', {
                type: 'geojson',
                data: kingCountyPolygon
            });

            safeAddLayer({
                'id': 'kc-boundary-core',
                'type': 'line',
                'source': 'kc-precise-boundary',
                'paint': {
                    'line-color': '#f8fafc',
                    'line-width': 2.5,
                    'line-dasharray': [1, 2],
                    'line-opacity': 0.9
                }
            }, labelLayerId);
        }

        // Heatmap & Point Cloud
        if (houseGeoJSON) {
            // Guard Clause (Erken Çıkış): Eğer veri tam yüklenmediyse işlemi pas geç
            if (!houseGeoJSON || !houseGeoJSON.features) {
                console.warn("[QA AUDIT] Heatmap source data format is invalid or undefined.");
                return;
            }

            map.addSource('houses-dataset', {
                type: 'geojson',
                data: houseGeoJSON
            });

            safeAddLayer({
                'id': 'houses-heatmap',
                'type': 'heatmap',
                'source': 'houses-dataset',
                'maxzoom': 15,
                'paint': {
                    'heatmap-weight': 1,
                    'heatmap-color': [
                        'interpolate', ['linear'], ['heatmap-density'],
                        0, 'rgba(15, 23, 42, 0)',
                        0.2, 'rgba(15, 30, 60, 0.2)',   // Deep muted navy
                        0.6, 'rgba(30, 64, 110, 0.4)',  // Corporate blue
                        1, 'rgba(45, 120, 140, 0.6)'    // Muted teal core
                    ],
                    'heatmap-opacity': 0.45, // Reduced for subtle background effect
                    'heatmap-radius': [
                        'interpolate', ['linear'], ['zoom'],
                        8, 15,
                        15, 50
                    ] // Increased radius for smooth blending
                }
            }, '3d-buildings');

            safeAddLayer({
                'id': 'houses-point-cloud',
                'type': 'circle',
                'source': 'houses-dataset',
                'minzoom': 11,
                'paint': {
                    'circle-radius': 2,
                    'circle-color': '#10b981',
                    'circle-opacity': 0.5,
                    'circle-stroke-width': 0
                }
            }, '3d-buildings');
        }

        // Radar Halkası Katmanı
        map.addSource('radar-source', {
            type: 'geojson',
            data: {
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [startLng, startLat] }
            }
        });

        map.addLayer({
            'id': 'radar-layer',
            'type': 'circle',
            'source': 'radar-source',
            'paint': {
                'circle-radius': 0,
                'circle-color': '#d4af37',
                'circle-opacity': 0,
                'circle-stroke-width': 2,
                'circle-stroke-color': '#d4af37',
                'circle-stroke-opacity': 0,
                'circle-pitch-alignment': 'map'
            }
        });

        function animateLivingWorld() {
            targetRadarRadius += 0.8;
            let currentRadarOpacity = 1;

            if (targetRadarRadius > 250) {
                targetRadarRadius = 0;
            } else {
                currentRadarOpacity = 1 - (targetRadarRadius / 250);
            }

            if (map.getLayer('radar-layer')) {
                map.setPaintProperty('radar-layer', 'circle-radius', targetRadarRadius);
                map.setPaintProperty('radar-layer', 'circle-stroke-opacity', currentRadarOpacity * 0.9);
                map.setPaintProperty('radar-layer', 'circle-opacity', currentRadarOpacity * 0.15);
            }

            requestAnimationFrame(animateLivingWorld);
        }
        animateLivingWorld();
    };

    if (map.loaded()) {
        initializeLayers();
    } else {
        map.on('load', initializeLayers);
    }
}

// 3D Bina Tıklama Durumu Yönetimi (Kullanıcı İsteği İle Kapatıldı)
export function setBuildingSelection(e) {
    // Hologram aydınlatma ve bina izolasyonu kullanılmayacak, daima Mavi İşaretçi (Blue Marker) kullanılacak.
    return false;
}

export function updateMapFocus(lng, lat) {
    marker.setLngLat([lng, lat]);
    
    if (map.getSource('radar-source')) {
        map.getSource('radar-source').setData({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [lng, lat] }
        });
    }

    map.easeTo({
        center: [lng, lat],
        padding: { left: 400 },
        duration: 1000
    });
}
