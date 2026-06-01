const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
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

const getId = value => value?._id || value?.id || value;
const conversationForUser = userId => `driver:${userId}`;
const conversationForGuest = email => `guest:${String(email || 'unknown').toLowerCase().trim()}`;
const userIdFromConversation = conversationId => {
    const match = String(conversationId || '').match(/^driver:(.+)$/);
    return match?.[1] || null;
};

const normalizeConversationId = message => (
    message.conversationId ||
    (message.senderId || message.receiverId || message.userId
        ? conversationForUser(message.senderId || message.receiverId || message.userId)
        : conversationForGuest(message.senderEmail || message.email))
);

const serializeMessage = message => {
    const obj = message.toJSON ? message.toJSON() : message;
    return {
        ...obj,
        conversationId: normalizeConversationId(obj),
        content: obj.content || obj.message || '',
        senderName: obj.senderName || obj.name || 'Guest',
        senderEmail: obj.senderEmail || obj.email || null
    };
};

async function getOptionalUser(req) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1] || req.cookies?.authToken;
    if (!token) return null;

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return User.findById(decoded.id).select('name email role');
    } catch {
        return null;
    }
}

async function findPrimaryAdmin() {
    return User.findOne({ role: 'admin' }).sort({ createdAt: 1 }).select('name email role');
}

async function notifyUsers(users, payload) {
    const unique = Array.from(new Map(users.filter(Boolean).map(user => [String(getId(user)), user])).values());
    if (!unique.length) return;

    await Notification.insertMany(unique.map(user => ({
        userId: getId(user),
        ...payload
    })));
}

async function findDuplicate({ conversationId, senderId, senderEmail, content }) {
    const recent = new Date(Date.now() - 5000);
    const query = {
        conversationId,
        content,
        createdAt: { $gte: recent }
    };

    if (senderId) query.senderId = senderId;
    else query.senderEmail = senderEmail;

    return Message.findOne(query).sort({ createdAt: -1 });
}

async function userCanAccessConversation(user, conversationId) {
    if (user.role === 'admin') return true;
    if (conversationId === conversationForUser(user.id)) return true;

    const message = await Message.findOne({
        conversationId,
        $or: [
            { senderId: user.id },
            { receiverId: user.id },
            { userId: user.id }
        ]
    }).select('_id');

    return Boolean(message);
}

async function markConversationRead(conversationId, userId) {
    await Message.updateMany(
        {
            conversationId,
            receiverId: userId,
            readAt: null
        },
        {
            $set: { isRead: true, readAt: new Date(), status: 'read' },
            $addToSet: { readBy: userId }
        }
    );
}

async function createMessage({
    conversationId,
    sender,
    receiver,
    senderRole,
    receiverRole,
    subject,
    content,
    category,
    req
}) {
    const trimmed = content.trim();
    const senderId = sender?._id || null;
    const senderEmail = sender?.email || req.body.email || null;

    const duplicate = await findDuplicate({ conversationId, senderId, senderEmail, content: trimmed });
    if (duplicate) return { message: duplicate, duplicate: true };

    const message = new Message({
        conversationId,
        senderId,
        receiverId: receiver?._id || null,
        senderRole,
        receiverRole,
        senderName: sender?.name || req.body.name || 'Guest',
        senderEmail,
        receiverName: receiver?.name || null,
        receiverEmail: receiver?.email || null,
        subject: subject?.trim() || 'Support Request',
        content: trimmed,
        isRead: false,
        readBy: senderId ? [senderId] : [],
        status: 'unread',
        name: sender?.name || req.body.name || 'Guest',
        email: senderEmail,
        message: trimmed,
        userId: senderRole === 'user' ? senderId : null,
        userRole: senderRole === 'guest' ? 'user' : senderRole,
        category: category || 'support',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || null
    });

    await message.save();
    return { message, duplicate: false };
}

