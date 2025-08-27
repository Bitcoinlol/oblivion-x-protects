// Oblivion X Protects - Login System
let freeTrialUsed = false;
let generatedKeys = new Set();

// Disable right-click and keyboard shortcuts
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('keydown', function(e) {
    if (e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.shiftKey && e.key === 'C') ||
        (e.ctrlKey && e.key === 'u')) {
        e.preventDefault();
    }
});

// Panel switching functions
function showSignupPanel() {
    document.querySelector('.login-container').style.display = 'none';
    document.getElementById('signupPanel').style.display = 'flex';
    document.getElementById('existingAccountPanel').style.display = 'none';
}

function showLoginPanel() {
    document.querySelector('.login-container').style.display = 'flex';
    document.getElementById('signupPanel').style.display = 'none';
    document.getElementById('existingAccountPanel').style.display = 'none';
}

function showExistingAccountPanel() {
    document.querySelector('.login-container').style.display = 'none';
    document.getElementById('signupPanel').style.display = 'none';
    document.getElementById('existingAccountPanel').style.display = 'flex';
}

// Notification system
function showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in forwards';
        setTimeout(() => {
            container.removeChild(notification);
        }, 300);
    }, 3000);
}

// Generate random API key
function generateApiKey(duration) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `OX_${duration}_${result}`;
}

// Free trial function
function getFreeTrial() {
    const userIP = 'user_ip_placeholder'; // In real implementation, get actual IP
    
    if (localStorage.getItem('freeTrialUsed') || freeTrialUsed) {
        showNotification('You already have a key sorry', 'error');
        return;
    }
    
    const freeKey = generateApiKey('30D');
    generatedKeys.add(freeKey);
    
    // Copy to clipboard
    navigator.clipboard.writeText(freeKey).then(() => {
        showNotification('Copied 30 day free api key', 'success');
        localStorage.setItem('freeTrialUsed', 'true');
        localStorage.setItem('freeTrialKey', freeKey);
        freeTrialUsed = true;
        
        // Auto-fill the API key field
        document.getElementById('signupApiKey').value = freeKey;
    }).catch(() => {
        showNotification('Failed to copy key. Please copy manually: ' + freeKey, 'error');
    });
}

// Owner key check
function isOwnerKey(apiKey) {
    return apiKey === 'Ownerkeyyes+Iamlightitself.luarmorwebsiteremkaerkys';
}

// Login form handler
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const robloxUsername = document.getElementById('robloxUsername').value;
    const discordUsername = document.getElementById('discordUsername').value;
    const apiKey = document.getElementById('apiKey').value;
    
    if (!robloxUsername || !discordUsername || !apiKey) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    // Simulate login process
    showNotification('Logging in...', 'info');
    
    setTimeout(() => {
        if (isOwnerKey(apiKey)) {
            localStorage.setItem('userType', 'owner');
            localStorage.setItem('discordUsername', discordUsername);
            localStorage.setItem('robloxUsername', robloxUsername);
            localStorage.setItem('apiKey', apiKey);
            showNotification(`Welcome ${discordUsername}`, 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } else if (generatedKeys.has(apiKey) || localStorage.getItem('freeTrialKey') === apiKey) {
            localStorage.setItem('userType', 'user');
            localStorage.setItem('discordUsername', discordUsername);
            localStorage.setItem('robloxUsername', robloxUsername);
            localStorage.setItem('apiKey', apiKey);
            showNotification(`Welcome ${discordUsername}`, 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } else {
            showNotification('Invalid credentials', 'error');
        }
    }, 2000);
});

// Signup form handler
document.getElementById('signupForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const robloxUsername = document.getElementById('signupRoblox').value;
    const discordUsername = document.getElementById('signupDiscord').value;
    const apiKey = document.getElementById('signupApiKey').value;
    
    if (!robloxUsername || !discordUsername || !apiKey) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    // Simulate account creation
    showNotification('Creating account...', 'info');
    
    setTimeout(() => {
        if (isOwnerKey(apiKey)) {
            localStorage.setItem('userType', 'owner');
        } else {
            localStorage.setItem('userType', 'user');
        }
        
        localStorage.setItem('discordUsername', discordUsername);
        localStorage.setItem('robloxUsername', robloxUsername);
        localStorage.setItem('apiKey', apiKey);
        
        showNotification(`Welcome ${discordUsername}`, 'success');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    }, 2000);
});

// Existing account form handler
document.getElementById('existingAccountForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const apiKey = document.getElementById('existingApiKey').value;
    
    if (!apiKey) {
        showNotification('Please enter your API key', 'error');
        return;
    }
    
    // Check if account already in use
    const currentUser = localStorage.getItem('currentActiveUser');
    if (currentUser && currentUser !== apiKey) {
        showNotification('Account already in use. Your IP has been tracked by the user.', 'error');
        return;
    }
    
    // Simulate login
    showNotification('Logging in...', 'info');
    
    setTimeout(() => {
        if (isOwnerKey(apiKey)) {
            localStorage.setItem('userType', 'owner');
            localStorage.setItem('currentActiveUser', apiKey);
            showNotification('Welcome Owner', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } else if (generatedKeys.has(apiKey) || localStorage.getItem('freeTrialKey') === apiKey) {
            localStorage.setItem('userType', 'user');
            localStorage.setItem('currentActiveUser', apiKey);
            showNotification('Welcome back', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } else {
            showNotification('Invalid API key', 'error');
        }
    }, 2000);
});

// Check if free trial was already used on page load
window.addEventListener('load', function() {
    if (localStorage.getItem('freeTrialUsed')) {
        freeTrialUsed = true;
    }
});

// Add CSS for notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification.success {
        border-left: 4px solid #10b981;
    }
    
    .notification.error {
        border-left: 4px solid #ef4444;
    }
    
    .notification.info {
        border-left: 4px solid var(--primary-purple);
    }
`;
document.head.appendChild(style);
