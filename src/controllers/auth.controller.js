const db=require('../config/db');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');

//post /api/auth/register

const register=async (req, res)=>{
    try{
        const {email,password,full_name}=req.body;

        // check email
        const [existingUsers]=await db.query('SELECT * FROM Users WHERE email = ?', [email]);
        if (existingUsers.length>0){
            return res.status(400).json({ message: 'Email này đã được sử dụng!' });
        }
        // mã hoá sản phẩm
        const salt=await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(password,salt)

        // lưu db
        await db.query(
            'INSERT INTO Users (email,password_hash,full_name) VALUES (?,?,?)',
            [email,hashedPassword,full_name]
        );
        res.status(201).json({ message: 'Đăng ký tài khoản thành công!' });

        
    }catch(error){
        res.status(500).json({message:'Lỗi server',error:error.message});
    }
};

// post api đăng nhập
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Tìm user theo email
        const [users] = await db.query('SELECT * FROM Users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng!' });
        }

        const user = users[0];

        // 2. So sánh mật khẩu người dùng nhập với mật khẩu trong DB
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng!' });
        }

        // 3. Tạo JWT Token (thẻ thông hành)
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET, 
        );

        // 4. Trả kết quả về cho người dùng
        res.status(200).json({
            message: 'Đăng nhập thành công!',
            token: token,
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

module.exports = { register, login };
