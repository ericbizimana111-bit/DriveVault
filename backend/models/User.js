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

module.exports = mongoose.model('User', userSchema);
