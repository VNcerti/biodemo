// ==================== PAYMENT FUNCTIONS ====================

// DOM Elements
const userInfoCard = document.getElementById('userInfoCard');
const packagesContainer = document.getElementById('packagesContainer');
const paymentInfo = document.getElementById('paymentInfo');
const thankYouPage = document.getElementById('thankYouPage');
const userAvatar = document.getElementById('userAvatar');
const userName = document.getElementById('userName');
const userDisplayName = document.getElementById('userDisplayName');
const userStatus = document.getElementById('userStatus');
const userMessage = document.getElementById('userMessage');
const backToPlanBtn = document.getElementById('backToPlanBtn');
const confirmPaymentBtn = document.getElementById('confirmPaymentBtn');
const contactSupportBtn = document.getElementById('contactSupportBtn');
const selectedPlanName = document.getElementById('selectedPlanName');
const selectedPlanPrice = document.getElementById('selectedPlanPrice');
const bankAccount = document.getElementById('bankAccount');
const paymentNote = document.getElementById('paymentNote');
const paymentAmount = document.getElementById('paymentAmount');

// QR Code Elements
const qrCodeContainer = document.getElementById('qrCodeContainer');
const qrLoading = document.getElementById('qrLoading');
const qrCodeImage = document.getElementById('qrCodeImage');

// Discount Elements
const discountCodeInput = document.getElementById('discountCode');
const applyDiscountBtn = document.getElementById('applyDiscountBtn');
const discountMessage = document.getElementById('discountMessage');
const discountInfo = document.getElementById('discountInfo');
const discountAmount = document.getElementById('discountAmount');
const finalAmount = document.getElementById('finalAmount');

// Variables to remember scroll position
let scrollPosition = 0;
let selectedPackageId = '';

// Plan data với packageType
const planData = {
    trial: { 
        name: 'Trial Package', 
        price: 59000, 
        displayPrice: '59.000đ',
        duration: '1 tháng sử dụng không giới hạn',
        packageType: 'trial',
        durationDays: 30
    },
    basic: { 
        name: 'Basic Package', 
        price: 129000,
        displayPrice: '129.000đ',
        duration: '3 tháng sử dụng không giới hạn',
        packageType: 'basic', 
        durationDays: 90
    },
    plus: { 
        name: 'Plus Package', 
        price: 219000,
        displayPrice: '219.000đ',
        duration: '6 tháng sử dụng không giới hạn',
        packageType: 'plus',
        durationDays: 180
    },
    premium: { 
        name: 'Premium Package', 
        price: 249000,
        displayPrice: '249.000đ',
        duration: '1 năm sử dụng không giới hạn',
        packageType: 'premium',
        durationDays: 365
    }
};

// Selected plan
let selectedPlan = null;
let currentDiscount = null;
let originalPrice = 0;
let finalPrice = 0;
let isActivationCode = false;

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = getCurrentUser();
    
    if (currentUser) {
        // Load user info
        loadUserInfo(currentUser);
        
        // Check if user already has premium
        if (isUserPremium(currentUser)) {
            userMessage.innerHTML = `Xin chào <strong>${currentUser.username}</strong>, tài khoản của bạn đã là Premium.`;
            userStatus.innerHTML = '<i class="fas fa-crown"></i><span>Tài khoản Premium</span>';
            userStatus.className = 'user-status premium';
        } else {
            userMessage.innerHTML = `Xin chào <strong>${currentUser.username}</strong>, hãy chọn gói Premium muốn nâng cấp.`;
            
            // Update payment note with username
            const paymentNoteText = `PAY ${currentUser.username.toUpperCase()}`;
            paymentNote.textContent = paymentNoteText;
            document.querySelectorAll('[data-copy="PAY ADMIN"]').forEach(btn => {
                btn.setAttribute('data-copy', paymentNoteText);
            });
        }
    } else {
        // Redirect to login if not logged in
        window.location.href = 'account.html';
    }

    // Upgrade button click
    document.querySelectorAll('.upgrade-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const plan = this.getAttribute('data-plan');
            selectedPackageId = this.closest('.package-card').id;
            selectPlan(plan);
        });
    });

    // Back to plan selection
    backToPlanBtn.addEventListener('click', function() {
        paymentInfo.classList.remove('active');
        packagesContainer.style.display = 'block';
        userInfoCard.style.display = 'block';
        document.getElementById('welcomeSection').style.display = 'block';
        
        if (selectedPackageId) {
            const packageElement = document.getElementById(selectedPackageId);
            if (packageElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const packagePosition = packageElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                window.scrollTo(0, packagePosition);
            }
        }
    });

    // Apply discount code
    applyDiscountBtn.addEventListener('click', async function() {
        const code = discountCodeInput.value.trim();
        
        if (!code) {
            showDiscountMessage('Vui lòng nhập mã', 'error');
            return;
        }
        
        applyDiscountBtn.innerHTML = '<div class="loading"></div>';
        applyDiscountBtn.disabled = true;
        
        try {
            const response = await fetch(`${CONFIG.GOOGLE_SCRIPT_URL}?action=validateCode&code=${encodeURIComponent(code)}`);
            const result = await response.json();
            
            if (result.success) {
                if (result.type === 'discount') {
                    await applyDiscount(result.data);
                } else if (result.type === 'activation') {
                    await applyActivationCode(result.data);
                }
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            showDiscountMessage(error.message, 'error');
        } finally {
            applyDiscountBtn.innerHTML = '<i class="fas fa-tag"></i> Áp dụng';
            applyDiscountBtn.disabled = false;
        }
    });

    // Confirm payment
    confirmPaymentBtn.addEventListener('click', function() {
        if (isActivationCode) {
            paymentInfo.classList.remove('active');
            thankYouPage.style.display = 'block';
        } else {
            paymentInfo.classList.remove('active');
            thankYouPage.style.display = 'block';
        }
        
        thankYouPage.scrollIntoView(true);
    });

    // Contact support
    contactSupportBtn.addEventListener('click', function() {
        window.open('https://t.me/m/Qnw6Bzy6MzM1', '_blank');
    });

    // Copy to clipboard functionality
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const textToCopy = this.getAttribute('data-copy');
            
            const textarea = document.createElement('textarea');
            textarea.value = textToCopy;
            document.body.appendChild(textarea);
            
            textarea.select();
            document.execCommand('copy');
            
            document.body.removeChild(textarea);
            
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-check"></i> Đã sao chép';
            
            setTimeout(() => {
                this.innerHTML = originalText;
            }, 2000);
        });
    });
});

