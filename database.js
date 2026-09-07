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
                codigo VARCHAR(13) UNIQUE NOT NULL,
                descripcion VARCHAR(255) NOT NULL,
                precio_compra DECIMAL(10,2) DEFAULT 0,
                precio_venta DECIMAL(10,2) NOT NULL,
                precio_mayor DECIMAL(10,2) DEFAULT 0,
                cantidad_mayor INTEGER DEFAULT 1,
                tipo VARCHAR(50) DEFAULT 'UNITARIO',
                descuento DECIMAL(5,2) DEFAULT 0,
                familia VARCHAR(100) DEFAULT 'ABARROTES',
                proveedor VARCHAR(100),
                stock INTEGER DEFAULT 0,
                stock_critico INTEGER DEFAULT 0,
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
async function addProducto(data) {
    try {
        const result = await pool.query(
            `INSERT INTO productos (codigo, descripcion, precio_compra, precio_venta, precio_mayor, cantidad_mayor, tipo, descuento, familia, proveedor, stock, stock_critico) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
            [data.codigo, data.descripcion, data.precioCompra, data.precioVenta, data.precioMayor, data.cantidadMayor, data.tipo, data.descuento, data.familia, data.proveedor, data.stock, data.stockCritico]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error al agregar producto:', error);
        throw error;
    }
}

// Actualizar producto
async function updateProducto(id, data) {
    try {
        const result = await pool.query(
            `UPDATE productos SET codigo = $1, descripcion = $2, precio_compra = $3, precio_venta = $4, precio_mayor = $5, 
             cantidad_mayor = $6, tipo = $7, descuento = $8, familia = $9, proveedor = $10, stock = $11, stock_critico = $12 
             WHERE id = $13 RETURNING *`,
            [data.codigo, data.descripcion, data.precioCompra, data.precioVenta, data.precioMayor, data.cantidadMayor, data.tipo, data.descuento, data.familia, data.proveedor, data.stock, data.stockCritico, id]
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
