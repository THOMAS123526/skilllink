const express = require('express');
const router = express.Router();

const Notification = require('../models/Notification');
const { protect } = require('../middleware/authMiddleware');

// GET ALL NOTIFICATIONS FOR LOGGED-IN USER
router.get('/', protect, async (req, res) => {
    try {
        const notifications = await Notification.find({
            user: req.user._id
        }).sort({ createdAt: -1 });

        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({
            message: 'Failed to fetch notifications',
            error: error.message
        });
    }
});

// MARK A NOTIFICATION AS READ
router.patch('/:id/read', protect, async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            {
                _id: req.params.id,
                user: req.user._id
            },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                message: 'Notification not found'
            });
        }

        res.status(200).json(notification);
    } catch (error) {
        res.status(500).json({
            message: 'Failed to update notification',
            error: error.message
        });
    }
});

// MARK ALL NOTIFICATIONS AS READ
router.patch('/read-all', protect, async (req, res) => {
    try {
        await Notification.updateMany(
            {
                user: req.user._id,
                isRead: false
            },
            { isRead: true }
        );

        res.status(200).json({
            message: 'All notifications marked as read'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Failed to update notifications',
            error: error.message
        });
    }
});

module.exports = router;