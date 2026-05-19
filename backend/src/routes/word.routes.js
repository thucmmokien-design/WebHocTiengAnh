const express = require('express');
const router = express.Router();
const wordController = require('../controllers/word.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Phải có Token (đăng nhập) mới được thêm từ
router.post('/', verifyToken, wordController.addWord);

// Lấy danh sách từ (có Token) - Chú ý có tham số :setId
router.get('/set/:setId', verifyToken, wordController.getWordsBySet);

module.exports = router;