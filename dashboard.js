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
        this.selectedProjectType = 'freeforall';
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateUserInfo();
        this.startLiveUpdates();
        this.loadDashboardData();
        this.setupOwnerFeatures();
        this.disableInspectElement();
        this.setupProjectTypeSelection();
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

        // IP address controls
        this.setupIPControls();
    }

    setupProjectTypeSelection() {
        const typeButtons = document.querySelectorAll('.type-btn');
        typeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                typeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.selectedProjectType = btn.dataset.type;
            });
        });
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
            case 'obfuscation':
                this.setupObfuscation();
                break;
            case 'discord-bot':
                this.loadDiscordData();
                break;
            case 'ip-addresses':
                this.loadIPAddresses();
                break;
            case 'status':
                this.loadStatusCharts();
                break;
            case 'generate-keys':
                this.loadGeneratedKeys();
                break;
        }
    }

    setupObfuscation() {
        // Setup obfuscation tab functionality
        console.log('Obfuscation tab loaded');
    }

    loadDiscordData() {
        // Load Discord bot data
        console.log('Discord bot tab loaded');
    }

    updateUserInfo() {
        const usernameEl = document.getElementById('displayUsername');
        const apiExpiryEl = document.getElementById('apiExpiry');
        const userAvatarEl = document.getElementById('avatarImg');

        if (usernameEl) usernameEl.textContent = this.currentUser.username;
        if (userAvatarEl) userAvatarEl.src = this.currentUser.avatar || `https://ui-avatars.com/api/?name=${this.currentUser.username}&background=a855f7&color=fff`;
        
        if (apiExpiryEl && this.currentUser.apiExpiry) {
            const timeLeft = this.calculateTimeLeft(this.currentUser.apiExpiry);
            apiExpiryEl.textContent = `API Key expires in: ${timeLeft}`;
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
        const timeEl = document.getElementById('currentTime');
        const dateEl = document.getElementById('currentDate');
        
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
        const expiryDateEl = document.getElementById('expiryDate');
        const countdownEl = document.getElementById('expiryCountdown');

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

    setupFileUpload() {
        const fileInput = document.getElementById('fileInput');
        const uploadArea = document.getElementById('fileUploadArea');

        if (fileInput && uploadArea) {
            uploadArea.addEventListener('click', () => fileInput.click());
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('dragover');
            });
            uploadArea.addEventListener('dragleave', () => {
                uploadArea.classList.remove('dragover');
            });
            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('dragover');
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.handleFileUpload(files[0]);
                }
            });
            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.handleFileUpload(e.target.files[0]);
                }
            });
        }
    }

    handleFileUpload(file) {
        if (file.type !== 'text/plain' && !file.name.endsWith('.txt')) {
            this.showNotification('Please upload a .txt file', 'error');
            return;
        }

        this.startObfuscation(file);
    }

    startObfuscation(file) {
        const uploadArea = document.getElementById('fileUploadArea');
        const progressArea = document.getElementById('obfuscationProgress');

        uploadArea.style.display = 'none';
        progressArea.style.display = 'block';

        // Simulate obfuscation process
        setTimeout(() => this.activateStep(2), 1000);
        setTimeout(() => this.activateStep(3), 3000);
        setTimeout(() => this.activateStep(4), 5000);
        setTimeout(() => this.completeObfuscation(file), 6000);
    }

    activateStep(stepNumber) {
        document.querySelectorAll('.progress-step').forEach((step, index) => {
            if (index < stepNumber) {
                step.classList.add('active');
            }
        });
    }

    completeObfuscation(file) {
        const progressArea = document.getElementById('obfuscationProgress');
        const uploadArea = document.getElementById('fileUploadArea');

        progressArea.style.display = 'none';
        uploadArea.style.display = 'block';

        // Create download link
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(new Blob(['-- Obfuscated Lua Code\n-- Generated by Oblivion X Protects\n\nlocal _0x1a2b3c = "obfuscated_code_here"\nprint("Code protected successfully!")'], { type: 'text/plain' }));
        downloadLink.download = `obfuscated_${file.name}`;
        downloadLink.click();

        this.showNotification('Obfuscation complete! File downloaded.', 'success');
        this.stats.scriptsObfuscated++;
        this.updateDashboardStats();
    }

    setupUserManagement() {
        // User management tab switching
        const tabButtons = document.querySelectorAll('.user-management-tabs .tab-btn');
        const tabContents = document.querySelectorAll('.user-management-tabs + .tab-content');

        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.dataset.tab;
                
                tabButtons.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                
                btn.classList.add('active');
                document.getElementById(targetTab + 'Tab').classList.add('active');
            });
        });
    }

    addWhitelistUser() {
        const userId = document.getElementById('whitelistUserId').value;
        if (!userId) {
            this.showNotification('Please enter a Roblox User ID', 'error');
            return;
        }

        const userItem = this.createUserItem(userId, 'whitelisted');
        document.getElementById('whitelistUsers').appendChild(userItem);
        document.getElementById('whitelistUserId').value = '';
        
        this.stats.whitelistedUsers++;
        this.updateDashboardStats();
        this.showNotification(`User ${userId} whitelisted successfully`, 'success');
    }

    addBlacklistUser() {
        const userId = document.getElementById('blacklistUserId').value;
        if (!userId) {
            this.showNotification('Please enter a Roblox User ID', 'error');
            return;
        }

        const userItem = this.createUserItem(userId, 'blacklisted');
        document.getElementById('blacklistUsers').appendChild(userItem);
        document.getElementById('blacklistUserId').value = '';
        
        this.stats.blacklistedUsers++;
        this.updateDashboardStats();
        this.showNotification(`User ${userId} blacklisted successfully`, 'success');
    }

    createUserItem(userId, status) {
        const item = document.createElement('div');
        item.className = 'user-item';
        item.innerHTML = `
            <span>User ID: ${userId}</span>
            <span class="status ${status}">${status.charAt(0).toUpperCase() + status.slice(1)}</span>
            <button class="delete-btn" onclick="this.parentElement.remove()">
                <i class="fas fa-trash"></i>
            </button>
        `;
        return item;
    }

    setupKeyGeneration() {
        // Owner key generation
        if (this.isOwner) {
            document.getElementById('ownerTab').style.display = 'block';
        }
    }

    generatePlanKey(planType) {
        const key = this.generateApiKey(planType);
        const keyItem = this.createKeyItem(key, planType);
        document.getElementById('generatedKeysList').appendChild(keyItem);
        
        this.generatedKeys.push({ key, planType, generated: new Date() });
        this.showNotification(`${planType} key generated successfully`, 'success');
    }

    generateApiKey(planType) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 32; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return `OX_${planType.toUpperCase()}_${result}`;
    }

    createKeyItem(key, planType) {
        const item = document.createElement('div');
        item.className = 'key-item';
        item.innerHTML = `
            <div class="key-info">
                <span class="key-value">${key}</span>
                <span class="key-plan">${planType}</span>
            </div>
            <div class="key-actions">
                <button class="copy-btn" onclick="copyToClipboard('${key}')">
                    <i class="fas fa-copy"></i>
                </button>
                <button class="delete-btn" onclick="this.closest('.key-item').remove()">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        return item;
    }

    setupDiscordControls() {
        // Discord admin management
        document.querySelector('.add-admin-btn')?.addEventListener('click', () => this.addDiscordAdmin());
    }

    addDiscordAdmin() {
        const adminId = document.getElementById('adminDiscordId').value;
        if (!adminId) {
            this.showNotification('Please enter a Discord User ID', 'error');
            return;
        }

        const adminItem = document.createElement('div');
        adminItem.className = 'admin-item';
        adminItem.innerHTML = `
            <span>Discord ID: ${adminId}</span>
            <button class="delete-btn" onclick="this.parentElement.remove()">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        document.getElementById('adminList').appendChild(adminItem);
        document.getElementById('adminDiscordId').value = '';
        this.showNotification(`Discord admin ${adminId} added successfully`, 'success');
    }

    setupIPControls() {
        const toggle = document.getElementById('allowMultipleLogins');
        if (toggle) {
            toggle.addEventListener('change', (e) => {
                this.updateIPPolicy(e.target.checked);
            });
        }
    }

    updateIPPolicy(allowMultiple) {
        if (allowMultiple) {
            this.showNotification('Multiple logins now allowed', 'info');
        } else {
            this.showNotification('Multiple logins disabled', 'info');
        }
    }

    loadProjects() {
        // Load existing projects
        this.updateProjectStats();
    }

    updateProjectStats() {
        document.getElementById('projectWhitelisted').textContent = this.stats.whitelistedUsers;
        document.getElementById('projectBlacklisted').textContent = this.stats.blacklistedUsers;
        document.getElementById('projectExecutions').textContent = this.stats.loadstringExecutions;
    }

    handleProjectCreation(e) {
        e.preventDefault();
        
        const projectName = document.getElementById('projectName').value;
        const projectFile = document.getElementById('projectFile').files[0];
        
        if (!projectName || !projectFile) {
            this.showNotification('Please fill in all fields', 'error');
            return;
        }

        // Create project
        const project = {
            id: Date.now(),
            name: projectName,
            type: this.selectedProjectType,
            active: true,
            createdAt: new Date()
        };

        this.projects.push(project);
        this.addProjectToGrid(project);
        this.closeModal('createProjectModal');
        
        // Reset form
        document.getElementById('createProjectForm').reset();
        this.showNotification(`Project "${projectName}" created successfully`, 'success');
    }

    addProjectToGrid(project) {
        const projectsGrid = document.getElementById('projectsGrid');
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        projectCard.innerHTML = `
            <div class="project-header">
                <h3>${project.name}</h3>
                <span class="project-status ${project.active ? 'active' : 'inactive'}">
                    ${project.active ? 'Active' : 'Inactive'}
                </span>
            </div>
            <div class="project-type">${project.type === 'freeforall' ? 'Free for All' : 'User Management'}</div>
            <div class="project-actions">
                <button class="action-btn copy-btn" onclick="copyProjectLink(${project.id})" title="Copy Loadstring">
                    <i class="fas fa-copy"></i>
                </button>
                <button class="action-btn activate-btn" onclick="toggleProjectStatus(${project.id})" title="Toggle Status">
                    <i class="fas fa-power-off"></i>
                </button>
                <button class="action-btn delete-btn" onclick="deleteProject(${project.id})" title="Delete Project">
                    <i class="fas fa-trash"></i>
                </button>
                ${project.type === 'usermanagement' ? `
                    <button class="action-btn manage-btn" onclick="openUserManagement(${project.id})" title="Manage Users">
                        <i class="fas fa-users"></i>
                    </button>
                ` : ''}
            </div>
        `;
        
        projectsGrid.appendChild(projectCard);
    }

    loadIPAddresses() {
        // Load IP addresses
        this.updateIPList();
    }

    updateIPList() {
        const ipList = document.getElementById('ipList');
        if (ipList) {
            ipList.innerHTML = `
                <div class="ip-item">
                    <span class="ip-address">${this.getCurrentIP()}</span>
                    <span class="ip-status current">Current Session</span>
                </div>
            `;
        }
    }

    getCurrentIP() {
        // In a real app, this would get the actual IP
        return '192.168.1.1';
    }

    loadStatusCharts() {
        // Initialize status chart
        this.initStatusChart();
    }

    initStatusChart() {
        const canvas = document.getElementById('statusChart');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            // Simple chart drawing
            ctx.fillStyle = '#a855f7';
            ctx.fillRect(50, 300, 100, 100);
            ctx.fillRect(200, 250, 100, 150);
            ctx.fillRect(350, 200, 100, 200);
            ctx.fillRect(500, 150, 100, 250);
        }
    }

    loadGeneratedKeys() {
        // Load existing generated keys
        this.updateGeneratedKeysList();
    }

    updateGeneratedKeysList() {
        const keysList = document.getElementById('generatedKeysList');
        if (keysList) {
            keysList.innerHTML = '';
            this.generatedKeys.forEach(keyData => {
                const keyItem = this.createKeyItem(keyData.key, keyData.planType);
                keysList.appendChild(keyItem);
            });
        }
    }

    loadDashboardData() {
        // Load initial dashboard data
        this.updateDashboardStats();
    }

    setupOwnerFeatures() {
        if (this.isOwner) {
            // Show owner-specific features
            document.getElementById('ownerTab').style.display = 'block';
        }
    }

    checkOwnerStatus() {
        return this.currentUser.apiKey === 'Ownerkeyyes+Iamlightitself.luarmorwebsiteremkaerkys';
    }

    loadUserData() {
        // Load user data from localStorage or session
        const userData = localStorage.getItem('oblivionUser');
        if (userData) {
            return JSON.parse(userData);
        }
        
        // Default user data
        return {
            username: 'Demo User',
            apiKey: 'demo_key',
            apiExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            avatar: null
        };
    }

    disableInspectElement() {
        // Disable right-click
        document.addEventListener('contextmenu', e => e.preventDefault());
        
        // Disable F12, Ctrl+Shift+I, Ctrl+Shift+C, Ctrl+U
        document.addEventListener('keydown', function(e) {
            if (e.key === 'F12' || 
                (e.ctrlKey && e.shiftKey && e.key === 'I') ||
                (e.ctrlKey && e.shiftKey && e.key === 'C') ||
                (e.ctrlKey && e.key === 'u')) {
                e.preventDefault();
            }
        });
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('notification-container');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        container.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in forwards';
            setTimeout(() => {
                if (container.contains(notification)) {
                    container.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    logout() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('oblivionUser');
            window.location.href = 'index.html';
        }
    }
}

// Global functions for onclick handlers
function showCreateProjectModal() {
    window.oblivionDashboard?.openModal('createProjectModal');
}

function closeModal(modalId) {
    window.oblivionDashboard?.closeModal(modalId);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        window.oblivionDashboard?.showNotification('Copied to clipboard!', 'success');
    }).catch(() => {
        window.oblivionDashboard?.showNotification('Failed to copy', 'error');
    });
}

