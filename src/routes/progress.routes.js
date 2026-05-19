const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progress.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Các luồng học tập bắt buộc phải có Token
router.post('/review', verifyToken, progressController.reviewWord);
router.get('/due-today', verifyToken, progressController.getDueWords);

module.exports = router;