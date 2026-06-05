const db=require('../config/db');

// post tạo bộ từ vựng
const createSet=async(req,res)=>{
    try {
        const {title,description,avatar_url}=req.body;
        // lấy token đã được giải mã
        const created_by=req.user.id;
        const [results]=await db.query(
            'INSERT INTO vocabularysets (title, description, created_by , avatar_url) VALUES (?, ?, ?, ?)',
            [title, description, created_by, avatar_url || false]
        );
        res.status(201).json({
            message: 'Tạo bộ từ vựng thành công',
            setId:results.insertId

        });

    }catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// get lấy bộ từ vựng
const getSets=async(req,res)=>{
    try{
        // Lấy bộ từ vựng và đếm số từ trong mỗi bộ
        const [sets]=await db.query(`
            SELECT 
                vs.id, 
                vs.title, 
                vs.description, 
                vs.created_by, 
                vs.is_public, 
                vs.created_at,
                vs.avatar_url,
                COUNT(w.id) as word_count
            FROM vocabularysets vs
            LEFT JOIN words w ON vs.id = w.set_id
            WHERE vs.is_active = TRUE 
            AND (vs.is_public = TRUE OR vs.created_by = ?)
            GROUP BY vs.id, vs.title, vs.description, vs.created_by, vs.is_public, vs.created_at, vs.avatar_url
            ORDER BY vs.created_at DESC
        `, [req.user.id]);
        
        res.status(200).json({ data: sets });

    }catch(error){
        res.status(500).json({message:'Lỗi server',error:error.message});
    }
};

// [PUT] /api/vocab-sets/:id - Sửa thông tin bộ từ vựng
const updateSet = async (req, res) => {
    try {
        const setId = req.params.id;
        const { title, description, avatar_url } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role;

        // 1. Tìm xem bộ từ này có tồn tại không
        const [sets] = await db.query('SELECT created_by FROM vocabularysets WHERE id = ?', [setId]);
        if (sets.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy bộ từ vựng!' });
        }

        // 2. Kiểm tra quyền lực (Bắt buộc là ADMIN hoặc là "chủ nhân" của bộ từ)
        if (userRole !== 'ADMIN' && sets[0].created_by !== userId) {
            return res.status(403).json({ message: 'Bạn không có quyền sửa bộ từ này!' });
        }

        // 3. Thực hiện cập nhật (bao gồm cả avatar_url nếu có)
        await db.query(
            'UPDATE vocabularysets SET title = ?, description = ?, avatar_url = ? WHERE id = ?',
            [title, description, avatar_url || null, setId]
        );

        res.status(200).json({ message: 'Cập nhật thông tin bộ từ vựng thành công!' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// [DELETE] /api/vocab-sets/:id - Xóa bộ từ vựng
const deleteSet = async (req, res) => {
    try {
        const setId = req.params.id;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Lấy thông tin bộ từ vựng
        const [sets] = await db.query('SELECT created_by, is_public FROM vocabularysets WHERE id = ?', [setId]);
        if (sets.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy bộ từ vựng!' });
        }

        const vocabSet = sets[0];

        // Kiểm tra quyền sở hữu
        if (userRole !== 'ADMIN' && vocabSet.created_by !== userId) {
            return res.status(403).json({ message: 'Bạn không có quyền xóa bộ từ này!' });
        }

        // Kiểm tra is_public - CHỈ cho phép xóa nếu is_public = FALSE (0)
        if (vocabSet.is_public === 1 || vocabSet.is_public === true) {
            return res.status(403).json({ 
                message: 'Không thể xóa bộ từ vựng công khai! Vui lòng chuyển sang chế độ riêng tư trước khi xóa.' 
            });
        }

        // Xóa bộ từ
        await db.query('DELETE FROM vocabularysets WHERE id = ?', [setId]);

        res.status(200).json({ message: 'Đã xóa bộ từ vựng ra khỏi hệ thống!' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// [POST] /api/vocab_set/upload-avatar - Upload avatar cho vocab set
const uploadAvatar = async (req, res) => {
    try {
        // Kiểm tra xem có file được upload không
        if (!req.file) {
            return res.status(400).json({ message: 'Vui lòng chọn file ảnh!' });
        }

        // Tạo URL cho avatar (relative path) - LƯU Ý: lưu vào /uploads/avatarsvacab/
        const avatarUrl = `/uploads/avatarsvacab/${req.file.filename}`;

        // CHỈ trả về URL, KHÔNG cập nhật database
        // Avatar sẽ được lưu vào vocabularysets table khi tạo vocab set
        res.status(200).json({
            message: 'Upload avatar thành công!',
            avatar_url: avatarUrl
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// NHỚ CẬP NHẬT LẠI DÒNG EXPORT Ở CUỐI FILE NHÉ:
module.exports = { createSet, getSets, updateSet, deleteSet, uploadAvatar };