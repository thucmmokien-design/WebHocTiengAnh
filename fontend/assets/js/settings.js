// Settings Page JavaScript

const API_BASE_URL = 'http://localhost:3000/api';

// Lấy token từ localStorage hoặc sessionStorage
function getToken() {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
}

// Hiển thị thông báo thành công
function showSuccess(message) {
    const successToast = document.getElementById('successMessage');
    const successText = document.getElementById('successText');
    successText.textContent = message;
    successToast.classList.add('active');
    
    setTimeout(() => {
        successToast.classList.remove('active');
    }, 3000);
}

// Hiển thị lỗi
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.classList.add('active');
    
    setTimeout(() => {
        errorElement.classList.remove('active');
    }, 5000);
}

// Format ngày tháng
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Load thông tin user từ API
async function loadUserProfile() {
    const token = getToken();
    
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/users/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 401) {
            // Token hết hạn
            localStorage.removeItem('token');
            sessionStorage.removeItem('token');
            window.location.href = 'login.html';
            return;
        }

        const data = await response.json();

        if (response.ok) {
            const user = data.user;
            
            // Hiển thị avatar
            const avatarPreview = document.getElementById('avatarPreview');
            if (user.avatar_url) {
                // Nếu avatar_url bắt đầu bằng /uploads, thêm base URL
                const avatarSrc = user.avatar_url.startsWith('/uploads') 
                    ? `http://localhost:3000${user.avatar_url}` 
                    : user.avatar_url;
                avatarPreview.innerHTML = `<img src="${avatarSrc}" alt="Avatar">`;
            } else {
                avatarPreview.innerHTML = '<i class="fas fa-user"></i>';
            }

            // Hiển thị thông tin
            document.getElementById('fullNameDisplay').textContent = user.full_name || 'Chưa cập nhật';
            document.getElementById('emailDisplay').textContent = user.email;
            document.getElementById('roleDisplay').textContent = user.role === 'admin' ? 'Quản Trị Viên' : 'Người Dùng';
            document.getElementById('createdAtDisplay').textContent = formatDate(user.created_at);
        } else {
            alert('Lỗi: ' + data.message);
        }
    } catch (error) {
        console.error('Lỗi khi tải thông tin:', error);
        alert('Không thể kết nối đến server!');
    }
}

// Upload avatar
document.getElementById('avatarInput')?.addEventListener('change', async function(e) {
    const file = e.target.files[0];
    
    if (!file) return;

    // Kiểm tra loại file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        alert('Chỉ chấp nhận file ảnh: JPG, PNG, GIF, WEBP');
        return;
    }

    // Kiểm tra kích thước (5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước file không được vượt quá 5MB!');
        return;
    }

    // Hiển thị preview ngay lập tức
    const reader = new FileReader();
    reader.onload = function(event) {
        const avatarPreview = document.getElementById('avatarPreview');
        avatarPreview.innerHTML = `<img src="${event.target.result}" alt="Avatar Preview">`;
    };
    reader.readAsDataURL(file);

    // Upload lên server
    const token = getToken();
    const formData = new FormData();
    formData.append('avatar', file);

    try {
        const response = await fetch(`${API_BASE_URL}/users/upload-avatar`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            showSuccess('Cập nhật ảnh đại diện thành công!');
            // Reload navbar để cập nhật avatar
            if (typeof loadUserProfile === 'function') {
                loadUserProfile();
            }
        } else {
            alert('Lỗi: ' + data.message);
            // Reload lại avatar cũ nếu upload thất bại
            loadUserProfile();
        }
    } catch (error) {
        console.error('Lỗi khi upload avatar:', error);
        alert('Không thể upload ảnh!');
        loadUserProfile();
    }
});

// ===== MODAL: Edit Full Name =====
function openEditNameModal() {
    const currentName = document.getElementById('fullNameDisplay').textContent;
    document.getElementById('newFullName').value = currentName !== 'Chưa cập nhật' ? currentName : '';
    document.getElementById('editNameModal').classList.add('active');
    document.getElementById('nameError').classList.remove('active');
}

function closeEditNameModal() {
    document.getElementById('editNameModal').classList.remove('active');
    document.getElementById('newFullName').value = '';
    document.getElementById('nameError').classList.remove('active');
}

async function saveFullName() {
    const newFullName = document.getElementById('newFullName').value.trim();

    // Validate
    if (!newFullName) {
        showError('nameError', 'Vui lòng nhập họ và tên!');
        return;
    }

    const token = getToken();

    try {
        const response = await fetch(`${API_BASE_URL}/users/profile`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                full_name: newFullName,
                avatar_url: null // Giữ nguyên avatar hiện tại
            })
        });

        const data = await response.json();

        if (response.ok) {
            showSuccess('Cập nhật họ và tên thành công!');
            closeEditNameModal();
            loadUserProfile(); // Reload thông tin
            
            // Reload navbar để cập nhật tên
            if (typeof window.loadUserProfile === 'function') {
                window.loadUserProfile();
            }
        } else {
            showError('nameError', data.message);
        }
    } catch (error) {
        console.error('Lỗi khi cập nhật tên:', error);
        showError('nameError', 'Không thể kết nối đến server!');
    }
}

// ===== MODAL: Change Password =====
function openChangePasswordModal() {
    document.getElementById('changePasswordModal').classList.add('active');
    document.getElementById('oldPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
    document.getElementById('passwordError').classList.remove('active');
}

function closeChangePasswordModal() {
    document.getElementById('changePasswordModal').classList.remove('active');
    document.getElementById('oldPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
    document.getElementById('passwordError').classList.remove('active');
}

async function savePassword() {
    const oldPassword = document.getElementById('oldPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validate
    if (!oldPassword || !newPassword || !confirmPassword) {
        showError('passwordError', 'Vui lòng điền đầy đủ thông tin!');
        return;
    }

    if (newPassword.length < 6) {
        showError('passwordError', 'Mật khẩu mới phải có ít nhất 6 ký tự!');
        return;
    }

    if (newPassword !== confirmPassword) {
        showError('passwordError', 'Mật khẩu xác nhận không khớp!');
        return;
    }

    const token = getToken();

    try {
        const response = await fetch(`${API_BASE_URL}/users/change-password`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                old_password: oldPassword,
                new_password: newPassword
            })
        });

        const data = await response.json();

        if (response.ok) {
            showSuccess('Đổi mật khẩu thành công!');
            closeChangePasswordModal();
        } else {
            showError('passwordError', data.message);
        }
    } catch (error) {
        console.error('Lỗi khi đổi mật khẩu:', error);
        showError('passwordError', 'Không thể kết nối đến server!');
    }
}

// Đóng modal khi click bên ngoài
window.addEventListener('click', function(event) {
    const editNameModal = document.getElementById('editNameModal');
    const changePasswordModal = document.getElementById('changePasswordModal');
    
    if (event.target === editNameModal) {
        closeEditNameModal();
    }
    if (event.target === changePasswordModal) {
        closeChangePasswordModal();
    }
});

// Load thông tin khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
    loadUserProfile();
});
