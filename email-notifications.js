/**
 * Oblivion X Protects - Email Notification System
 * Handles automated email notifications for security events, user actions, and system alerts
 */

class EmailNotificationSystem {
    constructor() {
        this.config = {
            smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
            smtpPort: process.env.SMTP_PORT || 587,
            smtpUser: process.env.SMTP_USER || '',
            smtpPass: process.env.SMTP_PASS || '',
            fromEmail: process.env.FROM_EMAIL || 'noreply@oblivionx.com',
            fromName: 'Oblivion X Protects'
        };
        
        this.templates = {
            welcome: this.getWelcomeTemplate(),
            keyExpiring: this.getKeyExpiringTemplate(),
            securityAlert: this.getSecurityAlertTemplate(),
            scriptExecuted: this.getScriptExecutedTemplate(),
            userBlacklisted: this.getUserBlacklistedTemplate(),
            systemAlert: this.getSystemAlertTemplate()
        };
        
        this.emailQueue = [];
        this.isProcessing = false;
        
        // Initialize email service
        this.initializeEmailService();
    }

    /**
     * Initialize email service (simulated for demo)
     */
    initializeEmailService() {
        console.log('📧 Email notification system initialized');
        
        // Start processing queue
        setInterval(() => {
            this.processEmailQueue();
        }, 5000); // Process every 5 seconds
    }

    /**
     * Send welcome email to new users
     */
    async sendWelcomeEmail(user) {
        const emailData = {
            to: user.email,
            subject: 'Welcome to Oblivion X Protects! 🛡️',
            template: 'welcome',
            data: {
                username: user.username,
                apiKey: user.apiKey,
                plan: user.plan,
                expiresAt: user.expiresAt,
                dashboardUrl: 'https://oblivionx.com/dashboard.html'
            }
        };
        
        return this.queueEmail(emailData);
    }

    /**
     * Send API key expiring notification
     */
    async sendKeyExpiringNotification(user, daysRemaining) {
        const emailData = {
            to: user.email,
            subject: `⚠️ Your API Key Expires in ${daysRemaining} Days`,
            template: 'keyExpiring',
            data: {
                username: user.username,
                daysRemaining: daysRemaining,
                expiresAt: user.expiresAt,
                renewUrl: 'https://oblivionx.com/pricing.html',
                plan: user.plan
            }
        };
        
        return this.queueEmail(emailData);
    }

    /**
     * Send security alert notification
     */
    async sendSecurityAlert(user, event) {
        const emailData = {
            to: user.email,
            subject: '🚨 Security Alert - Suspicious Activity Detected',
            template: 'securityAlert',
            data: {
                username: user.username,
                eventType: event.type,
                severity: event.severity,
                timestamp: event.timestamp,
                ip: event.ip,
                location: event.location,
                details: event.details,
                dashboardUrl: 'https://oblivionx.com/dashboard.html#ip-addresses'
            }
        };
        
        return this.queueEmail(emailData);
    }

    /**
     * Send script execution summary
     */
    async sendScriptExecutionSummary(user, scriptData) {
        const emailData = {
            to: user.email,
            subject: '📊 Daily Script Execution Summary',
            template: 'scriptExecuted',
            data: {
                username: user.username,
                scriptName: scriptData.name,
                executions: scriptData.executions,
                uniqueUsers: scriptData.uniqueUsers,
                topUser: scriptData.topUser,
                date: new Date().toLocaleDateString(),
                dashboardUrl: 'https://oblivionx.com/dashboard.html#status'
            }
        };
        
        return this.queueEmail(emailData);
    }

    /**
     * Send user blacklisted notification
     */
    async sendUserBlacklistedAlert(user, blacklistedUser, scriptName) {
        const emailData = {
            to: user.email,
            subject: '🚫 User Blacklisted - Security Action Taken',
            template: 'userBlacklisted',
            data: {
                username: user.username,
                blacklistedUserId: blacklistedUser.userId,
                blacklistedUsername: blacklistedUser.username,
                scriptName: scriptName,
                reason: blacklistedUser.reason,
                timestamp: new Date().toISOString(),
                dashboardUrl: 'https://oblivionx.com/dashboard.html#projects'
            }
        };
        
        return this.queueEmail(emailData);
    }

