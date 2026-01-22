/**
 * JOVENES FUENTE DE LUZ - API Routes
 * Endpoints para el formulario público
 */

const express = require('express');
const validator = require('validator');
const { registros } = require('../database');

const router = express.Router();

// Patrones de validación
const patterns = {
    nombre: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{2,50}$/,
    apellido: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{2,50}$/,
    telefono: /^[0-9]{7,15}$/
};

/**
 * Sanitizar string - Eliminar caracteres peligrosos
 */
function sanitizeString(str) {
    if (typeof str !== 'string') return '';

    // Escapar HTML y eliminar caracteres peligrosos
    let clean = validator.escape(str);

    // Eliminar cualquier intento de script
    clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    clean = clean.replace(/javascript:/gi, '');
    clean = clean.replace(/on\w+=/gi, '');

    return clean.trim();
}

/**
 * Validar datos del formulario
 */
function validateFormData(data) {
    const errors = [];

    // Validar nombre
    if (!data.nombre || !patterns.nombre.test(data.nombre)) {
        errors.push('Nombre inválido: solo letras y espacios (2-50 caracteres)');
    }

    // Validar apellido
    if (!data.apellido || !patterns.apellido.test(data.apellido)) {
        errors.push('Apellido inválido: solo letras y espacios (2-50 caracteres)');
    }

    // Validar teléfono
    if (!data.telefono || !patterns.telefono.test(data.telefono)) {
        errors.push('Teléfono inválido: solo números (7-15 dígitos)');
    }

    // Validar fecha de nacimiento
    if (!data.nacimiento || !validator.isDate(data.nacimiento)) {
        errors.push('Fecha de nacimiento inválida');
    } else {
        const birthDate = new Date(data.nacimiento);
        const today = new Date();
        const minDate = new Date('1920-01-01');

        if (birthDate > today || birthDate < minDate) {
            errors.push('Fecha de nacimiento fuera de rango válido');
        }
    }

    // Validar bautizado
    if (!data.bautizado || !['si', 'no'].includes(data.bautizado)) {
        errors.push('Selección de bautizado inválida');
    }

    return errors;
}

/**
 * POST /api/registro
 * Crear nuevo registro
 */
router.post('/registro', (req, res) => {
    try {
        const { nombre, apellido, telefono, nacimiento, bautizado } = req.body;

        // Sanitizar todas las entradas
        const cleanData = {
            nombre: sanitizeString(nombre).replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, ''),
            apellido: sanitizeString(apellido).replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, ''),
            telefono: String(telefono).replace(/[^0-9]/g, ''),
            nacimiento: sanitizeString(nacimiento),
            bautizado: sanitizeString(bautizado).toLowerCase()
        };

        // Validar datos
        const errors = validateFormData(cleanData);

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Datos inválidos',
                errors: errors
            });
        }

        // Guardar en la base de datos (usando queries parametrizadas para prevenir SQL injection)
        const id = registros.create(cleanData);

        console.log(`✅ Nuevo registro creado: ID ${id} - ${cleanData.nombre} ${cleanData.apellido}`);

        res.status(201).json({
            success: true,
            message: 'Registro creado exitosamente',
            id: id
        });

    } catch (error) {
        console.error('❌ Error al crear registro:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

module.exports = router;
