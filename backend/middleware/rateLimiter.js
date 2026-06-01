const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === 'production' ? 5 : 50,
    message: 'Too many login attempts. Please try again after 15 minutes.',
    standardHeaders: true,
    legacyHeaders: false
});

const signupLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: 'Too many accounts created from this IP. Please try again later.',
    standardHeaders: true,
    legacyHeaders: false
});

const otpLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: process.env.NODE_ENV === 'production' ? 3 : 20,
    message: 'Too many OTP requests. Please try again later.',
    standardHeaders: true,
    legacyHeaders: false
});

const contactFormLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: 'Too many messages sent. Please try again later.',
    standardHeaders: true,
    legacyHeaders: false
});

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = {
    loginLimiter,
    signupLimiter,
    otpLimiter,
    contactFormLimiter,
    generalLimiter
};