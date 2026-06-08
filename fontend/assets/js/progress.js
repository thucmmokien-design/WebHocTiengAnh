// =========================
// LOAD NAVBAR
// =========================
fetch("../components/navbar.html")
    .then(response => response.text())
    .then(data => {
        document.querySelector(".nav-container").innerHTML = data;
        const isLogin = localStorage.getItem("nav-container"); 
        const isLogintwo = localStorage.getItem("page-content");
        if(isLogin !== "true" || isLogintwo !== "true"){
            window.location.href ="login.html"
        }
        
        const script = document.createElement("script");
        script.src = "../assets/js/navbar.js";
        script.onload = function() {
            console.log('📦 navbar.js đã load');
            if (typeof initNavbar === 'function') {
                initNavbar();
            }
        };
        document.body.appendChild(script);
        
        // Load achievements
        loadAchievements();
        
        // Tự động kiểm tra và trao thành tích mới
        checkNewAchievements();
    })
    .catch(error => {
        console.error('❌ Lỗi khi load navbar:', error);
    });

// =========================
// CHECK NEW ACHIEVEMENTS
// =========================
async function checkNewAchievements() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/achievements/check', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            
            // Nếu có thành tích mới, hiển thị thông báo
            if (data.new_achievements && data.new_achievements.length > 0) {
                console.log('🎉 Thành tích mới:', data.new_achievements);
                
                // Reload lại danh sách achievements
                setTimeout(() => {
                    loadAchievements();
                }, 500);
            }
        }
    } catch (error) {
        console.error('❌ Lỗi khi check achievements:', error);
    }
}

// =========================
// LOAD ACHIEVEMENTS
// =========================
async function loadAchievements() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/achievements', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            
            // Cập nhật stats
            document.getElementById('totalWordsLearned').textContent = data.total_words_learned;
            const unlockedCount = data.achievements.filter(a => a.unlocked).length;
            document.getElementById('unlockedCount').textContent = unlockedCount;
            document.getElementById('totalCount').textContent = data.achievements.length;
            
            // Render achievements
            renderAchievements(data.achievements);
        } else {
            document.getElementById('achievementsGrid').innerHTML = '<p class="empty-text">Không thể tải dữ liệu thành tích</p>';
        }
    } catch (error) {
        console.error('❌ Lỗi khi load achievements:', error);
        document.getElementById('achievementsGrid').innerHTML = '<p class="empty-text">Lỗi kết nối server</p>';
    }
}

// =========================
// RENDER ACHIEVEMENTS
// =========================
function renderAchievements(achievements) {
    const container = document.getElementById('achievementsGrid');
    
    if (!achievements || achievements.length === 0) {
        container.innerHTML = '<p class="empty-text">Chưa có thành tích nào</p>';
        return;
    }
    
    const html = achievements.map(achievement => {
        const unlockedClass = achievement.unlocked ? 'unlocked' : 'locked';
        const unlockedDate = achievement.unlocked_at ? 
            new Date(achievement.unlocked_at).toLocaleDateString('vi-VN') : '';
        
        return `
            <div class="achievement-card ${unlockedClass}">
                <div class="achievement-badge">
                    <img src="http://localhost:3000${achievement.badge_image}" 
                         alt="${achievement.name}"
                         onerror="this.src='http://localhost:3000/uploads/huyhieu/GTTD.png'">
                    ${achievement.unlocked ? '<i class="fas fa-check-circle unlock-icon"></i>' : '<i class="fas fa-lock lock-icon"></i>'}
                </div>
                <div class="achievement-info">
                    <h3 class="achievement-name">${achievement.name}</h3>
                    <p class="achievement-description">${achievement.description}</p>
                    <div class="achievement-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${achievement.progress_percentage}%"></div>
                        </div>
                        <span class="progress-text">${achievement.progress}/${achievement.threshold} từ (${achievement.progress_percentage}%)</span>
                    </div>
                    ${achievement.unlocked ? 
                        `<p class="unlocked-date"><i class="fas fa-calendar-check"></i> Mở khóa: ${unlockedDate}</p>` : 
                        `<p class="locked-hint"><i class="fas fa-info-circle"></i> Còn ${achievement.threshold - achievement.progress} từ nữa</p>`
                    }
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
}
