// Advanced Loadstring Protection System for Oblivion X Protects
// Provides secure script delivery with anti-tampering and access control

class LoadstringProtection {
    constructor() {
        this.protectedScripts = new Map();
        this.accessTokens = new Map();
        this.executionLogs = [];
        this.antiTamperChecks = [];
        this.encryptionKey = this.generateEncryptionKey();
        
        this.init();
    }

    init() {
        this.setupAntiTamperProtection();
        this.startSecurityMonitoring();
        this.initializeProtectedEndpoints();
    }

    // Script Protection and Storage
    protectScript(scriptContent, options = {}) {
        const scriptId = this.generateScriptId();
        const protectionLevel = options.level || 'standard';
        
        // Apply obfuscation based on protection level
        const obfuscatedScript = this.applyObfuscation(scriptContent, protectionLevel);
        
        // Encrypt the script
        const encryptedScript = this.encryptScript(obfuscatedScript);
        
        // Create protection wrapper
        const protectedScript = this.createProtectionWrapper(encryptedScript, options);
        
        // Store protected script
        this.protectedScripts.set(scriptId, {
            id: scriptId,
            originalScript: scriptContent,
            protectedScript: protectedScript,
            encryptedScript: encryptedScript,
            protectionLevel: protectionLevel,
            createdAt: new Date(),
            accessCount: 0,
            lastAccessed: null,
            options: options,
            whitelist: options.whitelist || [],
            blacklist: options.blacklist || [],
            maxExecutions: options.maxExecutions || null,
            expiresAt: options.expiresAt || null
        });

        // Generate loadstring URL
        const loadstringUrl = this.generateLoadstringUrl(scriptId);
        
        return {
            scriptId: scriptId,
            loadstringUrl: loadstringUrl,
            protectedScript: protectedScript,
            success: true
        };
    }

