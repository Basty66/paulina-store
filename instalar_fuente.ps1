# Script de PowerShell para instalar la fuente
$fontSourcePath = "C:\Users\crist\Desktop\paulina\LibreBarcodeEAN13Text-Regular.ttf"
$fontDestPath = "C:\Windows\Fonts\LibreBarcodeEAN13Text-Regular.ttf"

# Copiar la fuente
Copy-Item -Path $fontSourcePath -Destination $fontDestPath -Force

# Registrar en el registro
$regPath = "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Fonts"
New-ItemProperty -Path $regPath -Name "Libre Barcode EAN13 Text (TrueType)" -Value "LibreBarcodeEAN13Text-Regular.ttf" -PropertyType String -Force

Write-Host "Fuente instalada correctamente"
