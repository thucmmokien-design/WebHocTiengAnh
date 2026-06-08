const express = require('express');
const router = express.Router();
const achievementController = require('../controllers/achievement.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Lấy danh sách thành tích của user
router.get('/', verifyToken, achievementController.getUserAchievements);

// Kiểm tra và trao thành tích mới
router.post('/check', verifyToken, achievementController.checkAndUnlockAchievements);

module.exports = router;
