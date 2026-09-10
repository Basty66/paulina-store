const express = require('express');
const cors = require('cors');
const path = require('path');
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
