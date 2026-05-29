const rateLimit = require('express-rate-limit');

// Rate limiters for different endpoints
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts
    message: 'Too many login attempts. Please try again after 15 minutes.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.user && req.user.role === 'admin' // Don't apply to admins
});

const signupLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 sign-ups per hour
    message: 'Too many accounts created from this IP. Please try again later.',
    standardHeaders: true,
    legacyHeaders: false
});

const otpLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 3, // 3 OTP requests
    message: 'Too many OTP requests. Please try again later.',
    standardHeaders: true,
    legacyHeaders: false
});

const contactFormLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 messages per hour
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
