const db = require('../config/db');

// [POST] /api/words - Thêm từ vựng mới vào bộ từ
const addWord = async (req, res) => {
    try {
        // Lấy các thông tin Client gửi lên
        const { set_id, english_word, meaning, pronunciation, example_sentence } = req.body;

        // Lưu vào database
        const [result] = await db.query(
            `INSERT INTO Words 
            (set_id, english_word, meaning, pronunciation, example_sentence) 
            VALUES (?, ?, ?, ?, ?)`,
            [set_id, english_word, meaning, pronunciation, example_sentence]
        );

        res.status(201).json({ 
            message: 'Thêm từ vựng thành công!', 
            wordId: result.insertId 
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// [GET] /api/words/set/:setId - Lấy danh sách từ vựng của 1 bộ từ cụ thể
const getWordsBySet = async (req, res) => {
    try {
        const { setId } = req.params; // Lấy ID của bộ từ trên thanh URL

        const [words] = await db.query(
            'SELECT * FROM Words WHERE set_id = ? ORDER BY created_at DESC', 
            [setId]
        );

        res.status(200).json({ 
            total_words: words.length,
            data: words 
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

module.exports = { addWord, getWordsBySet };