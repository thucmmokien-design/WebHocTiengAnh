const db = require('../config/db');

// Hàm xáo trộn mảng (Thuật toán Fisher-Yates chuẩn xác nhất)
const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

// [GET] /api/practice/quiz/:setId - Lấy bài tập trắc nghiệm
const getMultipleChoice = async (req, res) => {
    try {
        const { setId } = req.params;

        // 1. Lấy toàn bộ từ vựng của bộ từ này lên RAM (Chỉ tốn 1 lần gọi DB)
        const [words] = await db.query(
            'SELECT id, english_word, meaning FROM Words WHERE set_id = ?',
            [setId]
        );

        // Phải có tối thiểu 4 từ mới đủ làm 4 đáp án (A, B, C, D)
        if (words.length < 4) {
            return res.status(400).json({ 
                message: 'Bộ từ vựng này quá ngắn. Cần ít nhất 4 từ để tạo bài trắc nghiệm!' 
            });
        }

        // 2. Thuật toán nhào nặn dữ liệu tạo câu hỏi
        const quiz = words.map(currentWord => {
            // Bước A: Lọc ra tất cả các từ KHÁC với từ hiện tại để làm mồi nhử (đáp án sai)
            const otherWords = words.filter(w => w.id !== currentWord.id);

            // Bước B: Trộn ngẫu nhiên đống từ sai đó và bốc ra đúng 3 từ đầu tiên
            const shuffledOthers = shuffleArray(otherWords);
            const threeWrongAnswers = shuffledOthers.slice(0, 3);

            // Bước C: Gom 1 đáp án ĐÚNG và 3 đáp án SAI lại thành 4 lựa chọn
            const options = [
                { id: currentWord.id, meaning: currentWord.meaning, is_correct: true },
                ...threeWrongAnswers.map(w => ({ id: w.id, meaning: w.meaning, is_correct: false }))
            ];

            // Bước D: Trộn 4 lựa chọn này lên để đáp án đúng không phải lúc nào cũng nằm ở vị trí A
            return {
                question_word: currentWord.english_word,
                options: shuffleArray(options)
            };
        });

        // 3. Trộn luôn cả thứ tự các câu hỏi trước khi trả về
        res.status(200).json({ 
            total_questions: quiz.length,
            data: shuffleArray(quiz) 
        });

    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// [POST] /api/practice/submit - Nộp kết quả trắc nghiệm và nhận thưởng
const submitQuiz = async (req, res) => {
    try {
        const userId = req.user.id;
        const { setId, correct_answers, total_questions } = req.body;

        // 1. Validate dữ liệu cơ bản
        if (correct_answers === undefined || !total_questions) {
            return res.status(400).json({ message: 'Thiếu thông tin kết quả bài thi!' });
        }

        // 2. Thuật toán quy đổi điểm: 1 câu trả lời đúng = 5 XP
        const earnedXp = correct_answers * 5;

        // 3. Cập nhật XP mới vào bảng Users (Nếu có điểm mới cộng để tối ưu DB)
        if (earnedXp > 0) {
            await db.query(
                'UPDATE Users SET xp = xp + ? WHERE id = ?', 
                [earnedXp, userId]
            );
        }

        // 4. Lấy lại tổng XP hiện tại của User để trả về cho Frontend hiển thị thanh Level
        const [users] = await db.query('SELECT xp FROM Users WHERE id = ?', [userId]);
        const currentXp = users[0].xp;

        // 5. Trả kết quả vinh danh
        res.status(200).json({ 
            message: 'Nộp bài thành công!',
            result: {
                correct: correct_answers,
                total: total_questions,
                accuracy: Math.round((correct_answers / total_questions) * 100) + '%'
            },
            rewards: {
                earned_xp: earnedXp,
                current_total_xp: currentXp
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// NHỚ XUẤT THÊM HÀM NÀY Ở CUỐI FILE
module.exports = { getMultipleChoice, submitQuiz };