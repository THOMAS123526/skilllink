const express = require('express');
const Request = require('../models/Request');
const Service = require('../models/Service');
const { protect } = require('../middleware/authMiddleware');
const Notification = require('../models/Notification');

const router = express.Router();

// Customer creates a service request
router.post('/', protect, async (req, res) => {
    try {
        if (req.user.role !== 'customer') {
            return res.status(403).json({
                message: 'Only customers can request services'
            });
        }

        const { serviceId, message } = req.body;

        if (!serviceId) {
            return res.status(400).json({
                message: 'Please select a service'
            });
        }

        const service = await Service.findById(serviceId);

        if (!service) {
            return res.status(404).json({
                message: 'Service not found'
            });
        }

        if (service.provider.toString() === req.user._id.toString()) {
            return res.status(400).json({
                message: 'You cannot request your own service'
            });
        }

        const newRequest = await Request.create({
            customer: req.user._id,
            provider: service.provider,
            service: service._id,
            message
        });
        await Notification.create({
    user: service.provider,
    title: 'New Service Request',
    message: `You have received a new request for ${service.title}`,
    type: 'request',
    relatedRequest: newRequest._id
});

        res.status(201).json({
            message: 'Service request submitted successfully!',
            request: newRequest
        });

    } catch (error) {
        console.error('Request creation error:', error);

        res.status(500).json({
            message: 'Failed to submit request'
        });
    }
});
// Customer views their submitted requests
router.get('/my-requests', protect, async (req, res) => {
    try {
        if (req.user.role !== 'customer') {
            return res.status(403).json({
                message: 'Only customers can view their requests'
            });
        }

        const requests = await Request.find({
            customer: req.user._id
        })
        .populate('service')
        .populate('provider', 'fullName email')
        .sort({ createdAt: -1 });

        res.status(200).json(requests);

    } catch (error) {
        console.error('Request retrieval error:', error);

        res.status(500).json({
            message: 'Failed to retrieve requests'
        });
    }
});
// Provider views incoming job requests
router.get('/job-requests', protect, async (req, res) => {
    try {
        if (req.user.role !== 'provider') {
            return res.status(403).json({
                message: 'Only providers can view job requests'
            });
        }

        const requests = await Request.find({
            provider: req.user._id
        })
        .populate('customer', 'fullName email')
        .populate('service')
        .sort({ createdAt: -1 });

        res.status(200).json(requests);

    } catch (error) {
        console.error('Job request retrieval error:', error);

        res.status(500).json({
            message: 'Failed to retrieve job requests'
        });
    }
});
// Provider accepts or rejects a job request
router.patch('/:id/status', protect, async (req, res) => {
    try {
        if (req.user.role !== 'provider') {
            return res.status(403).json({
                message: 'Only providers can update requests'
            });
        }

        const { status } = req.body;

        if (!['accepted', 'rejected', 'completed'].includes(status)) {
            return res.status(400).json({
                message: 'Invalid request status'
            });
        }

        const request = await Request.findOne({
            _id: req.params.id,
            provider: req.user._id
        });

        if (!request) {
            return res.status(404).json({
                message: 'Job request not found'
            });
        }

        const validTransition =
            (request.status === 'pending' &&
                ['accepted', 'rejected'].includes(status)) ||
            (request.status === 'accepted' &&
                status === 'completed');

        if (!validTransition) {
            return res.status(400).json({
                message: 'This request cannot be updated to that status'
            });
        }

        request.status = status;
        await request.save();

        res.status(200).json({
            message: `Request ${status} successfully!`,
            request
        });

    } catch (error) {
        console.error('Request update error:', error);

        res.status(500).json({
            message: 'Failed to update request'
        });
    }
});
module.exports = router;