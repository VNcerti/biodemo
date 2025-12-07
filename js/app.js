// Main application logic
class AppManager {
    constructor() {
        this.currentCategory = 'all';
        this.currentView = 'home';
        this.allApps = [];
        this.searchTerm = '';
        
        this.initializeElements();
        this.bindEvents();
        this.init();
    }

    initializeElements() {
        this.appsGrid = document.getElementById('appsGrid');
        this.gamesGrid = document.getElementById('gamesGrid');
        this.gamesSection = document.getElementById('gamesSection');
        this.sectionTitle = document.getElementById('sectionTitle');
        this.searchInput = document.getElementById('searchInput');
        this.categoryCards = document.querySelectorAll('.category-card');
        this.navItems = document.querySelectorAll('.nav-item[data-view]');
        this.searchModal = document.getElementById('searchModal');
        this.searchModalInput = document.getElementById('searchModalInput');
        this.closeSearch = document.getElementById('closeSearch');
        this.searchResults = document.getElementById('searchResults');
        this.searchNavItem = document.getElementById('searchNavItem');
        
        // Thêm debounce cho search
        this.searchDebounceTimeout = null;
    }

    bindEvents() {
        // Search events với debounce
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value.toLowerCase().trim();
                
                // Debounce để tránh tìm kiếm quá nhiều
                clearTimeout(this.searchDebounceTimeout);
                this.searchDebounceTimeout = setTimeout(() => {
                    this.renderApps();
                }, 300);
            });
        }

        if (this.searchModalInput) {
            this.searchModalInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.trim();
                
                // Debounce cho modal search
                clearTimeout(this.searchDebounceTimeout);
                this.searchDebounceTimeout = setTimeout(() => {
                    this.searchApps(searchTerm);
                }, 300);
            });
        }

        // Category events
        this.categoryCards.forEach(card => {
            card.addEventListener('click', () => {
                const category = card.dataset.category;
                this.currentCategory = category;
                
                this.categoryCards.forEach(c => {
                    c.classList.toggle('active', c.dataset.category === category);
                });
                
                this.renderApps();
            });
        });

        // Navigation events
        this.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const view = item.dataset.view;
                
                if (view === 'search') {
                    this.openSearchModal();
                    return;
                }
                
                this.navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                
                this.currentView = view;
                this.renderApps();
            });
        });

        // Modal events
        if (this.searchModal) {
            this.searchModal.addEventListener('click', (e) => {
                if (e.target === this.searchModal) {
                    this.closeSearchModal();
                }
            });
        }

        if (this.closeSearch) {
            this.closeSearch.addEventListener('click', () => {
                this.closeSearchModal();
            });
        }
    }

    init() {
        console.log('🔄 Khởi tạo AppManager...');
        this.loadAppsFromSheets();
    }

    async loadAppsFromSheets() {
        try {
            console.log('📥 Đang tải ứng dụng từ Google Sheets...');
            
            // Hiển thị skeleton loading
            if (this.appsGrid) {
                AppUtils.showSkeletonLoading(this.appsGrid);
            }
            
            // Kiểm tra cache trước
            if (AppUtils.isCacheValid()) {
                const cachedApps = AppUtils.getFromCache();
                if (cachedApps && cachedApps.length > 0) {
                    console.log('✅ Đang tải từ cache...', cachedApps.length, 'apps');
                    this.allApps = cachedApps;
                    this.renderApps();
                    // Vẫn fetch dữ liệu mới ở background
                    this.fetchFreshData();
                    return;
                }
            }
            
            // Nếu không có cache hoặc cache hết hạn, fetch mới
            await this.fetchFreshData();
            
        } catch (error) {
            console.error('❌ Lỗi khi tải ứng dụng:', error);
            
            // Thử load từ cache nếu có
            const cachedApps = AppUtils.getFromCache();
            if (cachedApps && cachedApps.length > 0) {
                console.log('⚠️ Lỗi fetch, đang dùng cache...');
                this.allApps = cachedApps;
                this.renderApps();
            } else if (this.appsGrid) {
                AppUtils.showError(this.appsGrid, 'Không thể tải dữ liệu ứng dụng. Vui lòng kiểm tra kết nối mạng.');
            }
        }
    }

    async fetchFreshData() {
        try {
            console.log('🔄 Đang tải dữ liệu mới từ server...');
            
            // Thêm timestamp để tránh cache
            const timestamp = Date.now();
            const url = `${CONFIG.GOOGLE_SCRIPT_URL}?action=getApps&t=${timestamp}&nocache=true`;
            console.log('📡 Fetch URL:', url);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            });
            
            console.log('📦 Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            console.log('📊 Server response success:', result.success);
            
            if (result.success && result.data) {
                console.log('📱 Data received:', result.data.length, 'apps');
                
                // Xử lý dữ liệu để đảm bảo cấu trúc đúng
                this.allApps = result.data.map((app, index) => {
                    // Đảm bảo app có các trường cần thiết
                    return {
                        id: app.id || index + 1,
                        name: app.name || `Ứng dụng ${index + 1}`,
                        description: app.description || 'Chưa có mô tả',
                        image: app.image || 'https://via.placeholder.com/70/2563eb/FFFFFF?text=App',
                        categories: app.categories || 'other',
                        updatedate: app.updatedate || new Date().toISOString(),
                        developer: app.developer || 'Nhà phát triển',
                        version: app.version || '1.0.0',
                        downloadlink: app.downloadlink || '#',
                        viplink1: app.viplink1 || '',
                        screenshot1: app.screenshot1 || '',
                        screenshot2: app.screenshot2 || '',
                        screenshot3: app.screenshot3 || ''
                    };
                });
                
                console.log('✅ Dữ liệu đã được xử lý:', this.allApps.length, 'apps');
                console.log('📱 App đầu tiên:', this.allApps[0]);
                
                // Lưu vào cache
                AppUtils.saveToCache(this.allApps);
                
                // Render apps
                this.renderApps();
                
                console.log('✅ Dữ liệu mới đã được tải và cache');
            } else {
                throw new Error(result.message || 'Dữ liệu không hợp lệ từ server');
            }
        } catch (error) {
            console.error('💥 Lỗi khi fetch dữ liệu mới:', error);
            throw error;
        }
    }

    openSearchModal() {
        if (this.searchModal) {
            this.searchModal.style.display = 'block';
            setTimeout(() => {
                if (this.searchModalInput) {
                    this.searchModalInput.focus();
                }
            }, 100);
        }
    }

    closeSearchModal() {
        if (this.searchModal) {
            this.searchModal.style.display = 'none';
            if (this.searchModalInput) {
                this.searchModalInput.value = '';
            }
            if (this.searchResults) {
                this.searchResults.innerHTML = '';
            }
        }
    }

    searchApps(searchTerm) {
        if (!this.searchResults) return;
        
        if (!searchTerm.trim()) {
            this.searchResults.innerHTML = '<div class="no-results"><p>Nhập từ khóa để tìm kiếm</p></div>';
            return;
        }

        const filteredApps = this.allApps.filter(app => 
            app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (app.description && app.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        if (filteredApps.length === 0) {
            this.searchResults.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <p>Không tìm thấy ứng dụng nào với từ khóa "${searchTerm}"</p>
                </div>
            `;
        } else {
            this.displayApps(filteredApps, this.searchResults);
        }
    }

    renderApps() {
        let filteredApps = this.filterApps();
        this.updateSectionTitle();
        
        if (this.appsGrid) {
            this.displayApps(filteredApps, this.appsGrid);
        }
        
        if (this.gamesSection && this.gamesGrid) {
            if (this.currentView === 'home' && this.currentCategory === 'all' && !this.searchTerm) {
                this.gamesSection.style.display = 'block';
                const games = this.allApps.filter(app => 
                    app.categories && (app.categories.includes('game') || 
                                      (typeof app.categories === 'string' && app.categories.includes('game')))
                );
                this.displayApps(games, this.gamesGrid);
            } else {
                this.gamesSection.style.display = 'none';
                this.gamesGrid.innerHTML = '';
            }
        }
    }

    filterApps() {
        let filteredApps = this.allApps;
        
        // Lọc theo view
        switch(this.currentView) {
            case 'today':
                const today = new Date().toLocaleDateString('vi-VN');
                filteredApps = this.allApps.filter(app => {
                    if (!app.updatedate) return false;
                    try {
                        const appDate = new Date(app.updatedate).toLocaleDateString('vi-VN');
                        return appDate === today;
                    } catch (e) {
                        return false;
                    }
                });
                break;
                
            case 'games':
                filteredApps = this.allApps.filter(app => {
                    if (!app.categories) return false;
                    if (Array.isArray(app.categories)) {
                        return app.categories.includes('game');
                    } else if (typeof app.categories === 'string') {
                        return app.categories.includes('game');
                    }
                    return false;
                });
                break;
                
            case 'home':
            default:
                if (this.currentCategory !== 'all') {
                    filteredApps = this.allApps.filter(app => {
                        if (!app.categories) return false;
                        if (Array.isArray(app.categories)) {
                            return app.categories.includes(this.currentCategory);
                        } else if (typeof app.categories === 'string') {
                            return app.categories.includes(this.currentCategory);
                        }
                        return false;
                    });
                }
                break;
        }
        
        // Lọc theo search term
        if (this.searchTerm) {
            filteredApps = filteredApps.filter(app => 
                app.name.toLowerCase().includes(this.searchTerm) ||
                (app.description && app.description.toLowerCase().includes(this.searchTerm))
            );
        }
        
        // Sắp xếp theo ID giảm dần (mới nhất lên đầu)
        filteredApps.sort((a, b) => {
            const idA = parseInt(a.id) || 0;
            const idB = parseInt(b.id) || 0;
            return idB - idA;
        });
        
        console.log('🔍 Filtered apps:', filteredApps.length);
        return filteredApps;
    }

    updateSectionTitle() {
        if (!this.sectionTitle) return;
        
        let title = 'Ứng dụng mới';
        
        if (this.searchTerm) {
            title = `Kết quả tìm kiếm: "${this.searchTerm}"`;
        } else if (this.currentView === 'today') {
            title = 'Ứng dụng hôm nay';
        } else if (this.currentView === 'games') {
            title = 'Trò chơi';
        } else if (this.currentCategory !== 'all') {
            title = CONFIG.CATEGORY_LABELS[this.currentCategory] || this.currentCategory;
        }
        
        this.sectionTitle.textContent = title;
    }

    displayApps(apps, container) {
        if (!container) return;
        
        container.innerHTML = '';
        
        if (apps.length === 0) {
            let message = 'Không có ứng dụng nào.';
            
            if (this.searchTerm) {
                message = `Không tìm thấy ứng dụng nào với từ khóa "${this.searchTerm}"`;
            } else if (this.currentView === 'today') {
                const today = new Date().toLocaleDateString('vi-VN');
                message = `Không có ứng dụng nào được đăng vào ${today}`;
            } else if (this.currentCategory !== 'all') {
                message = `Không có ứng dụng nào trong thể loại "${CONFIG.CATEGORY_LABELS[this.currentCategory] || this.currentCategory}"`;
            }
            
            AppUtils.showNoResults(container, message);
            return;
        }
        
        console.log('🎨 Hiển thị', apps.length, 'apps');
        
        apps.forEach(app => {
            const appCard = this.createAppCard(app);
            container.appendChild(appCard);
        });
    }

    createAppCard(app) {
        const appCard = document.createElement('div');
        appCard.className = 'app-card';
        appCard.dataset.appId = app.id;
        
        const tagsHTML = AppUtils.createTagsHTML(app.categories);
        const formattedDate = AppUtils.formatDate(app.updatedate);
        const descriptionHTML = AppUtils.createShortDescriptionHTML(app.description);
        
        appCard.innerHTML = `
            <img src="${app.image}" 
                 alt="${app.name}" 
                 class="app-logo" 
                 loading="lazy"
                 onerror="this.onerror=null; this.src='https://via.placeholder.com/70/2563eb/FFFFFF?text=App';">
            <div class="app-content">
                <div class="app-header">
                    <div class="app-info">
                        <div class="app-name">${app.name}</div>
                        <div class="app-tags">${tagsHTML}</div>
                        <div class="app-meta">
                            <div class="app-meta-item">
                                <i class="fas fa-clock"></i>
                                <span>${formattedDate}</span>
                            </div>
                        </div>
                    </div>
                    <div class="app-actions">
                        <button class="download-btn" onclick="window.location.href='app-detail.html?id=${app.id}'">
                            <i class="fas fa-download"></i>
                            Tải về
                        </button>
                    </div>
                </div>
                ${descriptionHTML}
            </div>
        `;
        
        return appCard;
    }
}

// Khởi tạo ứng dụng khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM loaded, khởi tạo AppManager...');
    
    // Áp dụng theme
    applyThemeFromStorage();
    
    // Kiểm tra xem có các phần tử cần thiết cho trang chính không
    const appsGrid = document.getElementById('appsGrid');
    if (appsGrid) {
        window.appManager = new AppManager();
    } else {
        console.log('⚠️ Không tìm thấy appsGrid, có thể đang ở trang khác');
    }
});

// Thêm hàm global để debug
window.debugAppManager = function() {
    if (window.appManager) {
        console.log('🔍 AppManager debug info:');
        console.log('- Total apps:', window.appManager.allApps.length);
        console.log('- Current category:', window.appManager.currentCategory);
        console.log('- Current view:', window.appManager.currentView);
        console.log('- Search term:', window.appManager.searchTerm);
        console.log('- First 3 apps:', window.appManager.allApps.slice(0, 3));
    } else {
        console.log('❌ AppManager not initialized');
    }
};

// Clear cache function
window.clearAppCache = function() {
    AppUtils.clearCache();
    alert('✅ Đã xoá cache. Tải lại trang để tải dữ liệu mới.');
    window.location.reload();
};
