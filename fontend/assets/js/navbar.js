// =========================
// NAVBAR NAVIGATION
// =========================

// Hàm khởi tạo navbar (được gọi từ home.js sau khi navbar load xong)
function initNavbar() {
    console.log('🚀 Khởi tạo navbar...');
    
    // Lấy tất cả menu items
    const menuItems = document.querySelectorAll('.menu-item');
    console.log('📋 Tìm thấy', menuItems.length, 'menu items');
    
    // Lấy tên trang hiện tại từ URL
    const currentPage = getCurrentPage();
    console.log('📄 Trang hiện tại:', currentPage);
    
    // Set active cho trang hiện tại
    setActivePage(currentPage);
    
    // Load user profile
    loadUserProfile();
    
    // Thêm sự kiện click cho mỗi menu item
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            // Lấy tên trang từ data-page attribute
            const page = this.getAttribute('data-page');
            console.log('🖱️ Click vào:', page);
            
            // Chuyển đến trang tương ứng
            navigateToPage(page);
        });
    });
    
    // Xử lý nút logout
    const logoutBtn = document.querySelector('.btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            // Xác nhận logout
            if (confirm('Bạn có chắc muốn đăng xuất?')) {
                // Xóa token và user info
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                sessionStorage.removeItem('token');
                sessionStorage.removeItem('user');
                
                // Chuyển về trang login
                window.location.href = 'login.html';
            }
        });
    }
    
    // Xử lý overlay (mobile)
    const overlay = document.getElementById('navbarOverlay');
    if (overlay) {
        overlay.addEventListener('click', toggleMobileMenu);
    }
    
    console.log('✅ Navbar đã sẵn sàng!');
}

// =========================
// LOAD USER PROFILE
// =========================
async function loadUserProfile() {
    try {
        // Lấy token
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        if (!token) {
            console.warn('⚠️ Chưa đăng nhập');
            return;
        }
        
        // Gọi API lấy profile
        const response = await fetch('http://localhost:3000/api/users/profile', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            const user = data.user;
            
            console.log('✅ Đã load user profile:', user);
            
            // Cập nhật tên user
            const userNameElement = document.querySelector('.user-name');
            if (userNameElement) {
                userNameElement.textContent = user.full_name || user.email || 'Người dùng';
            }
            
            // Cập nhật avatar
            const userAvatarElement = document.querySelector('.user-avatar');
            if (userAvatarElement) {
                if (user.avatar_url) {
                    // Nếu có avatar_url, thay icon bằng ảnh
                    // Nếu avatar_url bắt đầu bằng /uploads, thêm base URL
                    const avatarSrc = user.avatar_url.startsWith('/uploads') 
                        ? `http://localhost:3000${user.avatar_url}` 
                        : user.avatar_url;
                    userAvatarElement.innerHTML = `<img src="${avatarSrc}" alt="Avatar">`;
                } else {
                    // Nếu không có, giữ nguyên icon
                    userAvatarElement.innerHTML = '<i class="fas fa-user"></i>';
                }
            }
            
            // Lưu user info vào localStorage để dùng sau
            localStorage.setItem('user', JSON.stringify(user));
            
        } else {
            console.error('❌ Không thể load profile');
            // Nếu token hết hạn, chuyển về login
            if (response.status === 401) {
                localStorage.removeItem('token');
                sessionStorage.removeItem('token');
                window.location.href = 'login.html';
            }
        }
    } catch (error) {
        console.error('❌ Lỗi khi load profile:', error);
    }
}

// =========================
// HÀM LẤY TRANG HIỆN TẠI
// =========================
function getCurrentPage() {
    // Lấy URL hiện tại
    const path = window.location.pathname;
    console.log('🔍 Path:', path);
    
    // Lấy tên file (ví dụ: "home .html" -> "home ")
    let fileName = path.split('/').pop().split('.')[0];
    console.log('📝 File name (raw):', `"${fileName}"`);
    
    // Xóa tất cả khoảng trắng (trim)
    fileName = fileName.trim();
    console.log('📝 File name (trimmed):', `"${fileName}"`);
    
    // Trả về tên trang (mặc định là "home")
    return fileName || 'home';
}

// =========================
// HÀM SET ACTIVE PAGE
// =========================
function setActivePage(pageName) {
    console.log('🎯 Đang set active cho:', `"${pageName}"`);
    
    // Lấy tất cả menu items
    const menuItems = document.querySelectorAll('.menu-item');
    
    // Xóa class "active" khỏi tất cả items
    menuItems.forEach(item => {
        item.classList.remove('active');
    });
    
    // Thêm class "active" cho item tương ứng
    let found = false;
    menuItems.forEach(item => {
        const itemPage = item.getAttribute('data-page');
        console.log(`   Kiểm tra: "${itemPage}" === "${pageName}"?`, itemPage === pageName);
        
        if (itemPage === pageName) {
            item.classList.add('active');
            console.log('✅ Set active thành công:', pageName);
            found = true;
        }
    });
    
    if (!found) {
        console.warn('⚠️ Không tìm thấy menu item cho:', pageName);
    }
}

// =========================
// HÀM CHUYỂN TRANG
// =========================
function navigateToPage(pageName) {
    // Map tên trang -> tên file
    const pageMap = {
        'home': 'home .html',
        'practice': 'practice.html',
        'progress': 'progress.html',
        'settings': 'settings.html'
    };
    
    // Lấy tên file tương ứng
    const fileName = pageMap[pageName];
    
    if (fileName) {
        console.log('🔄 Chuyển đến:', fileName);
        // Chuyển đến trang
        window.location.href = fileName;
    } else {
        console.error('❌ Không tìm thấy trang:', pageName);
    }
}

// =========================
// MOBILE MENU TOGGLE
// =========================
function toggleMobileMenu() {
    const navbar = document.getElementById('navbar');
    const overlay = document.getElementById('navbarOverlay');
    
    // Toggle class "open"
    navbar.classList.toggle('open');
    overlay.classList.toggle('active');
}
