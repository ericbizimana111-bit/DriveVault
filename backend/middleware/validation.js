const xss = require('xss');
const mongoSanitize = require('express-mongo-sanitize');
const { sanitize } = mongoSanitize;

const sanitizeQueryObject = (queryObj, replaceWith = '_') => {
    if (!queryObj || typeof queryObj !== 'object') return queryObj;

    Object.keys(queryObj).forEach((key) => {
        const safeKey = key.replace(/^\$|\./g, replaceWith);
        const value = queryObj[key];

        if (safeKey !== key) {
            queryObj[safeKey] = value;
            delete queryObj[key];
        }

        if (typeof value === 'object' && value !== null) {
            sanitizeQueryObject(queryObj[safeKey], replaceWith);
        }
    });
};

/**
 * Validate National ID format (exactly 16 digits for Rwanda)
 */
const validateNationalId = (id) => {
    if (!id) return false;
    const cleanId = id.toString().trim();
    return /^\d{16}$/.test(cleanId);
};

/**
 * Validate email format
 */
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate password strength
 * Requirements: min 8 chars, at least one uppercase, one number, one special char
 */
const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
};

/**
 * Get password strength score
 */
const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;

    return {
        score: strength,
        level: strength <= 2 ? 'weak' : strength === 3 ? 'fair' : strength === 4 ? 'good' : 'strong'
    };
};

/**
 * Sanitize user input to prevent XSS
 */
const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    return xss(input.trim());
};

/**
 * Middleware to sanitize all request inputs
 */
const sanitizeRequestData = (req, res, next) => {
    // Sanitize body
    if (req.body && typeof req.body === 'object') {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = sanitizeInput(req.body[key]);
            }
        });
    }

    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
        Object.keys(req.query).forEach(key => {
            if (typeof req.query[key] === 'string') {
                req.query[key] = sanitizeInput(req.query[key]);
            }
        });
    }

    next();
};

/**
 * Middleware to prevent NoSQL injection via MongoDB sanitization
 */
const mongoSanitizeMiddleware = (req, res, next) => {
    if (req.body && typeof req.body === 'object') {
        req.body = sanitize(req.body, { replaceWith: '_' });
    }

    if (req.params && typeof req.params === 'object') {
        req.params = sanitize(req.params, { replaceWith: '_' });
    }

    if (req.query && typeof req.query === 'object') {
        sanitizeQueryObject(req.query, '_');
    }

    next();
};

module.exports = {
    validateNationalId,
    validateEmail,
    validatePassword,
    getPasswordStrength,
    sanitizeInput,
    sanitizeRequestData,
    mongoSanitizeMiddleware
};


