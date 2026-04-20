"use strict";
// Arayüz Düğmeleri ve DOM Manipülasyonları Sınırı

export const elements = {
    btn: document.querySelector('button'),
    sonucEtiket: document.getElementById('fiyat-etiket'),
    evIciYazi: document.getElementById('marker-price'),
    uyariDiv: document.getElementById('sinir-uyarisi'),
    konumInput: document.getElementById('konum'),
    bedroomsInput: document.getElementById('bedrooms'),
    bathroomsInput: document.getElementById('bathrooms'),
    sqftLivingInput: document.getElementById('sqft_living'),
    gradeInput: document.getElementById('grade'),
    markerPin: document.querySelector('.marker-pin') // Will only be available after marker is created, evaluated later.
};

export function updateLocationText(lat, lng) {
    elements.konumInput.value = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

export function showBoundaryWarning() {
    if (elements.uyariDiv) {
        elements.uyariDiv.innerText = "⚠️ Lütfen veri seti dahilindeki King County sınırları içinden bir konum seçin.";
        elements.uyariDiv.style.display = 'block';
        setTimeout(() => { elements.uyariDiv.style.display = 'none'; }, 4000);
    }
}

export function hideBoundaryWarning() {
    if (elements.uyariDiv) elements.uyariDiv.style.display = 'none';
}

export function setLoadingState() {
    if (elements.btn.disabled) return false; // Zaten yükleniyor (Spam kilidi başarılı)
    
    elements.btn.disabled = true;
    elements.btn.style.opacity = '0.5';
    elements.btn.innerText = "Hesaplanıyor...";
    elements.sonucEtiket.innerText = "...";
    
    // We update evIciYazi if it exists in DOM
    const evYazi = document.getElementById('marker-price');
    if (evYazi) evYazi.innerText = "...";
    
    return true;
}

export function resetLoadingState() {
    elements.btn.disabled = false;
    elements.btn.style.opacity = '1';
    elements.btn.innerText = "Piyasa Değerini Hesapla";
}

export function toggleMarkerPinVisibility(isVisible) {
    const pin = document.querySelector('.marker-pin');
    if (pin) pin.style.display = isVisible ? 'block' : 'none';
}

export function setCalculationWaitState() {
    const evYazi = document.getElementById('marker-price');
    if (evYazi) evYazi.innerText = "Hesaplanıyor...";
    elements.sonucEtiket.innerText = "—";
    elements.sonucEtiket.style.color = "var(--text-muted)";
}

export function getFormData(lat, lng) {
    const userSqftLiving = parseInt(elements.sqftLivingInput.value) || 0;
    const smartLotSize = Math.floor(userSqftLiving * 1.5 > 5000 ? userSqftLiving * 1.5 : 5000);
    
    return {
        bedrooms: parseInt(elements.bedroomsInput.value) || 0,
        bathrooms: parseFloat(elements.bathroomsInput.value) || 0,
        sqft_living: userSqftLiving,
        sqft_lot: smartLotSize, floors: 1.0, waterfront: 0, view: 0, condition: 3,
        grade: parseInt(elements.gradeInput.value) || 7,
        sqft_above: userSqftLiving,
        sqft_basement: 0, yr_built: 1990, yr_renovated: 0, zipcode: 98103,
        lat: lat, 
        long: lng,
        sqft_living15: userSqftLiving,
        sqft_lot15: smartLotSize
    };
}

export function displayResult(sonuc) {
    const formatliFiyat = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(sonuc.tahmini_fiyat_dolar);
    
    elements.sonucEtiket.innerText = formatliFiyat;
    elements.sonucEtiket.style.color = "var(--text-main)";

    const evYazi = document.getElementById('marker-price');
    if (evYazi) {
        if (sonuc.tahmini_fiyat_dolar >= 1000000) {
            evYazi.innerText = "$" + (sonuc.tahmini_fiyat_dolar / 1000000).toFixed(2) + "M";
        } else if (sonuc.tahmini_fiyat_dolar >= 1000) {
            evYazi.innerText = "$" + (sonuc.tahmini_fiyat_dolar / 1000).toFixed(0) + "K";
        } else {
            evYazi.innerText = formatliFiyat;
        }
    }
}

export function displayError(hata) {
    if (hata && hata.name === 'AbortError') {
        elements.sonucEtiket.innerText = "Zaman Aşımı (Timeout)";
    } else {
        elements.sonucEtiket.innerText = "Sistem Hatası";
    }
    
    const evYazi = document.getElementById('marker-price');
    if (evYazi) evYazi.innerText = "Hata";
    
    elements.sonucEtiket.style.color = "#ef4444"; // Error Red
}
