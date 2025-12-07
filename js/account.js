// ==================== ACCOUNT FUNCTIONS ====================

// DOM Elements
const authTabs = document.querySelectorAll('.auth-tab');
const authForms = document.querySelectorAll('.auth-form');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const authFormsContainer = document.getElementById('authForms');
const userInfo = document.getElementById('userInfo');
const welcomeSection = document.getElementById('welcomeSection');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const logoutBtn = document.getElementById('logoutBtn');
const upgradeBtn = document.getElementById('upgradeBtn');
const refreshBtn = document.getElementById('refreshBtn');
const changePasswordBtn = document.getElementById('changePasswordBtn');
const changePasswordModal = document.getElementById('changePasswordModal');
const closeChangePasswordModal = document.getElementById('closeChangePasswordModal');
const changePasswordForm = document.getElementById('changePasswordForm');
const submitChangePasswordBtn = document.getElementById('submitChangePasswordBtn');
const newPasswordInput = document.getElementById('newPassword');
const passwordStrength = document.getElementById('passwordStrength');
const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');
const successText = document.getElementById('successText');
const errorText = document.getElementById('errorText');
const quickLoading = document.getElementById('quickLoading');
const navItems = document.querySelectorAll('.nav-item[data-view]');

// Check if user is already logged in
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = getCurrentUser();
    if (currentUser) {
        loadUserInfo(currentUser, true);
        refreshUserInfo(currentUser);
    } else {
        authFormsContainer.style.display = 'block';
        welcomeSection.style.display = 'block';
        quickLoading.style.display = 'none';
    }

    // Navigation events
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const view = item.dataset.view;
            
            if (view === 'search') {
                window.location.href = 'index.html#search';
                return;
            }
            
            if (view === 'today' || view === 'games') {
                window.location.href = `index.html?view=${view}`;
            }
        });
    });
});

// Tab switching
authTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const formId = tab.getAttribute('data-form');
        
        authTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        authForms.forEach(form => {
            form.classList.remove('active');
            if (form.id === formId) {
                form.classList.add('active');
            }
        });
    });
});

