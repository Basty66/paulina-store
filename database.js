const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Crear tablas
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
        await pool.query(`
            CREATE TABLE IF NOT EXISTS familias (
                id SERIAL PRIMARY KEY,
                codigo VARCHAR(10) UNIQUE NOT NULL,
                nombre VARCHAR(100) NOT NULL,
                tipo VARCHAR(50) DEFAULT 'NO USA TECLA',
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await pool.query(`
            CREATE TABLE IF NOT EXISTS product_ready (
                product_id INTEGER PRIMARY KEY,
                ready BOOLEAN DEFAULT false,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await pool.query(`
            CREATE TABLE IF NOT EXISTS product_history (
                id SERIAL PRIMARY KEY,
                product_id INTEGER,
                action VARCHAR(20) NOT NULL,
                data JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await pool.query(`
            CREATE TABLE IF NOT EXISTS product_scanned (
                product_id INTEGER PRIMARY KEY,
                scanned BOOLEAN DEFAULT false,
                scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        // Limpiar familias con codigos viejos (5 digitos) y re-insertar con 4 digitos
        await pool.query("DELETE FROM familias WHERE codigo LIKE '9%' OR codigo LIKE '1%'");
        const count = await pool.query('SELECT COUNT(*) FROM familias');
        if (parseInt(count.rows[0].count) === 0) {
            const defaults = [
                ['5000', 'Alimentos Basicos'],
                ['5001', 'Lacteos y Huevo'],
                ['5002', 'Carnes y Aves'],
                ['5003', 'Embutidos y Fiambres'],
                ['5004', 'Pescados y Mariscos'],
                ['5005', 'Frutas y Verduras'],
                ['5006', 'Pan y Reposteria'],
                ['5007', 'Bebidas sin Alcohol'],
                ['5008', 'Bebidas Alcoholicas'],
                ['5009', 'Cafe y Te'],
                ['5010', 'Snacks y Dulces'],
                ['5011', 'Congelados'],
                ['5012', 'Conservas'],
                ['5013', 'Limpieza'],
                ['5014', 'Higiene Personal'],
                ['5015', 'Farmacia'],
                ['5016', 'Bebes'],
                ['5017', 'Mascotas'],
                ['5018', 'Tabaco'],
                ['5019', 'Papeleria y Utensilios']
            ];
            for (const [codigo, nombre] of defaults) {
                await pool.query('INSERT INTO familias (codigo, nombre, tipo) VALUES ($1, $2, $3) ON CONFLICT (codigo) DO NOTHING', [codigo, nombre, 'NO USA TECLA']);
            }
            console.log('Familias por defecto insertadas');
        }
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

// ===== FAMILIAS =====
async function getFamilias() {
    try {
        const result = await pool.query('SELECT * FROM familias ORDER BY id ASC');
        return result.rows;
    } catch (error) {
        console.error('Error al obtener familias:', error);
        throw error;
    }
}

async function addFamilia(data) {
    try {
        const result = await pool.query(
            'INSERT INTO familias (codigo, nombre, tipo) VALUES ($1, $2, $3) RETURNING *',
            [data.codigo, data.nombre, data.tipo]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error al agregar familia:', error);
        throw error;
    }
}

async function updateFamilia(id, data) {
    try {
        const result = await pool.query(
            'UPDATE familias SET codigo = $1, nombre = $2, tipo = $3 WHERE id = $4 RETURNING *',
            [data.codigo, data.nombre, data.tipo, id]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error al actualizar familia:', error);
        throw error;
    }
}

async function deleteFamilia(id) {
    try {
        await pool.query('DELETE FROM familias WHERE id = $1', [id]);
        return true;
    } catch (error) {
        console.error('Error al eliminar familia:', error);
        throw error;
    }
}

// ===== PRODUCT READY =====
async function getAllReady() {
    try {
        const result = await pool.query('SELECT product_id, ready FROM product_ready');
        return result.rows;
    } catch (error) {
        console.error('Error al obtener ready:', error);
        throw error;
    }
}

async function setReady(productId, ready) {
    try {
        await pool.query(
            `INSERT INTO product_ready (product_id, ready, updated_at) VALUES ($1, $2, NOW())
             ON CONFLICT (product_id) DO UPDATE SET ready = $2, updated_at = NOW()`,
            [productId, ready]
        );
        return true;
    } catch (error) {
        console.error('Error al guardar ready:', error);
        throw error;
    }
}

// ===== PRODUCT HISTORY =====
async function addHistory(productId, action, data) {
    try {
        await pool.query(
            'INSERT INTO product_history (product_id, action, data) VALUES ($1, $2, $3)',
            [productId, action, JSON.stringify(data)]
        );
        return true;
    } catch (error) {
        console.error('Error al guardar historial:', error);
        throw error;
    }
}

async function getHistory(limit = 50) {
    try {
        const result = await pool.query(
            'SELECT * FROM product_history ORDER BY created_at DESC LIMIT $1',
            [limit]
        );
        return result.rows;
    } catch (error) {
        console.error('Error al obtener historial:', error);
        throw error;
    }
}

async function getHistoryByProduct(productId) {
    try {
        const result = await pool.query(
            'SELECT * FROM product_history WHERE product_id = $1 ORDER BY created_at DESC',
            [productId]
        );
        return result.rows;
    } catch (error) {
        console.error('Error al obtener historial:', error);
        throw error;
    }
}

// ===== PRODUCT SCANNED =====
async function getAllScanned() {
    try {
        const result = await pool.query('SELECT product_id, scanned FROM product_scanned');
        return result.rows;
    } catch (error) {
        console.error('Error al obtener scanned:', error);
        throw error;
    }
}

async function setScanned(productId, scanned) {
    try {
        await pool.query(
            `INSERT INTO product_scanned (product_id, scanned, scanned_at) VALUES ($1, $2, NOW())
             ON CONFLICT (product_id) DO UPDATE SET scanned = $2, scanned_at = NOW()`,
            [productId, scanned]
        );
        return true;
    } catch (error) {
        console.error('Error al guardar scanned:', error);
        throw error;
    }
}

module.exports = {
    initDatabase,
    getProductos,
    addProducto,
    updateProducto,
    deleteProducto,
    getFamilias,
    addFamilia,
    updateFamilia,
    deleteFamilia,
    getAllReady,
    setReady,
    addHistory,
    getHistory,
    getHistoryByProduct,
    getAllScanned,
    setScanned
};
