import os
import shutil
import winreg
import subprocess
from pathlib import Path

# Configuración
FONT_FILE = "LibreBarcodeEAN13Text-Regular.ttf"
FONT_NAME = "Libre Barcode EAN13 Text"

def install_font():
    """Instala la fuente en Windows"""
    print("Instalando fuente de código de barras...")
    
    # Ruta de la carpeta de fuentes del sistema
    fonts_dir = Path(os.environ["WINDIR"]) / "Fonts"
    
    # Verificar si la fuente ya está instalada
    font_path = fonts_dir / FONT_FILE
    if font_path.exists():
        print(f"  La fuente {FONT_NAME} ya está instalada.")
        return True
    
    # Copiar fuente a la carpeta del sistema
    source = Path(__file__).parent / FONT_FILE
    if not source.exists():
        print(f"  Error: No se encontró el archivo {FONT_FILE}")
        return False
    
    try:
        shutil.copy2(source, fonts_dir)
        print(f"  Fuente copiada a {fonts_dir}")
        
        # Registrar la fuente en el registro de Windows
        register_font(FONT_FILE, FONT_NAME)
        
        print(f"  Fuente {FONT_NAME} instalada correctamente.")
        return True
        
    except Exception as e:
        print(f"  Error al instalar la fuente: {e}")
        return False

def register_font(font_file, font_name):
    """Registra la fuente en el registro de Windows"""
    try:
        # Abrir clave del registro
        key = winreg.OpenKey(
            winreg.HKEY_LOCAL_MACHINE,
            r"SOFTWARE\Microsoft\Windows NT\CurrentVersion\Fonts",
            0,
            winreg.KEY_SET_VALUE
        )
        
        # Registrar la fuente
        winreg.SetValueEx(key, font_name, 0, winreg.REG_SZ, font_file)
        winreg.CloseKey(key)
        
    except Exception as e:
        print(f"  Advertencia: No se pudo registrar en el registro: {e}")

def check_font_installed():
    """Verifica si la fuente está instalada"""
    fonts_dir = Path(os.environ["WINDIR"]) / "Fonts"
    font_path = fonts_dir / FONT_FILE
    return font_path.exists()

if __name__ == "__main__":
    print("=" * 60)
    print("INSTALADOR DE FUENTE DE CÓDIGO DE BARRAS")
    print("=" * 60)
    
    if check_font_installed():
        print(f"La fuente {FONT_NAME} ya está instalada.")
    else:
        install_font()
    
    print("=" * 60)
    print("Ahora ejecute: python aplicar_fuente_excel.py")
    print("=" * 60)
