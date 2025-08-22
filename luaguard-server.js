const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'luaguard_secret_key_2025';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// File upload configuration
const upload = multer({
    dest: 'uploads/',
    fileFilter: (req, file, cb) => {
        if (file.originalname.endsWith('.lua')) {
            cb(null, true);
        } else {
            cb(new Error('Only .lua files are allowed'));
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// In-memory database (replace with real database in production)
const database = {
    users: new Map(),
    scripts: new Map(),
    keys: new Map(),
    sessions: new Map()
};

// Utility functions
function generateKey() {
    const segments = [];
    for (let i = 0; i < 4; i++) {
        segments.push(crypto.randomBytes(2).toString('hex').toUpperCase());
    }
    return `LG-${segments.join('-')}`;
}

function generateHWID() {
    return crypto.randomBytes(16).toString('hex').toUpperCase();
}

function obfuscateLuaScript(content, level = 'basic') {
    // Basic obfuscation simulation
    const obfuscated = `-- Protected by LuaGuard
-- Protection Level: ${level}
-- Generated: ${new Date().toISOString()}

local function _0x${crypto.randomBytes(3).toString('hex')}()
    local _0x${crypto.randomBytes(3).toString('hex')} = "${Buffer.from(content).toString('base64')}"
    return (function()
        ${content.split('\n').map(line => 
            `        -- ${line.replace(/--.*$/, '').trim()}`
        ).join('\n')}
    end)()
end

return _0x${crypto.randomBytes(3).toString('hex')}()`;
    
    return obfuscated;
}

// Authentication middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
}

// Routes

// User registration (30-day free trial)
app.post('/api/register', async (req, res) => {
    try {
        const { email, password, username } = req.body;
        
        if (database.users.has(email)) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const trialExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        
        const user = {
            id: crypto.randomUUID(),
            email,
            username,
            password: hashedPassword,
            plan: 'trial',
            trial_expires: trialExpires,
            created_at: new Date(),
            scripts: [],
            keys: []
        };

        database.users.set(email, user);

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            success: true,
            message: '30-day free trial activated!',
            token,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                plan: user.plan,
                trial_expires: user.trial_expires
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Registration failed' });
    }
});

// User login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = database.users.get(email);
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                plan: user.plan,
                trial_expires: user.trial_expires
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

// Upload and obfuscate script
app.post('/api/scripts/upload', authenticateToken, upload.single('script'), (req, res) => {
    try {
        const { name, protection_level = 'basic' } = req.body;
        const user = database.users.get(req.user.email);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check user limits based on plan
        const limits = {
            trial: 5,
            pro: 25,
            premium: 100,
            enterprise: Infinity
        };

        if (user.scripts.length >= limits[user.plan]) {
            return res.status(400).json({ error: 'Script limit reached for your plan' });
        }

        // Read and obfuscate script
        const scriptContent = fs.readFileSync(req.file.path, 'utf8');
        const obfuscatedContent = obfuscateLuaScript(scriptContent, protection_level);
        
        const script = {
            id: crypto.randomUUID(),
            name,
            original_size: scriptContent.length,
            obfuscated_size: obfuscatedContent.length,
            protection_level,
            created_at: new Date(),
            user_id: user.id,
            keys: [],
            analytics: {
                downloads: 0,
                executions: 0,
                revenue: 0
            }
        };

        // Save obfuscated script
        const scriptDir = path.join('protected_scripts', user.id);
        if (!fs.existsSync(scriptDir)) {
            fs.mkdirSync(scriptDir, { recursive: true });
        }
        
        const scriptPath = path.join(scriptDir, `${script.id}.lua`);
        fs.writeFileSync(scriptPath, obfuscatedContent);
        script.file_path = scriptPath;

        // Update database
        database.scripts.set(script.id, script);
        user.scripts.push(script.id);

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        res.json({
            success: true,
            script: {
                id: script.id,
                name: script.name,
                protection_level: script.protection_level,
                created_at: script.created_at,
                size_reduction: `${((1 - obfuscatedContent.length / scriptContent.length) * 100).toFixed(1)}%`
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Script upload failed' });
    }
});

// Generate license key
app.post('/api/keys/generate', authenticateToken, (req, res) => {
    try {
        const { script_id, duration_days = 30, max_uses = 1 } = req.body;
        const user = database.users.get(req.user.email);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const script = database.scripts.get(script_id);
        if (!script || script.user_id !== user.id) {
            return res.status(404).json({ error: 'Script not found' });
        }

        // Check key limits
        const keyLimits = {
            trial: 50,
            pro: 500,
            premium: 5000,
            enterprise: Infinity
        };

        if (user.keys.length >= keyLimits[user.plan]) {
            return res.status(400).json({ error: 'Key limit reached for your plan' });
        }

        const key = {
            id: crypto.randomUUID(),
            key: generateKey(),
            script_id,
            user_id: user.id,
            created_at: new Date(),
            expires_at: new Date(Date.now() + duration_days * 24 * 60 * 60 * 1000),
            max_uses,
            current_uses: 0,
            status: 'active',
            hwid_whitelist: [],
            last_used: null
        };

        database.keys.set(key.key, key);
        user.keys.push(key.key);
        script.keys.push(key.key);

        res.json({
            success: true,
            key: {
                key: key.key,
                expires_at: key.expires_at,
                max_uses: key.max_uses,
                status: key.status
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Key generation failed' });
    }
});

// Validate license key (used by protected scripts)
app.post('/api/keys/validate', (req, res) => {
    try {
        const { key, hwid, script_id } = req.body;
        
        const keyData = database.keys.get(key);
        if (!keyData) {
            return res.status(404).json({ error: 'Invalid key' });
        }

        // Check expiration
        if (new Date() > keyData.expires_at) {
            return res.status(403).json({ error: 'Key expired' });
        }

        // Check usage limit
        if (keyData.current_uses >= keyData.max_uses) {
            return res.status(403).json({ error: 'Key usage limit exceeded' });
        }

        // Check HWID if whitelist exists
        if (keyData.hwid_whitelist.length > 0 && !keyData.hwid_whitelist.includes(hwid)) {
            return res.status(403).json({ error: 'Hardware ID not whitelisted' });
        }

        // Check script association
        if (keyData.script_id !== script_id) {
            return res.status(403).json({ error: 'Key not valid for this script' });
        }

        // Update usage statistics
        keyData.current_uses++;
        keyData.last_used = new Date();
        
        // Add HWID to whitelist if first use
        if (hwid && !keyData.hwid_whitelist.includes(hwid)) {
            keyData.hwid_whitelist.push(hwid);
        }

        // Update script analytics
        const script = database.scripts.get(script_id);
        if (script) {
            script.analytics.executions++;
        }

        res.json({
            success: true,
            message: 'Key validated successfully',
            expires_at: keyData.expires_at,
            uses_remaining: keyData.max_uses - keyData.current_uses
        });
    } catch (error) {
        res.status(500).json({ error: 'Key validation failed' });
    }
});

// Get user dashboard data
app.get('/api/dashboard', authenticateToken, (req, res) => {
    try {
        const user = database.users.get(req.user.email);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get user's scripts
        const userScripts = user.scripts.map(scriptId => {
            const script = database.scripts.get(scriptId);
            return {
                id: script.id,
                name: script.name,
                protection_level: script.protection_level,
                created_at: script.created_at,
                keys_count: script.keys.length,
                analytics: script.analytics
            };
        });

        // Get user's keys
        const userKeys = user.keys.map(keyStr => {
            const key = database.keys.get(keyStr);
            const script = database.scripts.get(key.script_id);
            return {
                key: key.key,
                script_name: script.name,
                expires_at: key.expires_at,
                status: key.status,
                current_uses: key.current_uses,
                max_uses: key.max_uses
            };
        });

        // Calculate total revenue
        const totalRevenue = userScripts.reduce((sum, script) => sum + script.analytics.revenue, 0);

        res.json({
            success: true,
            user: {
                email: user.email,
                username: user.username,
                plan: user.plan,
                trial_expires: user.trial_expires
            },
            stats: {
                scripts: userScripts.length,
                keys: userKeys.length,
                total_users: userKeys.reduce((sum, key) => sum + key.current_uses, 0),
                revenue: totalRevenue
            },
            scripts: userScripts,
            keys: userKeys,
            recent_activity: generateRecentActivity(user)
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to load dashboard data' });
    }
});

// Get protected script
app.get('/api/scripts/:scriptId/download', authenticateToken, (req, res) => {
    try {
        const script = database.scripts.get(req.params.scriptId);
        if (!script || script.user_id !== req.user.userId) {
            return res.status(404).json({ error: 'Script not found' });
        }

        script.analytics.downloads++;
        
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', `attachment; filename="${script.name}"`);
        res.sendFile(path.resolve(script.file_path));
    } catch (error) {
        res.status(500).json({ error: 'Download failed' });
    }
});

// Revoke license key
app.post('/api/keys/:key/revoke', authenticateToken, (req, res) => {
    try {
        const keyData = database.keys.get(req.params.key);
        if (!keyData) {
            return res.status(404).json({ error: 'Key not found' });
        }

        const user = database.users.get(req.user.email);
        if (!user || keyData.user_id !== user.id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        keyData.status = 'revoked';
        keyData.revoked_at = new Date();

        res.json({
            success: true,
            message: 'Key revoked successfully'
        });
    } catch (error) {
        res.status(500).json({ error: 'Key revocation failed' });
    }
});

// Get script analytics
app.get('/api/scripts/:scriptId/analytics', authenticateToken, (req, res) => {
    try {
        const script = database.scripts.get(req.params.scriptId);
        if (!script || script.user_id !== req.user.userId) {
            return res.status(404).json({ error: 'Script not found' });
        }

        // Generate mock analytics data
        const analytics = {
            ...script.analytics,
            usage_over_time: generateUsageData(),
            geographic_distribution: generateGeoData(),
            key_status_breakdown: generateKeyStatusData(script.keys)
        };

        res.json({
            success: true,
            analytics
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to load analytics' });
    }
});

// Webhook for key validation (for protected scripts)
app.post('/api/validate', (req, res) => {
    try {
        const { key, hwid, script_checksum } = req.body;
        
        const keyData = database.keys.get(key);
        if (!keyData) {
            return res.status(404).json({ valid: false, error: 'Invalid key' });
        }

        // Check expiration
        if (new Date() > keyData.expires_at) {
            return res.status(403).json({ valid: false, error: 'Key expired' });
        }

        // Check status
        if (keyData.status !== 'active') {
            return res.status(403).json({ valid: false, error: 'Key not active' });
        }

        // Update usage
        keyData.current_uses++;
        keyData.last_used = new Date();

        // Update script analytics
        const script = database.scripts.get(keyData.script_id);
        if (script) {
            script.analytics.executions++;
        }

        res.json({
            valid: true,
            expires_at: keyData.expires_at,
            uses_remaining: keyData.max_uses - keyData.current_uses
        });
    } catch (error) {
        res.status(500).json({ valid: false, error: 'Validation failed' });
    }
});

// Helper functions
function generateRecentActivity(user) {
    return [
        {
            type: 'key_generated',
            message: 'New License Key Generated',
            details: `Key: LG-****-****-${crypto.randomBytes(2).toString('hex').toUpperCase()} created`,
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        {
            type: 'script_protected',
            message: 'Script Obfuscated',
            details: 'premium_script.lua successfully protected',
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000)
        },
        {
            type: 'user_registration',
            message: 'New User Registration',
            details: 'User purchased script license',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
    ];
}

function generateUsageData() {
    const data = [];
    for (let i = 29; i >= 0; i--) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        data.push({
            date: date.toISOString().split('T')[0],
            executions: Math.floor(Math.random() * 100) + 10,
            unique_users: Math.floor(Math.random() * 50) + 5
        });
    }
    return data;
}

function generateGeoData() {
    return [
        { country: 'United States', users: 45, percentage: 35 },
        { country: 'United Kingdom', users: 23, percentage: 18 },
        { country: 'Germany', users: 18, percentage: 14 },
        { country: 'Canada', users: 15, percentage: 12 },
        { country: 'Australia', users: 12, percentage: 9 },
        { country: 'Other', users: 15, percentage: 12 }
    ];
}

function generateKeyStatusData(keys) {
    const active = keys.filter(key => database.keys.get(key)?.status === 'active').length;
    const expired = keys.filter(key => {
        const keyData = database.keys.get(key);
        return keyData && new Date() > keyData.expires_at;
    }).length;
    const revoked = keys.filter(key => database.keys.get(key)?.status === 'revoked').length;
    
    return { active, expired, revoked };
}

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large (max 10MB)' });
        }
    }
    
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// Serve static files
app.use(express.static('.'));

// Start server
app.listen(PORT, () => {
    console.log(`LuaGuard server running on port ${PORT}`);
    console.log(`Dashboard: http://localhost:${PORT}/dashboard.html`);
    console.log(`API: http://localhost:${PORT}/api`);
    
    // Create directories
    if (!fs.existsSync('uploads')) {
        fs.mkdirSync('uploads');
    }
    if (!fs.existsSync('protected_scripts')) {
        fs.mkdirSync('protected_scripts');
    }
});

module.exports = app;
