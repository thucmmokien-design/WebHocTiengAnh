const db = require('../config/db');

// Danh sách thành tích được định nghĩa sẵn
const ACHIEVEMENTS_CONFIG = [
    // Mốc từ vựng (theo tổng số từ)
    { name: 'Học Thuộc 20 Từ Vựng', description: 'Bước khởi đầu trên hành trình học từ vựng', type: 'total', threshold: 20, badge_image: '/uploads/huyhieu/20tuvung.png' },
    { name: 'Học Thuộc 50 Từ Vựng', description: 'Đạt cột mốc 50 từ vựng đầu tiên', type: 'total', threshold: 50, badge_image: '/uploads/huyhieu/50tuvung.png' },
    { name: 'Học Thuộc 75 Từ Vựng', description: 'Chinh phục 75 từ vựng đầu tiên', type: 'total', threshold: 75, badge_image: '/uploads/huyhieu/75tuvung.png' },
    { name: 'Học Thuộc 100 Từ Vựng', description: 'Cán mốc 100 từ vựng', type: 'total', threshold: 100, badge_image: '/uploads/huyhieu/100tuvung.png' },
    // Huy hiệu chủ đề (theo set_id cụ thể)
    // set_id: 1 = Chuyên ngành CNTT, 2 = Giáo dục học thuật, 3 = Môi trường Xã hội, 4 = Thể thao và Chiến thuật, 5 = Giao tiếp thông dụng
    { name: 'Chuyên Gia CNTT', description: 'Hoàn thành chủ đề Công nghệ thông tin', type: 'set', set_id: 1, badge_image: '/uploads/huyhieu/CNTT.png' },
    { name: 'Học Giả Anh Ngữ', description: 'Hoàn thành chủ đề Giáo dục học thuật', type: 'set', set_id: 2, badge_image: '/uploads/huyhieu/GDHT.png' },
    { name: 'Hiểu Biết Xã Hội', description: 'Hoàn thành chủ đề Môi trường & Xã hội', type: 'set', set_id: 3, badge_image: '/uploads/huyhieu/MTXH.png' },
    { name: 'Kiện Tướng Chiến Thuật', description: 'Hoàn thành chủ đề Thể thao & Chiến thuật', type: 'set', set_id: 4, badge_image: '/uploads/huyhieu/TTCT.png' },
    { name: 'Bậc Thầy Giao Tiếp', description: 'Hoàn thành chủ đề Giao tiếp thông dụng', type: 'set', set_id: 5, badge_image: '/uploads/huyhieu/GTTD.png' }
];

