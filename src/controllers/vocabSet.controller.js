const db=require('../config/db');

// post tạo bộ từ vựng
const createSet=async(req,res)=>{
    try {
        const {title,description,is_public}=req.body;
        // lấy token đã được giải mã
        const created_by=req.user.id;
        const [results]=await db.query(
            'INSERT INTO VocabularySets (title, description, created_by, is_public) VALUES (?, ?, ?, ?)',
            [title, description, created_by, is_public || false]
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
        // chỉ lấy bộ từ vựng đang active
        const [sets]=await db.query(`
            SELECT id, title, description, created_by, is_public, created_at 
            FROM VocabularySets 
            WHERE is_active = TRUE 
            AND (is_public = TRUE OR created_by = ?)
            ORDER BY created_at DESC
        `, [req.user.id]);
        res.status(200).json({ data: sets });

    }catch(error){
        res.results(500).json({message:'Lỗi server',error:error.message});
    }
};

// [PUT] /api/vocab-sets/:id - Sửa thông tin bộ từ vựng
const updateSet = async (req, res) => {
    try {
        const setId = req.params.id;
        const { title, description, is_public } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role;

        // 1. Tìm xem bộ từ này có tồn tại không
        const [sets] = await db.query('SELECT created_by FROM VocabularySets WHERE id = ?', [setId]);
        if (sets.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy bộ từ vựng!' });
        }

        // 2. Kiểm tra quyền lực (Bắt buộc là ADMIN hoặc là "chủ nhân" của bộ từ)
        if (userRole !== 'ADMIN' && sets[0].created_by !== userId) {
            return res.status(403).json({ message: 'Bạn không có quyền sửa bộ từ này!' });
        }

        // 3. Thực hiện cập nhật
        await db.query(
            'UPDATE VocabularySets SET title = ?, description = ?, is_public = ? WHERE id = ?',
            [title, description, is_public || false, setId]
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

        const [sets] = await db.query('SELECT created_by FROM VocabularySets WHERE id = ?', [setId]);
        if (sets.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy bộ từ vựng!' });
        }

        if (userRole !== 'ADMIN' && sets[0].created_by !== userId) {
            return res.status(403).json({ message: 'Bạn không có quyền xóa bộ từ này!' });
        }

        // Xóa bộ từ. 
        // (Nếu cấu trúc DB chuẩn, xóa bộ từ thì các từ vựng bên trong bảng Words cũng sẽ tự động bay màu theo nhờ khóa ngoại ON DELETE CASCADE)
        await db.query('DELETE FROM VocabularySets WHERE id = ?', [setId]);

        res.status(200).json({ message: 'Đã xóa bộ từ vựng ra khỏi hệ thống!' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// NHỚ CẬP NHẬT LẠI DÒNG EXPORT Ở CUỐI FILE NHÉ:
module.exports = { createSet, getSets, updateSet, deleteSet };