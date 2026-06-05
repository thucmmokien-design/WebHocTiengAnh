const express = require('express');
const router = express.Router();
const vocabSetController = require('../controllers/vocabSet.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ===================================
// Multer config for VOCAB SET avatars
// ===================================
const vocabUploadDir = path.join(__dirname, '../../uploads/avatarsvacab');
if (!fs.existsSync(vocabUploadDir)) {
    fs.mkdirSync(vocabUploadDir, { recursive: true });
}

const vocabStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, vocabUploadDir);  // Lưu vào avatarsvacab
    },
    filename: function (req, file, cb) {
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        cb(null, `vocab_${timestamp}${ext}`);
    }
});

const vocabFileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WEBP)!'), false);
    }
};

const uploadVocabAvatar = multer({
    storage: vocabStorage,
    fileFilter: vocabFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }  // 5MB
});

// ===================================
// Routes
// ===================================
// Upload avatar MUST be before /:id routes
router.post('/upload-avatar', verifyToken, uploadVocabAvatar.single('avatar'), vocabSetController.uploadAvatar);

router.post('/', verifyToken, vocabSetController.createSet);
router.get('/', verifyToken, vocabSetController.getSets);
router.put('/:id', verifyToken, vocabSetController.updateSet);
router.delete('/:id', verifyToken, vocabSetController.deleteSet);

module.exports = router;
