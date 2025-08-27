// Security and IP Tracking System for Oblivion X Protects
// Advanced security monitoring, IP tracking, and threat detection

class SecurityTracker {
    constructor() {
        this.ipDatabase = new Map();
        this.securityEvents = [];
        this.blockedIPs = new Set();
        this.suspiciousActivity = new Map();
        this.loginAttempts = new Map();
        this.maxLoginAttempts = 5;
        this.blockDuration = 30 * 60 * 1000; // 30 minutes
        this.geoLocationCache = new Map();
        
        this.init();
    }

    init() {
        this.startIPTracking();
        this.setupSecurityMonitoring();
        this.loadSecurityData();
        this.startCleanupTasks();
    }

    // IP Tracking and Geolocation
    async trackUserIP(userId, apiKey) {
        const clientIP = this.getClientIP();
        const timestamp = new Date();
        
        // Get geolocation data
        const location = await this.getIPLocation(clientIP);
        
        // Create IP record
        const ipRecord = {
            ip: clientIP,
            userId: userId,
            apiKey: apiKey,
            location: location,
            firstSeen: timestamp,
            lastSeen: timestamp,
            loginCount: 1,
            suspicious: false,
            blocked: false
        };

        // Check if IP exists
        if (this.ipDatabase.has(clientIP)) {
            const existing = this.ipDatabase.get(clientIP);
            existing.lastSeen = timestamp;
            existing.loginCount++;
            
            // Check for suspicious activity
            if (existing.userId !== userId) {
                this.flagSuspiciousActivity(clientIP, 'multiple_users', {
                    previousUser: existing.userId,
                    currentUser: userId
                });
            }
        } else {
            this.ipDatabase.set(clientIP, ipRecord);
        }

        // Log security event
        this.logSecurityEvent('ip_tracked', {
            ip: clientIP,
            userId: userId,
            location: location.city + ', ' + location.country,
            userAgent: navigator.userAgent
        });

        return ipRecord;
    }

    getClientIP() {
        // In a real implementation, this would get the actual client IP
        // For demo purposes, we'll simulate different IPs
        const simulatedIPs = [
            '192.168.1.100',
            '10.0.0.45',
            '172.16.0.23',
            '203.0.113.15',
            '198.51.100.42'
        ];
        
        return simulatedIPs[Math.floor(Math.random() * simulatedIPs.length)];
    }

    async getIPLocation(ip) {
        // Check cache first
        if (this.geoLocationCache.has(ip)) {
            return this.geoLocationCache.get(ip);
        }

        // Simulate geolocation lookup
        const locations = [
            { city: 'New York', country: 'United States', region: 'NY', timezone: 'America/New_York' },
            { city: 'London', country: 'United Kingdom', region: 'England', timezone: 'Europe/London' },
            { city: 'Tokyo', country: 'Japan', region: 'Tokyo', timezone: 'Asia/Tokyo' },
            { city: 'Sydney', country: 'Australia', region: 'NSW', timezone: 'Australia/Sydney' },
            { city: 'Berlin', country: 'Germany', region: 'Berlin', timezone: 'Europe/Berlin' }
        ];

        const location = locations[Math.floor(Math.random() * locations.length)];
        this.geoLocationCache.set(ip, location);
        
        return location;
    }

    // Login Attempt Tracking
    trackLoginAttempt(ip, success, userId = null) {
        const timestamp = new Date();
        
        if (!this.loginAttempts.has(ip)) {
            this.loginAttempts.set(ip, {
                attempts: 0,
                lastAttempt: timestamp,
                blocked: false,
                blockExpiry: null
            });
        }

        const record = this.loginAttempts.get(ip);

        if (success) {
            // Reset attempts on successful login
            record.attempts = 0;
            record.blocked = false;
            record.blockExpiry = null;
            
            this.logSecurityEvent('login_success', {
                ip: ip,
                userId: userId,
                timestamp: timestamp
            });
        } else {
            record.attempts++;
            record.lastAttempt = timestamp;

            // Block IP if too many failed attempts
            if (record.attempts >= this.maxLoginAttempts) {
                record.blocked = true;
                record.blockExpiry = new Date(timestamp.getTime() + this.blockDuration);
                this.blockedIPs.add(ip);

                this.logSecurityEvent('ip_blocked', {
                    ip: ip,
                    attempts: record.attempts,
                    blockDuration: this.blockDuration / 60000 + ' minutes'
                });

                // Send alert
                this.sendSecurityAlert('IP_BLOCKED', {
                    ip: ip,
                    attempts: record.attempts,
                    location: this.geoLocationCache.get(ip)
                });
            }

            this.logSecurityEvent('login_failed', {
                ip: ip,
                attempts: record.attempts,
                timestamp: timestamp
            });
        }
    }

