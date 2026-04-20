# 🏢 SmartPrice AI - Emlak Değerleme Platformu

[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.9+-blue.svg?style=flat&logo=python)](https://www.python.org/)
[![MapLibre GL JS](https://img.shields.io/badge/MapLibre-3.6.2-FF8119.svg?style=flat&logo=maplibre)](https://maplibre.org/)
[![Scikit-Learn](https://img.shields.io/badge/scikit--learn-1.3.1-F7931E.svg?style=flat&logo=scikit-learn)](https://scikit-learn.org/)
[![Shapely](https://img.shields.io/badge/Shapely-GIS-green.svg?style=flat)](https://shapely.readthedocs.io/)

SmartPrice AI, King County (Seattle) bölgesi için önceden eğitilmiş bir Makine Öğrenimi (Machine Learning) modeli kullanarak, girilen coğrafi ve fiziksel parametrelere göre anında, yüksek doğruluklu emlak piyasa değeri tahmini yapan kurumsal (enterprise-grade) bir PropTech (Gayrimenkul Teknolojisi) platformudur.

## 🌟 Öne Çıkan Özellikler

- **Dinamik Fiyat Tahmini (ML):** Scikit-Learn ile eğitilmiş model sayesinde yatak odası, metrekare, lokasyon ve inşaat kalitesi gibi parametreleri anlık olarak asıl fiyata yansıtır.
- **Akıllı GIS / Sahil Şeridi Algılama:** Sadece geçmiş verilere (Data-Bias) dayanmak yerine `Shapely` geometrik algılayıcılarını kullanır. Kullanıcı bir sahil veya göl kenarına tıkladığı an (Washington Gölü, Puget Sound vs.) sistem bunu algılar ve fiyata otomatik "Waterfront" primi yansıtır.
- **İnteraktif 3D Harita:** Açık kaynak `MapLibre GL JS` ile optimize edilmiş, derinlik ve aydınlatma yeteneği olan 3 Boyutlu vektör harita deneyimi sunar.
- **Micro-Service Mimarisi:** Backend (FastAPI) ve Frontend (Vanilla JS) mimarileri tamamen birbirinden ayrılarak modern bağımsız web standardına uyumlu hale getirilmiştir.
- **QA Otomasyonu:** Modelin mantık hataları veya uç senaryolarda (Edge Cases) sapmasını engelleyen bağımsız bir stres-test altyapısı mevcuttur.

---

## 🏗️ Mimari ve Kullanılan Teknolojiler

Platform birbirleriyle HTTP ve GeoJSON protokolleri üzerinden haberleşen iki ana modülden oluşmaktadır.

### ⚙️ Backend (Arka Plan)
- **FastAPI:** Yüksek performanslı ve asenkron REST API motoru.
- **Pandas / Joblib:** Makine öğrenimi modelinin belleğe alınması ve matris tahmin işlemleri.
- **Shapely:** Konumsal (Spatial) kesişim analizleri ve sınır kontrolleri (Bounding Boxes).

### 🎨 Frontend (Ön Yüz)
- **Vanilla JavaScript (ES6+ Strict Mode):** Bağımlılıklardan arındırılmış, modüler kod yapısı.
- **MapLibre GL / Turf.js:** Harita render işlemleri ve istemci taraflı coğrafi hesaplamalar.
- **Glassmorphism UI:** Özel yazılmış pürüzsüz CSS animasyonları, şeffaf katmanlar ve Apple-vari kurumsal arayüz.

---

## 📂 Proje Yapısı (Project Structure)

```bash
📦 EmlakFiyatTahmin
 ┣ 📂 backend            # Python FastAPI Servis Kümesi
 ┃ ┣ 📂 api              # REST API Router ve Endpoint'leri
 ┃ ┣ 📂 core             # Dinamik Path Çözücü ve App Config (CORS)
 ┃ ┣ 📂 services         # ML Servisi, Shapely GIS ve GeoJSON işleyiciler
 ┃ ┗ 📜 main.py          # Backend Entrypoint (Uvicorn)
 ┣ 📂 frontend           # UI/UX, JS Modülleri ve Statik Varlıklar
 ┃ ┣ 📂 css             
 ┃ ┣ 📂 js               # api.js, main.js, map.js, ui.js (Modüler Mimari)
 ┃ ┗ 📜 index.html        
 ┣ 📂 models             # Statik Data Formatları 
 ┃ ┣ 📜 ev_fiyat_modeli.pkl   # Eğitilmiş Model
 ┃ ┣ 📜 kc_house_data.csv     # Historical Eğitim Verisi (Ekranda render edilir)
 ┃ ┗ 📜 king_county.geojson   # Analiz Sınırı Polygon Formati
 ┣ 📂 tests              # Kalite Güvence (QA) Otomasyonu
 ┃ ┗ 📜 test_predictions.py
 ┣ 📜 requirements.txt   # Backend Bağımlılıkları
 ┣ 📜 .gitignore         
 ┗ 📜 README.md          # Proje Dokümantasyonu
```

---

## 🚀 Kurulum (Local Development)

Projenin kendi cihazınızda kusursuz çalışabilmesi için Backend ve Frontend servislerinin paralel şekilde ayaklandırılması gerekmektedir. 

### 1. Ortamı Hazırlayın ve Bağımlılıkları Kurun
Sistemi klonladıktan veya indirdikten sonra kök (root) dizininde aşağıdaki komutla kütüphaneleri yükleyin:
```bash
pip install -r requirements.txt
```

### 2. Backend Sunucusunu (FastAPI) Başlatın
Terminal 1'i açın, `backend` klasörüne girin ve Uvicorn sunucusunu başlatın.
```bash
cd backend
uvicorn main:app --reload
```
*(Sunucu varsayılan olarak `http://127.0.0.1:8000` adresinde çalışacaktır.)*

### 3. Frontend Web Arayüzünü Başlatın
İkinci bir terminal (Terminal 2) açın, `frontend` klasörüne girin ve lokal bir HTTP sunucusu kurun.
```bash
cd frontend
python -m http.server 3000
```

Artık tarayıcınızda [http://localhost:3000](http://localhost:3000) adresine giderek platformu deneyimleyebilirsiniz.

---

## 🧪 Otomasyon Testleri (QA)

Makine öğrenimi modelinizin sağlığını test etmek için test klasöründeki otomasyon dosyasını kullanabilirsiniz:

```bash
cd tests
python test_predictions.py
```
Bu script, sistemi; *Ultra Lüks Malikane*, *Standart Ev*, *Boş Kutu Modeli*, *Sınır Dışı Koordinat* ve *GIS Gölet Kenarı/Karasal* gibi çeşitli "Edge Case" (Uç Nokta) testleriyle sınar ve fiyat dengelerini terminalinize raporlar.

---

<br>
<p align="center">
  <b>Geleceğin Gayrimenkul Zekası.</b> <br><br>
  <i>Yalnızca Eğitim, Geliştirme ve Araştırma (R&D) Amaçlıdır.</i>
</p>
