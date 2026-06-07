// =========================
// LOAD NAVBAR
// =========================
fetch("../components/navbar.html")
    .then(response => response.text())
    .then(data => {
        // render nav
        document.querySelector(".nav-container").innerHTML = data;
        const isLogin = localStorage.getItem("nav-container"); 
        const isLogintwo = localStorage.getItem("page-content");
        if(isLogin !== "true" || isLogintwo !== "true"){
            window.location.href ="login.html"
        }
        // load nav js
        const script = document.createElement("script");
        script.src = "../assets/js/navbar.js";
        script.onload = function() {
            // Gọi initNavbar() sau khi navbar.js load xong
            console.log('📦 navbar.js đã load');
            if (typeof initNavbar === 'function') {
                initNavbar();
            }
        };
        document.body.appendChild(script);
        
        // Load stats sau khi navbar đã load
        loadAllStats();
        loadReviewWords(); // Thêm load từ cần ôn tập
    })
    .catch(error => {
        console.error('❌ Lỗi khi load navbar:', error);
    });

// =========================
// LOAD USER INFO
// =========================
async function loadUserInfo() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/users/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            document.getElementById('userName').textContent = data.full_name || 'Bạn';
        } else {
            document.getElementById('userName').textContent = 'Bạn';
        }
    } catch (error) {
        console.error('❌ Lỗi khi load thông tin user:', error);
        document.getElementById('userName').textContent = 'Bạn';
    }
}

// =========================
// LOAD STREAK DATA
// =========================
async function loadStreakData() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/stats/streak', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            document.getElementById('streakValue').textContent = data.current_streak;
            document.getElementById('streakMessage').textContent = data.message;
        } else {
            document.getElementById('streakValue').textContent = '0';
            document.getElementById('streakMessage').textContent = 'Hãy bắt đầu học ngay!';
        }
    } catch (error) {
        console.error('❌ Lỗi khi load streak:', error);
        document.getElementById('streakValue').textContent = '--';
        document.getElementById('streakMessage').textContent = 'Không thể tải dữ liệu';
    }
}

// =========================
// LOAD WORDS LEARNED DATA
// =========================
async function loadWordsLearned() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/stats/words-learned', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const result = await response.json();
            const data = result.data;
            
            document.getElementById('wordsValue').textContent = data.total_words_learned;
            document.getElementById('learningCount').textContent = data.learning;
            document.getElementById('reviewingCount').textContent = data.reviewing;
            document.getElementById('masteredCount').textContent = data.mastered;
        } else {
            document.getElementById('wordsValue').textContent = '0';
        }
    } catch (error) {
        console.error('❌ Lỗi khi load words learned:', error);
        document.getElementById('wordsValue').textContent = '--';
    }
}

// =========================
// LOAD MEMORY RETENTION DATA
// =========================
async function loadMemoryRetention() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/stats/memory-retention', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const result = await response.json();
            const data = result.data;
            
            document.getElementById('memoryValue').textContent = `${data.memory_retention_rate}%`;
            document.getElementById('accuracyValue').textContent = `${data.accuracy}%`;
            document.getElementById('sessionsCount').textContent = data.total_sessions;
        } else {
            document.getElementById('memoryValue').textContent = '0%';
            document.getElementById('accuracyValue').textContent = '0%';
            document.getElementById('sessionsCount').textContent = '0';
        }
    } catch (error) {
        console.error('❌ Lỗi khi load memory retention:', error);
        document.getElementById('memoryValue').textContent = '--%';
    }
}

// =========================
// LOAD WEEKLY ACTIVITY DATA
// =========================
async function loadWeeklyActivity() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/stats/weekly-activity', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const result = await response.json();
            const data = result.data;
            
            // Render weekly chart
            renderWeeklyChart(data.weekly_stats);
        } else {
            document.getElementById('weeklyChart').innerHTML = '<p class="empty-text">Chưa có dữ liệu học tập</p>';
        }
    } catch (error) {
        console.error('❌ Lỗi khi load weekly activity:', error);
        document.getElementById('weeklyChart').innerHTML = '<p class="empty-text">Không thể tải dữ liệu</p>';
    }
}

// =========================
// RENDER WEEKLY CHART
// =========================
function renderWeeklyChart(weeklyStats) {
    const container = document.getElementById('weeklyChart');
    
    if (!weeklyStats || weeklyStats.length === 0) {
        container.innerHTML = '<p class="empty-text">Chưa có dữ liệu học tập</p>';
        return;
    }
    
    // Tìm giá trị max để tính tỷ lệ
    const maxWords = Math.max(...weeklyStats.map(d => d.total));
    
    const html = weeklyStats.map(day => {
        const percentage = maxWords > 0 ? (day.total / maxWords) * 100 : 0;
        const heightClass = day.total === 0 ? 'empty' : percentage >= 80 ? 'high' : percentage >= 40 ? 'medium' : 'low';
        
        return `
            <div class="day-bar">
                <div class="bar-container">
                    <div class="bar ${heightClass}" style="height: ${Math.max(percentage, 5)}%;" title="${day.total} từ - ${day.sessions} buổi học">
                        <span class="bar-value">${day.total}</span>
                    </div>
                </div>
                <span class="day-label">${day.day}</span>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
}

// =========================
// LOAD ALL STATS
// =========================
async function loadAllStats() {
    await loadUserInfo();
    await Promise.all([
        loadStreakData(),
        loadWordsLearned(),
        loadMemoryRetention(),
        loadWeeklyActivity()
    ]);
}


// =========================
// LOAD REVIEW WORDS
// =========================
async function loadReviewWords() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/progress/review-words', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const result = await response.json();
            
            // Cập nhật số lượng từ cần ôn tập
            document.getElementById('reviewCount').textContent = `${result.total} từ`;
            
            // Render danh sách từ
            renderReviewWords(result.data);
        } else {
            document.getElementById('reviewCount').textContent = '0 từ';
            document.getElementById('reviewWordsContainer').innerHTML = '<p class="empty-text">Chưa có từ nào cần ôn tập 🎉</p>';
        }
    } catch (error) {
        console.error('❌ Lỗi khi load review words:', error);
        document.getElementById('reviewCount').textContent = '0 từ';
        document.getElementById('reviewWordsContainer').innerHTML = '<p class="empty-text">Không thể tải dữ liệu</p>';
    }
}

// =========================
// RENDER REVIEW WORDS
// =========================
function renderReviewWords(words) {
    const container = document.getElementById('reviewWordsContainer');
    
    if (!words || words.length === 0) {
        container.innerHTML = '<p class="empty-text">Chưa có từ nào cần ôn tập 🎉</p>';
        return;
    }
    
    // Tạo chuỗi từ vựng
    const wordsHtml = words.map(word => {
        return `<span class="scroll-word"><strong>${word.english_word}</strong> - ${word.meaning}</span>`;
    }).join('');
    
    // Nhân đôi để tạo hiệu ứng chạy liên tục
    container.innerHTML = `
        <div class="scroll-track">
            <div class="scroll-content">
                ${wordsHtml}
                ${wordsHtml}
            </div>
        </div>
    `;
}