    // Suspicious Activity Detection
    flagSuspiciousActivity(ip, type, details) {
        const timestamp = new Date();
        
        if (!this.suspiciousActivity.has(ip)) {
            this.suspiciousActivity.set(ip, []);
        }

        const activity = {
            type: type,
            details: details,
            timestamp: timestamp,
            severity: this.getSeverityLevel(type)
        };

        this.suspiciousActivity.get(ip).push(activity);

        // Mark IP as suspicious
        if (this.ipDatabase.has(ip)) {
            this.ipDatabase.get(ip).suspicious = true;
        }

        this.logSecurityEvent('suspicious_activity', {
            ip: ip,
            type: type,
            details: details,
            severity: activity.severity
        });

        // Auto-block for high severity activities
        if (activity.severity === 'high') {
            this.blockIP(ip, 'Automatic block due to suspicious activity');
        }
    }

    getSeverityLevel(activityType) {
        const severityMap = {
            'multiple_users': 'medium',
            'rapid_requests': 'high',
            'invalid_api_key': 'low',
            'tamper_attempt': 'high',
            'unusual_location': 'medium',
            'bot_detected': 'high'
        };

        return severityMap[activityType] || 'low';
    }

    // IP Blocking and Management
    blockIP(ip, reason) {
        this.blockedIPs.add(ip);
        
        if (this.ipDatabase.has(ip)) {
            this.ipDatabase.get(ip).blocked = true;
        }

        this.logSecurityEvent('manual_ip_block', {
            ip: ip,
            reason: reason,
            timestamp: new Date()
        });

        this.sendSecurityAlert('MANUAL_IP_BLOCK', {
            ip: ip,
            reason: reason
        });
    }

    unblockIP(ip) {
        this.blockedIPs.delete(ip);
        
        if (this.ipDatabase.has(ip)) {
            this.ipDatabase.get(ip).blocked = false;
        }

        if (this.loginAttempts.has(ip)) {
            const record = this.loginAttempts.get(ip);
            record.blocked = false;
            record.blockExpiry = null;
            record.attempts = 0;
        }

        this.logSecurityEvent('ip_unblocked', {
            ip: ip,
            timestamp: new Date()
        });
    }

    isIPBlocked(ip) {
        if (this.blockedIPs.has(ip)) {
            return true;
        }

        // Check if temporary block has expired
        if (this.loginAttempts.has(ip)) {
            const record = this.loginAttempts.get(ip);
            if (record.blocked && record.blockExpiry) {
                if (new Date() > record.blockExpiry) {
                    this.unblockIP(ip);
                    return false;
                }
                return true;
            }
        }

        return false;
    }

    // Security Event Logging
    logSecurityEvent(type, data) {
        const event = {
            id: this.generateEventId(),
            type: type,
            timestamp: new Date(),
            data: data,
            severity: this.getEventSeverity(type)
        };

        this.securityEvents.push(event);

        // Keep only last 1000 events
        if (this.securityEvents.length > 1000) {
            this.securityEvents.shift();
        }

        // Update dashboard if available
        this.updateSecurityDashboard(event);
    }

    getEventSeverity(eventType) {
        const severityMap = {
            'ip_tracked': 'info',
            'login_success': 'info',
            'login_failed': 'warning',
            'ip_blocked': 'error',
            'suspicious_activity': 'warning',
            'manual_ip_block': 'error',
            'tamper_detected': 'critical'
        };

        return severityMap[eventType] || 'info';
    }

    // Dashboard Integration
    updateSecurityDashboard(event) {
        // Update IP addresses tab
        this.updateIPAddressesList();
        
        // Update security stats
        this.updateSecurityStats();
        
        // Show real-time notifications for critical events
        if (event.severity === 'critical' || event.severity === 'error') {
            this.showSecurityNotification(event);
        }
    }

