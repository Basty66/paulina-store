const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Crear tabla de productos
async function initDatabase() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS productos (
                id SERIAL PRIMARY KEY,
                producto VARCHAR(255) NOT NULL,
                codigo VARCHAR(13) UNIQUE NOT NULL,
                precio_venta DECIMAL(10,2) NOT NULL,
                precio_costo DECIMAL(10,2) DEFAULT 0,
                categoria VARCHAR(100),
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Base de datos inicializada correctamente');
    } catch (error) {
        console.error('Error al inicializar la base de datos:', error);
    }
}

// Obtener todos los productos
async function getProductos() {
    try {
        const result = await pool.query('SELECT * FROM productos ORDER BY id DESC');
        return result.rows;
    } catch (error) {
        console.error('Error al obtener productos:', error);
        throw error;
    }
}

// Agregar producto
async function addProducto(producto, codigo, precioVenta, precioCosto, categoria) {
    try {
        const result = await pool.query(
            'INSERT INTO productos (producto, codigo, precio_venta, precio_costo, categoria) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [producto, codigo, precioVenta, precioCosto, categoria]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error al agregar producto:', error);
        throw error;
    }
}

// Actualizar producto
async function updateProducto(id, producto, codigo, precioVenta, precioCosto, categoria) {
    try {
        const result = await pool.query(
            'UPDATE productos SET producto = $1, codigo = $2, precio_venta = $3, precio_costo = $4, categoria = $5 WHERE id = $6 RETURNING *',
            [producto, codigo, precioVenta, precioCosto, categoria, id]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        throw error;
    }
}

// Eliminar producto
async function deleteProducto(id) {
    try {
        await pool.query('DELETE FROM productos WHERE id = $1', [id]);
        return true;
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        throw error;
    }
}

module.exports = {
    initDatabase,
    getProductos,
    addProducto,
    updateProducto,
    deleteProducto
};
