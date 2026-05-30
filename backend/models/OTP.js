const mongoose = require('mongoose');

// OTP model for email verification
const otpSchema = new mongoose.Schema({
    email: { type: String, required: true, lowercase: true, trim: true },
    otpHash: { type: String, required: true }, // bcrypt hashed OTP
    expiresAt: { type: Date, required: true }, // TTL index for auto-deletion
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 5 },
    used: { type: Boolean, default: false },
    usedAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now }
});

// Add TTL index to automatically delete expired OTPs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('OTP', otpSchema);
