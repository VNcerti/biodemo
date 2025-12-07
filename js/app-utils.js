// Utility functions for app management
class AppUtils {
    // Cache management
    static saveToCache(apps) {
        try {
            localStorage.setItem(CONFIG.CACHE_KEY, JSON.stringify(apps));
            localStorage.setItem(CONFIG.CACHE_TIMESTAMP_KEY, Date.now().toString());
            console.log('✅ Đã lưu vào cache:', apps.length, 'apps');
        } catch (e) {
            console.error('Lỗi khi lưu cache:', e);
        }
    }
    
    static getFromCache() {
        try {
            const cachedData = localStorage.getItem(CONFIG.CACHE_KEY);
            return cachedData ? JSON.parse(cachedData) : null;
        } catch (e) {
            console.error('Lỗi khi đọc cache:', e);
            return null;
        }
    }
    
    static isCacheValid() {
        try {
            const timestamp = localStorage.getItem(CONFIG.CACHE_TIMESTAMP_KEY);
            if (!timestamp) return false;
            
            const cacheAge = Date.now() - parseInt(timestamp);
            return cacheAge < CONFIG.CACHE_DURATION;
        } catch (e) {
            return false;
        }
    }
    
    static clearCache() {
        try {
            localStorage.removeItem(CONFIG.CACHE_KEY);
            localStorage.removeItem(CONFIG.CACHE_TIMESTAMP_KEY);
            console.log('✅ Đã xoá cache');
        } catch (e) {
            console.error('Lỗi khi xoá cache:', e);
        }
    }
    
    // Formatting functions
    static formatDate(dateString) {
        if (!dateString) return 'Chưa cập nhật';
        
        try {
            // Handle ISO format (2025-11-24T17:00:00.000Z)
            if (dateString.includes('T')) {
                const date = new Date(dateString);
                // Add one day to fix the timezone issue
                date.setDate(date.getDate() + 1);
                return date.toLocaleDateString('vi-VN');
            }
            
            // Handle dd/mm/yyyy format
            if (dateString.includes('/')) {
                return dateString;
            }
            
            return dateString;
        } catch (e) {
            return dateString;
        }
    }
    
    // Create tags HTML from categories
    static createTagsHTML(categories) {
        if (!categories) return '';
        
        let categoriesArray = [];
        if (typeof categories === 'string') {
            categoriesArray = categories.split(',');
        } else if (Array.isArray(categories)) {
            categoriesArray = categories;
        }
        
        if (categoriesArray.length === 0) return '';
        
        return categoriesArray.map(cat => 
            `<span class="app-tag">${CONFIG.CATEGORY_LABELS[cat] || cat}</span>`
        ).join('');
    }
    
    // Create short description HTML (for app cards)
    static createShortDescriptionHTML(description) {
        if (!description) return '<div class="app-description">Ứng dụng chưa có mô tả.</div>';
        
        // Lấy dòng đầu tiên hoặc cắt ngắn mô tả
        const firstLine = description.split('\n')[0];
        const shortDescription = firstLine.length > 100 
            ? firstLine.substring(0, 100) + '...' 
            : firstLine;
        
        return `<div class="app-description">${shortDescription}</div>`;
    }
    
    // Create full description HTML (for app detail page)
    static createDescriptionHTML(description) {
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
        html += '</div>';
        return html;
    }
    
    // Show skeleton loading
    static showSkeletonLoading(container) {
        if (!container) return;
        
        container.innerHTML = `
            ${Array(6).fill().map(() => `
                <div class="app-card skeleton">
                    <div class="app-logo skeleton"></div>
                    <div class="app-content">
                        <div class="skeleton-line" style="width: 70%"></div>
                        <div class="skeleton-line" style="width: 50%"></div>
                        <div class="skeleton-line" style="width: 60%"></div>
                    </div>
                </div>
            `).join('')}
        `;
    }
    
    // Show no results message
    static showNoResults(container, message) {
        if (!container) return;
        
        container.innerHTML = `
            <div class="no-results">
                <div class="no-results-icon">
                    <i class="fas fa-search"></i>
                </div>
                <div class="no-results-text">
                    <h3>Không tìm thấy kết quả</h3>
                    <p>${message}</p>
                </div>
            </div>
        `;
    }
    
    // Show error message
    static showError(container, message) {
        if (!container) return;
        
        container.innerHTML = `
            <div class="error-message">
                <div class="error-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3>Lỗi khi tải dữ liệu</h3>
                <p>${message}</p>
                <button class="retry-btn" onclick="window.location.reload()" style="margin-top: 15px;">
                    <i class="fas fa-redo"></i>
                    Thử lại
                </button>
            </div>
        `;
    }
}
