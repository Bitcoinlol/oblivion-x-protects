// Dashboard JavaScript
class Dashboard {
    constructor() {
        this.currentTab = 'dashboard';
        this.currentProject = null;
        this.userKey = localStorage.getItem('userKey');
        this.userData = null;
        this.projects = [];
        this.activities = [];
        
        this.init();
    }
    
    async init() {
        // Check authentication
        if (!this.userKey) {
            window.location.href = '/login';
            return;
        }
        
        // Disable right-click and dev tools
        this.disableSecurityFeatures();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Load dashboard data
        await this.loadDashboardData();
        
        // Setup periodic data refresh
        this.setupPeriodicRefresh();
    }
    
    disableSecurityFeatures() {
        document.addEventListener('contextmenu', e => e.preventDefault());
        
        document.addEventListener('keydown', e => {
            if (e.keyCode === 123 || 
                (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) ||
                (e.ctrlKey && e.keyCode === 85)) {
                e.preventDefault();
                return false;
            }
        });
    }
    
    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const tab = item.getAttribute('data-tab');
                this.switchTab(tab);
            });
        });
        
        // Logout button
        document.getElementById('logoutButton').addEventListener('click', () => {
            this.logout();
        });
        
        // Coin/Payment button
        document.getElementById('coinButton').addEventListener('click', () => {
            this.showPaymentModal();
        });
        
        // Create project button
        document.getElementById('createProjectBtn').addEventListener('click', () => {
            this.showCreateProjectModal();
        });
        
        // Modal event listeners
        this.setupModalEventListeners();
    }
    
    setupModalEventListeners() {
        // Create Project Modal
        const createModal = document.getElementById('createProjectModal');
        const closeModal = document.getElementById('closeModal');
        const cancelCreate = document.getElementById('cancelCreate');
        const createForm = document.getElementById('createProjectForm');
        
        [closeModal, cancelCreate].forEach(btn => {
            btn.addEventListener('click', () => {
                this.hideModal(createModal);
            });
        });
        
        // Project type selection
        document.querySelectorAll('.type-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
            });
        });
        
        // Create project form submission
        createForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.createProject();
        });
        
        // Management Modal
        const managementModal = document.getElementById('projectManagementModal');
        const closeManagementModal = document.getElementById('closeManagementModal');
        
        closeManagementModal.addEventListener('click', () => {
            this.hideModal(managementModal);
        });
        
        // Management tabs
        document.querySelectorAll('.management-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.getAttribute('data-tab');
                this.switchManagementTab(tabName);
            });
        });
        
        // Management actions
        document.getElementById('downloadLoader').addEventListener('click', () => {
            this.downloadLoader();
        });
        
        document.getElementById('copyLoader').addEventListener('click', () => {
            this.copyLoader();
        });
        
        document.getElementById('deleteProject').addEventListener('click', () => {
            this.deleteProject();
        });
        
        document.getElementById('whitelistUser').addEventListener('click', () => {
            this.manageUser('whitelist');
        });
        
        document.getElementById('blacklistUser').addEventListener('click', () => {
            this.manageUser('blacklist');
        });
        
        // Payment Modal
        const paymentModal = document.getElementById('paymentModal');
        const closePaymentModal = document.getElementById('closePaymentModal');
        
        closePaymentModal.addEventListener('click', () => {
            this.hideModal(paymentModal);
        });
        
        // Settings
        document.getElementById('saveUsernameBtn').addEventListener('click', () => {
            this.saveRobloxUsername();
        });
        
        // Modal click outside to close
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal(modal);
                }
            });
        });
    }
    
    async loadDashboardData() {
        try {
            this.showNotification('Loading dashboard...', 'info');
            
            const response = await fetch('/api/dashboard', {
                headers: {
                    'x-api-key': this.userKey
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to load dashboard data');
            }
            
            const data = await response.json();
            this.userData = data.user;
            this.projects = data.projects;
            this.activities = data.activities;
            
            this.updateUI();
            this.hideNotification();
            
        } catch (error) {
            console.error('Dashboard load error:', error);
            this.showNotification('Failed to load dashboard data', 'error');
            
            // If unauthorized, redirect to login
            if (error.message.includes('401') || error.message.includes('unauthorized')) {
                this.logout();
            }
        }
    }
    
    updateUI() {
        // Update header
        this.updateHeader();
        
        // Update stats
        this.updateStats();
        
        // Update activity feed
        this.updateActivityFeed();
        
        // Update projects
        this.updateProjects();
        
        // Update settings
        this.updateSettings();
        
        // Show admin tab if owner key
        this.checkAdminAccess();
    }
    
    updateHeader() {
        const keyExpiry = document.getElementById('keyExpiry');
        if (this.userData && this.userData.expiresAt) {
            const expiryDate = new Date(this.userData.expiresAt);
            keyExpiry.textContent = expiryDate.toLocaleDateString();
        }
    }
    
    updateStats() {
        if (!this.userData) return;
        
        document.getElementById('totalScripts').textContent = this.userData.totalScripts || 0;
        document.getElementById('totalActiveUsers').textContent = this.userData.totalActiveUsers || 0;
        document.getElementById('totalKeysCreated').textContent = this.userData.totalKeysCreated || 0;
        document.getElementById('totalKeysBanned').textContent = this.userData.totalKeysBanned || 0;
    }
    
    updateActivityFeed() {
        const activityFeed = document.getElementById('activityFeed');
        
        if (!this.activities || this.activities.length === 0) {
            activityFeed.innerHTML = `
                <div class="activity-item">
                    <div class="activity-icon">📝</div>
                    <div class="activity-content">
                        <div class="activity-text">No recent activity</div>
                        <div class="activity-time">Get started by creating a project</div>
                    </div>
                </div>
            `;
            return;
        }
        
        activityFeed.innerHTML = this.activities.map(activity => {
            const time = new Date(activity.timestamp).toLocaleString();
            const icon = this.getActivityIcon(activity.action);
            
            return `
                <div class="activity-item">
                    <div class="activity-icon">${icon}</div>
                    <div class="activity-content">
                        <div class="activity-text">${activity.details}</div>
                        <div class="activity-time">${time}</div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    getActivityIcon(action) {
        const icons = {
            'Project Created': '📁',
            'Project Deleted': '🗑️',
            'Script Executed': '⚡',
            'User Whitelisted': '✅',
            'User Blacklisted': '❌',
            'Key Generated': '🔑',
            'Tamper Detected': '🚨'
        };
        return icons[action] || '📝';
    }
    
    updateProjects() {
        const projectsGrid = document.getElementById('projectsGrid');
        
        if (!this.projects || this.projects.length === 0) {
            projectsGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📁</div>
                    <h3>No projects yet</h3>
                    <p>Create your first project to get started</p>
                </div>
            `;
            return;
        }
        
        projectsGrid.innerHTML = this.projects.map(project => `
            <div class="project-card">
                <div class="project-header">
                    <div>
                        <div class="project-title">${project.name}</div>
                        <div class="project-id">${project.projectId}</div>
                    </div>
                </div>
                <div class="project-type">
                    <span>${project.type === 'free-for-all' ? '🌐' : '👥'}</span>
                    ${project.type === 'free-for-all' ? 'Free for All' : 'User Management'}
                </div>
                <div class="project-actions">
                    <button class="project-btn" onclick="dashboard.manageProject('${project.projectId}')">
                        Manage
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    updateSettings() {
        if (!this.userData) return;
        
        // Update plan info
        document.getElementById('currentPlan').textContent = 
            this.userData.plan.charAt(0).toUpperCase() + this.userData.plan.slice(1);
        
        // Update expiry in settings
        const keyExpirySettings = document.getElementById('keyExpirySettings');
        if (this.userData.expiresAt) {
            const expiryDate = new Date(this.userData.expiresAt);
            keyExpirySettings.textContent = expiryDate.toLocaleDateString();
        }
        
        // Update username field
        if (this.userData.robloxUsername) {
            document.getElementById('robloxUsername').value = this.userData.robloxUsername;
            this.loadRobloxProfile(this.userData.robloxUsername);
        }
        
        // Update user counts (placeholder for now)
        document.getElementById('whitelistedCount').textContent = '0';
        document.getElementById('blacklistedCount').textContent = '0';
    }
    
    checkAdminAccess() {
        // Check if user has owner privileges (non-expiring key or special key)
        const isOwner = this.userData && (
            this.userData.keyId.startsWith('OWNER') || 
            this.userData.plan === 'owner' ||
            this.userData.keyId === 'ENIGMA-OWNER-KEY'
        );
        
        const adminTab = document.querySelector('.admin-only');
        if (isOwner) {
            adminTab.classList.remove('hidden');
        } else {
            adminTab.classList.add('hidden');
        }
    }
    
    switchTab(tabName) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}Tab`).classList.add('active');
        
        this.currentTab = tabName;
    }
    
    switchManagementTab(tabName) {
        document.querySelectorAll('.management-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        document.querySelectorAll('.management-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}Tab`).classList.add('active');
    }
    
    showCreateProjectModal() {
        const modal = document.getElementById('createProjectModal');
        modal.classList.remove('hidden');
        
        // Reset form
        document.getElementById('createProjectForm').reset();
        document.querySelectorAll('.type-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
    }
    
    async createProject() {
        const form = document.getElementById('createProjectForm');
        const formData = new FormData(form);
        
        const name = formData.get('projectName');
        const scriptFile = formData.get('scriptFile');
        const selectedType = document.querySelector('.type-btn.selected');
        
        if (!name || !scriptFile || !selectedType) {
            this.showNotification('Please fill in all fields and select a project type', 'error');
            return;
        }
        
        try {
            // Read file content
            const scriptContent = await this.readFileContent(scriptFile);
            const type = selectedType.getAttribute('data-type');
            
            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.userKey
                },
                body: JSON.stringify({
                    name,
                    script: scriptContent,
                    type
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to create project');
            }
            
            const data = await response.json();
            
            this.hideModal(document.getElementById('createProjectModal'));
            this.showNotification('Project created successfully!', 'success');
            
            // Refresh dashboard data
            await this.loadDashboardData();
            
        } catch (error) {
            console.error('Project creation error:', error);
            this.showNotification('Failed to create project', 'error');
        }
    }
    
    readFileContent(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }
    
    manageProject(projectId) {
        this.currentProject = this.projects.find(p => p.projectId === projectId);
        if (!this.currentProject) return;
        
        const modal = document.getElementById('projectManagementModal');
        const title = document.getElementById('managementModalTitle');
        
        title.textContent = `Manage: ${this.currentProject.name}`;
        
        // Update user lists if it's a user management project
        if (this.currentProject.type === 'user-management') {
            this.updateUserLists();
        } else {
            // Hide user management tab for free-for-all projects
            document.querySelector('[data-tab="users"]').style.display = 'none';
        }
        
        modal.classList.remove('hidden');
    }
    
    updateUserLists() {
        const whitelistedUsers = document.getElementById('whitelistedUsers');
        const blacklistedUsers = document.getElementById('blacklistedUsers');
        
        // Update whitelisted users
        if (this.currentProject.whitelistedUsers && this.currentProject.whitelistedUsers.length > 0) {
            whitelistedUsers.innerHTML = this.currentProject.whitelistedUsers.map(userId => `
                <div class="user-item">
                    <span>${userId}</span>
                    <button class="project-btn" onclick="dashboard.removeUser('${userId}', 'whitelist')">Remove</button>
                </div>
            `).join('');
        } else {
            whitelistedUsers.innerHTML = '<div class="empty-list">No whitelisted users</div>';
        }
        
        // Update blacklisted users
        if (this.currentProject.blacklistedUsers && this.currentProject.blacklistedUsers.length > 0) {
            blacklistedUsers.innerHTML = this.currentProject.blacklistedUsers.map(userId => `
                <div class="user-item">
                    <span>${userId}</span>
                    <button class="project-btn" onclick="dashboard.removeUser('${userId}', 'blacklist')">Remove</button>
                </div>
            `).join('');
        } else {
            blacklistedUsers.innerHTML = '<div class="empty-list">No blacklisted users</div>';
        }
    }
    
    async downloadLoader() {
        if (!this.currentProject) return;
        
        try {
            const response = await fetch(`/api/projects/${this.currentProject.projectId}/loader`, {
                headers: {
                    'x-api-key': this.userKey
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to generate loader');
            }
            
            const data = await response.json();
            
            // Create download
            const blob = new Blob([data.loader], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${this.currentProject.name}_loader.lua`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            this.showNotification('Loader downloaded successfully!', 'success');
            
        } catch (error) {
            console.error('Download error:', error);
            this.showNotification('Failed to download loader', 'error');
        }
    }
    
    async copyLoader() {
        if (!this.currentProject) return;
        
        try {
            const response = await fetch(`/api/projects/${this.currentProject.projectId}/loader`, {
                headers: {
                    'x-api-key': this.userKey
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to generate loader');
            }
            
            const data = await response.json();
            
            await navigator.clipboard.writeText(data.loader);
            this.showNotification('Loader copied to clipboard!', 'success');
            
        } catch (error) {
            console.error('Copy error:', error);
            this.showNotification('Failed to copy loader', 'error');
        }
    }
    
    async deleteProject() {
        if (!this.currentProject) return;
        
        if (!confirm(`Are you sure you want to delete "${this.currentProject.name}"? This action cannot be undone.`)) {
            return;
        }
        
        try {
            const response = await fetch(`/api/projects/${this.currentProject.projectId}`, {
                method: 'DELETE',
                headers: {
                    'x-api-key': this.userKey
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to delete project');
            }
            
            this.hideModal(document.getElementById('projectManagementModal'));
            this.showNotification('Project deleted successfully!', 'success');
            
            // Refresh dashboard data
            await this.loadDashboardData();
            
        } catch (error) {
            console.error('Delete error:', error);
            this.showNotification('Failed to delete project', 'error');
        }
    }
    
    async manageUser(action) {
        if (!this.currentProject) return;
        
        const userIdInput = document.getElementById('robloxUserId');
        const userId = userIdInput.value.trim();
        
        if (!userId) {
            this.showNotification('Please enter a Roblox User ID', 'error');
            return;
        }
        
        try {
            const response = await fetch(`/api/projects/${this.currentProject.projectId}/manage-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.userKey
                },
                body: JSON.stringify({
                    userId,
                    action
                })
            });
            
            if (!response.ok) {
                throw new Error(`Failed to ${action} user`);
            }
            
            const data = await response.json();
            this.currentProject = data.project;
            
            userIdInput.value = '';
            this.updateUserLists();
            this.showNotification(`User ${action}ed successfully!`, 'success');
            
        } catch (error) {
            console.error('User management error:', error);
            this.showNotification(`Failed to ${action} user`, 'error');
        }
    }
    
    async removeUser(userId, listType) {
        if (!this.currentProject) return;
        
        const oppositeAction = listType === 'whitelist' ? 'blacklist' : 'whitelist';
        
        try {
            const response = await fetch(`/api/projects/${this.currentProject.projectId}/manage-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.userKey
                },
                body: JSON.stringify({
                    userId,
                    action: 'remove'
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to remove user');
            }
            
            // Manually update the current project data
            if (listType === 'whitelist') {
                this.currentProject.whitelistedUsers = this.currentProject.whitelistedUsers.filter(id => id !== userId);
            } else {
                this.currentProject.blacklistedUsers = this.currentProject.blacklistedUsers.filter(id => id !== userId);
            }
            
            this.updateUserLists();
            this.showNotification('User removed successfully!', 'success');
            
        } catch (error) {
            console.error('Remove user error:', error);
            this.showNotification('Failed to remove user', 'error');
        }
    }
    
    async saveRobloxUsername() {
        const username = document.getElementById('robloxUsername').value.trim();
        
        if (!username) {
            this.showNotification('Please enter a username', 'error');
            return;
        }
        
        try {
            const response = await fetch('/api/user/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.userKey
                },
                body: JSON.stringify({
                    robloxUsername: username
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to save username');
            }
            
            this.showNotification('Username saved successfully!', 'success');
            this.loadRobloxProfile(username);
            
        } catch (error) {
            console.error('Save username error:', error);
            this.showNotification('Failed to save username', 'error');
        }
    }
    
    async loadRobloxProfile(username) {
        try {
            // This would typically call Roblox API, but for demo purposes we'll show a placeholder
            const profileDiv = document.getElementById('robloxProfile');
            profileDiv.innerHTML = `
                <div class="roblox-user">
                    <img src="https://via.placeholder.com/60x60/9333ea/ffffff?text=R" 
                         alt="${username}" class="roblox-avatar">
                    <div class="roblox-info">
                        <h4>${username}</h4>
                        <p>Account created: Unknown</p>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Profile load error:', error);
        }
    }
    
    showPaymentModal() {
        const modal = document.getElementById('paymentModal');
        modal.classList.remove('hidden');
    }
    
    showNotification(message, type = 'info') {
        const container = document.getElementById('notificationContainer');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        container.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }
    
    hideNotification() {
        const container = document.getElementById('notificationContainer');
        const notifications = container.querySelectorAll('.notification');
        notifications.forEach(notification => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        });
    }
    
    hideModal(modal) {
        modal.classList.add('hidden');
    }
    
    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userKey');
        window.location.href = '/login';
    }
    
    setupPeriodicRefresh() {
        // Refresh dashboard data every 30 seconds
        setInterval(() => {
            this.loadDashboardData();
        }, 30000);
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new Dashboard();
});

// Global functions for onclick handlers
window.dashboard = null;
