// Configuration variables - KHÔNG CHIA SẺ FILE NÀY
const CONFIG = {
    GOOGLE_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbywHM36jEQpXFXzBTdG-EcbdbKWbtMyKeOSjNwUt-XahtstAmm1F_R2fr8JWUms_A1jsQ/exec',
    CACHE_KEY: 'xspace_apps_cache',
    CACHE_TIMESTAMP_KEY: 'xspace_cache_timestamp',
    CACHE_DURATION: 30 * 60 * 1000, // 30 phút
    CATEGORY_LABELS: {
        'game': 'Trò chơi',
        'social': 'Mạng xã hội',
        'entertainment': 'Giải trí',
        'photo': 'Chụp ảnh',
        'clone': 'Nhân bản',
        'premium': 'Mở khoá Premium'
    },
    
    // Thêm các URL khác vào đây
    VIETQR_BASE_URL: 'https://img.vietqr.io/image/mbbank-311435-compact2.png',
    
    // Firebase Configuration
    FIREBASE_CONFIG: {
        apiKey: "AIzaSyC9VMDowjZ05A-ZqycaFYI5CtRcjazdZm4",
        authDomain: "ioscert-appstore.firebaseapp.com",
        databaseURL: "https://ioscert-appstore-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "ioscert-appstore",
        storageBucket: "ioscert-appstore.firebasestorage.app",
        messagingSenderId: "798453453536",
        appId: "1:798453453536:web:965eeebcbf3b043ea1b685",
        measurementId: "G-EP3FHT2B4B"
    }
};
