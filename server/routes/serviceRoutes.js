const express = require('express');
const Service = require('../models/Service');
const { protect, providerOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// Publish a new service
router.post('/', protect, providerOnly, async (req, res) => {
    try {
        const {  title, description, category, price } = req.body;

        if (!title || !description || !category || price === undefined) {
            return res.status(400).json({
                message: 'Please provide all required fields'
            });
        }

        const newService = await Service.create({
            provider: req.user._id,
            title,
            description,
            category,
            price
        });

        res.status(201).json({
            message: 'Service published successfully!',
            service: newService
        });

    } catch (error) {
        console.error('Service creation error:', error);

        res.status(500).json({
            message: 'Failed to publish service'
        });
    }
});

// Get all published services
router.get('/', async (req, res) => {
    try {
        const services = await Service.find()
            .populate('provider', 'fullName');

        res.status(200).json(services);

    } catch (error) {
        console.error('Service retrieval error:', error);

        res.status(500).json({
            message: 'Failed to retrieve services'
        });
    }
});

module.exports = router;