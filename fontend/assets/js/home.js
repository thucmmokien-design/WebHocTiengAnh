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
// LOAD ALL STATS
// =========================
async function loadAllStats() {
    await loadUserInfo();
    await Promise.all([
        loadStreakData(),
        loadWordsLearned(),
        loadMemoryRetention()
    ]);
}