router.post('/', async (req, res) => {
    try {
        const { name, email, subject, message, content, category } = req.body;
        const body = String(content || message || '').trim();
        if (!body) return res.status(400).json({ message: 'Message content is required' });

        const user = await getOptionalUser(req);
        if (!user && !email) return res.status(400).json({ message: 'Email is required' });

        const admin = await findPrimaryAdmin();
        const sender = user || { name: name || 'Guest', email: email?.toLowerCase().trim() };
        const senderRole = user ? user.role : 'guest';
        const conversationId = user ? conversationForUser(user.id) : conversationForGuest(email);

        const result = await createMessage({
            conversationId,
            sender,
            receiver: admin,
            senderRole,
            receiverRole: 'admin',
            subject,
            content: body,
            category,
            req
        });

        const admins = await User.find({ role: 'admin' }).select('_id name email');
        await notifyUsers(admins, {
            type: 'message',
            title: 'New driver message',
            message: `New message from ${result.message.senderName}: ${result.message.subject}`,
            messageId: result.message._id,
            relatedId: conversationId,
            relatedType: 'message',
            actionUrl: '/admin/messages'
        });

        res.status(result.duplicate ? 200 : 201).json({
            message: result.duplicate ? 'Duplicate message ignored.' : 'Message sent successfully.',
            data: serializeMessage(result.message)
        });
    } catch (err) {
        console.error('Message post error:', err);
        res.status(500).json({ message: 'Server error while submitting message' });
    }
});

router.get('/', auth, adminOnly, async (req, res) => {
    try {
        const messages = await Message.find().sort({ createdAt: -1 });
        res.json(messages.map(serializeMessage));
    } catch (err) {
        console.error('Get messages error:', err);
        res.status(500).json({ message: 'Server error fetching messages' });
    }
});

router.get('/mine', auth, async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [
                { senderId: req.user.id },
                { receiverId: req.user.id },
                { userId: req.user.id }
            ]
        }).sort({ createdAt: 1 });
        res.json(messages.map(serializeMessage));
    } catch (err) {
        console.error('Get user messages error:', err);
        res.status(500).json({ message: 'Server error fetching your messages' });
    }
});

router.get('/conversations', auth, async (req, res) => {
    try {
        const query = req.user.role === 'admin'
            ? {}
            : {
                $or: [
                    { senderId: req.user.id },
                    { receiverId: req.user.id },
                    { userId: req.user.id },
                    { conversationId: conversationForUser(req.user.id) }
                ]
            };

        const messages = await Message.find(query).sort({ createdAt: 1 });
        const grouped = new Map();

        for (const raw of messages.map(serializeMessage)) {
            const conversationId = normalizeConversationId(raw);
            const existing = grouped.get(conversationId) || {
                conversationId,
                subject: raw.subject || 'Support Request',
                participantName: req.user.role === 'admin'
                    ? raw.senderRole === 'admin' ? raw.receiverName : raw.senderName
                    : 'Administrators',
                participantEmail: req.user.role === 'admin'
                    ? raw.senderRole === 'admin' ? raw.receiverEmail : raw.senderEmail
                    : null,
                lastMessage: '',
                lastMessageAt: null,
                unreadCount: 0,
                messageCount: 0
            };

            existing.lastMessage = raw.content || raw.message || '';
            existing.lastMessageAt = raw.createdAt;
            existing.messageCount += 1;

            const receiverMatches = raw.receiverId && String(raw.receiverId) === String(req.user.id);
            if (receiverMatches && !raw.readAt) existing.unreadCount += 1;
            if (req.user.role === 'admin' && !existing.participantName && raw.senderRole !== 'admin') {
                existing.participantName = raw.senderName;
                existing.participantEmail = raw.senderEmail;
            }

            grouped.set(conversationId, existing);
        }

        res.json(Array.from(grouped.values()).sort((a, b) =>
            new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0)
        ));
    } catch (err) {
        console.error('Get conversations error:', err);
        res.status(500).json({ message: 'Server error fetching conversations' });
    }
});

