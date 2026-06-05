const db = require('../config/db');

// [POST] /api/words - Thêm từ vựng mới vào bộ từ
const addWord = async (req, res) => {
    const connection = await db.getConnection();
    
    try {
        // Lấy các thông tin Client gửi lên
        const { set_id, english_word, meaning, pronunciation, example_sentence } = req.body;
        const userId = req.user.id; // Lấy user ID từ token

        await connection.beginTransaction();

        // 1. Lưu từ vựng vào bảng words
        const [result] = await connection.query(
            `INSERT INTO words 
            (set_id, english_word, meaning, pronunciation, example_sentence) 
            VALUES (?, ?, ?, ?, ?)`,
            [set_id, english_word, meaning, pronunciation, example_sentence]
        );

        const newWordId = result.insertId;

        // 2. Tự động insert vào bảng userprogress với status 'NEW' cho user hiện tại
        await connection.query(
            `INSERT INTO userprogress 
            (user_id, word_id, status, memory_level) 
            VALUES (?, ?, 'NEW', 0)`,
            [userId, newWordId]
        );

        await connection.commit();

        res.status(201).json({ 
            message: 'Thêm từ vựng thành công!', 
            wordId: newWordId 
        });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    } finally {
        connection.release();
    }
};

// [GET] /api/words/set/:setId - Lấy danh sách từ vựng của 1 bộ từ cụ thể
const getWordsBySet = async (req, res) => {
    try {
        const { setId } = req.params; // Lấy ID của bộ từ trên thanh URL

        const [words] = await db.query(
            'SELECT * FROM words WHERE set_id = ? ORDER BY created_at DESC', 
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

// [PUT] /api/words/:id - Sửa từ vựng
const updateWord = async (req, res) => {
    try {
        const { id } = req.params;
        const { english_word, meaning, pronunciation, example_sentence } = req.body;

        // Kiểm tra từ vựng có tồn tại không
        const [words] = await db.query('SELECT * FROM words WHERE id = ?', [id]);
        if (words.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy từ vựng!' });
        }

        // Cập nhật từ vựng
        await db.query(
            `UPDATE words 
            SET english_word = ?, meaning = ?, pronunciation = ?, example_sentence = ?
            WHERE id = ?`,
            [english_word, meaning, pronunciation, example_sentence, id]
        );

        res.status(200).json({ message: 'Cập nhật từ vựng thành công!' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// [DELETE] /api/words/:id - Xóa từ vựng
const deleteWord = async (req, res) => {
    try {
        const { id } = req.params;

        // Kiểm tra từ vựng có tồn tại không
        const [words] = await db.query('SELECT * FROM words WHERE id = ?', [id]);
        if (words.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy từ vựng!' });
        }

        // Xóa từ vựng
        await db.query('DELETE FROM words WHERE id = ?', [id]);

        res.status(200).json({ message: 'Xóa từ vựng thành công!' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

module.exports = { addWord, getWordsBySet, updateWord, deleteWord };