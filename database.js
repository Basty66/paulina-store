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
        // Insertar familias por defecto si la tabla esta vacia
        const count = await pool.query('SELECT COUNT(*) FROM familias');
        if (parseInt(count.rows[0].count) === 0) {
            const defaults = [
                ['1001', 'Alimentos Basicos'],
                ['1002', 'Lacteos y Huevo'],
                ['1003', 'Carnes y Aves'],
                ['1004', 'Embutidos y Fiambres'],
                ['1005', 'Pescados y Mariscos'],
                ['1006', 'Frutas y Verduras'],
                ['1007', 'Pan y Reposteria'],
                ['1008', 'Bebidas sin Alcohol'],
                ['1009', 'Bebidas Alcoholicas'],
                ['1010', 'Cafe y Te'],
                ['1011', 'Snacks y Dulces'],
                ['1012', 'Congelados'],
                ['1013', 'Conservas'],
                ['1014', 'Limpieza'],
                ['1015', 'Higiene Personal'],
                ['1016', 'Farmacia'],
                ['1017', 'Bebes'],
                ['1018', 'Mascotas'],
                ['1019', 'Tabaco'],
                ['1020', 'Papeleria y Utensilios']
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

module.exports = {
    initDatabase,
    getProductos,
    addProducto,
    updateProducto,
    deleteProducto,
    getFamilias,
    addFamilia,
    updateFamilia,
    deleteFamilia
};
