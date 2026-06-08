# 🔧 Hướng Dẫn Cập Nhật Thành Tích

## Vấn Đề Đã Được Sửa

Code backend đã được cập nhật để:
1. Đếm từ đã học đúng (LEARNING + REVIEWING + MASTERED)
2. Sửa mapping set_id cho các thành tích theo chủ đề

## Cách Chạy Script Cập Nhật

### Option 1: Chạy Script Tự Động (Khuyến Nghị)

Script sẽ tự động kiểm tra và mở khóa thành tích cho tất cả user trong database.

```bash
cd backend
node update-achievements.js
```

**Kết quả mẫu:**
```
🚀 Bắt đầu cập nhật thành tích cho tất cả user...

📋 Tìm thấy 1 user(s)

👤 Đang xử lý: Test (test123@gmail.com)
   📚 Tổng từ đã học: 19
   ℹ️  Không có thành tích mới

✅ Hoàn thành cập nhật thành tích cho tất cả user!
```

### Option 2: Gọi API Từ Frontend

Khi user truy cập trang "Thành Tích", code frontend tự động gọi:
```javascript
POST /api/achievements/check
```

API này sẽ kiểm tra và tự động mở khóa thành tích mới.

### Option 3: Test Bằng Test HTML

1. Mở file `test-achievement-api.html` trong browser
2. Click "Load Token"
3. Click "POST /api/achievements/check"

## Kiểm Tra Kết Quả

### 1. Xem Trên Frontend
- Truy cập trang "Thành Tích" (menu 🏆)
- Xem số từ đã học
- Xem các thành tích đã mở khóa và progress

### 2. Xem Trong Database
```sql
-- Xem thành tích của user
SELECT * FROM achievements WHERE user_id = 18;

-- Xem tổng số từ đã học
SELECT 
    status, 
    COUNT(*) as count
FROM userprogress 
WHERE user_id = 18 
GROUP BY status;
```

## Restart Backend

Sau khi sửa code, hãy restart backend:

```bash
# Dừng backend (Ctrl+C)
# Chạy lại
cd backend
npm start
```

## Troubleshooting

### Không thấy thành tích sau khi chạy script?
1. Check backend có chạy không: `http://localhost:3000`
2. Refresh lại trang Progress
3. Check console browser (F12) xem có lỗi gì không

### Token hết hạn?
1. Logout và login lại
2. Token mới sẽ được tạo

### Database connection error?
1. Check MySQL có chạy không
2. Check file `.env` có đúng thông tin database không

## Notes

- Script `update-achievements.js` an toàn để chạy nhiều lần
- Nó sẽ bỏ qua các thành tích đã unlock rồi
- Chỉ unlock các thành tích mới đủ điều kiện
