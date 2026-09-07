# Instalación de Fuente de Código de Barras

## Archivos Necesarios

| Archivo | Descripción |
|---------|-------------|
| `LibreBarcodeEAN13Text-Regular.ttf` | Fuente de código de barras EAN-13 |
| `aplicar_fuente_excel.py` | Script para aplicar la fuente al Excel |

## Pasos para Instalar la Fuente

### Opción 1: Instalación Manual (Recomendado)

1. **Haga doble clic** en el archivo `LibreBarcodeEAN13Text-Regular.ttf`
2. Se abrirá el visor de fuentes de Windows
3. **Haga clic en "Instalar"**
4. Espere a que se complete la instalación

### Opción 2: Usando el Script

1. **Ejecute** `instalar_fuente_admin.bat` como administrador
2. Siga las instrucciones en pantalla

## Aplicar la Fuente al Excel

Una vez instalada la fuente:

1. **Ejecute** `python aplicar_fuente_excel.py`
2. Se creará un archivo `paulinastore_con_fuente.xlsx`
3. Abra el archivo Excel
4. Los códigos en la columna B se mostrarán como barras

## Verificar la Instalación

Para verificar que la fuente está instalada:

1. Abra el Panel de Control
2. Vaya a "Fuentes"
3. Busque "Libre Barcode EAN13 Text"
4. Debe aparecer en la lista

## Solución de Problemas

### Si la fuente no se muestra en Excel:

1. **Cierre** Excel completamente
2. **Abra** Excel nuevamente
3. **Abra** el archivo `paulinastore_con_fuente.xlsx`

### Si la fuente no está instalada:

1. **Cierre** todas las aplicaciones de Office
2. **Instale** la fuente nuevamente
3. **Reinicie** el computador si es necesario

## Notas Importantes

- La fuente es **gratuita y de código abierto** (OFL)
- Funciona con **Excel 2010 o superior**
- Los códigos deben tener **13 dígitos** (EAN-13)
- Los códigos de Chile comienzan con **780** o **700
