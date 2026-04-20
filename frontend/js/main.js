"use strict";
import { fetchKingCountyBoundary, fetchHousesGeoJSON, fetchPricePrediction } from './api.js';
import { 
    initMap, 
    setupMapLayers, 
    setBuildingSelection, 
    updateMapFocus,
    createModernMarker
} from './map.js';
import { 
    updateLocationText, 
    showBoundaryWarning, 
    hideBoundaryWarning, 
    setLoadingState, 
    resetLoadingState, 
    setCalculationWaitState, 
    getFormData, 
    displayResult, 
    displayError,
    toggleMarkerPinVisibility
} from './ui.js';

let secilenEnlem = 47.6062;
let secilenBoylam = -122.3321;
let kingCountyPolygon = null;

// INIT
// 1. Haritayı Ayağa Kaldır
const map = initMap('map-container', secilenBoylam, secilenEnlem);
createModernMarker(secilenBoylam, secilenEnlem);

// 2. Verileri Asenkron Çek (Anonim Async Fonksiyon ile sarmalandı)
(async () => {
    kingCountyPolygon = await fetchKingCountyBoundary();
    const houseGeoJSON = await fetchHousesGeoJSON();

    // 3. Katmanları Haritaya İşle
    setupMapLayers(kingCountyPolygon, houseGeoJSON, secilenBoylam, secilenEnlem);
})();

// 4. Etkileşim: Haritaya Tıklama
map.on('click', (e) => {
    const lat = e.lngLat.lat;
    const lng = e.lngLat.lng;

    // QA: Sınır İçi Kontrolü
    if (kingCountyPolygon) {
        const point = turf.point([lng, lat]);
        const isInside = turf.booleanPointInPolygon(point, kingCountyPolygon.features[0]);
        if (!isInside) {
            showBoundaryWarning();
            return;
        }
    } else {
        return; // Polygon yüklenmediyse bekle
    }

    hideBoundaryWarning();

    // Bina Tıklandı mı yoksa Boş Arsa mı?
    const isBuilding = setBuildingSelection(e);
    toggleMarkerPinVisibility(!isBuilding);

    // Global Değişkenleri ve UI'ı Güncelle
    secilenBoylam = lng;
    secilenEnlem = lat;
    updateLocationText(secilenEnlem, secilenBoylam);
    updateMapFocus(secilenBoylam, secilenEnlem);
    setCalculationWaitState();
});

// 5. Etkileşim: Butona Tıklama (Global Scope'da inline çalışmayacağı için manual bağlıyoruz)
document.getElementById('btn-hesapla').addEventListener('click', fiyatHesapla);

async function fiyatHesapla() {
    // Spam Kilidi
    if (!setLoadingState()) return;

    // Form verilerini ve akıllı matematiği UI modülünden al
    const istekVerisi = getFormData(secilenEnlem, secilenBoylam);

    // Timeout QA
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
        const sonuc = await fetchPricePrediction(istekVerisi, controller);
        clearTimeout(timeoutId);

        // Negative Extrapolation QA
        if (sonuc.tahmini_fiyat_dolar <= 0) throw new Error("İmkansız/Negatif Fiyat Verisi");

        if (sonuc.durum === "basarili") {
            displayResult(sonuc);
        } else {
            throw new Error("API Hatası");
        }
    } catch (hata) {
        displayError(hata);
        console.error(hata);
    } finally {
        resetLoadingState();
    }
}