function copyProjectLink(projectId) {
    const project = window.oblivionDashboard?.projects.find(p => p.id === projectId);
    if (project) {
        const loadstring = `loadstring(game:HttpGet("https://api.oblivionxprotects.com/files/v3/loaders/${projectId}.lua"))()`;
        copyToClipboard(loadstring);
    }
}

function toggleProjectStatus(projectId) {
    const project = window.oblivionDashboard?.projects.find(p => p.id === projectId);
    if (project) {
        project.active = !project.active;
        // Update UI
        const projectCard = document.querySelector(`[onclick="toggleProjectStatus(${projectId})"]`).closest('.project-card');
        const statusEl = projectCard.querySelector('.project-status');
        statusEl.textContent = project.active ? 'Active' : 'Inactive';
        statusEl.className = `project-status ${project.active ? 'active' : 'inactive'}`;
    }
}

function deleteProject(projectId) {
    if (confirm('Are you sure you want to delete this project?')) {
        window.oblivionDashboard?.projects = window.oblivionDashboard.projects.filter(p => p.id !== projectId);
        const projectCard = document.querySelector(`[onclick="deleteProject(${projectId})"]`).closest('.project-card');
        projectCard.remove();
        window.oblivionDashboard?.showNotification('Project deleted successfully', 'success');
    }
}

function openUserManagement(projectId) {
    window.oblivionDashboard?.openModal('userManagementModal');
}

function addWhitelistUser() {
    window.oblivionDashboard?.addWhitelistUser();
}

function addBlacklistUser() {
    window.oblivionDashboard?.addBlacklistUser();
}

function generatePlanKey(planType) {
    window.oblivionDashboard?.generatePlanKey(planType);
}

function showPlans() {
    window.location.href = 'index.html#plans';
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.oblivionDashboard = new OblivionDashboard();
});
