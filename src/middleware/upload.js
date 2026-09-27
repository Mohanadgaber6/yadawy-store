const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');

const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || './uploads');
const MAX_FILE_SIZE = (parseInt(process.env.MAX_FILE_SIZE_MB) || 10) * 1024 * 1024;
const MAX_VIDEO_SIZE = (parseInt(process.env.MAX_VIDEO_SIZE_MB) || 100) * 1024 * 1024;

// Ensure upload directories exist
const dirs = ['products', 'categories', 'collections', 'hero', 'content', 'videos', 'thumbnails'];
for (const dir of dirs) {
    const fullPath = path.join(UPLOAD_DIR, dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
    }
}

// Allowed MIME types
const ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif'
];

const ALLOWED_VIDEO_TYPES = [
    'video/mp4',
    'video/webm',
    'video/ogg'
];

// Sanitize filename
function sanitizeFilename(originalName) {
    const ext = path.extname(originalName).toLowerCase();
    const safeName = uuidv4();
    return `${safeName}${ext}`;
}

// Image upload storage
const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const subDir = req.uploadDir || 'products';
        const dest = path.join(UPLOAD_DIR, subDir);
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        cb(null, sanitizeFilename(file.originalname));
    }
});

// Image file filter
function imageFilter(req, file, cb) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
        return cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and AVIF images are allowed.'), false);
    }
    cb(null, true);
}

// Video file filter
function videoFilter(req, file, cb) {
    if (!ALLOWED_VIDEO_TYPES.includes(file.mimetype)) {
        return cb(new Error('Invalid file type. Only MP4, WebM, and OGG videos are allowed.'), false);
    }
    cb(null, true);
}

// Create multer instances
const uploadImages = multer({
    storage: imageStorage,
    fileFilter: imageFilter,
    limits: {
        fileSize: MAX_FILE_SIZE,
        files: 20
    }
});

const videoStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(UPLOAD_DIR, 'videos'));
    },
    filename: (req, file, cb) => {
        cb(null, sanitizeFilename(file.originalname));
    }
});

const uploadVideos = multer({
    storage: videoStorage,
    fileFilter: videoFilter,
    limits: {
        fileSize: MAX_VIDEO_SIZE,
        files: 5
    }
});

// Process uploaded image — resize and create thumbnail
async function processImage(filePath, subDir) {
    try {
        const dir = path.dirname(filePath);
        const filename = path.basename(filePath, path.extname(filePath));
        const ext = path.extname(filePath);

        // Validate it's actually an image by reading metadata
        const metadata = await sharp(filePath).metadata();
        if (!metadata.width || !metadata.height) {
            throw new Error('Invalid image file');
        }

        // Resize if very large (keep aspect ratio, max 2000px wide)
        if (metadata.width > 2000) {
            const optimizedPath = path.join(dir, `${filename}_opt${ext}`);
            await sharp(filePath)
                .resize(2000, null, { withoutEnlargement: true })
                .jpeg({ quality: 85 })
                .toFile(optimizedPath);

            // Replace original
            fs.unlinkSync(filePath);
            fs.renameSync(optimizedPath, filePath);
        }

        // Create thumbnail
        const thumbnailDir = path.join(UPLOAD_DIR, 'thumbnails');
        const thumbnailPath = path.join(thumbnailDir, `${filename}_thumb.webp`);
        await sharp(filePath)
            .resize(400, 500, { fit: 'cover' })
            .webp({ quality: 80 })
            .toFile(thumbnailPath);

        return {
            imagePath: `/uploads/${subDir}/${path.basename(filePath)}`,
            thumbnailPath: `/uploads/thumbnails/${filename}_thumb.webp`
        };
    } catch (err) {
        // If processing fails, delete the uploaded file
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        throw err;
    }
}

// Delete uploaded file safely
function deleteUploadedFile(filePath) {
    try {
        const fullPath = filePath.startsWith('/uploads')
            ? path.join(UPLOAD_DIR, '..', filePath)
            : path.resolve(filePath);

        // Prevent path traversal
        const normalizedPath = path.normalize(fullPath);
        const uploadsRoot = path.normalize(UPLOAD_DIR);
        if (!normalizedPath.startsWith(uploadsRoot)) {
            console.error('Path traversal attempt blocked:', filePath);
            return false;
        }

        if (fs.existsSync(normalizedPath)) {
            fs.unlinkSync(normalizedPath);
            return true;
        }
    } catch (err) {
        console.error('Error deleting file:', err.message);
    }
    return false;
}

// Set upload directory middleware
function setUploadDir(dir) {
    return (req, res, next) => {
        req.uploadDir = dir;
        next();
    };
}

// Handle multer errors
function handleUploadError(err, req, res, next) {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size exceeded.' });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ error: 'Too many files uploaded at once.' });
        }
        return res.status(400).json({ error: `Upload error: ${err.message}` });
    }
    if (err) {
        return res.status(400).json({ error: err.message });
    }
    next();
}

module.exports = {
    uploadImages,
    uploadVideos,
    processImage,
    deleteUploadedFile,
    setUploadDir,
    handleUploadError,
    UPLOAD_DIR
};
