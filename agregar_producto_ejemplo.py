import openpyxl
import random

# Configuración
EXCEL_FILE = "paulinastore.xlsx"

# Leer Excel
wb = openpyxl.load_workbook(EXCEL_FILE)
ws = wb["Datos de origen"]

# Agregar un producto de ejemplo con código nuevo
nuevo_producto = "Producto de Ejemplo " + str(random.randint(1000, 9999))
nuevo_codigo = "780" + str(random.randint(100000000, 999999999))  # Código EAN-13 chileno
nuevo_precio = random.randint(1000, 5000)

# Encontrar la siguiente fila vacía
siguiente_fila = ws.max_row + 1

# Agregar nuevo producto
ws.cell(row=siguiente_fila, column=1, value=nuevo_producto)
ws.cell(row=siguiente_fila, column=2, value=int(nuevo_codigo))
ws.cell(row=siguiente_fila, column=3, value=nuevo_precio)

# Guardar Excel
wb.save(EXCEL_FILE)

print("=" * 60)
print("NUEVO PRODUCTO AGREGADO")
print("=" * 60)
print(f"Producto: {nuevo_producto}")
print(f"Código: {nuevo_codigo}")
print(f"Precio: ${nuevo_precio}")
print("-" * 60)
print("Ahora ejecute: python sincronizar_completo.py")
print("=" * 60)
