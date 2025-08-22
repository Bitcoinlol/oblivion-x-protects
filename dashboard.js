// Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Sidebar navigation
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    const dashboardSections = document.querySelectorAll('.dashboard-section');

    sidebarItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all items and sections
            sidebarItems.forEach(i => i.classList.remove('active'));
            dashboardSections.forEach(s => s.classList.remove('active'));
            
            // Add active class to clicked item
            item.classList.add('active');
            
            // Show corresponding section
            const targetId = item.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });

    // Upload modal functionality
    const uploadBtns = document.querySelectorAll('button:contains("Upload New Script")');
    const uploadModal = document.getElementById('uploadModal');
    
    // Since :contains() doesn't work in querySelector, we'll find buttons by text content
    document.querySelectorAll('button').forEach(btn => {
        if (btn.textContent.includes('Upload New Script')) {
            btn.addEventListener('click', () => {
                uploadModal.style.display = 'block';
            });
        }
    });

    // Upload form handling
    const uploadForm = document.querySelector('.upload-form');
    if (uploadForm) {
        uploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const scriptName = document.getElementById('script-name').value;
            const scriptFile = document.getElementById('script-file').files[0];
            const protectionLevel = document.getElementById('protection-level').value;
            
            if (!scriptFile) {
                alert('Please select a Lua file to upload.');
                return;
            }

            // Show loading state
            const submitBtn = uploadForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            submitBtn.disabled = true;

            try {
                // Read file content
                const fileContent = await readFileAsText(scriptFile);
                
                // Simulate obfuscation
                const result = await LuaGuardAPI.obfuscateScript(fileContent, protectionLevel);
                
                if (result.success) {
                    alert(`Script "${scriptName}" has been successfully obfuscated and protected!`);
                    uploadModal.style.display = 'none';
                    uploadForm.reset();
                    
                    // Refresh the scripts list (in a real app, this would fetch from API)
                    loadScripts();
                } else {
                    alert('Failed to obfuscate script. Please try again.');
                }
            } catch (error) {
                alert('Error processing file: ' + error.message);
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // Key generation
    document.querySelectorAll('button').forEach(btn => {
        if (btn.textContent.includes('Generate New Key')) {
            btn.addEventListener('click', async () => {
                const scriptId = prompt('Enter script ID or name:');
                if (!scriptId) return;

                const duration = prompt('Enter key duration in days (default: 30):', '30');
                const durationDays = parseInt(duration) || 30;

                try {
                    const result = await LuaGuardAPI.generateKey(scriptId, durationDays);
                    if (result.success) {
                        alert(`New key generated: ${result.key}\nExpires: ${result.expires.toLocaleDateString()}`);
                        loadKeys();
                    }
                } catch (error) {
                    alert('Failed to generate key: ' + error.message);
                }
            });
        }
    });

    // Script actions
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-danger') && e.target.textContent === 'Delete') {
            if (confirm('Are you sure you want to delete this script? This action cannot be undone.')) {
                e.target.closest('.script-card').remove();
                showToast('Script deleted successfully');
            }
        }
        
        if (e.target.classList.contains('btn-danger') && e.target.textContent === 'Revoke') {
            if (confirm('Are you sure you want to revoke this key?')) {
                const row = e.target.closest('tr');
                const statusBadge = row.querySelector('.status-badge');
                statusBadge.textContent = 'Revoked';
                statusBadge.className = 'status-badge expired';
                showToast('Key revoked successfully');
            }
        }
    });

    // File upload drag and drop
    const fileUpload = document.querySelector('.file-upload');
    if (fileUpload) {
        const fileInput = fileUpload.querySelector('input[type="file"]');
        const fileLabel = fileUpload.querySelector('.file-upload-label');

        fileUpload.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileUpload.classList.add('dragover');
        });

        fileUpload.addEventListener('dragleave', () => {
            fileUpload.classList.remove('dragover');
        });

        fileUpload.addEventListener('drop', (e) => {
            e.preventDefault();
            fileUpload.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0 && files[0].name.endsWith('.lua')) {
                fileInput.files = files;
                fileLabel.innerHTML = `<i class="fas fa-file-code"></i> ${files[0].name}`;
            } else {
                alert('Please upload a .lua file');
            }
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                fileLabel.innerHTML = `<i class="fas fa-file-code"></i> ${e.target.files[0].name}`;
            }
        });
    }

    // Real-time search for keys table
    const searchInput = document.getElementById('keySearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const tableRows = document.querySelectorAll('.keys-table tbody tr');
            
            tableRows.forEach(row => {
                const keyCell = row.querySelector('.key-cell');
                const scriptCell = row.cells[1];
                const userCell = row.cells[2];
                
                const matches = keyCell.textContent.toLowerCase().includes(searchTerm) ||
                               scriptCell.textContent.toLowerCase().includes(searchTerm) ||
                               userCell.textContent.toLowerCase().includes(searchTerm);
                
                row.style.display = matches ? '' : 'none';
            });
        });
    }

    // Load initial data
    loadDashboardData();
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
