const jwt=require("jsonwebtoken")

// Middleware kiểm tra user đã đăng nhập
const verifyToken=(req,res,next)=>{
    // Lấy token từ header
    const authHeader=req.header('Authorization')
    const token=authHeader&&authHeader.split(' ')[1]

    if(!token){
        return res.status(401).json({ message: 'Không tìm thấy Token. Vui lòng đăng nhập!' });
    }
    try {
        //giải mã token
        const decoded=jwt.verify(token,process.env.JWT_SECRET)
        req.user=decoded;
        next();
    }catch(error){
        return res.status(403).json({ message: 'Token không hợp lệ hoặc đã hết hạn!' });
    }
};

//Middlewares kiểm tra quyền admin
const verifyAdmin=(req,res,next)=>{
    verifyToken(req,res,()=>{
        if (req.user.role==='ADMIN'){
            next();
        }
        else{
            res.status(403).json({ message: 'Bạn không có quyền thực hiện hành động này!' });
        }
    });
};

module.exports={verifyToken,verifyAdmin}