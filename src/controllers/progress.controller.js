const db = require('../config/db');

// [POST] /api/progress/review - Cập nhật kết quả học Flashcard
const reviewWord = async (req, res) => {
    try {
        const userId = req.user.id;
        const { word_id, is_remembered } = req.body;

        // 1. Kiểm tra xem user đã có tiến trình với từ này chưa
        const [existingProgress] = await db.query(
            'SELECT * FROM UserProgress WHERE user_id = ? AND word_id = ?',
            [userId, word_id]
        );

        let memoryLevel = 1;
        let status = 'LEARNING';
        let daysToAdd = 1; // Số ngày sau mới cần ôn lại

        if (existingProgress.length > 0) {
            // Đã từng học
            const progress = existingProgress[0];
            if (is_remembered) {
                // Nhớ bài -> Tăng level, dãn khoảng cách ngày ôn tập ra
                memoryLevel = progress.memory_level + 1;
                status = memoryLevel >= 5 ? 'MASTERED' : 'REVIEWING';
                daysToAdd = memoryLevel * 2; // Ví dụ: level 2 thì 4 ngày sau học, level 3 thì 6 ngày...
            } else {
                // Quên bài -> Reset level về 1, ngày mai bắt học lại
                memoryLevel = 1;
                daysToAdd = 1;
            }

            // Cập nhật record cũ
            await db.query(
                `UPDATE UserProgress 
                 SET status = ?, memory_level = ?, last_reviewed_at = NOW(), 
                     next_review_date = DATE_ADD(NOW(), INTERVAL ? DAY)
                 WHERE id = ?`,
                [status, memoryLevel, daysToAdd, progress.id]
            );
        } else {
            // Lần đầu tiên học từ này
            if (is_remembered) {
                memoryLevel = 2;
                daysToAdd = 2;
            }
            // Tạo record mới
            await db.query(
                `INSERT INTO UserProgress 
                 (user_id, word_id, status, memory_level, last_reviewed_at, next_review_date) 
                 VALUES (?, ?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL ? DAY))`,
                [userId, word_id, status, memoryLevel, daysToAdd]
            );
        }

        res.status(200).json({ 
            message: 'Đã lưu kết quả!', 
            status: status,
            next_review_in_days: daysToAdd
        });

    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// [GET] /api/progress/due-today - Lấy danh sách từ cần ôn tập hôm nay
const getDueWords = async (req, res) => {
    try {
        const userId = req.user.id;

        // Bổ sung w.pronunciation và w.example_sentence vào câu SELECT
        const [dueWords] = await db.query(`
            SELECT w.id as word_id, w.english_word, w.meaning, w.pronunciation, w.example_sentence, up.status, up.memory_level
            FROM Words w
            JOIN UserProgress up ON w.id = up.word_id
            WHERE up.user_id = ? 
            AND (up.next_review_date IS NULL OR up.next_review_date <= NOW())
            ORDER BY up.next_review_date ASC
        `, [userId]);

        res.status(200).json({ 
            total: dueWords.length,
            data: dueWords 
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

module.exports = { reviewWord, getDueWords };