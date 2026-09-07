# Generador de Códigos de Barras para Paulina Store

## Archivos Generados

| Archivo | Descripción |
|---------|-------------|
| `paulinastore_con_codigos.xlsx` | Excel con códigos de barras insertados |
| `codigos_barras/` | Carpeta con imágenes PNG de códigos de barras |
| `codigos_generados.json` | Registro de códigos ya procesados |

## Scripts Disponibles

### 1. `sincronizar_completo.py` (Recomendado)
Script unificado que:
- Detecta nuevos códigos en el Excel
- Genera imágenes de códigos de barras
- Inserta las imágenes en el Excel
- Mantiene un registro de códigos procesados

**Uso:**
```bash
python sincronizar_completo.py
```

### 2. `sincronizar_codigos.py`
Solo genera imágenes PNG en la carpeta `codigos_barras/`.

**Uso:**
```bash
python sincronizar_codigos.py
```

### 3. `insertar_codigos_en_excel.py`
Inserta códigos de barras en un nuevo archivo Excel.

**Uso:**
```bash
python insertar_codigos_en_excel.py
```

## Flujo de Trabajo

1. **Agregar productos** al archivo `paulinastore.xlsx` en la hoja "Datos de origen"
2. **Agregar códigos** en la columna "codigo" (formato EAN-13: 13 dígitos)
3. **Ejecutar** `python sincronizar_completo.py`
4. **Abrir** `paulinastore_con_codigos.xlsx` para ver los códigos de barras

## Formato de Códigos

| Dígitos | Formato | Ejemplo |
|---------|---------|---------|
| 13 | EAN-13 (estándar) | 7802337203252 |
| 12 | UPC-A (se agrega 0 al inicio) | 700159000936 → 0700159000936 |
| 14 | GTIN-14 (se toman primeros 13) | 78050000321581 → 7805000032158 |

## Notas

- Los códigos deben ser numéricos
- Formato recomendado: EAN-13 (13 dígitos)
- Los códigos de Chile comienzan con 780 o 700
- El script ignora productos sin código
