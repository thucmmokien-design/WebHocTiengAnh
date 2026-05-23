/**
 * ============================================
 * AUTHENTICATION FORM HANDLERS
 * ============================================
 * Xử lý đăng nhập, đăng ký, validation
 */

// ============================================
// PASSWORD TOGGLE FUNCTIONALITY
// ============================================
function togglePassword(inputId, iconId) {
    const passwordInput = document.getElementById(inputId);
    const eyeIcon = document.getElementById(iconId);
    
    if (!passwordInput || !eyeIcon) {
        console.error('Password input or icon not found');
        return;
    }
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        // Eye slash icon (hidden password)
        eyeIcon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';
    } else {
        passwordInput.type = 'password';
        // Eye icon (visible password)
        eyeIcon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
    }
}

// ============================================
// LOGIN FORM HANDLER
// ============================================
function handleLoginSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('.auth-submit');
    const email = document.getElementById('email')?.value;
    const password = document.getElementById('password')?.value;
    
    // Basic validation
    if (!email || !password) {
        showAlert('Vui lòng điền đầy đủ thông tin!', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showAlert('Email không hợp lệ!', 'error');
        return;
    }
    
    // Show loading state
    setButtonLoading(submitBtn, true);
    
    // Simulate API call
    setTimeout(() => {
        setButtonLoading(submitBtn, false);
        
        // TODO: Replace with actual API call
        console.log('Login attempt:', { email, password });
        showAlert('Đăng nhập thành công!', 'success');
        
        // Redirect after successful login
        // window.location.href = '../pages/index.html';
    }, 2000);
}

// ============================================
// REGISTER FORM HANDLER
// ============================================
function handleRegisterSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('.auth-submit');
    const fullName = document.getElementById('fullName')?.value;
    const email = document.getElementById('email')?.value;
    const password = document.getElementById('password')?.value;
    const confirmPassword = document.getElementById('confirmPassword')?.value;
    
    // Validation
    if (!fullName || !email || !password || !confirmPassword) {
        showAlert('Vui lòng điền đầy đủ thông tin!', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showAlert('Email không hợp lệ!', 'error');
        return;
    }
    
    if (password.length < 6) {
        showAlert('Mật khẩu phải có ít nhất 6 ký tự!', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showAlert('Mật khẩu xác nhận không khớp!', 'error');
        return;
    }
    
    // Show loading state
    setButtonLoading(submitBtn, true);
    
    // Simulate API call
    setTimeout(() => {
        setButtonLoading(submitBtn, false);
        
        // TODO: Replace with actual API call
        console.log('Register attempt:', { fullName, email, password });
        showAlert('Đăng ký thành công! Chuyển đến trang đăng nhập...', 'success');
        
        // Redirect to login page
        setTimeout(() => {
            // window.location.href = 'login.html';
        }, 1500);
    }, 2000);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Set button loading state
 */
function setButtonLoading(button, isLoading) {
    if (!button) return;
    
    if (isLoading) {
        button.classList.add('loading');
        button.disabled = true;
        button.dataset.originalText = button.textContent;
    } else {
        button.classList.remove('loading');
        button.disabled = false;
        if (button.dataset.originalText) {
            button.textContent = button.dataset.originalText;
        }
    }
}

/**
 * Show alert message
 */
function showAlert(message, type = 'info') {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());
    
    // Create alert element
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    
    const icon = type === 'error' ? '⚠️' : type === 'success' ? '✓' : 'ℹ️';
    alert.innerHTML = `
        <span>${icon}</span>
        <span>${message}</span>
    `;
    
    // Insert alert before form
    const form = document.querySelector('.auth-form');
    if (form) {
        form.parentNode.insertBefore(alert, form);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            alert.remove();
        }, 5000);
    } else {
        // Fallback to browser alert
        alert(message);
    }
}

/**
 * Show inline error for specific input
 */
function showInputError(inputId, message) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    // Add error class
    input.classList.add('error');
    
    // Remove existing error message
    const existingError = input.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Create error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <span>⚠️</span>
        <span>${message}</span>
    `;
    
    // Insert after input
    input.parentNode.appendChild(errorDiv);
    
    // Remove error on input change
    input.addEventListener('input', function removeError() {
        input.classList.remove('error');
        const errorMsg = input.parentNode.querySelector('.error-message');
        if (errorMsg) {
            errorMsg.remove();
        }
        input.removeEventListener('input', removeError);
    });
}

/**
 * Clear all input errors
 */
function clearInputErrors() {
    const errorInputs = document.querySelectorAll('.form-input.error');
    errorInputs.forEach(input => {
        input.classList.remove('error');
    });
    
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(msg => msg.remove());
}

// ============================================
// SOCIAL LOGIN HANDLERS
// ============================================
function handleGoogleLogin() {
    console.log('Google login clicked');
    showAlert('Tính năng đăng nhập Google đang được phát triển', 'info');
    // TODO: Implement Google OAuth
}

function handleFacebookLogin() {
    console.log('Facebook login clicked');
    showAlert('Tính năng đăng nhập Facebook đang được phát triển', 'info');
    // TODO: Implement Facebook OAuth
}

// ============================================
// INITIALIZE EVENT LISTENERS
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }
    
    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegisterSubmit);
    }
    
    // Social login buttons
    const googleBtns = document.querySelectorAll('[title*="Google"]');
    googleBtns.forEach(btn => {
        btn.addEventListener('click', handleGoogleLogin);
    });
    
    const facebookBtns = document.querySelectorAll('[title*="Facebook"]');
    facebookBtns.forEach(btn => {
        btn.addEventListener('click', handleFacebookLogin);
    });
});

// Export functions for global use
window.togglePassword = togglePassword;
window.showAlert = showAlert;
window.showInputError = showInputError;
window.clearInputErrors = clearInputErrors;
