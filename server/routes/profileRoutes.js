const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../config/upload');

const router = express.Router();
const uploadProfilePicture = (req, res, next) => {
    upload.single('profilePicture')(req, res, (error) => {
        if (error) {
            console.error('Profile image upload error:', error);

            return res.status(400).json({
                message: error.message || 'Image upload failed'
            });
        }

        next();
    });
};

// GET logged-in user's profile
router.get('/', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select('-password');

        res.status(200).json(user);

    } catch (error) {
        console.error('Profile fetch error:', error);

        res.status(500).json({
            message: 'Failed to fetch profile'
        });
    }
});

// UPDATE logged-in user's profile
router.put('/', protect, uploadProfilePicture, async (req, res) => {
    try {
        const { fullName, phone, location, bio } = req.body;

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        if (fullName !== undefined) user.fullName = fullName;
        if (phone !== undefined) user.phone = phone;
        if (location !== undefined) user.location = location;
        if (bio !== undefined) user.bio = bio;
        if (req.file) {
            user.profilePicture = req.file.path;
        }

        await user.save();

        res.status(200).json({
            message: 'Profile updated successfully!',
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                phone: user.phone,
                location: user.location,
                bio: user.bio,
                profilePicture: user.profilePicture
            }
        });

    } catch (error) {
        console.error('Profile update error:', error);

        res.status(500).json({
            message: 'Failed to update profile'
        });
    }
});

module.exports = router;