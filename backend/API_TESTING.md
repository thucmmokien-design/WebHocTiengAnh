# API Testing Guide

## Progress API - Đếm số từ vựng đã học

### Endpoint: GET /api/progress/words-learned

**Mô tả:** Đếm tổng số từ vựng mà user đã học (có status khác 'NEW')

**Authentication:** Required (Bearer Token)

**Request:**
```http
GET http://localhost:3000/api/progress/words-learned
Authorization: Bearer YOUR_TOKEN_HERE
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "total_words_learned": 25,
    "learning": 10,
    "reviewing": 8,
    "mastered": 7
  },
  "message": "Bạn đã học được 25 từ vựng!"
}
```

**Response Error (500):**
```json
{
  "success": false,
  "message": "Lỗi khi đếm số từ đã học",
  "error": "Error details..."
}
```

---

## Cách test bằng các tool

### 1. **Postman / Thunder Client**
```
GET http://localhost:3000/api/progress/words-learned
Headers:
  Authorization: Bearer <your-token>
```

### 2. **cURL**
```bash
curl -X GET http://localhost:3000/api/progress/words-learned \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. **JavaScript (Frontend)**
```javascript
const token = localStorage.getItem('token');

const response = await fetch('http://localhost:3000/api/progress/words-learned', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);
```

### 4. **Sử dụng api.js helper**
```javascript
const token = auth.getToken();
const response = await api.get('/progress/words-learned', token);
console.log(response);
```

---

## Logic tính toán

**Công thức SQL:**
```sql
SELECT 
  COUNT(*) as total_words_learned,
  SUM(CASE WHEN status = 'LEARNING' THEN 1 ELSE 0 END) as learning,
  SUM(CASE WHEN status = 'REVIEWING' THEN 1 ELSE 0 END) as reviewing,
  SUM(CASE WHEN status = 'MASTERED' THEN 1 ELSE 0 END) as mastered
FROM userprogress
WHERE user_id = ? AND status != 'NEW'
```

**Giải thích:**
- `total_words_learned`: Tổng số từ có status khác 'NEW'
- `learning`: Số từ đang học (status = 'LEARNING')
- `reviewing`: Số từ đang ôn tập (status = 'REVIEWING')  
- `mastered`: Số từ đã thuộc lòng (status = 'MASTERED')

---

## Tích hợp vào trang chủ

Đã được tích hợp sẵn trong `home.js`:

```javascript
async function loadStats(token) {
    const response = await api.get('/progress/words-learned', token);
    
    if (response && response.data) {
        document.getElementById('totalWords').textContent = 
            response.data.total_words_learned;
    }
}
```

---

## Các trạng thái trong userprogress

| Status | Ý nghĩa | Tính vào tổng |
|--------|---------|---------------|
| NEW | Chưa học | ❌ Không |
| LEARNING | Đang học | ✅ Có |
| REVIEWING | Đang ôn tập | ✅ Có |
| MASTERED | Đã thuộc lòng | ✅ Có |