    /**
     * Send system alert to administrators
     */
    async sendSystemAlert(alertData) {
        const adminEmails = ['admin@oblivionx.com', 'security@oblivionx.com'];
        
        for (const email of adminEmails) {
            const emailData = {
                to: email,
                subject: `🔧 System Alert - ${alertData.type}`,
                template: 'systemAlert',
                data: {
                    alertType: alertData.type,
                    severity: alertData.severity,
                    message: alertData.message,
                    timestamp: alertData.timestamp,
                    affectedUsers: alertData.affectedUsers || 0,
                    systemStatus: alertData.systemStatus || 'operational'
                }
            };
            
            this.queueEmail(emailData);
        }
    }

    /**
     * Queue email for processing
     */
    queueEmail(emailData) {
        emailData.id = this.generateEmailId();
        emailData.queuedAt = new Date().toISOString();
        emailData.attempts = 0;
        emailData.status = 'queued';
        
        this.emailQueue.push(emailData);
        
        console.log(`📧 Email queued: ${emailData.subject} to ${emailData.to}`);
        
        return {
            success: true,
            emailId: emailData.id,
            status: 'queued'
        };
    }

    /**
     * Process email queue
     */
    async processEmailQueue() {
        if (this.isProcessing || this.emailQueue.length === 0) {
            return;
        }
        
        this.isProcessing = true;
        
        const email = this.emailQueue.shift();
        
        try {
            await this.sendEmail(email);
            console.log(`✅ Email sent successfully: ${email.id}`);
        } catch (error) {
            console.error(`❌ Failed to send email ${email.id}:`, error.message);
            
            // Retry logic
            email.attempts++;
            if (email.attempts < 3) {
                email.status = 'retry';
                this.emailQueue.push(email);
            } else {
                email.status = 'failed';
                console.error(`💀 Email ${email.id} failed permanently after 3 attempts`);
            }
        }
        
        this.isProcessing = false;
    }

    /**
     * Send email (simulated for demo)
     */
    async sendEmail(emailData) {
        // Simulate email sending delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simulate occasional failures for testing
        if (Math.random() < 0.1) {
            throw new Error('SMTP connection failed');
        }
        
        const htmlContent = this.renderTemplate(emailData.template, emailData.data);
        
        // In production, use actual SMTP service like nodemailer
        console.log(`📧 [SIMULATED] Sending email:
To: ${emailData.to}
Subject: ${emailData.subject}
Template: ${emailData.template}
Data: ${JSON.stringify(emailData.data, null, 2)}`);
        
        return {
            success: true,
            messageId: `msg_${Date.now()}`,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Render email template with data
     */
    renderTemplate(templateName, data) {
        const template = this.templates[templateName];
        if (!template) {
            throw new Error(`Template ${templateName} not found`);
        }
        
        let html = template.html;
        
        // Simple template variable replacement
        Object.keys(data).forEach(key => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            html = html.replace(regex, data[key] || '');
        });
        
        return html;
    }

    /**
     * Generate unique email ID
     */
    generateEmailId() {
        return `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get email statistics
     */
    getEmailStats() {
        return {
            queueLength: this.emailQueue.length,
            isProcessing: this.isProcessing,
            totalSent: this.totalSent || 0,
            totalFailed: this.totalFailed || 0,
            templates: Object.keys(this.templates)
        };
    }

    // Email Templates
    getWelcomeTemplate() {
        return {
            html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Inter', sans-serif; background: #0f0f23; color: #e2e8f0; margin: 0; padding: 20px; }
                    .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 12px; overflow: hidden; }
                    .header { background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%); padding: 30px; text-align: center; }
                    .logo { font-size: 24px; font-weight: bold; color: white; }
                    .content { padding: 30px; }
                    .key-box { background: rgba(168, 85, 247, 0.1); border: 1px solid #a855f7; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
                    .key { font-family: 'Courier New', monospace; font-size: 18px; color: #a855f7; font-weight: bold; }
                    .button { display: inline-block; background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
                    .footer { background: #0f0f23; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="logo">🛡️ Oblivion X Protects</div>
                        <h1>Welcome to the Future of Lua Protection!</h1>
                    </div>
                    <div class="content">
                        <h2>Hello {{username}}! 👋</h2>
                        <p>Welcome to Oblivion X Protects, the most advanced Lua script protection platform in the galaxy!</p>
                        
                        <div class="key-box">
                            <h3>Your API Key</h3>
                            <div class="key">{{apiKey}}</div>
                            <p>Plan: <strong>{{plan}}</strong> | Expires: {{expiresAt}}</p>
                        </div>
                        
                        <h3>🚀 What's Next?</h3>
                        <ul>
                            <li>Upload your first Lua script for protection</li>
                            <li>Configure whitelist/blacklist settings</li>
                            <li>Monitor real-time analytics</li>
                            <li>Join our Discord community</li>
                        </ul>
                        
                        <div style="text-align: center;">
                            <a href="{{dashboardUrl}}" class="button">Access Dashboard</a>
                        </div>
                        
                        <p><strong>Need help?</strong> Join our Discord server or check out our documentation.</p>
                    </div>
                    <div class="footer">
                        <p>© 2024 Oblivion X Protects. Securing the future of Lua development.</p>
                        <p>This email was sent to {{email}}. If you didn't create this account, please ignore this email.</p>
                    </div>
                </div>
            </body>
            </html>
            `
        };
    }

