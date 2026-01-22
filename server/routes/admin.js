/**
 * JOVENES FUENTE DE LUZ - Admin Routes
 * Endpoints protegidos para administración
 */

const express = require('express');
const { registros, admins } = require('../database');

const router = express.Router();

/**
 * Middleware de autenticación
 */
function requireAuth(req, res, next) {
    if (req.session && req.session.admin) {
        return next();
    }
    return res.status(401).json({
        success: false,
        message: 'No autorizado'
    });
}

/**
 * POST /admin/login
 * Iniciar sesión como administrador
 */
router.post('/login', (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Usuario y contraseña requeridos'
            });
        }

        // Verificar credenciales
        const admin = admins.verify(username, password);

        if (!admin) {
            console.log(`⚠️ Intento de login fallido para: ${username}`);
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        // Crear sesión
        req.session.admin = {
            id: admin.id,
            username: admin.username
        };

        console.log(`✅ Admin conectado: ${username}`);

        res.json({
            success: true,
            message: 'Login exitoso'
        });

    } catch (error) {
        console.error('❌ Error en login:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

/**
 * POST /admin/logout
 * Cerrar sesión
 */
router.post('/logout', (req, res) => {
    if (req.session) {
        req.session.destroy();
    }
    res.json({
        success: true,
        message: 'Sesión cerrada'
    });
});

/**
 * GET /admin/check
 * Verificar si hay sesión activa
 */
router.get('/check', (req, res) => {
    res.json({
        authenticated: !!(req.session && req.session.admin),
        admin: req.session?.admin?.username || null
    });
});

/**
 * GET /admin/registros
 * Obtener todos los registros (protegido)
 */
router.get('/registros', requireAuth, (req, res) => {
    try {
        const allRegistros = registros.getAll();

        res.json({
            success: true,
            registros: allRegistros,
            total: allRegistros.length
        });

    } catch (error) {
        console.error('❌ Error obteniendo registros:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

/**
 * DELETE /admin/registro/:id
 * Eliminar un registro (protegido)
 */
router.delete('/registro/:id', requireAuth, (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }

        const registro = registros.getById(id);

        if (!registro) {
            return res.status(404).json({
                success: false,
                message: 'Registro no encontrado'
            });
        }

        registros.delete(id);

        console.log(`🗑️ Registro eliminado: ID ${id} por ${req.session.admin.username}`);

        res.json({
            success: true,
            message: 'Registro eliminado'
        });

    } catch (error) {
        console.error('❌ Error eliminando registro:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

/**
 * GET /admin/export
 * Exportar registros a CSV (protegido)
 */
router.get('/export', requireAuth, (req, res) => {
    try {
        const allRegistros = registros.getAll();

        // Crear CSV
        const headers = ['ID', 'Nombre', 'Apellido', 'Teléfono', 'Nacimiento', 'Bautizado', 'Fecha Registro'];
        const csvRows = [headers.join(',')];

        allRegistros.forEach(reg => {
            const row = [
                reg.id,
                `"${reg.nombre}"`,
                `"${reg.apellido}"`,
                reg.telefono,
                reg.nacimiento,
                reg.bautizado,
                reg.fecha_registro
            ];
            csvRows.push(row.join(','));
        });

        const csv = csvRows.join('\n');

        // Enviar como descarga
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename=registros_fdl_${Date.now()}.csv`);
        res.send('\uFEFF' + csv); // BOM para Excel

    } catch (error) {
        console.error('❌ Error exportando:', error);
        res.status(500).json({
            success: false,
            message: 'Error al exportar'
        });
    }
});

module.exports = router;
