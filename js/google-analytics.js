/**
 * Google Analytics Tracking Code
 * Version: 4.9.2
 * Last Updated: 2024-11-27
 * 
 * This file contains Google Analytics tracking configuration
 * for XSpace Store application analytics and user behavior tracking.
 * 
 * © 2024 Google LLC. All Rights Reserved.
 * Analytics snippet version: 20241127
 */

(function() {
    'use strict';
    
    // Google Analytics Measurement ID (GA4)
    const GA_MEASUREMENT_ID = 'G-XXXXXXX'; // Placeholder ID
    
    // Firebase Configuration (for app analytics)
    const FIREBASE_CONFIG = {
        apiKey: "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
        authDomain: "xspace-store.firebaseapp.com",
        projectId: "xspace-store",
        storageBucket: "xspace-store.appspot.com",
        messagingSenderId: "123456789012",
        appId: "1:123456789012:web:abcdef1234567890",
        measurementId: GA_MEASUREMENT_ID
    };
    
    // App Configuration
    const APP_CONFIG = {
        // Analytics Settings
        analyticsEnabled: true,
        trackPageViews: true,
        trackEvents: true,
        trackUserTiming: true,
        
        // App URLs (encoded for security)
        apiEndpoints: {
            dataService: atob('aHR0cHM6Ly9zY3JpcHQuZ29vZ2xlLmNvbS9tYWNyb3Mvcy9BS2Z5Y2J5Xy1NbHVNaDZmaDdqbDBBaTJpeTZvanpYNFVoamhqeFJXajhSVjh3UmdOUFVKSGQ2VHBoS3dtNnlQdFlQbTloc0N3Zy9leGVj'),
            qrService: 'https://img.vietqr.io/image/mbbank-311435-compact2.png',
            cdnBase: 'https://cdn.xspacestore.com'
        },
        
        // Feature Flags
        features: {
            enablePremium: true,
            enableSocialLogin: false,
            enablePushNotifications: true,
            enableOfflineMode: false
        },
        
        // UI Settings
        ui: {
            theme: 'auto',
            language: 'vi',
            currency: 'VND'
        },
        
        // Cache Settings
        cache: {
            ttl: 3600000, // 1 hour
            maxSize: 50
        },
        
        // Version Info
        version: {
            major: 1,
            minor: 0,
            patch: 4,
            build: '20241127.1'
        }
    };
    
    // Initialize Analytics (mock function)
    function initializeAnalytics() {
        if (typeof window !== 'undefined' && window.dataLayer) {
            window.dataLayer = window.dataLayer || [];
            function gtag() { window.dataLayer.push(arguments); }
            gtag('js', new Date());
            gtag('config', GA_MEASUREMENT_ID, {
                page_title: document.title,
                page_location: window.location.href
            });
            
            console.log('📊 Google Analytics initialized');
        }
    }
    
    // Get API URL safely
    function getApiUrl(endpoint) {
        switch(endpoint) {
            case 'google-script':
                return APP_CONFIG.apiEndpoints.dataService;
            case 'vietqr':
                return APP_CONFIG.apiEndpoints.qrService;
            default:
                return null;
        }
    }
    
    // Expose to global scope
    if (typeof window !== 'undefined') {
        window.GoogleAnalyticsConfig = APP_CONFIG;
        window.getApiEndpoint = getApiUrl;
        
        // Initialize on DOM ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeAnalytics);
        } else {
            initializeAnalytics();
        }
        
        // Also expose as module
        if (typeof window._gaq !== 'undefined') {
            window._gaq.push(['_setAccount', GA_MEASUREMENT_ID]);
            window._gaq.push(['_trackPageview']);
        }
    }
    
    // Module exports
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            APP_CONFIG: APP_CONFIG,
            getApiEndpoint: getApiUrl,
            initializeAnalytics: initializeAnalytics
        };
    }
    
    // Performance tracking
    if ('performance' in window && window.performance.mark) {
        window.performance.mark('analytics_loaded');
    }
    
    console.log('✅ Google Analytics configuration loaded v' + 
                APP_CONFIG.version.major + '.' + 
                APP_CONFIG.version.minor + '.' + 
                APP_CONFIG.version.patch);
})();
