import requests
import openpyxl

API_URL = "https://paulina-livid.vercel.app/api/productos"

# Primero eliminar productos existentes
print("Limpiando productos anteriores...")
try:
    response = requests.get(API_URL)
    if response.ok:
        products = response.json()
        for p in products:
            requests.delete(f"{API_URL}/{p['id']}")
            print(f"  Eliminado: {p.get('descripcion', p.get('producto', 'N/A'))}")
except Exception as e:
    print(f"Error al limpiar: {e}")

# Leer productos del Excel
print("\nImportando productos del Excel...")
wb = openpyxl.load_workbook("paulinastore.xlsx", data_only=True)
ws = wb["Datos de origen"]

productos = []
for row in ws.iter_rows(min_row=2, max_col=4):
    producto = row[0].value
    codigo = row[1].value
    precio_venta = row[2].value
    precio_costo = row[3].value
    
    if codigo is None:
        continue
    
    # Normalizar código a 13 dígitos
    codigo_str = str(int(codigo)) if isinstance(codigo, (int, float)) else str(codigo)
    if len(codigo_str) == 12:
        codigo_str = "0" + codigo_str
    elif len(codigo_str) == 14:
        codigo_str = codigo_str[:13]
    
    productos.append({
        "codigo": codigo_str,
        "descripcion": producto.strip(),
        "precioCompra": float(precio_costo) if precio_costo else 0,
        "precioVenta": float(precio_venta) if precio_venta else 0,
        "precioMayor": 0,
        "cantidadMayor": 1,
        "tipo": "UNITARIO",
        "descuento": 0,
        "familia": "ABARROTES",
        "proveedor": "",
        "stock": 0,
        "stockCritico": 0
    })

# Insertar en la API
exitos = 0
errores = 0

for prod in productos:
    try:
        response = requests.post(API_URL, json=prod)
        if response.status_code in [200, 201]:
            print(f"  OK: {prod['descripcion']}")
            exitos += 1
        else:
            print(f"  ERROR: {prod['descripcion']} - {response.text}")
            errores += 1
    except Exception as e:
        print(f"  ERROR: {prod['descripcion']} - {str(e)}")
        errores += 1

print(f"\nRESUMEN: {exitos} insertados, {errores} errores")
