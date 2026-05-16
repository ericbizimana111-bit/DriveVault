const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    driverName: { type: String, required: true, trim: true },
    documentType: { type: String, required: true, trim: true },
    documentNumber: { type: String, required: true, trim: true },
    issueDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
    expiryDate: { type: String, default: '' },
    issuedBy: { type: String, default: 'Rwanda National Police', trim: true },
    paymentCode: { type: String, required: true, trim: true },
    documentPhoto: { type: String, default: null },
    status: { type: String, default: 'active', trim: true },
    createdAt: { type: Date, default: Date.now }
});

documentSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

documentSchema.set('toObject', {
    virtuals: true,
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('Document', documentSchema);
