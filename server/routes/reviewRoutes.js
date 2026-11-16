const express = require('express');
const router = express.Router();

const Review = require('../models/Review');
const Request = require('../models/Request');
const { protect } = require('../middleware/authMiddleware');
const mongoose = require('mongoose');

// CUSTOMER SUBMITS A REVIEW
router.post('/', protect, async (req, res) => {
    try {
        if (req.user.role !== 'customer') {
            return res.status(403).json({
                message: 'Only customers can submit reviews'
            });
        }

        const { requestId, rating, comment } = req.body;

        if (!requestId || !Number.isInteger(Number(rating)) ||
            Number(rating) < 1 || Number(rating) > 5) {
            return res.status(400).json({
                message: 'Please provide a valid request ID and rating from 1 to 5'
            });
        }

        const serviceRequest = await Request.findById(requestId);

        if (!serviceRequest) {
            return res.status(404).json({
                message: 'Request not found'
            });
        }

        if (serviceRequest.customer.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: 'You cannot review another customer’s request'
            });
        }

        if (serviceRequest.status !== 'completed') {
            return res.status(400).json({
                message: 'You can only review completed services'
            });
        }

        const review = await Review.create({
            customer: req.user._id,
            provider: serviceRequest.provider,
            service: serviceRequest.service,
            request: serviceRequest._id,
            rating: Number(rating),
            comment
        });

        res.status(201).json({
            message: 'Review submitted successfully!',
            review
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                message: 'You have already reviewed this service request'
            });
        }

        console.error('Review submission error:', error);

        res.status(500).json({
            message: 'Failed to submit review'
        });
    }
});

// GET REVIEWS FOR A PROVIDER
router.get('/provider/:providerId', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.providerId)) {
            return res.status(400).json({
                message: 'Invalid provider ID'
            });
        }

        const reviews = await Review.find({
            provider: req.params.providerId
        })
            .populate('customer', 'fullName')
            .populate('service', 'title')
            .sort({ createdAt: -1 });

        res.status(200).json(reviews);

    } catch (error) {
        console.error('Review fetching error:', error);

        res.status(500).json({
            message: 'Failed to fetch reviews'
        });
    }
});

module.exports = router;