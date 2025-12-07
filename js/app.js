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
    }

    bindEvents() {
        // Search events
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value.toLowerCase().trim();
                this.renderApps();
            });
        }

        if (this.searchModalInput) {
            this.searchModalInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.trim();
                this.searchApps(searchTerm);
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
        this.loadAppsFromSheets();
    }

    async loadAppsFromSheets() {
        try {
            if (this.appsGrid) {
                AppUtils.showSkeletonLoading(this.appsGrid);
            }
            
            if (AppUtils.isCacheValid()) {
                const cachedApps = AppUtils.getFromCache();
                if (cachedApps && cachedApps.length > 0) {
                    console.log('✅ Đang tải từ cache...');
                    this.allApps = cachedApps;
                    this.renderApps();
                    this.fetchFreshData();
                    return;
                }
            }
            
            await this.fetchFreshData();
            
        } catch (error) {
            console.error('Lỗi khi tải ứng dụng:', error);
            const cachedApps = AppUtils.getFromCache();
            if (cachedApps && cachedApps.length > 0) {
                this.allApps = cachedApps;
                this.renderApps();
            } else if (this.appsGrid) {
                this.appsGrid.innerHTML = '<div class="loading"><p>Lỗi khi tải ứng dụng. Vui lòng thử lại sau.</p></div>';
            }
        }
    }

    async fetchFreshData() {
        try {
            console.log('🔄 Đang tải dữ liệu mới từ server...');
            const response = await fetch(`${CONFIG.GOOGLE_SCRIPT_URL}?action=getApps&t=${Date.now()}`);
            const result = await response.json();
            
            if (result.success) {
                // Xử lý dữ liệu để đảm bảo cấu trúc đúng
                this.allApps = result.data.map(app => {
                    // Đảm bảo app có categories
                    if (!app.categories) {
                        app.categories = 'other'; // Mặc định nếu không có categories
                    }
                    return app;
                });
                
                AppUtils.saveToCache(this.allApps);
                this.renderApps();
                console.log('✅ Dữ liệu mới đã được tải và cache');
                console.log('📊 Cấu trúc dữ liệu app đầu tiên:', this.allApps[0]);
            } else {
                throw new Error('Không thể tải dữ liệu');
            }
        } catch (error) {
            console.error('Lỗi khi fetch dữ liệu mới:', error);
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
                    app.categories && app.categories.includes('game')
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
        
        switch(this.currentView) {
            case 'today':
                const today = new Date().toLocaleDateString('vi-VN');
                filteredApps = this.allApps.filter(app => {
                    if (!app.updatedate) return false;
                    const appDate = new Date(app.updatedate).toLocaleDateString('vi-VN');
                    return appDate === today;
                });
                break;
            case 'games':
                filteredApps = this.allApps.filter(app => 
                    app.categories && app.categories.includes('game')
                );
                break;
            case 'home':
            default:
                if (this.currentCategory !== 'all') {
                    filteredApps = this.allApps.filter(app => 
                        app.categories && app.categories.includes(this.currentCategory)
                    );
                }
                break;
        }
        
        if (this.searchTerm) {
            filteredApps = filteredApps.filter(app => 
                app.name.toLowerCase().includes(this.searchTerm) ||
                (app.description && app.description.toLowerCase().includes(this.searchTerm))
            );
        }
        
        filteredApps.sort((a, b) => {
            const idA = parseInt(a.id) || 0;
            const idB = parseInt(b.id) || 0;
            return idB - idA;
        });
        
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
            }
            
            AppUtils.showNoResults(container, message);
            return;
        }
        
        apps.forEach(app => {
            const appCard = this.createAppCard(app);
            container.appendChild(appCard);
        });
    }

    createAppCard(app) {
        const appCard = document.createElement('div');
        appCard.className = 'app-card';
        
        const tagsHTML = AppUtils.createTagsHTML(app.categories);
        const formattedDate = AppUtils.formatDate(app.updatedate);
        
        // THAY ĐỔI QUAN TRỌNG: Sử dụng createShortDescriptionHTML thay vì createDescriptionHTML
        const descriptionHTML = AppUtils.createShortDescriptionHTML(app.description);
        
        appCard.innerHTML = `
            <img src="${app.image}" alt="${app.name}" class="app-logo" 
                 loading="lazy"
                 onerror="this.src='https://via.placeholder.com/70/2563eb/FFFFFF?text=App'">
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
    // Kiểm tra xem có các phần tử cần thiết cho trang chính không
    const appsGrid = document.getElementById('appsGrid');
    if (appsGrid) {
        window.appManager = new AppManager();
    }
});
