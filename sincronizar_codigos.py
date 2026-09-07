import openpyxl
import barcode
from barcode.writer import ImageWriter
import os
import json
from datetime import datetime

# Configuración
EXCEL_FILE = "paulinastore.xlsx"
OUTPUT_DIR = "codigos_barras"
REGISTRY_FILE = "codigos_generados.json"

# Crear directorio de salida si no existe
if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

# Cargar registro de códigos ya generados
if os.path.exists(REGISTRY_FILE):
    with open(REGISTRY_FILE, "r", encoding="utf-8") as f:
        registry = json.load(f)
else:
    registry = {"codigos": [], "ultima_actualizacion": None}

# Leer Excel
wb = openpyxl.load_workbook(EXCEL_FILE, data_only=True)
ws = wb["Datos de origen"]

print("=" * 60)
print("SINCRONIZADOR DE CÓDIGOS DE BARRAS")
print("=" * 60)
print(f"Fecha: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
print(f"Archivo Excel: {EXCEL_FILE}")
print("-" * 60)

nuevos = 0
existentes = 0
errores = []

for row in ws.iter_rows(min_row=2, max_col=4):
    producto = row[0].value
    codigo = row[1].value
    precio_venta = row[2].value
    
    if codigo is None:
        continue
    
    # Convertir a string y normalizar
    codigo_str = str(int(codigo)) if isinstance(codigo, (int, float)) else str(codigo)
    
    # Ajustar longitud según formato
    if len(codigo_str) == 12:
        codigo_str = "0" + codigo_str
    elif len(codigo_str) == 14:
        codigo_str = codigo_str[:13]
    elif len(codigo_str) != 13:
        errores.append(f"{producto}: {codigo_str} ({len(codigo_str)} dígitos)")
        continue
    
    # Verificar si ya existe el código
    if codigo_str in registry["codigos"]:
        existentes += 1
        continue
    
    # Generar nuevo código de barras
    try:
        ean = barcode.get("ean13", code=codigo_str, writer=ImageWriter())
        
        # Nombre del archivo
        nombre_limpio = "".join(c if c.isalnum() or c in " -_" else "" for c in producto)
        nombre_limpio = nombre_limpio.strip()[:50]
        
        filepath = os.path.join(OUTPUT_DIR, f"{nombre_limpio}_{codigo_str}")
        saved_path = ean.save(filepath)
        
        # Agregar al registro
        registry["codigos"].append(codigo_str)
        
        nuevos += 1
        
        print(f"  NUEVO: {producto}")
        print(f"         Código: {codigo_str}")
        print(f"         Archivo: {saved_path}")
        
    except Exception as e:
        errores.append(f"{producto}: {codigo_str} - {str(e)}")

# Actualizar registro
registry["ultima_actualizacion"] = datetime.now().isoformat()
with open(REGISTRY_FILE, "w", encoding="utf-8") as f:
    json.dump(registry, f, ensure_ascii=False, indent=2)

# Resumen
print("-" * 60)
print("RESUMEN:")
print(f"  Códigos existentes (ya generados): {existentes}")
print(f"  Códigos nuevos generados: {nuevos}")
print(f"  Errores: {len(errores)}")

if errores:
    print("\nErrores:")
    for err in errores:
        print(f"  - {err}")

print("-" * 60)
print(f"Total de códigos en registro: {len(registry['codigos'])}")
print(f"Carpeta de salida: {OUTPUT_DIR}/")
print("=" * 60)
