const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify that the user is logged in
async function protect(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'Authentication required'
            });
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({
                message: 'User not found'
            });
        }

        req.user = user;
        next();

    } catch (error) {
        return res.status(401).json({
            message: 'Invalid or expired token'
        });
    }
}

// Allow only service providers
function providerOnly(req, res, next) {
    if (req.user.role !== 'provider') {
        return res.status(403).json({
            message: 'Only service providers can publish services'
        });
    }

    next();
}

module.exports = { protect, providerOnly };