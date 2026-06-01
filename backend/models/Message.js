const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
    {
        conversationId: { type: String, required: true, trim: true, index: true },

        senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        senderRole: { type: String, enum: ['user', 'admin', 'guest'], required: true },
        receiverRole: { type: String, enum: ['user', 'admin', 'guest'], default: 'admin' },

        senderName: { type: String, default: null, trim: true },
        senderEmail: { type: String, default: null, lowercase: true, trim: true },
        receiverName: { type: String, default: null, trim: true },
        receiverEmail: { type: String, default: null, lowercase: true, trim: true },

        subject: { type: String, default: 'Support Request', trim: true },
        content: { type: String, required: true, trim: true },

        isRead: { type: Boolean, default: false },
        readAt: { type: Date, default: null },
        readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        status: { type: String, enum: ['unread', 'read', 'replied'], default: 'unread' },

        // Legacy contact-form compatibility.
        name: { type: String, default: null },
        email: { type: String, default: null, lowercase: true, trim: true },
        message: { type: String, default: null },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        userRole: { type: String, enum: ['user', 'admin', 'guest'], default: 'user' },
        adminReply: { type: String, default: null },
        repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        repliedAt: { type: Date, default: null },
        replyEmailSent: { type: Boolean, default: false },

        category: { type: String, default: 'support', trim: true },
        ipAddress: { type: String, default: null },
        userAgent: { type: String, default: null }
    },
    { timestamps: true }
);

messageSchema.index({ conversationId: 1, createdAt: 1 });
messageSchema.index({ senderId: 1, createdAt: -1 });
messageSchema.index({ receiverId: 1, isRead: 1, createdAt: -1 });
messageSchema.index({ email: 1, createdAt: -1 });
messageSchema.index({ userId: 1, createdAt: -1 });
messageSchema.index({ status: 1, createdAt: -1 });

messageSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('Message', messageSchema);
