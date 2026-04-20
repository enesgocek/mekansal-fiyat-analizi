import requests
import json

# API Endpoint
URL = "http://127.0.0.1:8000/tahmin_et"

# Varsayılan temel özellikler (Her test için güncellenecek alanlar dışındakiler)
base_payload = {
    "bedrooms": 3,
    "bathrooms": 2.0,
    "sqft_living": 1500,
    "sqft_lot": 5000,
    "floors": 1.0,
    "waterfront": 0,
    "view": 0,
    "condition": 3,
    "grade": 7,
    "sqft_above": 1500,
    "sqft_basement": 0,
    "yr_built": 1990,
    "yr_renovated": 0,
    "zipcode": 98040, # Mercer Island vb genel test
    "lat": 47.5,
    "long": -122.2,
    "sqft_living15": 1500,
    "sqft_lot15": 5000
}

def run_test(test_name, modified_params):
    print(f"\n[{test_name.upper()}]")
    
    # Baz veri tablosu kopyalanır ve istenen parametreler güncellenir
    payload = base_payload.copy()
    payload.update(modified_params)
    
    print(f"Testing Parameters: {json.dumps(modified_params, indent=2)}")
    
    try:
        response = requests.post(URL, json=payload)
        
        if response.status_code == 200:
            result = response.json()
            price = result.get("tahmini_fiyat_dolar", "N/A")
            if price != "N/A":
                print(f"[OK] Prediction Successful:")
                print(f"--> Predicted Price: ${price:,.2f}")
            else:
                print("[FAIL] Prediction Failed: Missing expected JSON structure.")
                print(f"Response: {result}")
        else:
            print(f"[FAIL] HTTP Error {response.status_code}")
            print(f"Detail: {response.text}")
    except requests.exceptions.RequestException as e:
        print(f"[FAIL] Connection Error: {e}")
        print("💡 Ensure FastAPI is running on http://127.0.0.1:8000")

if __name__ == "__main__":
    print("==================================================")
    print("REAL ESTATE ML API - QA AUTOMATION TEST SCRIPT ")
    print("==================================================")

    # 1. The Luxury Mansion (High Value)
    run_test("The Luxury Mansion (Prime Area)", {
        "bedrooms": 5,
        "bathrooms": 4.0,
        "sqft_living": 5000,
        "lat": 47.57,    # Mercer Island / Bellevue
        "long": -122.22,
        "grade": 11,     # High build grade
        "sqft_above": 5000,
        "sqft_living15": 4000
    })

    # 2. The Standard Suburban Home (Average Value)
    run_test("The Standard Suburban Home", {
        "bedrooms": 3,
        "bathrooms": 2.0,
        "sqft_living": 1500,
        "lat": 47.48,    # Renton / Kent area
        "long": -122.20,
        "grade": 7,      # Average grade
        "sqft_above": 1500,
        "sqft_living15": 1400
    })

    # 3. Edge Cases & Stress Tests
    run_test("Edge Case: The Micro-Mansion (Unrealistic Density)", {
        "bedrooms": 5,
        "bathrooms": 4.0,
        "sqft_living": 600,   # Micro-sized but physically packed with rooms
        "grade": 5,
        "sqft_above": 600
    })

    run_test("Edge Case: The Empty Box", {
        "bedrooms": 0,
        "bathrooms": 0.0,
        "sqft_living": 2000,  # Large space, no distinct rooms
        "grade": 6,
        "sqft_above": 2000
    })

    run_test("Edge Case: Out of Bounds Coordinates", {
        "lat": 4.5,       # Unrelated global coordinates
        "long": 12.2
    })
    
    # 4. GIS Waterfront Filtration Tests
    print("\n--- GIS WATERFRONT DETECTION TESTS ---")
    run_test("Waterfront QA: Inland Control House", {
        "lat": 47.6062,    # Seattle Downtown (Inland)
        "long": -122.3321
    })

    run_test("Waterfront QA: Coastal Target House", {
        "lat": 47.58,      # Inside/Edge of Lake Washington bounds
        "long": -122.25
    })
    
    print("\n==================================================")
    print("QA COMPLETION ")
    print("==================================================")
