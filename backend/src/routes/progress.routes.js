const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progress.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// API: Review batch (cập nhật cả bộ từ)
router.post('/review-batch', verifyToken, progressController.reviewWordsBatch);

// API: Lấy toàn bộ từ của 1 bộ để học
router.get('/study-set/:setId', verifyToken, progressController.getWordsForStudy);

module.exports = router;