// [GET] /api/achievements - Lấy danh sách thành tích của user
const getUserAchievements = async (req, res) => {
    try {
        const userId = req.user.id;

        // Lấy danh sách thành tích đã mở khóa
        const [unlockedAchievements] = await db.query(`
            SELECT 
                achievement_name,
                description,
                unlocked_at
            FROM achievements
            WHERE user_id = ?
            ORDER BY unlocked_at DESC
        `, [userId]);

        // Đếm số từ đã học (chỉ tính REVIEWING và MASTERED, không tính LEARNING)
        const [wordsLearned] = await db.query(`
            SELECT COUNT(*) as total
            FROM userprogress
            WHERE user_id = ? AND status IN ('REVIEWING', 'MASTERED')
        `, [userId]);

        const totalWordsLearned = wordsLearned[0].total;

        // Lấy tiến độ theo từng bộ từ vựng (chỉ tính REVIEWING và MASTERED)
        const [setProgress] = await db.query(`
            SELECT 
                vs.id as set_id,
                vs.title,
                COUNT(CASE WHEN up.status IN ('REVIEWING', 'MASTERED') THEN 1 END) as learned,
                COUNT(w.id) as total
            FROM vocabularysets vs
            LEFT JOIN words w ON vs.id = w.set_id
            LEFT JOIN userprogress up ON w.id = up.word_id AND up.user_id = ?
            WHERE vs.is_active = TRUE
            GROUP BY vs.id, vs.title
        `, [userId]);

        // Tạo danh sách tất cả thành tích với trạng thái
        const allAchievements = ACHIEVEMENTS_CONFIG.map(achievement => {
            const unlocked = unlockedAchievements.find(ua => ua.achievement_name === achievement.name);
            
            let progress = 0;
            let threshold = 0;
            
            if (achievement.type === 'total') {
                // Thành tích theo tổng số từ
                progress = totalWordsLearned;
                threshold = achievement.threshold;
            } else if (achievement.type === 'set') {
                // Thành tích theo bộ từ vựng cụ thể (dùng set_id)
                const setData = setProgress.find(s => s.set_id === achievement.set_id);
                if (setData) {
                    progress = setData.learned;
                    threshold = setData.total;
                }
            }
            
            return {
                name: achievement.name,
                description: achievement.description,
                threshold: threshold,
                badge_image: achievement.badge_image,
                unlocked: !!unlocked,
                unlocked_at: unlocked ? unlocked.unlocked_at : null,
                progress: progress,
                progress_percentage: threshold > 0 ? Math.min(Math.round((progress / threshold) * 100), 100) : 0
            };
        });

        res.status(200).json({
            total_words_learned: totalWordsLearned,
            achievements: allAchievements
        });

    } catch (error) {
        console.error('Error getting achievements:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// [POST] /api/achievements/check - Kiểm tra và trao thành tích mới
const checkAndUnlockAchievements = async (req, res) => {
    try {
        const userId = req.user.id;

        // Đếm số từ đã học (chỉ tính REVIEWING và MASTERED, không tính LEARNING)
        const [wordsLearned] = await db.query(`
            SELECT COUNT(*) as total
            FROM userprogress
            WHERE user_id = ? AND status IN ('REVIEWING', 'MASTERED')
        `, [userId]);

        const totalWordsLearned = wordsLearned[0].total;

        // Lấy tiến độ theo từng bộ từ vựng (chỉ tính REVIEWING và MASTERED)
        const [setProgress] = await db.query(`
            SELECT 
                vs.id as set_id,
                vs.title,
                COUNT(CASE WHEN up.status IN ('REVIEWING', 'MASTERED') THEN 1 END) as learned,
                COUNT(w.id) as total
            FROM vocabularysets vs
            LEFT JOIN words w ON vs.id = w.set_id
            LEFT JOIN userprogress up ON w.id = up.word_id AND up.user_id = ?
            WHERE vs.is_active = TRUE
            GROUP BY vs.id, vs.title
        `, [userId]);

        console.log('📊 Set Progress:', setProgress); // Debug: Xem tiến độ các bộ từ

        // Lấy danh sách thành tích đã mở khóa
        const [unlockedAchievements] = await db.query(`
            SELECT achievement_name
            FROM achievements
            WHERE user_id = ?
        `, [userId]);

        const unlockedNames = unlockedAchievements.map(a => a.achievement_name);
        const newAchievements = [];

        // Kiểm tra từng thành tích
        for (const achievement of ACHIEVEMENTS_CONFIG) {
            if (unlockedNames.includes(achievement.name)) {
                continue; // Đã mở khóa rồi, bỏ qua
            }

            let shouldUnlock = false;

            if (achievement.type === 'total') {
                // Thành tích theo tổng số từ
                if (totalWordsLearned >= achievement.threshold) {
                    shouldUnlock = true;
                }
            } else if (achievement.type === 'set') {
                // Thành tích theo bộ từ vựng cụ thể (dùng set_id)
                const setData = setProgress.find(s => s.set_id === achievement.set_id);
                console.log(`🔍 Checking ${achievement.name}: set_id=${achievement.set_id}, found:`, setData);
                
                if (setData && setData.learned >= setData.total && setData.total > 0) {
                    shouldUnlock = true; // Đã học hết tất cả từ trong bộ
                }
            }

            if (shouldUnlock) {
                // Insert thành tích mới
                await db.query(`
                    INSERT INTO achievements (user_id, achievement_name, description, unlocked_at)
                    VALUES (?, ?, ?, NOW())
                `, [userId, achievement.name, achievement.description]);

                newAchievements.push({
                    name: achievement.name,
                    description: achievement.description,
                    badge_image: achievement.badge_image
                });
            }
        }

        res.status(200).json({
            message: newAchievements.length > 0 ? 'Chúc mừng! Bạn đã mở khóa thành tích mới!' : 'Chưa có thành tích mới',
            total_words_learned: totalWordsLearned,
            new_achievements: newAchievements,
            debug_set_progress: setProgress // Trả về để debug
        });

    } catch (error) {
        console.error('Error checking achievements:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

module.exports = {
    getUserAchievements,
    checkAndUnlockAchievements
};
