# Paulina Store - Generador de Códigos de Barras

Sistema completo para gestionar productos con códigos de barras, conectado a Neon Database.

## Requisitos

- Node.js instalado
- Cuenta en Neon (ya configurada)

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Iniciar el servidor:
```bash
iniciar_servidor.bat
```

3. Abrir en el navegador:
```
http://localhost:3000
```

## Funcionalidades

- **Agregar productos** con nombre, código, precios y categoría
- **Generar códigos de barras** automáticamente (EAN-13)
- **Editar productos** existentes
- **Eliminar productos**
- **Buscar** productos por nombre o código
- **Exportar a CSV** para Excel
- **Imprimir** códigos de barras
- **Base de datos en la nube** (Neon PostgreSQL)

## Archivos

| Archivo | Descripción |
|---------|-------------|
| `server.js` | Servidor backend con Express |
| `database.js` | Conexión a Neon Database |
| `.env` | Variables de entorno (DATABASE_URL) |
| `public/index.html` | Página principal |
| `iniciar_servidor.bat` | Script para iniciar el servidor |

## API Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/productos | Obtener todos los productos |
| POST | /api/productos | Agregar nuevo producto |
| PUT | /api/productos/:id | Actualizar producto |
| DELETE | /api/productos/:id | Eliminar producto |

## Base de Datos

La información se almacena en Neon Database (PostgreSQL en la nube), lo que permite:
- Acceder desde cualquier dispositivo
- Compartir datos con otros usuarios
- Respaldos automáticos
- Escalabilidad