    applyObfuscation(script, level) {
        // Anti-debugging wrapper
        const antiDebugWrapper = `
-- Anti-Debug Protection
local function _checkEnv()
    if debug and debug.getinfo then
        game:GetService("Players").LocalPlayer:Kick("Debug environment detected")
        return
    end
    if getfenv and getfenv(2) then
        local env = getfenv(2)
        if env.debug or env.getfenv or env.setfenv then
            game:GetService("Players").LocalPlayer:Kick("Suspicious environment")
            return
        end
    end
end

local function _checkHooks()
    local originalLoadstring = loadstring
    if type(loadstring) ~= "function" or loadstring ~= originalLoadstring then
        game:GetService("Players").LocalPlayer:Kick("Loadstring hook detected")
        return
    end
end

_checkEnv()
_checkHooks()
`;

        // Variable name obfuscation
        let obfuscated = script;
        const varMap = new Map();
        let varCounter = 1;

        // Replace variable names
        obfuscated = obfuscated.replace(/local\s+([a-zA-Z_][a-zA-Z0-9_]*)/g, (match, varName) => {
            if (!varMap.has(varName)) {
                varMap.set(varName, `_${this.generateObfuscatedName(varCounter++)}`);
            }
            return `local ${varMap.get(varName)}`;
        });

        // Apply variable replacements
        varMap.forEach((obfName, origName) => {
            const regex = new RegExp(`\\b${origName}\\b`, 'g');
            obfuscated = obfuscated.replace(regex, obfName);
        });

        // String encryption
        obfuscated = obfuscated.replace(/"([^"]+)"/g, (match, str) => {
            const encrypted = this.encryptString(str);
            return `_decrypt("${encrypted}")`;
        });

        // Add decryption function
        const decryptFunction = `
local function _decrypt(encrypted)
    local key = "${this.encryptionKey}"
    local result = ""
    for i = 1, #encrypted do
        local char = encrypted:sub(i, i)
        local keyChar = key:sub(((i - 1) % #key) + 1, ((i - 1) % #key) + 1)
        result = result .. string.char(string.byte(char) ~ string.byte(keyChar))
    end
    return result
end
`;

        if (level === 'premium') {
            // Advanced control flow obfuscation
            obfuscated = this.applyControlFlowObfuscation(obfuscated);
        }

        return antiDebugWrapper + decryptFunction + obfuscated;
    }

    createProtectionWrapper(encryptedScript, options) {
        const robloxUserId = options.robloxUserId || 'game:GetService("Players").LocalPlayer.UserId';
        const projectId = options.projectId || 'default';
        
        return `
-- Oblivion X Protects - Advanced Script Protection
-- This script is protected by advanced anti-tampering measures

local HttpService = game:GetService("HttpService")
local Players = game:GetService("Players")
local LocalPlayer = Players.LocalPlayer

-- Protection Configuration
local SCRIPT_ID = "${options.scriptId || 'unknown'}"
local PROJECT_ID = "${projectId}"
local API_ENDPOINT = "https://oblivionx.protects/api"

-- Anti-Tamper Checks
local function performSecurityChecks()
    -- Check for common exploit environments
    local exploitChecks = {
        "syn", "Synapse", "KRNL", "Fluxus", "Oxygen", "Script-Ware",
        "Sentinel", "ProtoSmasher", "Sirhurt", "JJSploit"
    }
    
    for _, exploit in pairs(exploitChecks) do
        if _G[exploit] or getgenv()[exploit] then
            LocalPlayer:Kick("Exploit environment detected: " .. exploit)
            return false
        end
    end
    
    -- Check for debugging tools
    if debug and debug.getinfo then
        LocalPlayer:Kick("Debug environment detected")
        return false
    end
    
    return true
end

-- User Validation
local function validateUser()
    local userId = tostring(LocalPlayer.UserId)
    local success, response = pcall(function()
        return HttpService:RequestAsync({
            Url = API_ENDPOINT .. "/validate-user",
            Method = "POST",
            Headers = {
                ["Content-Type"] = "application/json"
            },
            Body = HttpService:JSONEncode({
                userId = userId,
                projectId = PROJECT_ID,
                scriptId = SCRIPT_ID
            })
        })
    end)
    
    if not success or response.StatusCode ~= 200 then
        LocalPlayer:Kick("Failed to validate user access")
        return false
    end
    
    local data = HttpService:JSONDecode(response.Body)
    
    if data.blacklisted then
        LocalPlayer:Kick("Access denied: User is blacklisted")
        return false
    end
    
    if data.whitelistOnly and not data.whitelisted then
        LocalPlayer:Kick("Access denied: User not whitelisted")
        return false
    end
    
    return true
end

-- Script Execution Logger
local function logExecution()
    spawn(function()
        pcall(function()
            HttpService:RequestAsync({
                Url = API_ENDPOINT .. "/log-execution",
                Method = "POST",
                Headers = {
                    ["Content-Type"] = "application/json"
                },
                Body = HttpService:JSONEncode({
                    userId = tostring(LocalPlayer.UserId),
                    projectId = PROJECT_ID,
                    scriptId = SCRIPT_ID,
                    timestamp = os.time()
                })
            })
        end)
    end)
end

-- Main Protection Logic
if not performSecurityChecks() then
    return
end

if not validateUser() then
    return
end

logExecution()

-- Execute Protected Script
local protectedCode = "${encryptedScript}"
local decryptedCode = _decryptScript(protectedCode)
local scriptFunction = loadstring(decryptedCode)

if scriptFunction then
    scriptFunction()
else
    LocalPlayer:Kick("Failed to load protected script")
end
`;
    }

    encryptScript(script) {
        let encrypted = '';
        for (let i = 0; i < script.length; i++) {
            const char = script.charCodeAt(i);
            const keyChar = this.encryptionKey.charCodeAt(i % this.encryptionKey.length);
            encrypted += String.fromCharCode(char ^ keyChar);
        }
        return btoa(encrypted);
    }

    encryptString(str) {
        let encrypted = '';
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            const keyChar = this.encryptionKey.charCodeAt(i % this.encryptionKey.length);
            encrypted += String.fromCharCode(char ^ keyChar);
        }
        return encrypted;
    }

    generateLoadstringUrl(scriptId) {
        const baseUrl = 'https://oblivionx.protects/api/script';
        const accessToken = this.generateAccessToken(scriptId);
        return `${baseUrl}/${scriptId}?token=${accessToken}`;
    }

    generateAccessToken(scriptId) {
        const token = this.generateRandomString(32);
        this.accessTokens.set(token, {
            scriptId: scriptId,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        });
        return token;
    }

    // API Endpoints for Script Serving
    initializeProtectedEndpoints() {
        // This would be implemented on the server side
        // Here we simulate the endpoint behavior
        this.endpoints = {
            '/api/script/:id': this.serveProtectedScript.bind(this),
            '/api/validate-user': this.validateUserAccess.bind(this),
            '/api/log-execution': this.logScriptExecution.bind(this)
        };
    }

    async serveProtectedScript(scriptId, token, userAgent) {
        const script = this.protectedScripts.get(scriptId);
        if (!script) {
            return { error: 'Script not found', status: 404 };
        }

        // Validate access token
        const tokenData = this.accessTokens.get(token);
        if (!tokenData || tokenData.scriptId !== scriptId) {
            return { error: 'Invalid access token', status: 401 };
        }

        // Check token expiration
        if (new Date() > tokenData.expiresAt) {
            this.accessTokens.delete(token);
            return { error: 'Access token expired', status: 401 };
        }

        // Check script expiration
        if (script.expiresAt && new Date() > script.expiresAt) {
            return { error: 'Script expired', status: 410 };
        }

        // Check execution limits
        if (script.maxExecutions && script.accessCount >= script.maxExecutions) {
            return { error: 'Execution limit reached', status: 429 };
        }

        // Update access statistics
        script.accessCount++;
        script.lastAccessed = new Date();

        // Log access attempt
        this.logAccess(scriptId, userAgent);

        // Return protected script
        return {
            script: script.protectedScript,
            status: 200,
            headers: {
                'Content-Type': 'text/plain',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'X-Protection-Level': script.protectionLevel
            }
        };
    }

    async validateUserAccess(userId, projectId, scriptId) {
        const script = this.protectedScripts.get(scriptId);
        if (!script) {
            return { error: 'Script not found', status: 404 };
        }

        // Check blacklist
        if (script.blacklist.includes(userId)) {
            this.logSecurityEvent('blacklist_access_attempt', {
                userId: userId,
                scriptId: scriptId,
                projectId: projectId
            });
            return { blacklisted: true, status: 200 };
        }

        // Check whitelist (if whitelist-only mode)
        const whitelistOnly = script.options.whitelistOnly || false;
        const whitelisted = script.whitelist.includes(userId);

        if (whitelistOnly && !whitelisted) {
            this.logSecurityEvent('whitelist_access_denied', {
                userId: userId,
                scriptId: scriptId,
                projectId: projectId
            });
            return { whitelistOnly: true, whitelisted: false, status: 200 };
        }

        return { 
            whitelistOnly: whitelistOnly,
            whitelisted: whitelisted,
            blacklisted: false,
            status: 200 
        };
    }

    logScriptExecution(userId, projectId, scriptId, timestamp) {
        const executionLog = {
            userId: userId,
            projectId: projectId,
            scriptId: scriptId,
            timestamp: new Date(timestamp * 1000),
            ip: this.getCurrentIP(),
            userAgent: navigator.userAgent
        };

        this.executionLogs.push(executionLog);

        // Update dashboard statistics
        if (window.oblivionDashboard) {
            window.oblivionDashboard.stats.loadstringExecutions++;
            window.oblivionDashboard.updateDashboardStats();
        }

        // Trigger analytics event
        if (window.oblivionAnalytics) {
            window.oblivionAnalytics.addCustomEvent('script_execution', executionLog);
        }

        return { success: true, status: 200 };
    }

    // Security and Anti-Tamper
    setupAntiTamperProtection() {
        // Monitor for common tampering attempts
        this.antiTamperChecks = [
            this.checkForDebuggers,
            this.checkForHooks,
            this.checkForModifications,
            this.checkForExploits
        ];

        // Run checks periodically
        setInterval(() => {
            this.runAntiTamperChecks();
        }, 30000); // Every 30 seconds
    }

    runAntiTamperChecks() {
        this.antiTamperChecks.forEach(check => {
            try {
                const result = check.call(this);
                if (!result.passed) {
                    this.handleTamperDetection(result);
                }
            } catch (error) {
                console.warn('Anti-tamper check failed:', error);
            }
        });
    }

    checkForDebuggers() {
        // Check for debugging tools
        const debuggerPresent = !!(window.debug || window.getfenv || window.setfenv);
        return {
            passed: !debuggerPresent,
            type: 'debugger_detection',
            details: debuggerPresent ? 'Debugger tools detected' : null
        };
    }

    checkForHooks() {
        // Check for function hooks
        const originalFunctions = ['loadstring', 'pcall', 'xpcall'];
        for (const funcName of originalFunctions) {
            if (typeof window[funcName] !== 'function') {
                return {
                    passed: false,
                    type: 'function_hook',
                    details: `${funcName} has been hooked or modified`
                };
            }
        }
        return { passed: true };
    }

    checkForModifications() {
        // Check for script modifications
        const currentScript = document.currentScript;
        if (currentScript && currentScript.src) {
            // In a real implementation, you'd verify script integrity
            return { passed: true };
        }
        return { passed: true };
    }

    checkForExploits() {
        // Check for known exploit signatures
        const exploitSignatures = ['syn', 'krnl', 'fluxus', 'oxygen'];
        for (const signature of exploitSignatures) {
            if (window[signature] || (window._G && window._G[signature])) {
                return {
                    passed: false,
                    type: 'exploit_detection',
                    details: `Exploit signature detected: ${signature}`
                };
            }
        }
        return { passed: true };
    }

    handleTamperDetection(result) {
        this.logSecurityEvent('tamper_detected', {
            type: result.type,
            details: result.details,
            timestamp: new Date(),
            userAgent: navigator.userAgent
        });

        // Notify security tracker
        if (window.securityTracker) {
            window.securityTracker.flagSuspiciousActivity(
                window.securityTracker.getClientIP(),
                'tamper_attempt',
                result
            );
        }

        // In a real implementation, you might:
        // - Disable script execution
        // - Send alert to administrators
        // - Block the user's IP
        console.warn('Tamper attempt detected:', result);
    }

    // Utility Functions
    generateScriptId() {
        return 'OX_' + Date.now() + '_' + this.generateRandomString(8);
    }

    generateEncryptionKey() {
        return 'OBLIVION_X_' + this.generateRandomString(16);
    }

    generateObfuscatedName(counter) {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let name = '';
        let num = counter;
        while (num > 0) {
            name += chars[num % chars.length];
            num = Math.floor(num / chars.length);
        }
        return name || 'a';
    }

    generateRandomString(length) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    applyControlFlowObfuscation(script) {
        // Advanced control flow flattening
        const stateVar = '_state' + Math.floor(Math.random() * 1000);
        const jumpTable = '_jump' + Math.floor(Math.random() * 1000);
        
        return `
local ${stateVar} = 1
local ${jumpTable} = {}

while ${stateVar} do
    if ${stateVar} == 1 then
        ${script}
        ${stateVar} = nil
    else
        break
    end
end
`;
    }

    getCurrentIP() {
        // In a real implementation, this would get the actual client IP
        return '127.0.0.1';
    }

    logAccess(scriptId, userAgent) {
        console.log(`Script access: ${scriptId} from ${userAgent}`);
    }

    logSecurityEvent(type, data) {
        const event = {
            type: type,
            data: data,
            timestamp: new Date()
        };
        
        console.warn('Security Event:', event);
        
        // Send to security tracker if available
        if (window.securityTracker) {
            window.securityTracker.logSecurityEvent(type, data);
        }
    }

    startSecurityMonitoring() {
        // Monitor for suspicious activity patterns
        setInterval(() => {
            this.analyzeAccessPatterns();
        }, 60000); // Every minute
    }

    analyzeAccessPatterns() {
        // Analyze recent access logs for suspicious patterns
        const recentLogs = this.executionLogs.filter(log => 
            new Date() - log.timestamp < 60000 // Last minute
        );

        // Check for rapid successive executions
        const userCounts = new Map();
        recentLogs.forEach(log => {
            userCounts.set(log.userId, (userCounts.get(log.userId) || 0) + 1);
        });

        userCounts.forEach((count, userId) => {
            if (count > 10) { // More than 10 executions per minute
                this.logSecurityEvent('rapid_execution', {
                    userId: userId,
                    executionCount: count,
                    timeframe: '1 minute'
                });
            }
        });
    }

    // Public API Methods
    getProtectedScript(scriptId) {
        return this.protectedScripts.get(scriptId);
    }

    getExecutionStats() {
        const totalExecutions = this.executionLogs.length;
        const uniqueUsers = new Set(this.executionLogs.map(log => log.userId)).size;
        const recentExecutions = this.executionLogs.filter(log => 
            new Date() - log.timestamp < 24 * 60 * 60 * 1000
        ).length;

        return {
            totalExecutions,
            uniqueUsers,
            recentExecutions,
            protectedScripts: this.protectedScripts.size
        };
    }

    exportProtectionData() {
        const data = {
            timestamp: new Date().toISOString(),
            protectedScripts: Array.from(this.protectedScripts.entries()),
            executionLogs: this.executionLogs,
            stats: this.getExecutionStats()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `protection-data-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Initialize loadstring protection system
window.loadstringProtection = new LoadstringProtection();

// Export for global use
window.LoadstringProtection = LoadstringProtection;
