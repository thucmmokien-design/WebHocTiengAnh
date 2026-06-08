/**
 * Script để kiểm tra và cập nhật thành tích cho tất cả user
 * Chạy một lần để unlock thành tích cho những user đã đáp ứng điều kiện
 */

require('dotenv').config();
const db = require('./src/config/db');

const ACHIEVEMENTS_CONFIG = [
    { name: 'Học Thuộc 20 Từ Vựng', description: 'Bước khởi đầu trên hành trình học từ vựng', type: 'total', threshold: 20 },
    { name: 'Học Thuộc 50 Từ Vựng', description: 'Đạt cột mốc 50 từ vựng đầu tiên', type: 'total', threshold: 50 },
    { name: 'Học Thuộc 75 Từ Vựng', description: 'Chinh phục 75 từ vựng đầu tiên', type: 'total', threshold: 75 },
    { name: 'Học Thuộc 100 Từ Vựng', description: 'Cán mốc 100 từ vựng', type: 'total', threshold: 100 },
    { name: 'Chuyên Gia CNTT', description: 'Hoàn thành chủ đề Công nghệ thông tin', type: 'set', set_id: 1 },
    { name: 'Học Giả Anh Ngữ', description: 'Hoàn thành chủ đề Giáo dục học thuật', type: 'set', set_id: 2 },
    { name: 'Hiểu Biết Xã Hội', description: 'Hoàn thành chủ đề Môi trường & Xã hội', type: 'set', set_id: 3 },
    { name: 'Kiện Tướng Chiến Thuật', description: 'Hoàn thành chủ đề Thể thao & Chiến thuật', type: 'set', set_id: 4 },
    { name: 'Bậc Thầy Giao Tiếp', description: 'Hoàn thành chủ đề Giao tiếp thông dụng', type: 'set', set_id: 5 }
];

async function updateAchievementsForAllUsers() {
    try {
        console.log('🚀 Bắt đầu cập nhật thành tích cho tất cả user...\n');

        // Lấy danh sách tất cả user
        const [users] = await db.query('SELECT id, email, full_name FROM users');
        
        console.log(`📋 Tìm thấy ${users.length} user(s)\n`);

        for (const user of users) {
            console.log(`👤 Đang xử lý: ${user.full_name} (${user.email})`);
            
            const userId = user.id;

            // Đếm số từ đã học (chỉ tính REVIEWING và MASTERED)
            const [wordsLearned] = await db.query(`
                SELECT COUNT(*) as total
                FROM userprogress
                WHERE user_id = ? AND status IN ('REVIEWING', 'MASTERED')
            `, [userId]);

            const totalWordsLearned = wordsLearned[0].total;
            console.log(`   📚 Tổng từ đã học (REVIEWING + MASTERED): ${totalWordsLearned}`);

            // Lấy tiến độ theo từng set (chỉ tính REVIEWING và MASTERED)
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

            // Lấy danh sách thành tích đã unlock
            const [unlockedAchievements] = await db.query(`
                SELECT achievement_name FROM achievements WHERE user_id = ?
            `, [userId]);

            const unlockedNames = unlockedAchievements.map(a => a.achievement_name);
            let newAchievements = 0;

            // Kiểm tra từng thành tích
            for (const achievement of ACHIEVEMENTS_CONFIG) {
                if (unlockedNames.includes(achievement.name)) {
                    continue; // Đã unlock rồi
                }

                let shouldUnlock = false;

                if (achievement.type === 'total') {
                    if (totalWordsLearned >= achievement.threshold) {
                        shouldUnlock = true;
                    }
                } else if (achievement.type === 'set') {
                    const setData = setProgress.find(s => s.set_id === achievement.set_id);
                    if (setData && setData.learned >= setData.total && setData.total > 0) {
                        shouldUnlock = true;
                    }
                }

                if (shouldUnlock) {
                    await db.query(`
                        INSERT INTO achievements (user_id, achievement_name, description, unlocked_at)
                        VALUES (?, ?, ?, NOW())
                    `, [userId, achievement.name, achievement.description]);

                    console.log(`   🎉 Mở khóa: ${achievement.name}`);
                    newAchievements++;
                }
            }

            if (newAchievements === 0) {
                console.log(`   ℹ️  Không có thành tích mới`);
            } else {
                console.log(`   ✅ Đã mở khóa ${newAchievements} thành tích mới!`);
            }
            
            console.log('');
        }

        console.log('✅ Hoàn thành cập nhật thành tích cho tất cả user!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Lỗi:', error);
        process.exit(1);
    }
}

// Chạy script
updateAchievementsForAllUsers();
