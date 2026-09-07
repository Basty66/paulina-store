const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase, getProductos, addProducto, updateProducto, deleteProducto } = require('./database');

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
        const { producto, codigo, precioVenta, precioCosto, categoria } = req.body;
        const nuevoProducto = await addProducto(producto, codigo, precioVenta, precioCosto, categoria);
        res.status(201).json(nuevoProducto);
    } catch (error) {
        res.status(500).json({ error: 'Error al agregar producto' });
    }
});

app.put('/api/productos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { producto, codigo, precioVenta, precioCosto, categoria } = req.body;
        const productoActualizado = await updateProducto(id, producto, codigo, precioVenta, precioCosto, categoria);
        res.json(productoActualizado);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar producto' });
    }
});

app.delete('/api/productos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await deleteProducto(id);
        res.json({ message: 'Producto eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar producto' });
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
