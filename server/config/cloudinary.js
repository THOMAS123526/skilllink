require('dotenv').config();

const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
console.log('Cloudinary diagnostic:', {
    cloudNameLoaded: Boolean(process.env.CLOUDINARY_CLOUD_NAME),
    apiKeyLoaded: Boolean(process.env.CLOUDINARY_API_KEY),
    apiSecretLoaded: Boolean(process.env.CLOUDINARY_API_SECRET),
    apiKeyLength: process.env.CLOUDINARY_API_KEY?.length,
    apiSecretLength: process.env.CLOUDINARY_API_SECRET?.length
});

module.exports = cloudinary;