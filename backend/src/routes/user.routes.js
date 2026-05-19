const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Sử dụng phương thức PUT cho các hành động cập nhật dữ liệu
router.put('/change-password', verifyToken, userController.changePassword);
router.put('/change-email', verifyToken, userController.changeEmail);

module.exports = router;