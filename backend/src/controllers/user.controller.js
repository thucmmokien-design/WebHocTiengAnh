const db = require('../config/db');
const bcrypt = require('bcrypt');

// [GET] /api/users/profile
const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        // Lấy thông tin user từ DB
        const [users] = await db.query(
            'SELECT id, email, full_name, avatar_url, role, created_at FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'Người dùng không tồn tại!' });
        }

        res.status(200).json({
            message: 'Lấy thông tin thành công',
            user: users[0]
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// [PUT] /api/users/profile
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { full_name, avatar_url } = req.body;

        // Validate
        if (!full_name || full_name.trim() === '') {
            return res.status(400).json({ message: 'Tên không được để trống!' });
        }

        // Lấy thông tin user hiện tại để giữ nguyên avatar_url nếu không có giá trị mới
        const [currentUser] = await db.query(
            'SELECT avatar_url FROM users WHERE id = ?',
            [userId]
        );

        // Giữ nguyên avatar_url cũ nếu không có avatar_url mới được gửi lên
        const finalAvatarUrl = avatar_url !== undefined ? avatar_url : currentUser[0].avatar_url;

        // Cập nhật vào DB
        await db.query(
            'UPDATE users SET full_name = ?, avatar_url = ? WHERE id = ?',
            [full_name.trim(), finalAvatarUrl, userId]
        );

        // Lấy thông tin mới
        const [users] = await db.query(
            'SELECT id, email, full_name, avatar_url, role FROM users WHERE id = ?',
            [userId]
        );

        res.status(200).json({
            message: 'Cập nhật thông tin thành công!',
            user: users[0]
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// [PUT] /api/users/change-password
const changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { old_password, new_password } = req.body;

        // 1. Lấy thông tin user từ DB
        const [users] = await db.query('SELECT password_hash FROM users WHERE id = ?', [userId]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'Người dùng không tồn tại!' });
        }

        // 2. Kiểm tra mật khẩu cũ có khớp không
        const isMatch = await bcrypt.compare(old_password, users[0].password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Mật khẩu hiện tại không đúng!' });
        }

        // 3. Mã hóa mật khẩu mới
        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(new_password, salt);

        // 4. Cập nhật vào DB
        await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [hashedNewPassword, userId]);

        res.status(200).json({ message: 'Đổi mật khẩu thành công!' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// [PUT] /api/users/change-email
const changeEmail = async (req, res) => {
    try {
        const userId = req.user.id;
        const { new_email, password } = req.body;

        // 1. Kiểm tra định dạng email cơ bản (Tùy chọn)
        if (!new_email || !new_email.includes('@')) {
            return res.status(400).json({ message: 'Email không hợp lệ!' });
        }

        // 2. Lấy thông tin user để xác thực mật khẩu
        const [users] = await db.query('SELECT password_hash FROM users WHERE id = ?', [userId]);
        const isMatch = await bcrypt.compare(password, users[0].password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Mật khẩu xác nhận không đúng!' });
        }

        // 3. Kiểm tra xem email mới đã có ai dùng chưa
        const [existingEmails] = await db.query('SELECT id FROM users WHERE email = ?', [new_email]);
        if (existingEmails.length > 0) {
            return res.status(400).json({ message: 'Email này đã được sử dụng bởi tài khoản khác!' });
        }

        // 4. Cập nhật email mới vào DB
        await db.query('UPDATE Users SET email = ? WHERE id = ?', [new_email, userId]);

        res.status(200).json({ message: 'Đổi email thành công!' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// [POST] /api/users/upload-avatar
const uploadAvatar = async (req, res) => {
    try {
        const userId = req.user.id;

        // Kiểm tra xem có file được upload không
        if (!req.file) {
            return res.status(400).json({ message: 'Vui lòng chọn file ảnh!' });
        }

        // Tạo URL cho avatar (relative path)
        const avatarUrl = `/uploads/avatars/${req.file.filename}`;

        // Cập nhật avatar_url vào database
        await db.query(
            'UPDATE users SET avatar_url = ? WHERE id = ?',
            [avatarUrl, userId]
        );

        // Lấy thông tin user mới
        const [users] = await db.query(
            'SELECT id, email, full_name, avatar_url, role FROM users WHERE id = ?',
            [userId]
        );

        res.status(200).json({
            message: 'Upload avatar thành công!',
            user: users[0]
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

module.exports = { 
    getProfile,
    updateProfile,
    changePassword, 
    changeEmail,
    uploadAvatar
};