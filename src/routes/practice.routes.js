const express = require('express');
const router = express.Router();
const practiceController = require('../controllers/practice.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Lấy bài trắc nghiệm của một bộ từ cụ thể
router.get('/quiz/:setId', verifyToken, practiceController.getMultipleChoice);
// Nộp bài và nhận điểm
router.post('/submit', verifyToken, practiceController.submitQuiz);

module.exports = router;