// ==================== APP DETAIL FUNCTIONS ====================

// Lấy appId từ URL parameter
const urlParams = new URLSearchParams(window.location.search);
const appId = urlParams.get('id');

// Biến để theo dõi retry
let retryCount = 0;
const MAX_RETRIES = 3;
let currentAppData = null;

// XOÁ CACHE khi vào trang chi tiết
function clearCache() {
    try {
        localStorage.removeItem('xspace_apps_cache');
        localStorage.removeItem('xspace_cache_timestamp');
        console.log('✅ Đã xoá cache');
    } catch (e) {
        console.log('⚠️ Không thể xoá cache:', e);
    }
}

// Hiển thị loading
function showLoading() {
    const appContent = document.getElementById('appContent');
    if (appContent) {
        appContent.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
                <p>Đang tải thông tin ứng dụng...</p>
            </div>
        `;
    }
}

// Hiển thị lỗi với nút retry
function showError(message, showRetry = true) {
    let retryButton = '';
    if (showRetry && retryCount < MAX_RETRIES) {
        retryButton = `
            <button class="retry-btn" onclick="retryLoadApp()">
                <i class="fas fa-redo"></i>
                Thử lại
            </button>
        `;
    }
    
    const appContent = document.getElementById('appContent');
    if (appContent) {
        appContent.innerHTML = `
            <div class="error-message">
                <div class="error-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3>Đã xảy ra lỗi</h3>
                <p>${message}</p>
                ${retryButton}
                <button class="download-btn" onclick="window.location.href='index.html'" style="margin-top: 16px; max-width: 200px;">
                    <i class="fas fa-home"></i>
                    Quay về trang chủ
                </button>
            </div>
        `;
    }
}

// Retry load app
function retryLoadApp() {
    retryCount++;
    console.log(`🔄 Thử lại lần ${retryCount}/${MAX_RETRIES}...`);
    loadAppDetail();
}

// Toggle debug info
function toggleDebug() {
    const debugInfo = document.getElementById('debugInfo');
    const toggle = document.querySelector('.debug-toggle');
    
    if (!debugInfo || !toggle) return;
    
    if (debugInfo.style.display === 'none' || debugInfo.style.display === '') {
        debugInfo.style.display = 'block';
        toggle.innerHTML = '<i class="fas fa-bug"></i> ẩn';
        updateDebugInfo();
    } else {
        debugInfo.style.display = 'none';
        toggle.innerHTML = '<i class="fas fa-bug"></i> Hiển thị thông tin debug';
    }
}

// Update debug info
function updateDebugInfo() {
    const debugContent = document.getElementById('debugContent');
    if (!debugContent || !currentAppData) return;
    
    debugContent.innerHTML = `
        <h4>Thông tin debug:</h4>
        <p><strong>App ID:</strong> ${appId}</p>
        <p><strong>Retry count:</strong> ${retryCount}/${MAX_RETRIES}</p>
        <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Screenshot1:</strong> ${currentAppData.screenshot1 || 'N/A'}</p>
        <p><strong>Screenshot2:</strong> ${currentAppData.screenshot2 || 'N/A'}</p>
        <p><strong>Screenshot3:</strong> ${currentAppData.screenshot3 || 'N/A'}</p>
        <button class="retry-btn" onclick="forceReload()" style="margin-top: 10px;">
            <i class="fas fa-sync-alt"></i>
            Tải lại dữ liệu
        </button>
    `;
}

// Force reload
function forceReload() {
    clearCache();
    retryCount = 0;
    loadAppDetail();
}

// Xử lý dữ liệu app
function processAppData(app) {
    console.log('🔍 Processing app data...');
    
    // Đảm bảo tất cả các trường cần thiết tồn tại
    app.viplink1 = app.viplink1 || '';
    app.downloadlink = app.downloadlink || '';
    app.categories = app.categories || 'other';
    
    // Xử lý screenshot
    const possibleKeys = {
        'screenshot1': ['screenshot1', 'Screenshot1', 'screenshot_1', 'image1', 'Image1'],
        'screenshot2': ['screenshot2', 'Screenshot2', 'screenshot_2', 'image2', 'Image2'],
        'screenshot3': ['screenshot3', 'Screenshot3', 'screenshot_3', 'image3', 'Image3']
    };
    
    // Tìm screenshot1
    let foundScreenshot1 = '';
    for (const key of possibleKeys.screenshot1) {
        if (app[key] && typeof app[key] === 'string' && app[key].trim() !== '') {
            foundScreenshot1 = app[key].trim();
            break;
        }
    }
    
    // Tìm screenshot2
    let foundScreenshot2 = '';
    for (const key of possibleKeys.screenshot2) {
        if (app[key] && typeof app[key] === 'string' && app[key].trim() !== '') {
            foundScreenshot2 = app[key].trim();
            break;
        }
    }
    
    // Tìm screenshot3
    let foundScreenshot3 = '';
    for (const key of possibleKeys.screenshot3) {
        if (app[key] && typeof app[key] === 'string' && app[key].trim() !== '') {
            foundScreenshot3 = app[key].trim();
            break;
        }
    }
    
    // Cách 2: Nếu không tìm thấy, thử lấy từ index của mảng
    if (!foundScreenshot1 && Array.isArray(app)) {
        if (app.length > 10) foundScreenshot1 = app[10] || '';
        if (app.length > 11) foundScreenshot2 = app[11] || '';
        if (app.length > 12) foundScreenshot3 = app[12] || '';
    }
    
    // Gán giá trị cuối cùng
    app.screenshot1 = foundScreenshot1;
    app.screenshot2 = foundScreenshot2;
    app.screenshot3 = foundScreenshot3;
    
    console.log('📸 Screenshot results:');
    console.log('- Screenshot 1:', app.screenshot1, 'Valid:', isValidImageUrl(app.screenshot1));
    console.log('- Screenshot 2:', app.screenshot2, 'Valid:', isValidImageUrl(app.screenshot2));
    console.log('- Screenshot 3:', app.screenshot3, 'Valid:', isValidImageUrl(app.screenshot3));
    
    return app;
}

// Tạo HTML cho mô tả
function createDescriptionHTML(description) {
    if (!description) {
        return '<div class="app-description-check">Ứng dụng chưa có mô tả chi tiết.</div>';
    }

    const lines = description.split('\n').filter(line => line.trim());
    
    let html = '<div class="app-description-check">';
    lines.forEach(line => {
        if (line.trim()) {
            html += `
                <div class="description-item">
                    <div class="check-icon-container">
                        <i class="fas fa-check"></i>
                    </div>
                    <span class="description-text">${line.trim()}</span>
                </div>
            `;
        }
    });
    html
