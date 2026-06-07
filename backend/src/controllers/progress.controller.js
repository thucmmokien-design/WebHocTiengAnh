const db = require('../config/db');

// =========================
// HELPER: Tính chuỗi học liên tiếp (streak)
// =========================
async function calculateStreak(userId, connection) {
    try {
        // 1. Lấy tất cả các ngày đã học (distinct DATE từ started_at), sắp xếp giảm dần
        const [sessions] = await connection.query(`
            SELECT DISTINCT DATE(started_at) as study_date
            FROM studysessions
            WHERE user_id = ?
            ORDER BY study_date DESC
        `, [userId]);

        if (sessions.length === 0) {
            return 0; // Chưa có buổi học nào
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString().split('T')[0];

        // 2. Kiểm tra xem hôm nay có học không
        const lastStudyDate = sessions[0].study_date;
        const lastStudyStr = new Date(lastStudyDate).toISOString().split('T')[0];

        // Nếu ngày học gần nhất không phải hôm nay hoặc hôm qua => streak = 0
        const daysDiff = Math.floor((today - new Date(lastStudyDate)) / (1000 * 60 * 60 * 24));
        
        if (daysDiff > 1) {
            return 0; // Đã bỏ lỡ hơn 1 ngày => mất streak
        }

        // 3. Đếm số ngày liên tiếp
        let streak = 0;
        let expectedDate = new Date(today);
        
        // Nếu hôm nay chưa học, bắt đầu từ hôm qua
        if (lastStudyStr !== todayStr) {
            expectedDate.setDate(expectedDate.getDate() - 1);
        }

        for (let session of sessions) {
            const studyDate = new Date(session.study_date);
            studyDate.setHours(0, 0, 0, 0);
            const studyDateStr = studyDate.toISOString().split('T')[0];
            const expectedDateStr = expectedDate.toISOString().split('T')[0];

            if (studyDateStr === expectedDateStr) {
                streak++;
                expectedDate.setDate(expectedDate.getDate() - 1); // Lùi về 1 ngày trước
            } else {
                break; // Gặp ngày không liên tiếp => dừng
            }
        }

        return streak;

    } catch (error) {
        console.error('Error calculating streak:', error);
        return 0;
    }
}

// [POST] /api/progress/review-batch - Cập nhật kết quả học Flashcard cho CẢ BỘ TỪ
const reviewWordsBatch = async (req, res) => {
    const connection = await db.getConnection(); 
    
    try {
        const userId = req.user.id;
        const { set_id, reviews } = req.body; 

        if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
            return res.status(400).json({ message: 'Không có dữ liệu từ vựng nào để cập nhật!' });
        }
        
        if (!set_id) {
            return res.status(400).json({ message: 'Thiếu thông tin bộ từ vựng (set_id)!' });
        }

        await connection.beginTransaction();

        for (let item of reviews) {
            const { word_id, is_remembered } = item;

            const [existingProgress] = await connection.query(
                'SELECT * FROM userprogress WHERE user_id = ? AND word_id = ?',
                [userId, word_id]
            );

            let memoryLevel = 1;
            let status = 'LEARNING';
            let daysToAdd = 1;

            if (existingProgress.length > 0) {
                const progress = existingProgress[0];
                if (is_remembered) {
                    memoryLevel = progress.memory_level + 1;
                    status = memoryLevel >= 5 ? 'MASTERED' : 'REVIEWING';
                    daysToAdd = memoryLevel * 2; 
                } else {
                    memoryLevel = 1;
                    daysToAdd = 1;
                }

                await connection.query(
                    `UPDATE userprogress 
                     SET status = ?, memory_level = ?, last_reviewed_at = NOW(), 
                         next_review_date = DATE_ADD(NOW(), INTERVAL ? DAY)
                     WHERE id = ?`,
                    [status, memoryLevel, daysToAdd, progress.id]
                );
            } else {
                if (is_remembered) {
                    memoryLevel = 2;
                    daysToAdd = 2;
                }
                await connection.query(
                    `INSERT INTO userprogress 
                     (user_id, word_id, status, memory_level, last_reviewed_at, next_review_date) 
                     VALUES (?, ?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL ? DAY))`,
                    [userId, word_id, status, memoryLevel, daysToAdd]
                );
            }
        }

        // --- CẬP NHẬT ĐOẠN LƯU LỊCH SỬ HỌC TẬP (CHUẨN QUIZLET) ---
        // 1. Lấy tổng số từ THỰC TẾ của bộ từ vựng này từ Database (Đã fix set_id)
        const [wordCountResult] = await connection.query(
            'SELECT COUNT(*) as total_in_set FROM words WHERE set_id = ?',
            [set_id]
        );
        const totalCardsInSet = wordCountResult[0].total_in_set;

        // 2. Đếm số từ user bấm "Nhớ"
        const rememberedCards = reviews.filter(item => item.is_remembered === true).length;
        
        // 3. Tính phần trăm dựa trên tổng số từ của CẢ BỘ
        let score = 0;
        if (totalCardsInSet > 0) {
            score = Math.round((rememberedCards / totalCardsInSet) * 100);
        }

        // 4. Lưu vào studysessions với tổng số câu hỏi là tổng của cả bộ
        await connection.query(
            `INSERT INTO studysessions 
            (user_id, set_id, session_type, total_questions, correct_answers, score, started_at, completed_at) 
            VALUES (?, ?, 'FLASHCARD', ?, ?, ?, NOW(), NOW())`,
            [userId, set_id, totalCardsInSet, rememberedCards, score]
        );

        // 5. CẬP NHẬT CHUỖI HỌC LIÊN TIẾP (STREAK)
        const currentStreak = await calculateStreak(userId, connection);
        
        await connection.query(
            'UPDATE users SET current_streak = ? WHERE id = ?',
            [currentStreak, userId]
        );

        await connection.commit();

        res.status(200).json({ 
            message: `Tuyệt vời! Đã cập nhật thành công tiến độ cho tập Flashcard!`,
            session_stats: {
                set_id: set_id,
                total_in_set: totalCardsInSet,
                remembered: rememberedCards,
                accuracy: `${score}%`,
                current_streak: currentStreak
            }
        });

    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: 'Lỗi đồng bộ dữ liệu', error: error.message });
    } finally {
        connection.release();
    }
};

