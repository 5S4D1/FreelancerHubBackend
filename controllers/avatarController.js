const db = require('../DB/connect');
const cloudinary = require('../CDN/cloudinary');

const FALLBACK_AVATAR_URL = 'https://res.cloudinary.com/dz6mwsw9d/image/upload/v1778526754/fallback_img.png';

const uploadToCloudinary = (buffer, filename) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'home/freelancerhub',
                resource_type: 'auto'
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        uploadStream.end(buffer);
    });
};

// UPDATE AVATAR
exports.updateAvatar = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Avatar image is required' });
    }

    try {
        const uploadResult = await uploadToCloudinary(req.file.buffer, req.file.originalname);

        await db.query(
            'UPDATE profiles SET avatar_url = ? WHERE user_id = ?',
            [uploadResult.secure_url, req.user.id]
        );

        res.json({
            message: 'Avatar uploaded successfully',
            avatar_url: uploadResult.secure_url
        });
    } catch (err) {
        console.error('[UPDATE AVATAR] ', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET AVATAR (with fallback)
exports.getAvatar = async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT avatar_url FROM profiles WHERE user_id = ?',
            [req.user.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        const avatarUrl = rows[0].avatar_url || FALLBACK_AVATAR_URL;

        res.json({
            avatar_url: avatarUrl
        });
    } catch (err) {
        console.error('[GET AVATAR] ', err);
        res.status(500).json({ message: 'Server error' });
    }
};