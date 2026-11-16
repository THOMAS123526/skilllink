const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

    fullName: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    password: {
        type: String,
        required: true,
        minlength: 8
    },

    role: {
        type: String,
        enum: ['customer', 'provider'],
        default: 'customer'
    },

    // Profile information
    phone: {
        type: String,
        trim: true,
        default: ''
    },

    location: {
        type: String,
        trim: true,
        default: ''
    },

    bio: {
        type: String,
        trim: true,
        default: ''
    },

    profilePicture: {
        type: String,
        default: ''
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);