const express = require('express');
const router = express.Router();

const Message = require('../models/Message');
const Request = require('../models/Request');
const { protect } = require('../middleware/authMiddleware');

// SEND A MESSAGE
router.post('/:requestId', protect, async (req, res) => {
    try {
        const { content } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({
                message: 'Message cannot be empty.'
            });
        }

        const request = await Request.findById(req.params.requestId);

        if (!request) {
            return res.status(404).json({
                message: 'Service request not found.'
            });
        }

        const userId = req.user._id.toString();
        const customerId = request.customer.toString();
        const providerId = request.provider.toString();

        if (userId !== customerId && userId !== providerId) {
            return res.status(403).json({
                message: 'You are not allowed to message in this conversation.'
            });
        }

        if (request.status === 'rejected') {
            return res.status(400).json({
                message: 'This request has been rejected.'
            });
        }

        const receiver = userId === customerId
            ? request.provider
            : request.customer;

        const message = await Message.create({
            request: request._id,
            sender: req.user._id,
            receiver,
            content: content.trim()
        });

        res.status(201).json({
            message: 'Message sent successfully.',
            data: message
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// GET MESSAGES FOR A SERVICE REQUEST
router.get('/:requestId', protect, async (req, res) => {
    try {
        const request = await Request.findById(req.params.requestId);

        if (!request) {
            return res.status(404).json({
                message: 'Service request not found.'
            });
        }

        const userId = req.user._id.toString();

        if (
            userId !== request.customer.toString() &&
            userId !== request.provider.toString()
        ) {
            return res.status(403).json({
                message: 'You are not allowed to view this conversation.'
            });
        }

        const messages = await Message.find({
            request: request._id
        })
        .populate('sender', 'fullName')
        .populate('receiver', 'fullName')
        .sort({ createdAt: 1 });

        res.json(messages);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// MARK MESSAGES AS READ
router.patch('/:requestId/read', protect, async (req, res) => {
    try {
        const request = await Request.findById(req.params.requestId);

        if (!request) {
            return res.status(404).json({
                message: 'Service request not found.'
            });
        }

        const userId = req.user._id.toString();

        if (
            userId !== request.customer.toString() &&
            userId !== request.provider.toString()
        ) {
            return res.status(403).json({
                message: 'You are not allowed to access this conversation.'
            });
        }

        await Message.updateMany(
            {
                request: request._id,
                receiver: req.user._id,
                isRead: false
            },
            {
                $set: { isRead: true }
            }
        );

        res.json({
            message: 'Messages marked as read.'
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

module.exports = router;