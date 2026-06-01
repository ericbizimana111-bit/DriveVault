const express = require('express');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const { sendAdminReplyEmail } = require('../middleware/emailService');

const JWT_SECRET = process.env.JWT_SECRET || 'rwanda_drive_secret_2024';
const router = express.Router();

const adminOnly = (req, res, next) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
    next();
};

// Public or authenticated contact form submission
router.post('/', async (req, res) => {
    try {
        const { name, email, subject, message, category } = req.body;
        if (!email || !message) {
            return res.status(400).json({ message: 'Email and message are required' });
        }

        let user = null;
        const authHeader = req.headers['authorization'];
        const token = authHeader?.split(' ')[1] || req.cookies?.authToken;
        if (token) {
            try {
                const decoded = jwt.verify(token, JWT_SECRET);
                user = await User.findById(decoded.id).select('name email role');
            } catch (err) {
                // ignore invalid token for public message submissions
            }
        }

        const messageRecord = new Message({
            name: name || user?.name || 'Guest',
            email: email.toLowerCase().trim(),
            subject: subject || 'Support Request',
            message: message.trim(),
            userId: user?.id || null,
            userRole: user?.role || 'user',
            category: category || 'support',
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'] || null
        });

        await messageRecord.save();

        const admins = await User.find({ role: 'admin' }).select('_id');
        if (admins.length) {
            await Notification.insertMany(admins.map(admin => ({
                userId: admin._id,
                type: 'message',
                title: 'New support request',
                message: `New message from ${messageRecord.name}: ${messageRecord.subject}`,
                messageId: messageRecord.id,
                relatedType: 'message',
                actionUrl: '/admin/messages'
            })));
        }

        res.status(201).json({ message: 'Your message has been submitted. Admin will respond by email.' });
    } catch (err) {
        console.error('Message post error:', err);
        res.status(500).json({ message: 'Server error while submitting message' });
    }
});

// Get all messages for admin
router.get('/', auth, adminOnly, async (req, res) => {
    try {
        const messages = await Message.find().sort({ createdAt: -1 });
        res.json(messages);
    } catch (err) {
        console.error('Get messages error:', err);
        res.status(500).json({ message: 'Server error fetching messages' });
    }
});

// Get user messages
router.get('/mine', auth, async (req, res) => {
    try {
        const messages = await Message.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(messages);
    } catch (err) {
        console.error('Get user messages error:', err);
        res.status(500).json({ message: 'Server error fetching your messages' });
    }
});

// Admin reply to a message
router.put('/:id/reply', auth, adminOnly, async (req, res) => {
    try {
        const { reply } = req.body;
        if (!reply) return res.status(400).json({ message: 'Reply text is required' });

        const messageRecord = await Message.findById(req.params.id);
        if (!messageRecord) return res.status(404).json({ message: 'Message not found' });

        messageRecord.adminReply = reply.trim();
        messageRecord.status = 'replied';
        messageRecord.repliedBy = req.user.id;
        messageRecord.repliedAt = new Date();
        messageRecord.replyEmailSent = false;
        await messageRecord.save();

        const user = await User.findOne({ email: messageRecord.email });
        if (user) {
            await Notification.create({
                userId: user.id,
                type: 'admin_reply',
                title: 'You have received a reply from admin',
                message: `An admin has responded to your request: ${messageRecord.subject}`,
                messageId: messageRecord.id,
                relatedType: 'message',
                actionUrl: '/profile'
            });

            const emailSent = await sendAdminReplyEmail(user.email, user.name || 'Driver', req.user.name || 'Admin', reply.trim());
            if (emailSent) {
                messageRecord.replyEmailSent = true;
                await messageRecord.save();
            }
        }

        res.json({ message: 'Reply saved and notification sent' });
    } catch (err) {
        console.error('Reply error:', err);
        res.status(500).json({ message: 'Server error sending reply' });
    }
});

module.exports = router;
