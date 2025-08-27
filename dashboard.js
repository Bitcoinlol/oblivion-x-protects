// Dashboard JavaScript for Oblivion X Protects

class OblivionDashboard {
    constructor() {
        this.currentUser = this.loadUserData();
        this.isOwner = this.checkOwnerStatus();
        this.stats = {
            whitelistedUsers: 0,
            blacklistedUsers: 0,
            scriptsObfuscated: 0,
            loadstringExecutions: 0
        };
        this.projects = [];
        this.userList = [];
        this.ipAddresses = [];
        this.generatedKeys = [];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateUserInfo();
        this.startLiveUpdates();
        this.loadDashboardData();
        this.setupOwnerFeatures();
        this.disableInspectElement();
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Logout button
        document.querySelector('.logout-btn')?.addEventListener('click', () => this.logout());

        // Modal controls
        this.setupModalControls();
        
        // Project creation
        document.querySelector('.create-project-btn')?.addEventListener('click', () => this.openModal('createProjectModal'));

        // File upload for obfuscation
        this.setupFileUpload();

        // User management
        this.setupUserManagement();

        // Key generation
        this.setupKeyGeneration();

        // Discord bot controls
        this.setupDiscordControls();
    }

    switchTab(tabName) {
        // Remove active from all tabs and content
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        // Add active to selected tab and content
        document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
        document.getElementById(tabName)?.classList.add('active');

        // Load tab-specific data
        this.loadTabData(tabName);
    }

    loadTabData(tabName) {
        switch(tabName) {
            case 'dashboard':
                this.updateDashboardStats();
                break;
            case 'projects':
                this.loadProjects();
                break;
            case 'ip-addresses':
                this.loadIPAddresses();
                break;
            case 'status':
                this.loadStatusCharts();
                break;
        }
    }

    updateUserInfo() {
        const usernameEl = document.querySelector('.username');
        const apiExpiryEl = document.querySelector('.api-expiry');
        const userAvatarEl = document.querySelector('.user-avatar img');

        if (usernameEl) usernameEl.textContent = this.currentUser.username;
        if (userAvatarEl) userAvatarEl.src = this.currentUser.avatar || `https://ui-avatars.com/api/?name=${this.currentUser.username}&background=a855f7&color=fff`;
        
        if (apiExpiryEl && this.currentUser.apiExpiry) {
            const timeLeft = this.calculateTimeLeft(this.currentUser.apiExpiry);
            apiExpiryEl.textContent = `API Key expires in ${timeLeft}`;
        }
    }

    calculateTimeLeft(expiryDate) {
        const now = new Date();
        const expiry = new Date(expiryDate);
        const diff = expiry - now;
        
        if (diff <= 0) return 'Expired';
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        if (days > 0) return `${days}d ${hours}h`;
        return `${hours}h`;
    }

    startLiveUpdates() {
        // Update current time
        this.updateCurrentTime();
        setInterval(() => this.updateCurrentTime(), 1000);

        // Update API expiry countdown
        setInterval(() => this.updateUserInfo(), 60000);

        // Simulate live stats updates
        setInterval(() => this.updateLiveStats(), 30000);
    }

    updateCurrentTime() {
        const timeEl = document.querySelector('.current-time');
        const dateEl = document.querySelector('.current-date');
        
        if (timeEl && dateEl) {
            const now = new Date();
            timeEl.textContent = now.toLocaleTimeString();
            dateEl.textContent = now.toLocaleDateString();
        }
    }

    updateLiveStats() {
        // Simulate random stat updates
        this.stats.loadstringExecutions += Math.floor(Math.random() * 5);
        this.stats.scriptsObfuscated += Math.floor(Math.random() * 2);
        
        this.updateDashboardStats();
    }

    updateDashboardStats() {
        const statNumbers = document.querySelectorAll('.stat-number');
        const expiryDateEl = document.querySelector('.expiry-date');
        const countdownEl = document.querySelector('.expiry-countdown');

        if (statNumbers.length >= 4) {
            statNumbers[0].textContent = this.stats.whitelistedUsers;
            statNumbers[1].textContent = this.stats.blacklistedUsers;
            statNumbers[2].textContent = this.stats.scriptsObfuscated;
            statNumbers[3].textContent = this.stats.loadstringExecutions;
        }

        if (expiryDateEl && this.currentUser.apiExpiry) {
            const expiry = new Date(this.currentUser.apiExpiry);
            expiryDateEl.textContent = expiry.toLocaleDateString();
            
            if (countdownEl) {
                countdownEl.textContent = `${this.calculateTimeLeft(this.currentUser.apiExpiry)} remaining`;
            }
        }
    }

