// ==================== THEME MANAGEMENT ====================
function applyThemeFromStorage() {
    const savedTheme = localStorage.getItem('theme');
    const htmlElement = document.documentElement;
    
    if (savedTheme === 'dark') {
        htmlElement.setAttribute('data-theme', 'dark');
    } else {
        htmlElement.setAttribute('data-theme', 'light');
        if (!savedTheme) {
            localStorage.setItem('theme', 'light');
        }
    }
    
    updateMetaThemeColor(savedTheme === 'dark');
}

function updateMetaThemeColor(isDark) {
    const themeColor = isDark ? '#0f172a' : '#ffffff';
    
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
        metaThemeColor = document.createElement('meta');
        metaThemeColor.name = 'theme-color';
        document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.content = themeColor;
    
    let metaAppleThemeColor = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (!metaAppleThemeColor) {
        metaAppleThemeColor = document.createElement('meta');
        metaAppleThemeColor.name = 'apple-mobile-web-app-status-bar-style';
        document.head.appendChild(metaAppleThemeColor);
    }
    metaAppleThemeColor.content = isDark ? 'black' : 'default';
}

// ==================== USER FUNCTIONS ====================
function getCurrentUser() {
    try {
        const userStr = localStorage.getItem('currentUser');
        return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
        return null;
    }
}

function isUserPremium() {
    const user = getCurrentUser();
    if (!user) return false;
    
    if (user.accountType === 'premium') {
        if (user.vipExpiry) {
            const expiryDate = new Date(user.vipExpiry);
            const today = new Date();
            return expiryDate >= today;
        }
        return true;
    }
    return false;
}

function isVIPActive(vipExpiry) {
    if (!vipExpiry) return false;
    const expiryDate = new Date(vipExpiry);
    const today = new Date();
    return expiryDate >= today;
}

function formatDate(dateString) {
    if (!dateString) return 'Chưa cập nhật';
    
    if (dateString.includes('T')) {
        const date = new Date(dateString);
        date.setDate(date.getDate() + 1);
        return date.toLocaleDateString('vi-VN');
    }
    
    if (dateString.includes('/')) {
        return dateString;
    }
    
    return dateString;
}

// ==================== UTILITY FUNCTIONS ====================
function formatCurrency(amount) {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + 'đ';
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidImageUrl(url) {
    if (!url || typeof url !== 'string') {
        return false;
    }
    
    const trimmedUrl = url.trim();
    
    if (trimmedUrl === '' || 
        trimmedUrl === 'null' || 
        trimmedUrl === 'undefined' ||
        trimmedUrl === '#' ||
        trimmedUrl.toLowerCase() === 'null' ||
        trimmedUrl.toLowerCase() === 'undefined' ||
        trimmedUrl === 'N/A' ||
        trimmedUrl === 'n/a') {
        return false;
    }
    
    const isUrl = trimmedUrl.startsWith('http://') || 
                 trimmedUrl.startsWith('https://') || 
                 trimmedUrl.startsWith('//') ||
                 trimmedUrl.includes('.jpg') || 
                 trimmedUrl.includes('.jpeg') || 
                 trimmedUrl.includes('.png') ||
                 trimmedUrl.includes('.gif') ||
                 trimmedUrl.includes('.webp') ||
                 trimmedUrl.includes('imgur.com') ||
                 trimmedUrl.includes('i.imgur.com') ||
                 trimmedUrl.includes('cdn.discordapp.com') ||
                 trimmedUrl.includes('imageshack.com') ||
                 trimmedUrl.includes('photobucket.com');
    
    return isUrl;
}

// ==================== MESSAGE FUNCTIONS ====================
function showSuccess(elementId, message) {
    const successElement = document.getElementById(elementId);
    if (successElement) {
        const textElement = successElement.querySelector('span') || successElement;
        textElement.textContent = message;
        successElement.style.display = 'flex';
        
        setTimeout(() => {
            successElement.style.display = 'none';
        }, 5000);
    }
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        const textElement = errorElement.querySelector('span') || errorElement;
        textElement.textContent = message;
        errorElement.style.display = 'flex';
        
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }
}

// ==================== CATEGORY FUNCTIONS ====================
function getCategoryLabel(category) {
    return CONFIG.CATEGORY_LABELS[category] || category;
}
