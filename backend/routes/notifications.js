const express = require('express');
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');

const router = express.Router();

const adminOnly = (req, res, next) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
    next();
};

// Get notifications for current user
router.get('/', auth, async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
        const unreadCount = notifications.filter(n => !n.isRead).length;
        res.json({ notifications, unreadCount });
    } catch (err) {
        console.error('Get notifications error:', err);
        res.status(500).json({ message: 'Server error fetching notifications' });
    }
});

// Admin can get all notifications
router.get('/all', auth, adminOnly, async (req, res) => {
    try {
        const notifications = await Notification.find().sort({ createdAt: -1 });
        res.json(notifications);
    } catch (err) {
        console.error('Get all notifications error:', err);
        res.status(500).json({ message: 'Server error fetching notifications' });
    }
});

// Mark notification as read
router.patch('/:id/read', auth, async (req, res) => {
    try {
        const notification = await Notification.findOne({ _id: req.params.id, userId: req.user.id });
        if (!notification) return res.status(404).json({ message: 'Notification not found' });

        notification.isRead = true;
        notification.readAt = new Date();
        await notification.save();

        res.json({ message: 'Notification marked as read' });
    } catch (err) {
        console.error('Mark notification read error:', err);
        res.status(500).json({ message: 'Server error updating notification' });
    }
});

// Mark all notifications, or notifications for a related resource, as read.
router.patch('/read-all', auth, async (req, res) => {
    try {
        const query = { userId: req.user.id, isRead: false };
        if (req.body?.relatedId) query.relatedId = req.body.relatedId;
        if (req.body?.relatedType) query.relatedType = req.body.relatedType;

        const result = await Notification.updateMany(query, {
            $set: { isRead: true, readAt: new Date() }
        });

        res.json({ message: 'Notifications marked as read', modifiedCount: result.modifiedCount });
    } catch (err) {
        console.error('Mark notifications read error:', err);
        res.status(500).json({ message: 'Server error updating notifications' });
    }
});

module.exports = router;
