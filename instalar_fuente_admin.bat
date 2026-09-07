@echo off
echo Instalando fuente de codigo de barras...
powershell -Command "Start-Process powershell -ArgumentList '-ExecutionPolicy Bypass -File \"%~dp0instalar_fuente.ps1\"' -Verb RunAs"
echo.
echo Si no aparecieron errores, la fuente esta instalada.
echo Presione cualquier tecla para continuar...
pause > nul
