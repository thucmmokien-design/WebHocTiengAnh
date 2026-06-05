const express = require('express');
const router = express.Router();
const statsController = require('../controllers/stats.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// API: Lấy thông tin chuỗi học liên tiếp (streak)
router.get('/streak', verifyToken, statsController.getUserStreak);

// API: Đếm tổng số từ vựng đã học (status != 'NEW')
router.get('/words-learned', verifyToken, statsController.getTotalWordsLearned);

// API: Lấy tỉ lệ ghi nhớ (memory retention rate) từ cột score
router.get('/memory-retention', verifyToken, statsController.getMemoryRetention);

module.exports = router;