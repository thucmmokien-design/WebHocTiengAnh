// =========================
// API CONFIGURATION
// =========================
const API_BASE_URL = 'http://localhost:3000/api';

// =========================
// AUTO SLIDER
// =========================
let currentSlideIndex = 0;
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');

function showSlide(index) {
    // Xóa active khỏi tất cả
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    

    // Thêm active cho slide hiện tại
    slides[index].classList.add('active');
    dots[index].classList.add('active');
}

function nextSlide() {
    currentSlideIndex = (currentSlideIndex + 1) % slides.length;
    showSlide(currentSlideIndex);
}

function currentSlide(index) {
    currentSlideIndex = index;
    showSlide(currentSlideIndex);
}

// Auto slide mỗi 4 giây
if (slides.length > 0) {
    setInterval(nextSlide, 4000);
}

// =========================
// SHOW MESSAGE
// =========================
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'flex';
    
    // Auto hide sau 5 giây
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

function showSuccess(message) {
    const successDiv = document.getElementById('successMessage');
    if (successDiv) {
        successDiv.textContent = message;
        successDiv.style.display = 'flex';
        
        // Auto hide sau 5 giây
        setTimeout(() => {
            successDiv.style.display = 'none';
        }, 5000);
    }
}

function hideMessages() {
    const errorDiv = document.getElementById('errorMessage');
    const successDiv = document.getElementById('successMessage');
    
    if (errorDiv) errorDiv.style.display = 'none';
    if (successDiv) successDiv.style.display = 'none';
}

// =========================
// LOGIN FORM
// =========================
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        hideMessages();
        
        // Lấy dữ liệu form
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember').checked;
        
        // Validate
        if (!email || !password) {
            showError('Vui lòng nhập đầy đủ thông tin!');
            return;
        }
        
        // Disable button
        const loginBtn = document.getElementById('loginBtn');
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang đăng nhập...';
        
        try {
            // Gọi API login
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Đăng nhập thành công
                console.log('✅ Đăng nhập thành công:', data);
                
                // Lưu token
                if (remember) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                } else {
                    sessionStorage.setItem('token', data.token);
                    sessionStorage.setItem('user', JSON.stringify(data.user));
                }
                localStorage.setItem("nav-container","true");
                localStorage.setItem("page-content", "true");
                // Chuyển đến trang chủ
                window.location.href = 'home .html';
            } else {
                // Đăng nhập thất bại
                showError(data.message || 'Email hoặc mật khẩu không đúng!');
            }
        } catch (error) {
            console.error('❌ Lỗi:', error);
            showError('Không thể kết nối đến server. Vui lòng thử lại!');
        } finally {
            // Enable button
            loginBtn.disabled = false;
            loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Đăng Nhập';
        }
    });
}

// =========================
// REGISTER FORM
// =========================
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        hideMessages();
        
        // Lấy dữ liệu form
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const terms = document.getElementById('terms').checked;
        
        // Validate
        if (!email || !password || !confirmPassword) {
            showError('Vui lòng nhập đầy đủ thông tin!');
            return;
        }
        
        if (password.length < 6) {
            showError('Mật khẩu phải có ít nhất 6 ký tự!');
            return;
        }
        
        if (password !== confirmPassword) {
            showError('Mật khẩu xác nhận không khớp!');
            return;
        }
        
        if (!terms) {
            showError('Vui lòng đồng ý với điều khoản dịch vụ!');
            return;
        }
        
        // Disable button
        const registerBtn = document.getElementById('registerBtn');
        registerBtn.disabled = true;
        registerBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang đăng ký...';
        
        try {
            // Gọi API register
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Đăng ký thành công
                console.log('✅ Đăng ký thành công:', data);
                showSuccess('Đăng ký thành công! Đang chuyển đến trang đăng nhập...');
                
                // Chuyển đến trang login sau 2 giây
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } else {
                // Đăng ký thất bại
                showError(data.message || 'Đăng ký thất bại. Vui lòng thử lại!');
            }
        } catch (error) {
            console.error('❌ Lỗi:', error);
            showError('Không thể kết nối đến server. Vui lòng thử lại!');
        } finally {
            // Enable button
            registerBtn.disabled = false;
            registerBtn.innerHTML = '<i class="fas fa-user-plus"></i> Đăng Ký';
        }
    });
}
