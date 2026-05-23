const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

// Lấy thông tin profile
router.get('/profile', verifyToken, userController.getProfile);

// Cập nhật profile (full_name, avatar_url)
router.put('/profile', verifyToken, userController.updateProfile);

// Upload avatar
router.post('/upload-avatar', verifyToken, upload.single('avatar'), userController.uploadAvatar);

// Đổi mật khẩu
router.put('/change-password', verifyToken, userController.changePassword);

// Đổi email
router.put('/change-email', verifyToken, userController.changeEmail);

module.exports = router;