// Login form submission
loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    
    if (!username || !password) {
        showError('Vui lòng điền đầy đủ thông tin');
        return;
    }
    
    loginBtn.innerHTML = '<div class="loading"></div> Đang đăng nhập...';
    loginBtn.disabled = true;
    
    try {
        const response = await fetch(CONFIG.GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify({
                action: 'loginUser',
                data: {
                    username: username,
                    password: password
                }
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            localStorage.setItem('currentUser', JSON.stringify(result.data));
            loadUserInfo(result.data, false);
            showSuccess('Đăng nhập thành công!');
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        showError(error.message || 'Đăng nhập thất bại');
    } finally {
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Đăng nhập';
        loginBtn.disabled = false;
    }
});

// Register form submission
registerForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('registerUsername').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value.trim();
    const confirmPassword = document.getElementById('registerConfirmPassword').value.trim();
    
    if (!username || !email || !password || !confirmPassword) {
        showError('Vui lòng điền đầy đủ thông tin');
        return;
    }
    
    if (password !== confirmPassword) {
        showError('Mật khẩu xác nhận không khớp');
        return;
    }
    
    if (password.length < 6) {
        showError('Mật khẩu phải có ít nhất 6 ký tự');
        return;
    }
    
    if (!isValidEmail(email)) {
        showError('Email không hợp lệ');
        return;
    }
    
    registerBtn.innerHTML = '<div class="loading"></div> Đang đăng ký...';
    registerBtn.disabled = true;
    
    try {
        const response = await fetch(CONFIG.GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify({
                action: 'registerUser',
                data: {
                    username: username,
                    password: password,
                    email: email
                }
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showSuccess('Đăng ký thành công! Vui lòng đăng nhập.');
            authTabs[0].click();
            registerForm.reset();
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        showError(error.message || 'Đăng ký thất bại');
    } finally {
        registerBtn.innerHTML = '<i class="fas fa-user-plus"></i> Đăng ký tài khoản';
        registerBtn.disabled = false;
    }
});

// Logout
logoutBtn.addEventListener('click', function() {
    localStorage.removeItem('currentUser');
    authFormsContainer.style.display = 'block';
    welcomeSection.style.display = 'block';
    userInfo.classList.remove('active');
    showSuccess('Đã đăng xuất thành công');
});

// Upgrade button
upgradeBtn.addEventListener('click', function() {
    window.location.href = 'payment.html';
});

// Refresh user info
refreshBtn.addEventListener('click', async function() {
    const currentUser = getCurrentUser();
    if (currentUser) {
        refreshBtn.innerHTML = '<div class="loading"></div> Đang làm mới...';
        try {
            await refreshUserInfo(currentUser);
            showSuccess('Đã cập nhật thông tin tài khoản!');
        } catch (error) {
            showError(error.message || 'Lỗi khi làm mới thông tin');
        } finally {
            refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Làm mới';
        }
    }
});

// Change password modal
changePasswordBtn.addEventListener('click', function() {
    changePasswordModal.classList.add('active');
    changePasswordForm.reset();
    passwordStrength.className = 'password-strength';
});

closeChangePasswordModal.addEventListener('click', function() {
    changePasswordModal.classList.remove('active');
});

changePasswordModal.addEventListener('click', function(e) {
    if (e.target === changePasswordModal) {
        changePasswordModal.classList.remove('active');
    }
});

// Password strength checker
newPasswordInput.addEventListener('input', function() {
    const password = newPasswordInput.value;
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    passwordStrength.className = 'password-strength';
    if (password.length > 0) {
        if (strength <= 2) {
            passwordStrength.classList.add('strength-weak');
        } else if (strength <= 4) {
            passwordStrength.classList.add('strength-medium');
        } else {
            passwordStrength.classList.add('strength-strong');
        }
    }
});

// Change password form submission
changePasswordForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const oldPassword = document.getElementById('oldPassword').value.trim();
    const newPassword = document.getElementById('newPassword').value.trim();
    const confirmNewPassword = document.getElementById('confirmNewPassword').value.trim();
    
    if (!oldPassword || !newPassword || !confirmNewPassword) {
        showError('Vui lòng điền đầy đủ thông tin');
        return;
    }
    
    if (newPassword !== confirmNewPassword) {
        showError('Mật khẩu mới và xác nhận không khớp');
        return;
    }
    
    if (newPassword.length < 6) {
        showError('Mật khẩu mới phải có ít nhất 6 ký tự');
        return;
    }
    
    if (newPassword === oldPassword) {
        showError('Mật khẩu mới phải khác mật khẩu cũ');
        return;
    }
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showError('Bạn cần đăng nhập để đổi mật khẩu');
        return;
    }
    
    submitChangePasswordBtn.innerHTML = '<div class="loading"></div> Đang cập nhật...';
    submitChangePasswordBtn.disabled = true;
    
    try {
        const response = await fetch(CONFIG.GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify({
                action: 'changePassword',
                data: {
                    email: currentUser.email,
                    oldPassword: oldPassword,
                    newPassword: newPassword
                }
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showSuccess('Đổi mật khẩu thành công! Vui lòng đăng nhập lại với mật khẩu mới.');
            
            setTimeout(() => {
                changePasswordModal.classList.remove('active');
                changePasswordForm.reset();
                passwordStrength.className = 'password-strength';
            }, 2000);
            
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        showError(error.message || 'Đổi mật khẩu thất bại');
    } finally {
        submitChangePasswordBtn.innerHTML = '<i class="fas fa-check"></i> Cập nhật mật khẩu';
        submitChangePasswordBtn.disabled = false;
    }
});

// Load user info for account page
async function loadUserInfo(userData, isQuickLoad) {
    document.getElementById('userName').textContent = userData.username;
    document.getElementById('userEmail').textContent = userData.email;
    document.getElementById('userCreatedDate').textContent = formatDate(userData.createdDate);
    
    const firstLetter = userData.username.charAt(0).toUpperCase();
    document.getElementById('userAvatar').innerHTML = firstLetter;
    
    const userBadge = document.getElementById('userBadge');
    const vipExpiryInfo = document.getElementById('vipExpiryInfo');
    const vipExpiryDate = document.getElementById('vipExpiryDate');
    const upgradeBtn = document.getElementById('upgradeBtn');
    
    const packageInfo = {
        'free': { name: 'Miễn phí', class: 'free', icon: 'fas fa-user' },
        'trial': { name: 'Trial', class: 'trial', icon: 'fas fa-star' },
        'basic': { name: 'Basic', class: 'basic', icon: 'fas fa-crown' },
        'plus': { name: 'Plus', class: 'plus', icon: 'fas fa-crown' },
        'premium': { name: 'Premium', class: 'premium', icon: 'fas fa-crown' }
    };
    
    const currentPackage = packageInfo[userData.packageType] || packageInfo.free;
    
    if (userData.accountType === 'premium' && isVIPActive(userData.vipExpiry)) {
        userBadge.innerHTML = `<i class="${currentPackage.icon}"></i><span>Tài khoản ${currentPackage.name}</span>`;
        userBadge.className = `user-badge ${currentPackage.class}`;
        vipExpiryDate.textContent = formatDate(userData.vipExpiry);
        vipExpiryInfo.style.display = 'flex';
        upgradeBtn.style.display = 'none';
    } else {
        userBadge.innerHTML = `<i class="${currentPackage.icon}"></i><span>Tài khoản ${currentPackage.name}</span>`;
        userBadge.className = `user-badge ${currentPackage.class}`;
        vipExpiryInfo.style.display = 'none';
        upgradeBtn.style.display = 'flex';
    }
    
    authFormsContainer.style.display = 'none';
    welcomeSection.style.display = 'none';
    userInfo.classList.add('active');
    quickLoading.style.display = 'none';
    
    if (isQuickLoad) {
        userInfo.style.animation = 'none';
    }
}

async function refreshUserInfo(userData) {
    try {
        const response = await fetch(`${CONFIG.GOOGLE_SCRIPT_URL}?action=getUserByEmail&email=${encodeURIComponent(userData.email)}`);
        const result = await response.json();
        
        if (result.success) {
            const updatedUserData = result.data;
            localStorage.setItem('currentUser', JSON.stringify(updatedUserData));
            loadUserInfo(updatedUserData, false);
        } else {
            throw new Error('Không thể cập nhật thông tin');
        }
    } catch (error) {
        console.error('Lỗi khi tải thông tin người dùng:', error);
        loadUserInfo(userData, false);
    }
}

function showSuccess(message) {
    successText.textContent = message;
    successMessage.style.display = 'flex';
    errorMessage.style.display = 'none';
    
    setTimeout(() => {
        successMessage.style.display = 'none';
    }, 5000);
}

function showError(message) {
    errorText.textContent = message;
    errorMessage.style.display = 'flex';
    successMessage.style.display = 'none';
    
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 5000);
}