// [GET] /api/progress/study-set/:setId - Lấy TOÀN BỘ từ của 1 bộ để hiển thị
const getWordsForStudy = async (req, res) => {
    try {
        const userId = req.user.id;
        const setId = req.params.setId;

        // Dùng LEFT JOIN để lấy đủ từ vựng, nếu từ nào user chưa đụng tới thì status là NULL (ta gán thành 'NEW')
        const [words] = await db.query(`
            SELECT w.id as word_id, w.english_word, w.meaning, w.pronunciation, w.example_sentence, 
                   COALESCE(up.status, 'NEW') as status, 
                   COALESCE(up.memory_level, 0) as memory_level
            FROM words w
            LEFT JOIN userprogress up ON w.id = up.word_id AND up.user_id = ?
            WHERE w.set_id = ?
        `, [userId, setId]);

        res.status(200).json({ 
            total: words.length,
            data: words 
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// [GET] /api/progress/review-words - Lấy tất cả các từ cần ôn tập (đã học nhưng chưa MASTERED)
const getReviewWords = async (req, res) => {
    try {
        const userId = req.user.id;

        // Lấy các từ có status khác 'NEW' và khác 'MASTERED'
        const [words] = await db.query(`
            SELECT 
                w.id as word_id, 
                w.english_word, 
                w.meaning, 
                w.pronunciation, 
                w.example_sentence,
                up.status,
                up.memory_level,
                up.last_reviewed_at,
                up.next_review_date,
                vs.title as set_name,
                vs.id as set_id,
                vs.avatar_url as set_image
            FROM userprogress up
            INNER JOIN words w ON up.word_id = w.id
            INNER JOIN vocabularysets vs ON w.set_id = vs.id
            WHERE up.user_id = ? 
                AND up.status != 'NEW' 
                AND up.status != 'MASTERED'
            ORDER BY up.next_review_date ASC, up.last_reviewed_at DESC
        `, [userId]);

        res.status(200).json({ 
            total: words.length,
            message: 'Lấy danh sách từ cần ôn tập thành công',
            data: words 
        });
    } catch (error) {
        console.error('Error getting review words:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

module.exports = { 
    reviewWordsBatch, 
    getWordsForStudy,
    getReviewWords
};