router.get('/conversations/:conversationId', auth, async (req, res) => {
    try {
        const { conversationId } = req.params;
        const allowed = await userCanAccessConversation(req.user, conversationId);
        if (!allowed) return res.status(403).json({ message: 'Access denied' });

        await markConversationRead(conversationId, req.user.id);

        const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });
        res.json(messages.map(serializeMessage));
    } catch (err) {
        console.error('Get conversation error:', err);
        res.status(500).json({ message: 'Server error fetching conversation' });
    }
});

router.post('/conversations', auth, async (req, res) => {
    try {
        const content = String(req.body.content || req.body.message || '').trim();
        if (!content) return res.status(400).json({ message: 'Message content is required' });

        const sender = await User.findById(req.user.id).select('name email role');
        let receiver = null;
        let receiverRole = 'admin';
        let conversationId = conversationForUser(req.user.id);

        if (req.user.role === 'admin') {
            const receiverId = req.body.receiverId || userIdFromConversation(req.body.conversationId);
            if (!receiverId || !mongoose.Types.ObjectId.isValid(receiverId)) {
                return res.status(400).json({ message: 'Driver is required' });
            }

            receiver = await User.findOne({ _id: receiverId, role: 'user' }).select('name email role');
            if (!receiver) return res.status(404).json({ message: 'Driver not found' });

            receiverRole = 'user';
            conversationId = conversationForUser(receiver._id);
        } else {
            receiver = await findPrimaryAdmin();
        }

        const result = await createMessage({
            conversationId,
            sender,
            receiver,
            senderRole: req.user.role,
            receiverRole,
            subject: req.body.subject || 'Communication',
            content,
            category: req.body.category || 'communication',
            req
        });

        if (receiver) {
            await Notification.create({
                userId: receiver._id,
                type: req.user.role === 'admin' ? 'admin_reply' : 'message',
                title: req.user.role === 'admin' ? 'New admin message' : 'New driver message',
                message: `${sender.name} sent a message: ${content.slice(0, 80)}`,
                messageId: result.message._id,
                relatedId: conversationId,
                relatedType: 'message',
                actionUrl: req.user.role === 'admin' ? '/messages' : '/admin/messages'
            });
        } else {
            const admins = await User.find({ role: 'admin' }).select('_id');
            await notifyUsers(admins, {
                type: 'message',
                title: 'New driver message',
                message: `${sender.name} sent a message`,
                messageId: result.message._id,
                relatedId: conversationId,
                relatedType: 'message',
                actionUrl: '/admin/messages'
            });
        }

        res.status(result.duplicate ? 200 : 201).json({
            conversationId,
            data: serializeMessage(result.message)
        });
    } catch (err) {
        console.error('Start conversation error:', err);
        res.status(500).json({ message: 'Server error starting conversation' });
    }
});

