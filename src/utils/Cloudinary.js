import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Configure Cloudinary using environment variables.
// Assumes CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET are set.
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true, // Always use secure HTTPS URLs
});

/**
 * Uploads a file buffer (typically from Multer memory storage) to Cloudinary.
 * We use the upload_stream to handle the buffer efficiently.
 *
 * @param {Buffer} buffer - The file buffer from req.file.buffer.
 * @param {string} folder - The destination folder in Cloudinary (e.g., 'events').
 * @returns {Promise<string>} The secure URL of the uploaded image.
 */
const uploadImageToCloudinary = (buffer, folder = 'Green_World') => {
    if (!buffer) {
        return Promise.resolve(null);
    }

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: folder,
                resource_type: 'auto', // Auto-detect resource type (image, video, raw)
            },
            (error, result) => {
                if (error || !result) {
                    // Log the error for debugging but reject the promise
                    console.error('Cloudinary Upload Error:', error);
                    return reject(new Error('Image upload failed.'));
                }
                // Resolve with the secure HTTPS URL
                resolve(result.secure_url);
            }
        );

        // Pipe the buffer into a Readable stream to feed the upload_stream
        Readable.from(buffer).pipe(uploadStream);
    });
};

export default uploadImageToCloudinary;