// Select plan function
function selectPlan(plan) {
    if (plan) {
        selectedPlan = plan;
        
        // Update payment info
        selectedPlanName.textContent = planData[plan].name;
        selectedPlanPrice.textContent = planData[plan].displayPrice;
        paymentAmount.textContent = planData[plan].displayPrice;
        
        // Reset discount state
        resetDiscountState();
        
        // Hide welcome section, user info, and packages when showing payment info
        document.getElementById('welcomeSection').style.display = 'none';
        userInfoCard.style.display = 'none';
        packagesContainer.style.display = 'none';
        
        // Show payment info
        paymentInfo.classList.add('active');
        
        // Generate QR code với thông tin mới
        generateQRCode(planData[plan].price);
        
        window.scrollTo(0, 0);
    }
}

// Generate QR Code với API VietQR
function generateQRCode(amount) {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    qrLoading.style.display = 'flex';
    qrCodeImage.style.display = 'none';
    
    const username = currentUser.username.toUpperCase();
    const paymentDescription = `PAY ${username}`;
    const encodedDescription = encodeURIComponent(paymentDescription);
    
    // Sử dụng URL từ CONFIG
    const qrUrl = `${CONFIG.VIETQR_BASE_URL}?amount=${amount}&addInfo=${encodedDescription}&accountName=VU%20TUNG%20LAM`;
    
    qrCodeImage.onload = function() {
        qrLoading.style.display = 'none';
        qrCodeImage.style.display = 'block';
    };
    
    qrCodeImage.onerror = function() {
        qrLoading.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Không thể tải mã QR';
        qrCodeImage.style.display = 'none';
    };
    
    qrCodeImage.src = qrUrl;
    
    paymentNote.textContent = paymentDescription;
    
    document.querySelectorAll('[data-copy="PAY ADMIN"]').forEach(btn => {
        btn.setAttribute('data-copy', paymentDescription);
    });
}

// Update QR code khi có giảm giá
function updateQRCodeWithDiscount() {
    if (!selectedPlan || !currentDiscount || isActivationCode) return;
    
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    qrLoading.style.display = 'flex';
    qrCodeImage.style.display = 'none';
    
    const username = currentUser.username.toUpperCase();
    const paymentDescription = `PAY ${username}`;
    const encodedDescription = encodeURIComponent(paymentDescription);
    
    const qrUrl = `${CONFIG.VIETQR_BASE_URL}?amount=${finalPrice}&addInfo=${encodedDescription}&accountName=VU%20TUNG%20LAM`;
    
    qrCodeImage.onload = function() {
        qrLoading.style.display = 'none';
        qrCodeImage.style.display = 'block';
    };
    
    qrCodeImage.onerror = function() {
        qrLoading.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Không thể tải mã QR';
        qrCodeImage.style.display = 'none';
    };
    
    qrCodeImage.src = qrUrl;
}

