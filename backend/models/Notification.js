const mongoose = require('mongoose');

// Notification model for user notifications
const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
        type: String,
        enum: ['admin_reply', 'document_expiry', 'document_verified', 'system_alert', 'message'],
        default: 'message'
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    messageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },

    // Read status
    isRead: { type: Boolean, default: false },
    readAt: { type: Date, default: null },

    // Link to related resource
    relatedId: { type: String, default: null },
    relatedType: { type: String, default: null }, // 'message', 'document', 'driver'

    // Action details
    actionUrl: { type: String, default: null },

    createdAt: { type: Date, default: Date.now, index: { expireAfterSeconds: 2592000 } } // Auto-delete after 30 days
});

// Index for queries
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
