const mongoose = require('mongoose');

// Message model for contact/user-to-admin communication
const messageSchema = new mongoose.Schema({
    // Contact form submission
    name: { type: String, default: null },
    email: { type: String, required: true, lowercase: true, trim: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    
    // Sender details (for logged-in users)
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    userRole: { type: String, enum: ['user', 'admin'], default: 'user' },
    
    // Message status
    status: { type: String, enum: ['unread', 'read', 'replied'], default: 'unread' },
    
    // Reply tracking
    adminReply: { type: String, default: null },
    repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // admin ID
    repliedAt: { type: Date, default: null },
    replyEmailSent: { type: Boolean, default: false },
    
    // Metadata
    category: { type: String, default: 'general' }, // general, support, inquiry, feedback
    ipAddress: { type: String, default: null },
    userAgent: { type: String, default: null },
    
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Index for faster queries
messageSchema.index({ email: 1, createdAt: -1 });
messageSchema.index({ userId: 1, createdAt: -1 });
messageSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
