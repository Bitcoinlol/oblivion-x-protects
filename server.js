const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/enigmacode', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
    keyId: { type: String, unique: true, required: true },
    plan: { type: String, enum: ['free', 'standard', 'premium'], default: 'free' },
    expiresAt: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    robloxUsername: { type: String, default: '' },
    totalScripts: { type: Number, default: 0 },
    totalActiveUsers: { type: Number, default: 0 },
    totalKeysCreated: { type: Number, default: 0 },
    totalKeysBanned: { type: Number, default: 0 },
    ipAddress: { type: String },
    hasGeneratedFreeKey: { type: Boolean, default: false }
});

const User = mongoose.model('User', userSchema);

// Project Schema
const projectSchema = new mongoose.Schema({
    projectId: { type: String, unique: true, required: true },
    userId: { type: String, required: true },
    name: { type: String, required: true },
    script: { type: String, required: true },
    obfuscatedScript: { type: String, required: true },
    type: { type: String, enum: ['free-for-all', 'user-management'], required: true },
    whitelistedUsers: [{ type: String }],
    blacklistedUsers: [{ type: String }],
    createdAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    accessKey: { type: String, required: true }
});

const Project = mongoose.model('Project', projectSchema);

// Activity Log Schema
const activitySchema = new mongoose.Schema({
    userId: { type: String, required: true },
    action: { type: String, required: true },
    details: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    robloxUserId: { type: String },
    projectId: { type: String }
});

const Activity = mongoose.model('Activity', activitySchema);

// Utility functions
function generateKey(plan = 'free') {
    const prefix = plan === 'free' ? 'FREE' : plan === 'standard' ? 'STD' : 'PREM';
    const randomString = crypto.randomBytes(16).toString('hex').toUpperCase();
    return `${prefix}-${randomString}`;
}

function generateProjectId() {
    return 'PROJ-' + uuidv4().split('-')[0].toUpperCase();
}

function generateAccessKey() {
    return crypto.randomBytes(32).toString('hex');
}

function getExpirationDate(plan) {
    const now = new Date();
    switch (plan) {
        case 'free':
            return new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days
        case 'standard':
            return new Date(now.getTime() + (365 * 24 * 60 * 60 * 1000)); // 1 year
        case 'premium':
            return new Date(now.getTime() + (365 * 24 * 60 * 60 * 1000)); // 1 year
        default:
            return new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
    }
}

// Import the enhanced obfuscation engine
const ObfuscationEngine = require('./obfuscation-engine');
const obfuscationEngine = new ObfuscationEngine();

// Enhanced obfuscation function
function obfuscateScript(script, tier = 'standard') {
    try {
        return obfuscationEngine.obfuscateWithHelper(script, tier);
    } catch (error) {
        console.error('Obfuscation error:', error);
        // Fallback to basic obfuscation
        return basicObfuscation(script);
    }
}

// Basic fallback obfuscation
function basicObfuscation(script) {
    let obfuscated = script;
    
    // Basic string encryption
    obfuscated = obfuscated.replace(/["']([^"']+)["']/g, (match, str) => {
        const encoded = Buffer.from(str).toString('base64');
        return `string.char(table.unpack({${str.split('').map(c => c.charCodeAt(0)).join(',')}}))`;
    });
    
    // Anti-debugging checks
    const antiDebug = `
local function checkDebug()
    if debug and debug.getinfo then
        error("Debug detected")
    end
end
checkDebug()
`;
    
    return antiDebug + obfuscated;
}

