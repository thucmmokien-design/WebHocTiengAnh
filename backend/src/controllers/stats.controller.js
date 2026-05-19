const db = require('../config/db');

// [GET] /api/stats/overview - Lấy tổng quan thống kê và thành tích
const getLearningStats = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Lấy thông tin XP và tên của User từ bảng Users
        const [userResult] = await db.query(
            'SELECT full_name, xp FROM Users WHERE id = ?', 
            [userId]
        );
        if (userResult.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng!' });
        }
        const { full_name, xp } = userResult[0];

        // 2. Thống kê số lượng từ theo từng trạng thái (LEARNING, REVIEWING, MASTERED)
        // Sử dụng GROUP BY và COUNT để MySQL tự gom nhóm và đếm số lượng
        const [statusResult] = await db.query(
            `SELECT status, COUNT(*) as count 
             FROM UserProgress 
             WHERE user_id = ? 
             GROUP BY status`,
            [userId]
        );

        // Khởi tạo object chứa số liệu mặc định ban đầu là 0
        const wordStats = {
            total_learned: 0,
            learning: 0,
            reviewing: 0,
            mastered: 0
        };

        // Duyệt qua kết quả từ DB để đổ số liệu vào object
        statusResult.forEach(row => {
            const count = parseInt(row.count);
            wordStats.total_learned += count; // Tổng số từ đã từng đụng vào
            
            if (row.status === 'LEARNING') wordStats.learning = count;
            if (row.status === 'REVIEWING') wordStats.reviewing = count;
            if (row.status === 'MASTERED') wordStats.mastered = count;
        });
        // --- BẮT ĐẦU: THUẬT TOÁN TÍNH STREAK (CHUỖI NGÀY HỌC) ---
        // Lấy danh sách các ngày học (chỉ lấy phần Ngày, bỏ phần Giờ/Phút) sắp xếp từ gần nhất đến xa nhất
        const [datesResult] = await db.query(
            `SELECT DISTINCT DATE(last_reviewed_at) as study_date 
             FROM UserProgress 
             WHERE user_id = ? AND last_reviewed_at IS NOT NULL
             ORDER BY study_date DESC`,
            [userId]
        );

        let currentStreak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Đưa mốc thời gian về 00:00:00 của ngày hôm nay

        let expectedDate = new Date(today);
        let isFirstRow = true;

        for (let row of datesResult) {
            const studyDate = new Date(row.study_date);
            studyDate.setHours(0, 0, 0, 0);

            if (isFirstRow) {
                // Kiểm tra dòng đầu tiên (ngày học gần nhất)
                if (studyDate.getTime() === today.getTime()) {
                    // Có học hôm nay
                    currentStreak++;
                    expectedDate.setDate(today.getDate() - 1); // Tiếp theo phải check hôm qua
                } else if (studyDate.getTime() === today.getTime() - 86400000) {
                    // Không học hôm nay, nhưng hôm qua có học (chuỗi chưa bị đứt)
                    currentStreak++;
                    expectedDate.setDate(today.getDate() - 2); // Tiếp theo phải check hôm kia
                } else {
                    // Bỏ học quá 1 ngày -> Chuỗi đứt, dừng luôn
                    break; 
                }
                isFirstRow = false;
            } else {
                // Các dòng tiếp theo cứ lùi lùi dần về quá khứ
                if (studyDate.getTime() === expectedDate.getTime()) {
                    currentStreak++;
                    expectedDate.setDate(expectedDate.getDate() - 1);
                } else {
                    break; // Sai lệch ngày -> Đứt chuỗi
                }
            }
        }

        // 3. LOGIC TỰ ĐỘNG TÍNH THÀNH TÍCH (ACHIEVEMENTS) TRÊN RAM
        // Định nghĩa các mốc danh hiệu mà không cần lưu vào Database
        const achievements = [];

        // Hệ thống danh hiệu dựa trên điểm kinh nghiệm (XP)
        if (xp >= 10) {
            achievements.push({
                title: "Khởi Đầu Nan",
                description: "Ghi được những điểm số kinh nghiệm đầu tiên",
                unlocked: true
            });
        }
        if (xp >= 100) {
            achievements.push({
                title: "Chiến Binh Chăm Chỉ",
                description: "Tích lũy đạt cột mốc 100 XP",
                unlocked: true
            });
        }
        if (xp >= 500) {
            achievements.push({
                title: "Thần Đèn Từ Vựng",
                description: "Cán mốc đại cao thủ với 500 XP",
                unlocked: true
            });
        }

        // Hệ thống danh hiệu dựa trên số từ đã học thuộc làu (MASTERED)
        if (wordStats.mastered >= 1) {
            achievements.push({
                title: "Vạn Sự Khởi Đầu",
                description: "Học thuộc làu hoàn toàn 1 từ vựng",
                unlocked: true
            });
        }
        if (wordStats.mastered >= 10) {
            achievements.push({
                title: "Bộ Óc Siêu Phàm",
                description: "Học thuộc làu hoàn toàn 10 từ vựng",
                unlocked: true
            });
        }

        // 4. Trả toàn bộ cục dữ liệu tổng hợp về cho Client
        res.status(200).json({
            user: {
                full_name: full_name,
                current_xp: xp
            },
            learning_progress: {
                ...wordStats,
                current_streak: currentStreak // <--- THÊM DÒNG NÀY VÀO ĐÂY
            },
            achievements: achievements,
            total_achievements_unlocked: achievements.length
        });

    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

module.exports = { getLearningStats };