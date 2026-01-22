/**
 * ============================================
 * JOVENES FUENTE DE LUZ - Servidor Principal
 * ============================================
 * 
 * Formulario dinámico con estilo bíblico-juvenil
 * Panel de administración protegido
 * Validaciones de seguridad completas
 */

const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const path = require('path');

// Importar base de datos y rutas
const { initDatabase } = require('./database');
const apiRoutes = require('./routes/api');
const adminRoutes = require('./routes/admin');

// Crear app Express
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE DE SEGURIDAD
// ============================================

// Helmet para headers de seguridad (configuración relajada para desarrollo)
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.cdnfonts.com", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.cdnfonts.com", "https://fonts.gstatic.com", "data:"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "blob:"],
        },
    },
    crossOriginEmbedderPolicy: false
}));

// Parsear JSON y form data
app.use(express.json({ limit: '10kb' })); // Limitar tamaño de payload
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Sesiones
app.use(session({
    secret: 'fdl-jovenes-2024-secreto-super-seguro',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Cambiar a true en producción con HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
    }
}));

// ============================================
// ARCHIVOS ESTÁTICOS
// ============================================

app.use(express.static(path.join(__dirname, '..', 'public')));

// ============================================
// RUTAS API
// ============================================

app.use('/api', apiRoutes);
app.use('/admin', adminRoutes);

// ============================================
// MANEJO DE ERRORES
// ============================================

// 404
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.stack);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
    });
});

// ============================================
// INICIAR SERVIDOR
// ============================================

async function startServer() {
    // Inicializar base de datos primero
    await initDatabase();

    app.listen(PORT, () => {
        console.log('');
        console.log('╔═══════════════════════════════════════════════════════════╗');
        console.log('║                                                           ║');
        console.log('║     🔥 JOVENES FUENTE DE LUZ - Servidor Activo 🔥        ║');
        console.log('║                                                           ║');
        console.log('╠═══════════════════════════════════════════════════════════╣');
        console.log(`║  📋 Formulario:  http://localhost:${PORT}                    ║`);
        console.log(`║  🔐 Admin:       http://localhost:${PORT}/admin.html         ║`);
        console.log('║                                                           ║');
        console.log('║  👤 Usuario admin: admin                                  ║');
        console.log('║  🔑 Contraseña:    fdl2024                                ║');
        console.log('║                                                           ║');
        console.log('╚═══════════════════════════════════════════════════════════╝');
        console.log('');
    });
}

startServer().catch(err => {
    console.error('❌ Error iniciando servidor:', err);
    process.exit(1);
});

module.exports = app;
