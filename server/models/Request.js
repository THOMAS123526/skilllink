const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({

    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: true
    },

    message: {
        type: String,
        trim: true,
        default: ''
    },

    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'completed'],
        default: 'pending'
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('Request', requestSchema);