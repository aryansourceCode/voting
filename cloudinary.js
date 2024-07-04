const cloudinary = require('cloudinary').v2;
require('dotenv').config();
const fs = require('fs');

cloudinary.config({//configration of cloudinary
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

const uploadToCloudinary = async (localFilePath) => {//uploading of image
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto' // Specify the resource type
    });

    fs.unlinkSync(localFilePath);//unlink the local file after upload

    return response;
  } catch (error) {
    // Handle any errors, such as deleting the local file if the upload fails
    console.error('Error uploading to Cloudinary:', error);
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    return null;
  }
};

module.exports = { uploadToCloudinary };