    setupModalControls() {
        // Close modal buttons
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                this.closeModal(modal.id);
            });
        });

        // Close modal on backdrop click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });

        // Form submissions
        document.getElementById('createProjectForm')?.addEventListener('submit', (e) => this.handleProjectCreation(e));
        document.getElementById('userManagementForm')?.addEventListener('submit', (e) => this.handleUserManagement(e));
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }

    handleProjectCreation(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const projectData = {
            name: formData.get('projectName'),
            description: formData.get('projectDescription'),
            created: new Date(),
            id: Date.now()
        };

        this.projects.push(projectData);
        this.showNotification('Project created successfully!', 'success');
        this.closeModal('createProjectModal');
        e.target.reset();
        this.loadProjects();
    }

    loadProjects() {
        const projectsGrid = document.querySelector('.projects-stats');
        if (!projectsGrid) return;

        // Update project stats
        const projectCount = document.querySelector('.projects-stats .stat-number');
        if (projectCount) projectCount.textContent = this.projects.length;
    }

    setupFileUpload() {
        const uploadArea = document.querySelector('.upload-area');
        const fileInput = document.getElementById('luaFile');

        if (uploadArea && fileInput) {
            uploadArea.addEventListener('click', () => fileInput.click());
            
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.style.borderColor = 'var(--primary-purple)';
            });

            uploadArea.addEventListener('dragleave', () => {
                uploadArea.style.borderColor = 'var(--border-color)';
            });

            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.style.borderColor = 'var(--border-color)';
                
                const files = e.dataTransfer.files;
                if (files.length > 0 && files[0].name.endsWith('.lua')) {
                    fileInput.files = files;
                    this.handleFileUpload(files[0]);
                } else {
                    this.showNotification('Please upload a .lua file', 'error');
                }
            });

            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.handleFileUpload(e.target.files[0]);
                }
            });
        }

        // Obfuscate button
        document.querySelector('.btn-primary')?.addEventListener('click', () => this.processObfuscation());
    }

    handleFileUpload(file) {
        const uploadText = document.querySelector('.upload-area p');
        if (uploadText) {
            uploadText.innerHTML = `<i class="fas fa-file-code"></i> ${file.name} selected`;
        }

        // Update progress steps
        this.updateProgressStep(1);
    }

    updateProgressStep(step) {
        document.querySelectorAll('.step').forEach((el, index) => {
            if (index < step) {
                el.classList.add('active');
            } else {
                el.classList.remove('active');
            }
        });
    }

    async processObfuscation() {
        const fileInput = document.getElementById('luaFile');
        if (!fileInput.files.length) {
            this.showNotification('Please select a Lua file first', 'error');
            return;
        }

        this.updateProgressStep(2);
        this.showNotification('Processing obfuscation...', 'info');

        // Simulate obfuscation process
        setTimeout(() => {
            this.updateProgressStep(3);
            this.stats.scriptsObfuscated++;
            this.showNotification('Script obfuscated successfully!', 'success');
            
            // Generate loadstring
            const loadstring = this.generateLoadstring();
            this.displayLoadstring(loadstring);
        }, 2000);
    }

    generateLoadstring() {
        const randomId = Math.random().toString(36).substr(2, 9);
        return `loadstring(game:HttpGet("https://oblivionx.protects/api/script/${randomId}"))()`;
    }

    displayLoadstring(loadstring) {
        // Create and show loadstring result
        const resultDiv = document.createElement('div');
        resultDiv.className = 'obfuscation-result';
        resultDiv.innerHTML = `
            <h4>Protected Loadstring Generated:</h4>
            <div class="loadstring-output">
                <code>${loadstring}</code>
                <button class="copy-btn" onclick="navigator.clipboard.writeText('${loadstring}')">
                    <i class="fas fa-copy"></i> Copy
                </button>
            </div>
        `;
        
        document.querySelector('.obfuscation-container').appendChild(resultDiv);
    }

    setupUserManagement() {
        document.querySelector('.manage-users-btn')?.addEventListener('click', () => this.openModal('userManagementModal'));
    }

    handleUserManagement(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const action = formData.get('action');
        const userId = formData.get('userId');

        if (action === 'whitelist') {
            this.stats.whitelistedUsers++;
            this.showNotification(`User ${userId} whitelisted successfully!`, 'success');
        } else if (action === 'blacklist') {
            this.stats.blacklistedUsers++;
            this.showNotification(`User ${userId} blacklisted successfully!`, 'success');
        }

        this.updateDashboardStats();
        this.closeModal('userManagementModal');
        e.target.reset();
    }

    setupKeyGeneration() {
        if (!this.isOwner) return;

        document.querySelectorAll('.plan-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.plan-option').forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
            });
        });

        document.querySelector('.generate-key-btn')?.addEventListener('click', () => this.generateAPIKey());
    }

    generateAPIKey() {
        const selectedPlan = document.querySelector('.plan-option.selected');
        if (!selectedPlan) {
            this.showNotification('Please select a plan first', 'error');
            return;
        }

        const duration = selectedPlan.querySelector('.plan-duration').textContent;
        const key = this.createAPIKey(duration);
        
        this.generatedKeys.push({
            key: key,
            duration: duration,
            created: new Date(),
            status: 'active'
        });

        this.displayGeneratedKey(key, duration);
        this.showNotification('API Key generated successfully!', 'success');
    }

    createAPIKey(duration) {
        const prefix = 'OX';
        const segments = [];
        for (let i = 0; i < 4; i++) {
            segments.push(Math.random().toString(36).substr(2, 4).toUpperCase());
        }
        return `${prefix}-${segments.join('-')}`;
    }

    displayGeneratedKey(key, duration) {
        const keysContainer = document.querySelector('.generated-keys');
        if (!keysContainer) return;

        const keyItem = document.createElement('div');
        keyItem.className = 'key-item';
        keyItem.innerHTML = `
            <div>
                <div class="key-value">${key}</div>
                <small>Duration: ${duration}</small>
            </div>
            <button class="copy-key-btn" onclick="navigator.clipboard.writeText('${key}')">
                <i class="fas fa-copy"></i> Copy
            </button>
        `;
        
        keysContainer.appendChild(keyItem);
    }

    setupDiscordControls() {
        // Placeholder for Discord bot integration
        document.querySelectorAll('.control-card button').forEach(btn => {
            btn.addEventListener('click', () => {
                this.showNotification('Discord bot feature coming soon!', 'info');
            });
        });
    }

    loadIPAddresses() {
        // Simulate IP address data
        this.ipAddresses = [
            { ip: '192.168.1.100', location: 'New York, US', lastLogin: '2 minutes ago', status: 'current' },
            { ip: '10.0.0.45', location: 'London, UK', lastLogin: '1 hour ago', status: 'recent' },
            { ip: '172.16.0.23', location: 'Tokyo, JP', lastLogin: '1 day ago', status: 'recent' }
        ];

        this.updateIPList();
    }

    updateIPList() {
        const ipList = document.querySelector('.ip-list');
        if (!ipList) return;

        ipList.innerHTML = this.ipAddresses.map(ip => `
            <div class="ip-item">
                <span class="ip-address">${ip.ip}</span>
                <span class="location">${ip.location}</span>
                <span class="last-login">${ip.lastLogin}</span>
                <span class="status-badge status-${ip.status}">${ip.status}</span>
            </div>
        `).join('');
    }

    loadStatusCharts() {
        // Placeholder for charts - in a real app, you'd integrate Chart.js or similar
        document.querySelectorAll('.chart-placeholder').forEach(placeholder => {
            placeholder.textContent = 'Chart data loading...';
        });
    }

    loadUserData() {
        // Load from localStorage or API
        const userData = localStorage.getItem('oblivion_user');
        if (userData) {
            return JSON.parse(userData);
        }

        // Default user data
        return {
            username: 'User123',
            apiKey: localStorage.getItem('freeTrialKey') || 'OX-DEMO-KEY',
            apiExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            avatar: null
        };
    }

    checkOwnerStatus() {
        const apiKey = this.currentUser.apiKey;
        return apiKey && (apiKey.startsWith('OWNER-') || apiKey === 'OWNER-MASTER-KEY-2024');
    }

    setupOwnerFeatures() {
        const ownerTab = document.querySelector('[data-tab="generate-keys"]');
        if (ownerTab) {
            ownerTab.style.display = this.isOwner ? 'flex' : 'none';
        }
    }

    logout() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('oblivion_user');
            localStorage.removeItem('freeTrialKey');
            window.location.href = 'login.html';
        }
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}"></i>
            <span>${message}</span>
        `;

        // Add notification styles if not present
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 100px;
                    right: 20px;
                    background: var(--card-bg);
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    padding: 1rem 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    z-index: 10000;
                    transform: translateX(100%);
                    transition: transform 0.3s ease;
                    min-width: 300px;
                }
                .notification.show { transform: translateX(0); }
                .notification-success { border-color: #22c55e; color: #22c55e; }
                .notification-error { border-color: #ef4444; color: #ef4444; }
                .notification-info { border-color: var(--primary-purple); color: var(--primary-purple); }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    disableInspectElement() {
        // Disable right-click
        document.addEventListener('contextmenu', e => e.preventDefault());

        // Disable common inspect shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F12' || 
                (e.ctrlKey && e.shiftKey && e.key === 'I') ||
                (e.ctrlKey && e.shiftKey && e.key === 'C') ||
                (e.ctrlKey && e.key === 'U')) {
                e.preventDefault();
                this.showNotification('Developer tools are disabled for security', 'error');
            }
        });
    }

    loadDashboardData() {
        // Simulate loading data
        setTimeout(() => {
            this.stats = {
                whitelistedUsers: Math.floor(Math.random() * 100),
                blacklistedUsers: Math.floor(Math.random() * 20),
                scriptsObfuscated: Math.floor(Math.random() * 500),
                loadstringExecutions: Math.floor(Math.random() * 10000)
            };
            this.updateDashboardStats();
        }, 1000);
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.oblivionDashboard = new OblivionDashboard();
});

// Helper functions
function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsText(file);
    });
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // Add toast styles if not already defined
    if (!document.querySelector('.toast-styles')) {
        const style = document.createElement('style');
        style.className = 'toast-styles';
        style.textContent = `
            .toast {
                position: fixed;
                top: 100px;
                right: 20px;
                background: var(--dark-gray);
                color: var(--white);
                padding: 1rem 1.5rem;
                border-radius: 8px;
                border: 1px solid var(--primary-purple);
                box-shadow: var(--shadow);
                z-index: 10000;
                opacity: 0;
                transform: translateX(100%);
                transition: all 0.3s ease;
            }
            .toast.show {
                opacity: 1;
                transform: translateX(0);
            }
            .toast-success {
                border-color: #22C55E;
            }
            .toast-error {
                border-color: #EF4444;
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
    }, 100);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

