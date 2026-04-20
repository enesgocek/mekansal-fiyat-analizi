"use strict";
// Backend ve Dış Kaynak İstekleri (Network / API Sınırı)

export async function fetchKingCountyBoundary() {
    try {
        const res = await fetch('http://127.0.0.1:8000/king_county_boundary');
        if (!res.ok) throw new Error("Ağ hatası: " + res.status);
        return await res.json();
    } catch (err) {
        console.error("Sınır verisi alınamadı:", err);
        return null;
    }
}

export async function fetchHousesGeoJSON() {
    try {
        const res = await fetch('http://127.0.0.1:8000/api/houses_geojson');
        if (res.ok) {
            const data = await res.json();
            // Backend HTTP 200 dönse bile kendi içinde hata mesajı fırlattıysa yakala
            if (data.error) {
                console.warn("Backend veriyi çekemedi, Mock veriye (yedek) geçiliyor:", data.error);
                return generateMockHouseClusters();
            }
            return data;
        } else {
            return generateMockHouseClusters();
        }
    } catch (err) {
        console.error("Dataset yüklenemedi:", err);
        return generateMockHouseClusters();
    }
}

export async function fetchPricePrediction(istekVerisi, controller) {
    const response = await fetch('http://127.0.0.1:8000/tahmin_et', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(istekVerisi),
        signal: controller.signal
    });
    
    if (!response.ok) throw new Error("Sunucu işleyemedi: " + response.status);
    return await response.json();
}

export function generateMockHouseClusters() {
    const features = [];
    const centers = [
        { lng: -122.33, lat: 47.61, count: 500, spread: 0.1 },  // Seattle Downtown
        { lng: -122.20, lat: 47.61, count: 400, spread: 0.08 }, // Bellevue
        { lng: -122.10, lat: 47.45, count: 300, spread: 0.05 },
        { lng: -122.30, lat: 47.30, count: 200, spread: 0.04 }
    ];

    centers.forEach(center => {
        for (let i = 0; i < center.count; i++) {
            const r = center.spread * Math.sqrt(Math.random());
            const theta = Math.random() * 2 * Math.PI;
            const cLng = center.lng + r * Math.cos(theta);
            const cLat = center.lat + r * Math.sin(theta);
            features.push({
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [cLng, cLat] }
            });
        }
    });

    return { type: 'FeatureCollection', features: features };
}
