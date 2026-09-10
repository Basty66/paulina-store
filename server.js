const express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');
const { initDatabase, getProductos, addProducto, updateProducto, deleteProducto, getFamilias, addFamilia, updateFamilia, deleteFamilia, getAllReady, setReady, addHistory, getHistory, getHistoryByProduct, getAllScanned, setScanned } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Rutas API
app.get('/api/productos', async (req, res) => {
    try {
        const productos = await getProductos();
        res.json(productos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener productos' });
    }
});

app.post('/api/productos', async (req, res) => {
    try {
        const nuevoProducto = await addProducto(req.body);
        await addHistory(nuevoProducto.id, 'CREATE', nuevoProducto);
        res.status(201).json(nuevoProducto);
    } catch (error) {
        res.status(500).json({ error: 'Error al agregar producto' });
    }
});

app.put('/api/productos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const before = (await getProductos()).find(p => p.id == id);
        const productoActualizado = await updateProducto(id, req.body);
        await addHistory(id, 'UPDATE', { before, after: productoActualizado });
        res.json(productoActualizado);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar producto' });
    }
});

app.delete('/api/productos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const before = (await getProductos()).find(p => p.id == id);
        await deleteProducto(id);
        await addHistory(id, 'DELETE', before);
        res.json({ message: 'Producto eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar producto' });
    }
});

// ===== FAMILIAS API =====
app.get('/api/familias', async (req, res) => {
    try {
        const familias = await getFamilias();
        res.json(familias);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener familias' });
    }
});

app.post('/api/familias', async (req, res) => {
    try {
        const nuevaFamilia = await addFamilia(req.body);
        res.status(201).json(nuevaFamilia);
    } catch (error) {
        res.status(500).json({ error: 'Error al agregar familia' });
    }
});

app.put('/api/familias/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const familiaActualizada = await updateFamilia(id, req.body);
        res.json(familiaActualizada);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar familia' });
    }
});

app.delete('/api/familias/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await deleteFamilia(id);
        res.json({ message: 'Familia eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar familia' });
    }
});

// ===== PRODUCT READY API =====
app.get('/api/ready', async (req, res) => {
    try {
        const ready = await getAllReady();
        res.json(ready);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener ready' });
    }
});

app.post('/api/ready', async (req, res) => {
    try {
        const { productId, ready } = req.body;
        await setReady(productId, ready);
        res.json({ ok: true });
    } catch (error) {
        res.status(500).json({ error: 'Error al guardar ready' });
    }
});

// ===== HISTORY API =====
app.get('/api/history', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const history = await getHistory(limit);
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener historial' });
    }
});

app.get('/api/history/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const history = await getHistoryByProduct(productId);
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener historial' });
    }
});

// ===== SCANNED API =====
app.get('/api/scanned', async (req, res) => {
    try {
        const scanned = await getAllScanned();
        res.json(scanned);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener escaneados' });
    }
});

app.post('/api/scanned', async (req, res) => {
    try {
        const { productId, scanned } = req.body;
        await setScanned(productId, scanned);
        res.json({ ok: true });
    } catch (error) {
        res.status(500).json({ error: 'Error al guardar escaneado' });
    }
});

// OCR con Gemini Vision
app.post('/api/ocr-factura', async (req, res) => {
    try {
        const { image, mimeType } = req.body;
        if (!image) return res.status(400).json({ error: 'No image provided' });

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{
                inlineData: {
                    mimeType: mimeType || 'image/jpeg',
                    data: image,
                },
            }, `Eres un extractor de facturas chilenas.
Analiza esta imagen de factura y extrae TODOS los productos visibles.

Reglas:
- El campo "code" es el codigo o numero de articulo
- El campo "name" es la descripcion del producto
- El campo "quantity" es la cantidad comprada
- El campo "unit_price" es el precio bruto de la factura
- Si la descripcion contiene un paquete como "8x125" o "(x10)", divide el precio entre esa cantidad para obtener precio unitario
- El campo "total" es el total de la fila
- Todos los precios son numeros enteros sin puntos ni comas
- Si un campo no se ve, usa null

Devuelve SOLO el JSON con este formato:
{
  "products": [
    {"code": "3907", "name": "PECHUGA DE POLLO", "quantity": 1, "unit_price": 7214, "total": 17710}
  ]
}`],
            config: {
                responseMimeType: 'application/json',
            },
        });

        const text = response.text;
        const data = JSON.parse(text);
        res.json(data);
    } catch (err) {
        console.error('Gemini error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Servir la página principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor
async function startServer() {
    await initDatabase();
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
}

startServer();