// Apply discount
async function applyDiscount(discountData) {
    currentDiscount = discountData;
    isActivationCode = false;
    
    originalPrice = planData[selectedPlan].price;
    const discountValue = Math.round((originalPrice * discountData.discount_percent) / 100);
    finalPrice = originalPrice - discountValue;
    
    discountAmount.textContent = `-${formatCurrency(discountValue)}`;
    finalAmount.textContent = formatCurrency(finalPrice);
    paymentAmount.textContent = formatCurrency(finalPrice);
    
    discountInfo.style.display = 'block';
    
    updateQRCodeWithDiscount();
    
    showDiscountMessage(`✅ Áp dụng mã giảm giá ${discountData.discount_percent}% thành công!`, 'success');
    
    await useDiscountCode(discountData.code);
}

// Apply activation code
async function applyActivationCode(activationData) {
    isActivationCode = true;
    
    document.querySelector('.qr-section').style.display = 'none';
    document.querySelector('.bank-info').style.display = 'none';
    
    showDiscountMessage(`✅ Kích hoạt thành công! Gói ${activationData.package_type.toUpperCase()} đã được kích hoạt.`, 'success');
    
    confirmPaymentBtn.innerHTML = '<i class="fas fa-check-circle"></i> Hoàn tất kích hoạt';
    
    selectedPlanName.textContent = `Gói ${activationData.package_type.toUpperCase()} (Kích hoạt)`;
    selectedPlanPrice.textContent = '0đ';
    paymentAmount.textContent = '0đ';
    
    discountAmount.textContent = '-100%';
    finalAmount.textContent = '0đ';
    discountInfo.style.display = 'block';
    
    const currentUser = getCurrentUser();
    if (currentUser) {
        await useActivationCode(activationData.code, currentUser.email);
        
        await upgradeUserWithActivation(currentUser.email, activationData.duration_days);
    }
}

// Use discount code
async function useDiscountCode(code) {
    try {
        const response = await fetch(CONFIG.GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({
                action: 'useDiscountCode',
                code: code
            })
        });
        
        const result = await response.json();
        if (!result.success) {
            console.error('Lỗi khi sử dụng mã giảm giá:', result.message);
        }
    } catch (error) {
        console.error('Lỗi khi sử dụng mã giảm giá:', error);
    }
}

// Use activation code
async function useActivationCode(code, userEmail) {
    try {
        const response = await fetch(CONFIG.GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({
                action: 'useActivationCode',
                code: code,
                userEmail: userEmail
            })
        });
        
        const result = await response.json();
        if (!result.success) {
            console.error('Lỗi khi sử dụng mã kích hoạt:', result.message);
        }
    } catch (error) {
        console.error('Lỗi khi sử dụng mã kích hoạt:', error);
    }
}

// Upgrade user with activation code
async function upgradeUserWithActivation(email, durationDays) {
    try {
        const response = await fetch(CONFIG.GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({
                action: 'upgradeUser',
                data: { email: email, durationDays: durationDays }
            })
        });
        
        const result = await response.json();
        if (result.success) {
            console.log('✅ Nâng cấp tài khoản thành công:', result.message);
        } else {
            console.error('❌ Lỗi nâng cấp tài khoản:', result.message);
        }
    } catch (error) {
        console.error('❌ Lỗi nâng cấp tài khoản:', error);
    }
}

// Reset discount state
function resetDiscountState() {
    currentDiscount = null;
    isActivationCode = false;
    discountCodeInput.value = '';
    discountInfo.style.display = 'none';
    discountMessage.style.display = 'none';
    document.querySelector('.qr-section').style.display = 'block';
    document.querySelector('.bank-info').style.display = 'block';
    confirmPaymentBtn.innerHTML = '<i class="fas fa-check-circle"></i> Xác nhận đã thanh toán';
}

// Show discount message
function showDiscountMessage(message, type) {
    discountMessage.textContent = message;
    discountMessage.className = `message message-${type}`;
    discountMessage.style.display = 'flex';
}

// Load user info for payment page
function loadUserInfo(userData) {
    userName.textContent = userData.username;
    userDisplayName.textContent = userData.username;
    
    const firstLetter = userData.username.charAt(0).toUpperCase();
    userAvatar.innerHTML = firstLetter;
    
    const packageInfo = {
        'free': { name: 'Miễn phí', class: 'free', icon: 'fas fa-user' },
        'trial': { name: 'Trial', class: 'trial', icon: 'fas fa-star' },
        'basic': { name: 'Basic', class: 'basic', icon: 'fas fa-crown' },
        'plus': { name: 'Plus', class: 'plus', icon: 'fas fa-crown' },
        'premium': { name: 'Premium', class: 'premium', icon: 'fas fa-crown' }
    };
    
    const currentPackage = packageInfo[userData.packageType] || packageInfo.free;
    userStatus.innerHTML = `<i class="${currentPackage.icon}"></i><span>Tài khoản ${currentPackage.name}</span>`;
    userStatus.className = `user-status ${currentPackage.class}`;
}