    getKeyExpiringTemplate() {
        return {
            html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Inter', sans-serif; background: #0f0f23; color: #e2e8f0; margin: 0; padding: 20px; }
                    .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 12px; overflow: hidden; }
                    .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center; }
                    .content { padding: 30px; }
                    .warning-box { background: rgba(245, 158, 11, 0.1); border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
                    .button { display: inline-block; background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
                    .footer { background: #0f0f23; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>⚠️ API Key Expiring Soon</h1>
                    </div>
                    <div class="content">
                        <h2>Hello {{username}}!</h2>
                        <p>Your Oblivion X Protects API key is expiring soon.</p>
                        
                        <div class="warning-box">
                            <h3>⏰ {{daysRemaining}} Days Remaining</h3>
                            <p>Your <strong>{{plan}}</strong> plan expires on <strong>{{expiresAt}}</strong></p>
                        </div>
                        
                        <h3>Don't lose access to your protected scripts!</h3>
                        <p>Renew now to continue enjoying:</p>
                        <ul>
                            <li>Advanced script obfuscation</li>
                            <li>Real-time analytics</li>
                            <li>User management tools</li>
                            <li>Priority support</li>
                        </ul>
                        
                        <div style="text-align: center;">
                            <a href="{{renewUrl}}" class="button">Renew Now</a>
                        </div>
                    </div>
                    <div class="footer">
                        <p>© 2024 Oblivion X Protects</p>
                    </div>
                </div>
            </body>
            </html>
            `
        };
    }

    getSecurityAlertTemplate() {
        return {
            html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Inter', sans-serif; background: #0f0f23; color: #e2e8f0; margin: 0; padding: 20px; }
                    .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 12px; overflow: hidden; }
                    .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center; }
                    .content { padding: 30px; }
                    .alert-box { background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; border-radius: 8px; padding: 20px; margin: 20px 0; }
                    .button { display: inline-block; background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
                    .footer { background: #0f0f23; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🚨 Security Alert</h1>
                    </div>
                    <div class="content">
                        <h2>Hello {{username}}!</h2>
                        <p>We detected suspicious activity on your account.</p>
                        
                        <div class="alert-box">
                            <h3>{{eventType}}</h3>
                            <p><strong>Severity:</strong> {{severity}}</p>
                            <p><strong>Time:</strong> {{timestamp}}</p>
                            <p><strong>IP Address:</strong> {{ip}}</p>
                            <p><strong>Location:</strong> {{location}}</p>
                            <p><strong>Details:</strong> {{details}}</p>
                        </div>
                        
                        <h3>🛡️ Actions Taken</h3>
                        <ul>
                            <li>Suspicious IP has been flagged</li>
                            <li>Additional monitoring enabled</li>
                            <li>Account security enhanced</li>
                        </ul>
                        
                        <div style="text-align: center;">
                            <a href="{{dashboardUrl}}" class="button">Review Security</a>
                        </div>
                    </div>
                    <div class="footer">
                        <p>© 2024 Oblivion X Protects</p>
                    </div>
                </div>
            </body>
            </html>
            `
        };
    }

    getScriptExecutedTemplate() {
        return {
            html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Inter', sans-serif; background: #0f0f23; color: #e2e8f0; margin: 0; padding: 20px; }
                    .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 12px; overflow: hidden; }
                    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; }
                    .content { padding: 30px; }
                    .stats-box { background: rgba(16, 185, 129, 0.1); border: 1px solid #10b981; border-radius: 8px; padding: 20px; margin: 20px 0; }
                    .stat { display: inline-block; margin: 10px 20px; text-align: center; }
                    .stat-number { font-size: 24px; font-weight: bold; color: #10b981; }
                    .button { display: inline-block; background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
                    .footer { background: #0f0f23; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>📊 Daily Script Summary</h1>
                    </div>
                    <div class="content">
                        <h2>Hello {{username}}!</h2>
                        <p>Here's your daily script execution summary for <strong>{{date}}</strong>.</p>
                        
                        <div class="stats-box">
                            <h3>{{scriptName}}</h3>
                            <div class="stat">
                                <div class="stat-number">{{executions}}</div>
                                <div>Executions</div>
                            </div>
                            <div class="stat">
                                <div class="stat-number">{{uniqueUsers}}</div>
                                <div>Unique Users</div>
                            </div>
                            <p><strong>Top User:</strong> {{topUser}}</p>
                        </div>
                        
                        <div style="text-align: center;">
                            <a href="{{dashboardUrl}}" class="button">View Full Analytics</a>
                        </div>
                    </div>
                    <div class="footer">
                        <p>© 2024 Oblivion X Protects</p>
                    </div>
                </div>
            </body>
            </html>
            `
        };
    }

    getUserBlacklistedTemplate() {
        return {
            html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Inter', sans-serif; background: #0f0f23; color: #e2e8f0; margin: 0; padding: 20px; }
                    .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 12px; overflow: hidden; }
                    .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center; }
                    .content { padding: 30px; }
                    .action-box { background: rgba(245, 158, 11, 0.1); border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0; }
                    .button { display: inline-block; background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
                    .footer { background: #0f0f23; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🚫 User Blacklisted</h1>
                    </div>
                    <div class="content">
                        <h2>Hello {{username}}!</h2>
                        <p>A user has been blacklisted from your script.</p>
                        
                        <div class="action-box">
                            <h3>Blacklist Action</h3>
                            <p><strong>User ID:</strong> {{blacklistedUserId}}</p>
                            <p><strong>Username:</strong> {{blacklistedUsername}}</p>
                            <p><strong>Script:</strong> {{scriptName}}</p>
                            <p><strong>Reason:</strong> {{reason}}</p>
                            <p><strong>Time:</strong> {{timestamp}}</p>
                        </div>
                        
                        <div style="text-align: center;">
                            <a href="{{dashboardUrl}}" class="button">Manage Users</a>
                        </div>
                    </div>
                    <div class="footer">
                        <p>© 2024 Oblivion X Protects</p>
                    </div>
                </div>
            </body>
            </html>
            `
        };
    }

    getSystemAlertTemplate() {
        return {
            html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Inter', sans-serif; background: #0f0f23; color: #e2e8f0; margin: 0; padding: 20px; }
                    .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 12px; overflow: hidden; }
                    .header { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 30px; text-align: center; }
                    .content { padding: 30px; }
                    .system-box { background: rgba(99, 102, 241, 0.1); border: 1px solid #6366f1; border-radius: 8px; padding: 20px; margin: 20px 0; }
                    .footer { background: #0f0f23; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔧 System Alert</h1>
                    </div>
                    <div class="content">
                        <h2>System Administrator</h2>
                        <p>A system event requires attention.</p>
                        
                        <div class="system-box">
                            <h3>{{alertType}}</h3>
                            <p><strong>Severity:</strong> {{severity}}</p>
                            <p><strong>Message:</strong> {{message}}</p>
                            <p><strong>Time:</strong> {{timestamp}}</p>
                            <p><strong>Affected Users:</strong> {{affectedUsers}}</p>
                            <p><strong>System Status:</strong> {{systemStatus}}</p>
                        </div>
                    </div>
                    <div class="footer">
                        <p>© 2024 Oblivion X Protects - System Notifications</p>
                    </div>
                </div>
            </body>
            </html>
            `
        };
    }
}

// Export for use in Node.js environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EmailNotificationSystem;
}

// Browser environment initialization
if (typeof window !== 'undefined') {
    window.EmailNotificationSystem = EmailNotificationSystem;
    
    // Initialize email system
    window.emailNotifications = new EmailNotificationSystem();
    
    console.log('📧 Email notification system loaded');
}
