@echo off
echo ========================================
echo  Instalador de Fuente de Codigo de Barras
echo ========================================
echo.
echo Este script instalara la fuente "Libre Barcode EAN13 Text"
echo en su sistema para usar en Excel.
echo.
echo Presione cualquier tecla para continuar...
pause > nul

echo.
echo Intentando instalar como administrador...
echo.

:: Verificar si tiene permisos de administrador
net session >nul 2>&1
if %errorLevel% == 0 (
    echo Ejecutando con permisos de administrador...
    python "%~dp0instalar_fuente.py"
) else (
    echo Solicitando permisos de administrador...
    powershell -Command "Start-Process python -ArgumentList '%~dp0instalar_fuente.py' -Verb RunAs"
)

echo.
echo ========================================
echo  Proceso completado!
echo ========================================
echo.
echo Ahora ejecute: python aplicar_fuente_excel.py
echo.
echo Presione cualquier tecla para salir...
pause > nul
