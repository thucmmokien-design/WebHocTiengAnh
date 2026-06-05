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

// [GET] /api/stats/streak - Lấy thông tin chuỗi học liên tiếp của user
const getUserStreak = async (req, res) => {
    const connection = await db.getConnection();
    
    try {
        const userId = req.user.id;
        
        // Lấy current_streak từ database
        const [users] = await connection.query(
            'SELECT current_streak FROM users WHERE id = ?',
            [userId]
        );
        
        if (users.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng!' });
        }
        
        // Tính lại streak để đảm bảo chính xác
        const calculatedStreak = await calculateStreak(userId, connection);
        
        // Cập nhật nếu khác
        if (calculatedStreak !== users[0].current_streak) {
            await connection.query(
                'UPDATE users SET current_streak = ? WHERE id = ?',
                [calculatedStreak, userId]
            );
        }
        
        // Lấy thông tin chi tiết về các ngày đã học
        const [studyDays] = await connection.query(`
            SELECT DATE(started_at) as study_date, 
                   COUNT(*) as sessions_count,
                   SUM(correct_answers) as total_correct,
                   SUM(total_questions) as total_questions
            FROM studysessions
            WHERE user_id = ?
            GROUP BY DATE(started_at)
            ORDER BY study_date DESC
            LIMIT 30
        `, [userId]);
        
        res.status(200).json({
            current_streak: calculatedStreak,
            study_days: studyDays,
            message: calculatedStreak > 0 
                ? `Tuyệt vời! Bạn đã học ${calculatedStreak} ngày liên tiếp! 🔥` 
                : 'Hãy bắt đầu chuỗi học mới hôm nay!'
        });
        
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    } finally {
        connection.release();
    }
};

// [GET] /api/stats/words-learned - Đếm tổng số từ vựng đã học (status != 'NEW')
const getTotalWordsLearned = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Đếm số từ có status khác 'NEW'
        const [result] = await db.query(`
            SELECT 
                COUNT(*) as total_words_learned,
                SUM(CASE WHEN status = 'LEARNING' THEN 1 ELSE 0 END) as learning,
                SUM(CASE WHEN status = 'REVIEWING' THEN 1 ELSE 0 END) as reviewing,
                SUM(CASE WHEN status = 'MASTERED' THEN 1 ELSE 0 END) as mastered
            FROM userprogress
            WHERE user_id = ? AND status != 'NEW'
        `, [userId]);
        
        const stats = result[0];
        
        res.status(200).json({
            success: true,
            data: {
                total_words_learned: parseInt(stats.total_words_learned) || 0,
                learning: parseInt(stats.learning) || 0,
                reviewing: parseInt(stats.reviewing) || 0,
                mastered: parseInt(stats.mastered) || 0
            },
            message: `Bạn đã học được ${stats.total_words_learned || 0} từ vựng!`
        });
        
    } catch (error) {
        console.error('❌ Error counting words learned:', error);
        res.status(500).json({ 
            success: false,
            message: 'Lỗi khi đếm số từ đã học', 
            error: error.message 
        });
    }
};

// [GET] /api/stats/memory-retention - Lấy tỉ lệ ghi nhớ từ cột score
const getMemoryRetention = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Tính tỉ lệ ghi nhớ trung bình từ cột score và lấy thống kê chi tiết
        const [result] = await db.query(`
            SELECT 
                COUNT(*) as total_sessions,
                ROUND(AVG(score), 2) as avg_score,
                MIN(score) as min_score,
                MAX(score) as max_score,
                SUM(correct_answers) as total_correct,
                SUM(total_questions) as total_questions
            FROM studysessions
            WHERE user_id = ?
        `, [userId]);
        
        const stats = result[0];
        
        // Tính accuracy (độ chính xác) = tổng câu đúng / tổng câu hỏi
        const accuracy = stats.total_questions > 0 
            ? Math.round((stats.total_correct / stats.total_questions) * 100)
            : 0;
        
        // Lấy top 5 buổi học gần nhất
        const [recentSessions] = await db.query(`
            SELECT 
                session_type,
                score,
                correct_answers,
                total_questions,
                DATE_FORMAT(started_at, '%Y-%m-%d %H:%i') as study_time
            FROM studysessions
            WHERE user_id = ?
            ORDER BY started_at DESC
            LIMIT 5
        `, [userId]);
        
        res.status(200).json({
            success: true,
            data: {
                memory_retention_rate: parseFloat(stats.avg_score) || 0,
                accuracy: accuracy,
                total_sessions: parseInt(stats.total_sessions) || 0,
                min_score: parseFloat(stats.min_score) || 0,
                max_score: parseFloat(stats.max_score) || 0,
                total_correct: parseInt(stats.total_correct) || 0,
                total_questions: parseInt(stats.total_questions) || 0,
                recent_sessions: recentSessions
            },
            message: `Tỉ lệ ghi nhớ trung bình của bạn là ${stats.avg_score || 0}%`
        });
        
    } catch (error) {
        console.error('❌ Error getting memory retention:', error);
        res.status(500).json({ 
            success: false,
            message: 'Lỗi khi lấy tỉ lệ ghi nhớ', 
            error: error.message 
        });
    }
};

module.exports = { 
    getUserStreak,
    getTotalWordsLearned,
    getMemoryRetention 
};