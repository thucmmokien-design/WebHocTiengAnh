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
