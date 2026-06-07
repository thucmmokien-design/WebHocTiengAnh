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


---

## Progress API - Lấy danh sách từ cần ôn tập

### Endpoint: GET /api/progress/review-words

**Mô tả:** Lấy tất cả các từ vựng cần ôn tập (đã học nhưng chưa thuộc lòng - status khác NEW và MASTERED)

**Authentication:** Required (Bearer Token)

**Request:**
```http
GET http://localhost:3000/api/progress/review-words
Authorization: Bearer YOUR_TOKEN_HERE
```

**Response Success (200):**
```json
{
  "total": 15,
  "message": "Lấy danh sách từ cần ôn tập thành công",
  "data": [
    {
      "word_id": 123,
      "english_word": "algorithm",
      "meaning": "thuật toán",
      "pronunciation": "/ˈælɡərɪðəm/",
      "example_sentence": "This algorithm is very efficient.",
      "status": "LEARNING",
      "memory_level": 2,
      "last_reviewed_at": "2026-06-05T10:30:00.000Z",
      "next_review_date": "2026-06-09T00:00:00.000Z",
      "set_name": "Công nghệ thông tin",
      "set_id": 5,
      "set_image": "/uploads/avatarsvacab/anhcntt.jpg"
    },
    {
      "word_id": 145,
      "english_word": "database",
      "meaning": "cơ sở dữ liệu",
      "pronunciation": "/ˈdeɪtəbeɪs/",
      "example_sentence": "The database stores user information.",
      "status": "REVIEWING",
      "memory_level": 3,
      "last_reviewed_at": "2026-06-04T15:20:00.000Z",
      "next_review_date": "2026-06-10T00:00:00.000Z",
      "set_name": "Công nghệ thông tin",
      "set_id": 5,
      "set_image": "/uploads/avatarsvacab/anhcntt.jpg"
    }
  ]
}
```

**Response Error (500):**
```json
{
  "message": "Lỗi server",
  "error": "Error details..."
}
```

---

## Cách sử dụng API Review Words

### 1. **Postman / Thunder Client**
```
GET http://localhost:3000/api/progress/review-words
Headers:
  Authorization: Bearer <your-token>
```

### 2. **cURL**
```bash
curl -X GET http://localhost:3000/api/progress/review-words \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. **JavaScript (Frontend)**
```javascript
const token = localStorage.getItem('token');

async function loadReviewWords() {
  try {
    const response = await fetch('http://localhost:3000/api/progress/review-words', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();
    console.log(`Có ${result.total} từ cần ôn tập:`, result.data);
    
    // Hiển thị danh sách từ cần ôn tập
    displayReviewWords(result.data);
  } catch (error) {
    console.error('Lỗi:', error);
  }
}
```

### 4. **Sử dụng api.js helper**
```javascript
const token = auth.getToken();
const response = await api.get('/progress/review-words', token);

if (response && response.data) {
  console.log(`Bạn có ${response.total} từ cần ôn tập`);
  response.data.forEach(word => {
    console.log(`${word.english_word} - ${word.meaning} (${word.status})`);
  });
}
```

---

## Logic tính toán Review Words

**Công thức SQL:**
```sql
SELECT 
    w.id as word_id, 
    w.english_word, 
    w.meaning, 
    w.pronunciation, 
    w.example_sentence,
    up.status,
    up.memory_level,
    up.last_reviewed_at,
    up.next_review_date,
    vs.name as set_name,
    vs.id as set_id,
    vs.image_url as set_image
FROM userprogress up
INNER JOIN words w ON up.word_id = w.id
INNER JOIN vocabsets vs ON w.set_id = vs.id
WHERE up.user_id = ? 
    AND up.status != 'NEW' 
    AND up.status != 'MASTERED'
ORDER BY up.next_review_date ASC, up.last_reviewed_at DESC
```

**Giải thích:**
- Lấy các từ có `status != 'NEW'` (đã học) và `status != 'MASTERED'` (chưa thuộc lòng)
- Bao gồm status `LEARNING` và `REVIEWING`
- Sắp xếp theo `next_review_date` (từ cần ôn sớm nhất hiển thị trước)
- Kèm theo thông tin bộ từ vựng (set_name, set_id, set_image)

---

## Các trạng thái được lấy

| Status | Ý nghĩa | Được lấy trong API |
|--------|---------|-------------------|
| NEW | Chưa học | ❌ Không |
| LEARNING | Đang học | ✅ Có |
| REVIEWING | Đang ôn tập | ✅ Có |
| MASTERED | Đã thuộc lòng | ❌ Không |

---

## Tích hợp vào trang Home

**Hiển thị danh sách từ cần ôn tập ở cuối trang:**

```javascript
// Trong home.js
async function loadReviewWordsSection() {
  const token = auth.getToken();
  
  try {
    const response = await api.get('/progress/review-words', token);
    
    if (response && response.data && response.data.length > 0) {
      const reviewSection = document.getElementById('reviewWordsSection');
      reviewSection.innerHTML = `
        <h2>📚 Từ cần ôn tập (${response.total})</h2>
        <div class="review-words-grid">
          ${response.data.map(word => `
            <div class="review-word-card">
              <h3>${word.english_word}</h3>
              <p>${word.meaning}</p>
              <span class="badge ${word.status.toLowerCase()}">${word.status}</span>
              <span class="set-badge">${word.set_name}</span>
              <small>Ôn tập tiếp: ${new Date(word.next_review_date).toLocaleDateString('vi-VN')}</small>
            </div>
          `).join('')}
        </div>
      `;
    }
  } catch (error) {
    console.error('Error loading review words:', error);
  }
}

// Gọi khi load trang
loadReviewWordsSection();
```

---

## Use Cases (Các trường hợp sử dụng)

1. **Hiển thị từ cần ôn tập ở trang chủ** - Nhắc nhở người dùng ôn tập
2. **Tạo chế độ "Ôn tập nhanh"** - Luyện tập các từ đang học
3. **Thống kê tiến độ** - Xem có bao nhiêu từ đang trong quá trình học
4. **Lập lịch học tập** - Hiển thị từ cần ôn theo ngày
5. **Tạo bài kiểm tra từ cần ôn** - Quiz chỉ với các từ LEARNING/REVIEWING