// Middleware to verify API key
async function verifyKey(req, res, next) {
    const keyId = req.headers['x-api-key'] || req.query.key;
    
    if (!keyId) {
        return res.status(401).json({ error: 'API key required' });
    }
    
    try {
        const user = await User.findOne({ keyId, isActive: true });
        if (!user || user.expiresAt < new Date()) {
            return res.status(401).json({ error: 'Invalid or expired key' });
        }
        
        req.user = user;
        next();
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
}

// Routes

// Generate free key
app.post('/api/generate-free-key', async (req, res) => {
    try {
        const clientIP = req.ip || req.connection.remoteAddress;
        
        // Check if IP has already generated a free key
        const existingUser = await User.findOne({ 
            ipAddress: clientIP, 
            hasGeneratedFreeKey: true 
        });
        
        if (existingUser) {
            return res.status(400).json({ error: 'Free key already generated for this IP' });
        }
        
        const keyId = generateKey('free');
        const expiresAt = getExpirationDate('free');
        
        const user = new User({
            keyId,
            plan: 'free',
            expiresAt,
            ipAddress: clientIP,
            hasGeneratedFreeKey: true
        });
        
        await user.save();
        
        res.json({ 
            key: keyId, 
            expiresAt,
            message: 'Free key generated successfully. This key will expire in 30 days.' 
        });
    } catch (error) {
        console.error('Error generating free key:', error);
        res.status(500).json({ error: 'Failed to generate key' });
    }
});

// Login with key
app.post('/api/login', async (req, res) => {
    try {
        const { key } = req.body;
        
        if (!key) {
            return res.status(400).json({ error: 'Key is required' });
        }
        
        const user = await User.findOne({ keyId: key, isActive: true });
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid key' });
        }
        
        if (user.expiresAt < new Date()) {
            return res.status(401).json({ error: 'Key has expired' });
        }
        
        const token = jwt.sign(
            { userId: user._id, keyId: user.keyId },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );
        
        res.json({ 
            token, 
            user: {
                keyId: user.keyId,
                plan: user.plan,
                expiresAt: user.expiresAt,
                totalScripts: user.totalScripts,
                totalActiveUsers: user.totalActiveUsers,
                totalKeysCreated: user.totalKeysCreated,
                totalKeysBanned: user.totalKeysBanned
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Get user dashboard data
app.get('/api/dashboard', verifyKey, async (req, res) => {
    try {
        const projects = await Project.find({ userId: req.user.keyId, isActive: true });
        const activities = await Activity.find({ userId: req.user.keyId })
            .sort({ timestamp: -1 })
            .limit(50);
        
        res.json({
            user: {
                keyId: req.user.keyId,
                plan: req.user.plan,
                expiresAt: req.user.expiresAt,
                totalScripts: req.user.totalScripts,
                totalActiveUsers: req.user.totalActiveUsers,
                totalKeysCreated: req.user.totalKeysCreated,
                totalKeysBanned: req.user.totalKeysBanned,
                robloxUsername: req.user.robloxUsername
            },
            projects,
            activities
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: 'Failed to load dashboard' });
    }
});

// Create project
app.post('/api/projects', verifyKey, async (req, res) => {
    try {
        const { name, script, type } = req.body;
        
        if (!name || !script || !type) {
            return res.status(400).json({ error: 'Name, script, and type are required' });
        }
        
        const projectId = generateProjectId();
        const accessKey = generateAccessKey();
        
        // Determine obfuscation tier based on user plan
        let obfuscationTier = 'standard';
        if (req.user.plan === 'premium') {
            obfuscationTier = 'premium';
        } else if (req.user.plan === 'free') {
            obfuscationTier = 'standard'; // Free users get standard obfuscation
        }
        
        const obfuscatedScript = obfuscateScript(script, obfuscationTier);
        
        const project = new Project({
            projectId,
            userId: req.user.keyId,
            name,
            script,
            obfuscatedScript,
            type,
            accessKey
        });
        
        await project.save();
        
        // Update user stats
        await User.findByIdAndUpdate(req.user._id, {
            $inc: { totalScripts: 1 }
        });
        
        // Log activity
        const activity = new Activity({
            userId: req.user.keyId,
            action: 'Project Created',
            details: `Created project: ${name}`,
            projectId
        });
        await activity.save();
        
        res.json({ project });
    } catch (error) {
        console.error('Project creation error:', error);
        res.status(500).json({ error: 'Failed to create project' });
    }
});

// Get project loader
app.get('/api/projects/:projectId/loader', verifyKey, async (req, res) => {
    try {
        const project = await Project.findOne({ 
            projectId: req.params.projectId, 
            userId: req.user.keyId 
        });
        
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        const loaderScript = `
-- EnigmaCode Loader v1.0
local HttpService = game:GetService("HttpService")
local Players = game:GetService("Players")

local API_BASE = "${req.protocol}://${req.get('host')}/api"
local PROJECT_ID = "${project.projectId}"
local ACCESS_KEY = "${project.accessKey}"

local function validateAndLoad()
    local player = Players.LocalPlayer
    if not player then
        return
    end
    
    local userId = tostring(player.UserId)
    local url = API_BASE .. "/validate/" .. PROJECT_ID .. "?userId=" .. userId .. "&key=" .. ACCESS_KEY
    
    local success, response = pcall(function()
        return HttpService:GetAsync(url)
    end)
    
    if success then
        local data = HttpService:JSONDecode(response)
        if data.success then
            local scriptToRun = data.script
            if scriptToRun then
                local loadFunc, err = loadstring(scriptToRun)
                if loadFunc then
                    loadFunc()
                else
                    -- Silent failure
                end
            end
        else
            if data.kick then
                player:Kick(data.message or "Access denied")
            end
        end
    end
end

validateAndLoad()
`;
        
        res.json({ loader: loaderScript });
    } catch (error) {
        console.error('Loader generation error:', error);
        res.status(500).json({ error: 'Failed to generate loader' });
    }
});

// Validate script execution
app.get('/api/validate/:projectId', async (req, res) => {
    try {
        const { projectId } = req.params;
        const { userId, key } = req.query;
        
        const project = await Project.findOne({ projectId, accessKey: key });
        
        if (!project) {
            return res.status(404).json({ 
                success: false, 
                message: 'Project not found' 
            });
        }
        
        if (project.type === 'user-management') {
            const isWhitelisted = project.whitelistedUsers.includes(userId);
            const isBlacklisted = project.blacklistedUsers.includes(userId);
            
            if (isBlacklisted) {
                return res.json({
                    success: false,
                    kick: true,
                    message: 'You are blacklisted from this script.'
                });
            }
            
            if (!isWhitelisted) {
                return res.json({
                    success: false,
                    kick: true,
                    message: 'You are not whitelisted.'
                });
            }
        }
        
        // Log activity
        const activity = new Activity({
            userId: project.userId,
            action: 'Script Executed',
            details: `Script executed by Roblox User ID: ${userId}`,
            robloxUserId: userId,
            projectId
        });
        await activity.save();
        
        res.json({
            success: true,
            script: project.obfuscatedScript
        });
    } catch (error) {
        console.error('Validation error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// Manage user whitelist/blacklist
app.post('/api/projects/:projectId/manage-user', verifyKey, async (req, res) => {
    try {
        const { projectId } = req.params;
        const { userId, action } = req.body; // action: 'whitelist' or 'blacklist'
        
        const project = await Project.findOne({ 
            projectId, 
            userId: req.user.keyId 
        });
        
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        if (action === 'whitelist') {
            if (!project.whitelistedUsers.includes(userId)) {
                project.whitelistedUsers.push(userId);
            }
            project.blacklistedUsers = project.blacklistedUsers.filter(id => id !== userId);
        } else if (action === 'blacklist') {
            if (!project.blacklistedUsers.includes(userId)) {
                project.blacklistedUsers.push(userId);
            }
            project.whitelistedUsers = project.whitelistedUsers.filter(id => id !== userId);
        }
        
        await project.save();
        
        // Log activity
        const activity = new Activity({
            userId: req.user.keyId,
            action: action === 'whitelist' ? 'User Whitelisted' : 'User Blacklisted',
            details: `${action}ed Roblox User ID: ${userId}`,
            robloxUserId: userId,
            projectId
        });
        await activity.save();
        
        res.json({ success: true, project });
    } catch (error) {
        console.error('User management error:', error);
        res.status(500).json({ error: 'Failed to manage user' });
    }
});

// Delete project
app.delete('/api/projects/:projectId', verifyKey, async (req, res) => {
    try {
        const project = await Project.findOneAndUpdate(
            { projectId: req.params.projectId, userId: req.user.keyId },
            { isActive: false },
            { new: true }
        );
        
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        // Update user stats
        await User.findByIdAndUpdate(req.user._id, {
            $inc: { totalScripts: -1 }
        });
        
        // Log activity
        const activity = new Activity({
            userId: req.user.keyId,
            action: 'Project Deleted',
            details: `Deleted project: ${project.name}`,
            projectId: project.projectId
        });
        await activity.save();
        
        res.json({ success: true });
    } catch (error) {
        console.error('Project deletion error:', error);
        res.status(500).json({ error: 'Failed to delete project' });
    }
});

// Update user settings
app.put('/api/user/settings', verifyKey, async (req, res) => {
    try {
        const { robloxUsername } = req.body;
        
        await User.findByIdAndUpdate(req.user._id, { robloxUsername });
        
        res.json({ success: true });
    } catch (error) {
        console.error('Settings update error:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Protected script access
app.get('/scripts/:accessKey', async (req, res) => {
    try {
        const project = await Project.findOne({ accessKey: req.params.accessKey });
        
        if (!project) {
            return res.status(401).send('You are not authorized');
        }
        
        // This should only be accessible by the loader script
        res.type('text/plain').send(project.obfuscatedScript);
    } catch (error) {
        res.status(401).send('You are not authorized');
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`EnigmaCode server running on port ${PORT}`);
    console.log(`Access the application at http://localhost:${PORT}`);
});

module.exports = app;
