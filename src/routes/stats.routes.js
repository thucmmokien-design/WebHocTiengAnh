const express = require('express');
const router = express.Router();
const statsController = require('../controllers/stats.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Bắt buộc phải đăng nhập thì hệ thống mới biết là ai để thống kê dữ liệu người đó
router.get('/overview', verifyToken, statsController.getLearningStats);

module.exports = router;