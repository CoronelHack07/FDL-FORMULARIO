/**
 * JOVENES FUENTE DE LUZ - Configuración de Base de Datos
 * SQLite con sql.js (puro JavaScript, sin compilación nativa)
 */

const initSqlJs = require('sql.js');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Ruta de la base de datos
const dbPath = path.join(__dirname, '..', 'database.sqlite');

let db = null;

// Inicializar base de datos
async function initDatabase() {
    const SQL = await initSqlJs();

    // Cargar base de datos existente o crear nueva
    if (fs.existsSync(dbPath)) {
        const fileBuffer = fs.readFileSync(dbPath);
        db = new SQL.Database(fileBuffer);
        console.log('✅ Base de datos cargada desde archivo');
    } else {
        db = new SQL.Database();
        console.log('✅ Nueva base de datos creada');
    }

    // Crear tablas
    db.run(`
        CREATE TABLE IF NOT EXISTS registros (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            apellido TEXT NOT NULL,
            telefono TEXT NOT NULL,
            nacimiento TEXT NOT NULL,
            bautizado TEXT NOT NULL,
            fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Crear admin por defecto si no existe
    const adminCheck = db.exec("SELECT id FROM admins WHERE username = 'admin'");

    if (adminCheck.length === 0) {
        const hashedPassword = bcrypt.hashSync('fdl2024', 10);
        db.run("INSERT INTO admins (username, password) VALUES (?, ?)", ['admin', hashedPassword]);
        console.log('✅ Admin por defecto creado (usuario: admin, contraseña: fdl2024)');
    }

    // Guardar cambios
    saveDatabase();

    console.log('✅ Base de datos inicializada correctamente');
    return db;
}

// Guardar base de datos a archivo
function saveDatabase() {
    if (db) {
        const data = db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(dbPath, buffer);
    }
}

// Funciones para registros
const registros = {
    // Crear nuevo registro
    create: function (data) {
        db.run(`
            INSERT INTO registros (nombre, apellido, telefono, nacimiento, bautizado)
            VALUES (?, ?, ?, ?, ?)
        `, [data.nombre, data.apellido, data.telefono, data.nacimiento, data.bautizado]);

        const result = db.exec("SELECT last_insert_rowid() as id");
        saveDatabase();
        return result[0].values[0][0];
    },

    // Obtener todos los registros
    getAll: function () {
        const result = db.exec("SELECT * FROM registros ORDER BY fecha_registro DESC");
        if (result.length === 0) return [];

        const columns = result[0].columns;
        return result[0].values.map(row => {
            const obj = {};
            columns.forEach((col, i) => obj[col] = row[i]);
            return obj;
        });
    },

    // Obtener registro por ID
    getById: function (id) {
        const result = db.exec("SELECT * FROM registros WHERE id = ?", [id]);
        if (result.length === 0 || result[0].values.length === 0) return null;

        const columns = result[0].columns;
        const row = result[0].values[0];
        const obj = {};
        columns.forEach((col, i) => obj[col] = row[i]);
        return obj;
    },

    // Eliminar registro
    delete: function (id) {
        db.run("DELETE FROM registros WHERE id = ?", [id]);
        saveDatabase();
        return true;
    }
};

// Funciones para admins
const admins = {
    // Verificar credenciales
    verify: function (username, password) {
        const result = db.exec("SELECT * FROM admins WHERE username = ?", [username]);

        if (result.length === 0 || result[0].values.length === 0) {
            return null;
        }

        const columns = result[0].columns;
        const row = result[0].values[0];
        const admin = {};
        columns.forEach((col, i) => admin[col] = row[i]);

        const isValid = bcrypt.compareSync(password, admin.password);
        return isValid ? admin : null;
    },

    // Obtener admin por username
    getByUsername: function (username) {
        const result = db.exec("SELECT id, username FROM admins WHERE username = ?", [username]);
        if (result.length === 0 || result[0].values.length === 0) return null;

        const columns = result[0].columns;
        const row = result[0].values[0];
        const obj = {};
        columns.forEach((col, i) => obj[col] = row[i]);
        return obj;
    }
};

// Obtener instancia de db
function getDb() {
    return db;
}

module.exports = {
    initDatabase,
    getDb,
    registros,
    admins,
    saveDatabase
};