router.post('/conversations/:conversationId/messages', auth, async (req, res) => {
    try {
        const { conversationId } = req.params;
        const content = String(req.body.content || req.body.message || '').trim();
        if (!content) return res.status(400).json({ message: 'Message content is required' });

        const allowed = await userCanAccessConversation(req.user, conversationId);
        if (!allowed) return res.status(403).json({ message: 'Access denied' });

        const sender = await User.findById(req.user.id).select('name email role');
        let receiver = null;
        let receiverRole = 'admin';

        if (req.user.role === 'admin') {
            const previous = await Message.findOne({
                conversationId,
                $or: [
                    { senderRole: 'user', senderId: { $ne: null } },
                    { receiverRole: 'user', receiverId: { $ne: null } },
                    { userId: { $ne: null } }
                ]
            }).sort({ createdAt: 1 });

            const receiverId = previous?.senderRole === 'user'
                ? previous.senderId
                : previous?.receiverId || previous?.userId;

            if (receiverId && mongoose.Types.ObjectId.isValid(receiverId)) {
                receiver = await User.findById(receiverId).select('name email role');
            }

            if (!receiver) {
                const conversationUserId = userIdFromConversation(conversationId);
                if (conversationUserId && mongoose.Types.ObjectId.isValid(conversationUserId)) {
                    receiver = await User.findOne({ _id: conversationUserId, role: 'user' }).select('name email role');
                }
            }
            receiverRole = receiver ? 'user' : 'guest';
        } else {
            receiver = await findPrimaryAdmin();
            receiverRole = 'admin';
        }

        const result = await createMessage({
            conversationId,
            sender,
            receiver,
            senderRole: req.user.role,
            receiverRole,
            subject: req.body.subject,
            content,
            category: req.body.category,
            req
        });

        if (receiver) {
            await Notification.create({
                userId: receiver._id,
                type: req.user.role === 'admin' ? 'admin_reply' : 'message',
                title: req.user.role === 'admin' ? 'Admin replied to your message' : 'New driver message',
                message: req.user.role === 'admin'
                    ? `An administrator replied: ${content.slice(0, 80)}`
                    : `${sender.name} sent a message: ${content.slice(0, 80)}`,
                messageId: result.message._id,
                relatedId: conversationId,
                relatedType: 'message',
                actionUrl: req.user.role === 'admin' ? '/messages' : '/admin/messages'
            });
        } else if (req.user.role !== 'admin') {
            const admins = await User.find({ role: 'admin' }).select('_id');
            await notifyUsers(admins, {
                type: 'message',
                title: 'New driver message',
                message: `${sender.name} sent a message`,
                messageId: result.message._id,
                relatedId: conversationId,
                relatedType: 'message',
                actionUrl: '/admin/messages'
            });
        }

        res.status(result.duplicate ? 200 : 201).json(serializeMessage(result.message));
    } catch (err) {
        console.error('Send conversation message error:', err);
        res.status(500).json({ message: 'Server error sending message' });
    }
});

router.patch('/conversations/:conversationId/read', auth, async (req, res) => {
    try {
        const { conversationId } = req.params;
        const allowed = await userCanAccessConversation(req.user, conversationId);
        if (!allowed) return res.status(403).json({ message: 'Access denied' });

        await markConversationRead(conversationId, req.user.id);
        res.json({ message: 'Conversation marked as read' });
    } catch (err) {
        console.error('Mark conversation read error:', err);
        res.status(500).json({ message: 'Server error updating read status' });
    }
});

router.put('/:id/reply', auth, adminOnly, async (req, res) => {
    try {
        const reply = String(req.body.reply || req.body.content || '').trim();
        if (!reply) return res.status(400).json({ message: 'Reply text is required' });

        const original = await Message.findById(req.params.id);
        if (!original) return res.status(404).json({ message: 'Message not found' });

        const conversationId = normalizeConversationId(original);
        const receiverId = original.senderId || original.userId;
        const receiver = receiverId ? await User.findById(receiverId).select('name email role') : null;
        const sender = await User.findById(req.user.id).select('name email role');

        const result = await createMessage({
            conversationId,
            sender,
            receiver,
            senderRole: 'admin',
            receiverRole: receiver ? 'user' : 'guest',
            subject: original.subject,
            content: reply,
            category: original.category,
            req
        });

        original.adminReply = reply;
        original.status = 'replied';
        original.repliedBy = req.user.id;
        original.repliedAt = new Date();
        original.replyEmailSent = false;
        await original.save();

        if (receiver) {
            await Notification.create({
                userId: receiver._id,
                type: 'admin_reply',
                title: 'You have received a reply from admin',
                message: `An admin has responded to your request: ${original.subject}`,
                messageId: result.message._id,
                relatedId: conversationId,
                relatedType: 'message',
                actionUrl: '/messages'
            });

            const emailSent = await sendAdminReplyEmail(receiver.email, receiver.name || 'Driver', sender.name || 'Admin', reply);
            if (emailSent) {
                original.replyEmailSent = true;
                await original.save();
            }
        }

        res.json({ message: 'Reply saved and notification sent', data: serializeMessage(result.message) });
    } catch (err) {
        console.error('Reply error:', err);
        res.status(500).json({ message: 'Server error sending reply' });
    }
});

module.exports = router;