async function loadDashboardData() {
    try {
        // Simulate loading dashboard data
        console.log('Loading dashboard data...');
        
        // In a real application, you would fetch this data from your API
        const dashboardData = {
            user: {
                username: 'User123',
                email: 'user@example.com',
                trial_expires: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
            },
            stats: {
                scripts: 12,
                keys: 248,
                users: 1432,
                revenue: 2847
            },
            scripts: [
                { id: 1, name: 'premium_executor.lua', keys: 45, users: 128, revenue: 890, status: 'active' },
                { id: 2, name: 'advanced_script.lua', keys: 23, users: 67, revenue: 340, status: 'active' }
            ],
            keys: [
                { key: 'LG-2F4A-8B9C-7E1D', script: 'premium_executor.lua', user: 'user@example.com', expires: '2025-09-22', status: 'active' },
                { key: 'LG-9A3C-5D6E-4F2B', script: 'advanced_script.lua', user: 'demo@test.com', expires: '2025-08-25', status: 'expired' }
            ]
        };
        
        // Update UI with loaded data
        updateDashboardUI(dashboardData);
    } catch (error) {
        console.error('Failed to load dashboard data:', error);
        showToast('Failed to load dashboard data', 'error');
    }
}

function updateDashboardUI(data) {
    // Update stats cards
    const statCards = document.querySelectorAll('.stat-card .stat-info h3');
    if (statCards.length >= 4) {
        statCards[0].textContent = data.stats.scripts;
        statCards[1].textContent = data.stats.keys;
        statCards[2].textContent = data.stats.users.toLocaleString();
        statCards[3].textContent = `$${data.stats.revenue.toLocaleString()}`;
    }

    // Update trial progress
    const trialProgress = document.querySelector('.progress-fill');
    if (trialProgress && data.user.trial_expires) {
        const daysLeft = Math.ceil((data.user.trial_expires - new Date()) / (1000 * 60 * 60 * 24));
        const daysUsed = 30 - daysLeft;
        const percentage = (daysUsed / 30) * 100;
        trialProgress.style.width = `${percentage}%`;
        
        const trialBadge = document.querySelector('.trial-badge');
        if (trialBadge) {
            trialBadge.textContent = `${daysLeft} Days Remaining`;
        }
        
        const progressText = document.querySelector('.trial-progress p');
        if (progressText) {
            progressText.textContent = `${daysUsed} out of 30 days used`;
        }
    }
}

function loadScripts() {
    console.log('Refreshing scripts list...');
    // In a real app, this would fetch updated scripts from the API
    showToast('Scripts list updated');
}

function loadKeys() {
    console.log('Refreshing keys list...');
    // In a real app, this would fetch updated keys from the API
    showToast('Keys list updated');
}
