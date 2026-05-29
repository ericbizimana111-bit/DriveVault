const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    phone: { type: String, default: '' },
    nationalId: { type: String, default: undefined, sparse: true, trim: true },
    licenseCategory: { type: String, default: 'B' },
    dateOfBirth: { type: String, default: '' },
    address: { type: String, default: '' },
    photo: { type: String, default: null },
    // Email verification fields
    isEmailVerified: { type: Boolean, default: false },
    emailVerifiedAt: { type: Date, default: null },
    // OTP tracking (stores the hash, not the actual OTP)
    otpHash: { type: String, default: null },
    otpExpires: { type: Date, default: null },
    otpAttempts: { type: Number, default: 0 },
    // Account security
    lastLogin: { type: Date, default: null },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now }
});

userSchema.index(
    { nationalId: 1 },
    {
        unique: true,
        sparse: true,
        name: 'nationalId_unique_index'
    }
);

userSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

userSchema.set('toObject', {
    virtuals: true,
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('User', userSchema);
