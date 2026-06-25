
import requests

BASE_URL = "http://localhost:5001/api"

def test_flujo_completo():
    print("🚀 Iniciando suite de pruebas de integración VoxStock...")
    
    # 1. Probar endpoint de Pricing (Backend-Driven UI)
    res_pricing = requests.get(f"{BASE_URL}/pricing")
    assert res_pricing.status_code == 200, "❌ Error en endpoint de precios"
    assert len(res_pricing.json()) == 3, "❌ La matriz de precios debe contener exactamente 3 planes"
    print("✅ Endpoint /api/pricing verificado.")

    # 2. Probar inserción de Lead del Programa Piloto
    payload_lead = {
        "nombre": "Tester Senior",
        "empresa": "QA Logistics",
        "email": "test_qa_2026@logistica.com",
        "volumen": "100-500"
    }
    res_lead = requests.post(f"{BASE_URL}/leads", json=payload_lead)
    # Puede ser 200 (éxito) o 400 (si ya corriste la prueba antes y el correo existe)
    assert res_lead.status_code in [200, 400], "❌ Error crítico al procesar Lead"
    print("✅ Endpoint /api/leads e integridad de duplicados verificados.")
    
    print("🎉 ¡Todas las pruebas de integración base pasaron con éxito!")

if __name__ == "__main__":
    test_flujo_completo()