    updateIPAddressesList() {
        const ipList = document.querySelector('.ip-list');
        if (!ipList) return;

        const ipArray = Array.from(this.ipDatabase.entries())
            .sort((a, b) => b[1].lastSeen - a[1].lastSeen)
            .slice(0, 10); // Show only recent 10

        ipList.innerHTML = ipArray.map(([ip, data]) => {
            const statusClass = data.blocked ? 'blocked' : 
                               data.suspicious ? 'suspicious' : 
                               this.isRecentActivity(data.lastSeen) ? 'current' : 'recent';
            
            const statusText = data.blocked ? 'Blocked' : 
                              data.suspicious ? 'Suspicious' : 
                              this.isRecentActivity(data.lastSeen) ? 'Current' : 'Recent';

            return `
                <div class="ip-item">
                    <span class="ip-address">${ip}</span>
                    <span class="location">${data.location.city}, ${data.location.country}</span>
                    <span class="last-login">${this.formatTimeAgo(data.lastSeen)}</span>
                    <span class="status-badge status-${statusClass}">${statusText}</span>
                    <div class="ip-actions">
                        ${!data.blocked ? `<button class="action-btn" onclick="securityTracker.blockIP('${ip}', 'Manual block')">Block</button>` : 
                          `<button class="action-btn" onclick="securityTracker.unblockIP('${ip}')">Unblock</button>`}
                        <button class="action-btn" onclick="securityTracker.viewIPDetails('${ip}')">Details</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    updateSecurityStats() {
        const stats = this.getSecurityStats();
        
        // Update dashboard stats if elements exist
        const blockedIPsEl = document.querySelector('.blocked-ips-count');
        const suspiciousIPsEl = document.querySelector('.suspicious-ips-count');
        const totalEventsEl = document.querySelector('.security-events-count');

        if (blockedIPsEl) blockedIPsEl.textContent = stats.blockedIPs;
        if (suspiciousIPsEl) suspiciousIPsEl.textContent = stats.suspiciousIPs;
        if (totalEventsEl) totalEventsEl.textContent = stats.totalEvents;
    }

    getSecurityStats() {
        const blockedIPs = this.blockedIPs.size;
        const suspiciousIPs = Array.from(this.ipDatabase.values()).filter(ip => ip.suspicious).length;
        const totalEvents = this.securityEvents.length;
        const recentEvents = this.securityEvents.filter(e => 
            new Date() - e.timestamp < 24 * 60 * 60 * 1000
        ).length;

        return {
            blockedIPs,
            suspiciousIPs,
            totalEvents,
            recentEvents
        };
    }

    // Utility Functions
    isRecentActivity(timestamp) {
        return new Date() - timestamp < 5 * 60 * 1000; // 5 minutes
    }

    formatTimeAgo(timestamp) {
        const now = new Date();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        return 'Just now';
    }

    generateEventId() {
        return 'SEC_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Alert System
    sendSecurityAlert(type, data) {
        const alert = {
            type: type,
            data: data,
            timestamp: new Date()
        };

        // Send to Discord webhook if available
        if (window.oblivionDashboard && window.oblivionDashboard.sendDiscordAlert) {
            window.oblivionDashboard.sendDiscordAlert(alert);
        }

        // Log to console for development
        console.warn('Security Alert:', alert);
    }

    showSecurityNotification(event) {
        if (window.oblivionDashboard && window.oblivionDashboard.showNotification) {
            const message = this.getEventMessage(event);
            window.oblivionDashboard.showNotification(message, 'error');
        }
    }

    getEventMessage(event) {
        const messages = {
            'ip_blocked': `IP ${event.data.ip} has been blocked after ${event.data.attempts} failed login attempts`,
            'suspicious_activity': `Suspicious activity detected from IP ${event.data.ip}: ${event.data.type}`,
            'tamper_detected': `Tamper attempt detected from IP ${event.data.ip}`,
            'manual_ip_block': `IP ${event.data.ip} manually blocked: ${event.data.reason}`
        };

        return messages[event.type] || `Security event: ${event.type}`;
    }

    // Public API Methods
    viewIPDetails(ip) {
        const ipData = this.ipDatabase.get(ip);
        if (!ipData) return;

        const suspicious = this.suspiciousActivity.get(ip) || [];
        const loginHistory = this.loginAttempts.get(ip);

        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>IP Address Details: ${ip}</h3>
                    <button class="close-modal" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="ip-details">
                    <div class="detail-section">
                        <h4>Location Information</h4>
                        <p><strong>City:</strong> ${ipData.location.city}</p>
                        <p><strong>Country:</strong> ${ipData.location.country}</p>
                        <p><strong>Region:</strong> ${ipData.location.region}</p>
                        <p><strong>Timezone:</strong> ${ipData.location.timezone}</p>
                    </div>
                    <div class="detail-section">
                        <h4>Activity Summary</h4>
                        <p><strong>First Seen:</strong> ${ipData.firstSeen.toLocaleString()}</p>
                        <p><strong>Last Seen:</strong> ${ipData.lastSeen.toLocaleString()}</p>
                        <p><strong>Login Count:</strong> ${ipData.loginCount}</p>
                        <p><strong>Status:</strong> ${ipData.blocked ? 'Blocked' : ipData.suspicious ? 'Suspicious' : 'Normal'}</p>
                    </div>
                    ${suspicious.length > 0 ? `
                        <div class="detail-section">
                            <h4>Suspicious Activities</h4>
                            ${suspicious.map(activity => `
                                <div class="activity-item">
                                    <strong>${activity.type}</strong> (${activity.severity})
                                    <br><small>${activity.timestamp.toLocaleString()}</small>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
                <div class="modal-actions">
                    ${!ipData.blocked ? 
                        `<button class="btn-primary" onclick="securityTracker.blockIP('${ip}', 'Manual block from details'); this.closest('.modal').remove()">Block IP</button>` :
                        `<button class="btn-primary" onclick="securityTracker.unblockIP('${ip}'); this.closest('.modal').remove()">Unblock IP</button>`
                    }
                    <button class="btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    exportSecurityData() {
        const data = {
            timestamp: new Date().toISOString(),
            ipDatabase: Object.fromEntries(this.ipDatabase),
            securityEvents: this.securityEvents,
            blockedIPs: Array.from(this.blockedIPs),
            suspiciousActivity: Object.fromEntries(this.suspiciousActivity),
            stats: this.getSecurityStats()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `security-report-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // Cleanup and Maintenance
    startCleanupTasks() {
        // Clean up old events every hour
        setInterval(() => {
            this.cleanupOldEvents();
        }, 60 * 60 * 1000);

        // Clean up expired blocks every 10 minutes
        setInterval(() => {
            this.cleanupExpiredBlocks();
        }, 10 * 60 * 1000);
    }

    cleanupOldEvents() {
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        this.securityEvents = this.securityEvents.filter(event => event.timestamp > oneWeekAgo);
    }

    cleanupExpiredBlocks() {
        const now = new Date();
        for (const [ip, record] of this.loginAttempts.entries()) {
            if (record.blocked && record.blockExpiry && now > record.blockExpiry) {
                this.unblockIP(ip);
            }
        }
    }

    startIPTracking() {
        // Start tracking current session
        if (window.oblivionDashboard && window.oblivionDashboard.currentUser) {
            this.trackUserIP(
                window.oblivionDashboard.currentUser.username,
                window.oblivionDashboard.currentUser.apiKey
            );
        }
    }

    setupSecurityMonitoring() {
        // Monitor for suspicious patterns
        setInterval(() => {
            this.detectSuspiciousPatterns();
        }, 60000); // Check every minute
    }

    detectSuspiciousPatterns() {
        // Detect rapid requests from same IP
        const recentEvents = this.securityEvents.filter(e => 
            new Date() - e.timestamp < 60000 && e.type === 'ip_tracked'
        );

        const ipCounts = new Map();
        recentEvents.forEach(event => {
            const ip = event.data.ip;
            ipCounts.set(ip, (ipCounts.get(ip) || 0) + 1);
        });

        ipCounts.forEach((count, ip) => {
            if (count > 10) { // More than 10 requests per minute
                this.flagSuspiciousActivity(ip, 'rapid_requests', { requestCount: count });
            }
        });
    }

    loadSecurityData() {
        // Load any persisted security data
        const savedData = localStorage.getItem('oblivion_security_data');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                if (data.blockedIPs) {
                    this.blockedIPs = new Set(data.blockedIPs);
                }
            } catch (error) {
                console.error('Failed to load security data:', error);
            }
        }

        // Save security data periodically
        setInterval(() => {
            this.saveSecurityData();
        }, 5 * 60 * 1000); // Every 5 minutes
    }

    saveSecurityData() {
        const data = {
            blockedIPs: Array.from(this.blockedIPs),
            timestamp: new Date().toISOString()
        };

        localStorage.setItem('oblivion_security_data', JSON.stringify(data));
    }
}

// Initialize security tracker
window.securityTracker = new SecurityTracker();

// Export for global use
window.SecurityTracker = SecurityTracker;
