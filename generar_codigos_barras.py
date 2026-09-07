import openpyxl
import barcode
from barcode.writer import ImageWriter
import os

# Configuración
EXCEL_FILE = "paulinastore.xlsx"
OUTPUT_DIR = "codigos_barras"

# Crear directorio de salida
if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

# Leer Excel
wb = openpyxl.load_workbook(EXCEL_FILE, data_only=True)
ws = wb["Datos de origen"]

print("Generando códigos de barras...")
print("-" * 50)

codigos_generados = []
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
        # UPC-A → EAN-13 con cero adelante
        codigo_str = "0" + codigo_str
        print(f"  Ajustado a 13 dígitos: {codigo_str}")
    elif len(codigo_str) == 14:
        # GTIN-14, tomar primeros 13 para EAN-13
        codigo_str = codigo_str[:13]
        print(f"  Ajustado a 13 dígitos: {codigo_str}")
    elif len(codigo_str) != 13:
        errores.append(f"  {producto}: {codigo_str} ({len(codigo_str)} dígitos) - formato no estándar")
        continue
    
    try:
        # Generar código de barras EAN-13
        ean = barcode.get("ean13", code=codigo_str, writer=ImageWriter())
        
        # Nombre del archivo basado en el producto (limpiar caracteres especiales)
        nombre_limpio = "".join(c if c.isalnum() or c in " -_" else "" for c in producto)
        nombre_limpio = nombre_limpio.strip()[:50]
        
        filepath = os.path.join(OUTPUT_DIR, f"{nombre_limpio}_{codigo_str}")
        saved_path = ean.save(filepath)
        
        codigos_generados.append({
            "producto": producto,
            "codigo": codigo_str,
            "archivo": saved_path,
            "precio": precio_venta
        })
        
        print(f"  OK: {producto}")
        print(f"      Código: {codigo_str}")
        print(f"      Archivo: {saved_path}")
        
    except Exception as e:
        errores.append(f"  {producto}: {codigo_str} - Error: {str(e)}")

print("\n" + "=" * 50)
print(f"RESUMEN:")
print(f"  Códigos generados: {len(codigos_generados)}")
print(f"  Errores: {len(errores)}")

if errores:
    print("\nErrores:")
    for err in errores:
        print(err)

print(f"\nLos códigos de barras se guardaron en: {OUTPUT_DIR}/")
