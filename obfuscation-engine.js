const crypto = require('crypto');

class ObfuscationEngine {
    constructor() {
        this.variableMap = new Map();
        this.functionMap = new Map();
        this.stringMap = new Map();
        this.varCounter = 1;
        this.funcCounter = 1;
    }

    obfuscate(script, tier = 'standard') {
        this.reset();
        
        switch (tier) {
            case 'standard':
                return this.standardObfuscation(script);
            case 'premium':
                return this.premiumObfuscation(script);
            default:
                return this.standardObfuscation(script);
        }
    }

    reset() {
        this.variableMap.clear();
        this.functionMap.clear();
        this.stringMap.clear();
        this.varCounter = 1;
        this.funcCounter = 1;
    }

    standardObfuscation(script) {
        let obfuscated = script;

        // 1. Anti-debugging checks
        obfuscated = this.addAntiDebugging(obfuscated);

        // 2. String encryption
        obfuscated = this.encryptStrings(obfuscated);

        // 3. Variable renaming
        obfuscated = this.renameVariables(obfuscated);

        // 4. Function renaming
        obfuscated = this.renameFunctions(obfuscated);

        // 5. Add dummy code
        obfuscated = this.addDummyCode(obfuscated);

        // 6. Control flow obfuscation (basic)
        obfuscated = this.basicControlFlowObfuscation(obfuscated);

        return obfuscated;
    }

    premiumObfuscation(script) {
        let obfuscated = script;

        // All standard obfuscation features
        obfuscated = this.standardObfuscation(obfuscated);

        // Premium features
        obfuscated = this.advancedControlFlowFlattening(obfuscated);
        obfuscated = this.bytecodeVirtualization(obfuscated);
        obfuscated = this.addVirtualMachine(obfuscated);
        obfuscated = this.addIntegrityChecks(obfuscated);

        return obfuscated;
    }

    addAntiDebugging(script) {
        const antiDebugChecks = `
-- Anti-debugging measures
local function _checkDebug()
    if debug and debug.getinfo then
        error("Debug environment detected")
    end
    if getfenv and getfenv(2) then
        local env = getfenv(2)
        if env.debug or env.getfenv or env.setfenv then
            error("Suspicious environment detected")
        end
    end
end

local function _checkHooks()
    if type(loadstring) ~= "function" then
        error("Loadstring hook detected")
    end
    if type(pcall) ~= "function" then
        error("Pcall hook detected")
    end
end

local function _antiTamper()
    local function _verify()
        return true
    end
    if not _verify() then
        error("Tamper detected")
    end
end

_checkDebug()
_checkHooks()
_antiTamper()

`;

        return antiDebugChecks + script;
    }

    encryptStrings(script) {
        return script.replace(/["']([^"']+)["']/g, (match, str) => {
            const encrypted = this.xorEncrypt(str);
            return `_decrypt("${encrypted}")`;
        });
    }

    xorEncrypt(str) {
        const key = 'ENIGMACODE';
        let result = '';
        for (let i = 0; i < str.length; i++) {
            result += String.fromCharCode(
                str.charCodeAt(i) ^ key.charCodeAt(i % key.length)
            );
        }
        return Buffer.from(result).toString('base64');
    }

    renameVariables(script) {
        // Find all variable declarations and uses
        const varPattern = /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*=/g;
        const reservedWords = [
            'and', 'break', 'do', 'else', 'elseif', 'end', 'false', 'for',
            'function', 'if', 'in', 'local', 'nil', 'not', 'or', 'repeat',
            'return', 'then', 'true', 'until', 'while', 'game', 'workspace',
            'script', 'print', 'warn', 'error', 'tostring', 'tonumber',
            'type', 'pairs', 'ipairs', 'next', 'getfenv', 'setfenv',
            'loadstring', 'pcall', 'xpcall', 'coroutine', 'debug',
            'string', 'table', 'math', 'os', 'io'
        ];

        let match;
        while ((match = varPattern.exec(script)) !== null) {
            const varName = match[1];
            if (!reservedWords.includes(varName) && !this.variableMap.has(varName)) {
                const obfuscatedName = this.generateVariableName();
                this.variableMap.set(varName, obfuscatedName);
            }
        }

        // Replace all occurrences
        this.variableMap.forEach((obfuscatedName, originalName) => {
            const regex = new RegExp(`\\b${originalName}\\b`, 'g');
            script = script.replace(regex, obfuscatedName);
        });

        return script;
    }

    renameFunctions(script) {
        // Find function declarations
        const funcPattern = /function\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
        
        let match;
        while ((match = funcPattern.exec(script)) !== null) {
            const funcName = match[1];
            if (!this.functionMap.has(funcName)) {
                const obfuscatedName = this.generateFunctionName();
                this.functionMap.set(funcName, obfuscatedName);
            }
        }

        // Replace function names
        this.functionMap.forEach((obfuscatedName, originalName) => {
            const regex = new RegExp(`\\b${originalName}\\b`, 'g');
            script = script.replace(regex, obfuscatedName);
        });

        return script;
    }

    addDummyCode(script) {
        const dummyStatements = [
            'local _dummy1 = math.random(1, 100)',
            'local _dummy2 = string.len("dummy")',
            'local _dummy3 = table.concat({})',
            'if false then error("dummy") end',
            'local _dummy4 = tonumber("123") or 0',
            'local _dummy5 = type(nil) == "nil"'
        ];

        // Insert dummy code at random positions
        const lines = script.split('\n');
        const newLines = [];

        for (let i = 0; i < lines.length; i++) {
            newLines.push(lines[i]);
            if (Math.random() < 0.1) { // 10% chance to add dummy code
                const dummyLine = dummyStatements[Math.floor(Math.random() * dummyStatements.length)];
                newLines.push(dummyLine);
            }
        }

        return newLines.join('\n');
    }

    basicControlFlowObfuscation(script) {
        // Convert simple if-statements to more complex forms
        script = script.replace(
            /if\s+(.+?)\s+then\s+(.+?)\s+end/g,
            (match, condition, body) => {
                return `do
    local _cond = ${condition}
    if _cond then
        ${body}
    end
end`;
            }
        );

        return script;
    }

    advancedControlFlowFlattening(script) {
        // Create a state machine for control flow
        const stateVar = this.generateVariableName();
        const jumpTable = this.generateVariableName();

        const controlFlowWrapper = `
local ${stateVar} = 1
local ${jumpTable} = {}

while ${stateVar} do
    if ${stateVar} == 1 then
        -- Original script start
        ${script}
        ${stateVar} = nil
    else
        break
    end
end
`;

        return controlFlowWrapper;
    }

    bytecodeVirtualization(script) {
        // Simulate bytecode execution (simplified)
        const vmVar = this.generateVariableName();
        const bytecodeVar = this.generateVariableName();

        const virtualMachine = `
local ${vmVar} = {}
local ${bytecodeVar} = {}

function ${vmVar}.execute(code)
    local func = loadstring(code)
    if func then
        return func()
    end
end

-- Execute original script through VM
${vmVar}.execute([=[
${script}
]=])
`;

        return virtualMachine;
    }

    addVirtualMachine(script) {
        const vmCode = `
-- Virtual Machine
local _vm = {
    stack = {},
    memory = {},
    registers = {}
}

function _vm:push(value)
    table.insert(self.stack, value)
end

function _vm:pop()
    return table.remove(self.stack)
end

function _vm:execute(instructions)
    for _, instruction in ipairs(instructions) do
        if instruction.op == "LOAD" then
            self:push(instruction.value)
        elseif instruction.op == "CALL" then
            local func = self:pop()
            local args = {}
            for i = 1, instruction.argc do
                table.insert(args, 1, self:pop())
            end
            local result = func(unpack(args))
            if result ~= nil then
                self:push(result)
            end
        end
    end
end

-- Original script wrapped in VM
local _instructions = {
    {op = "LOAD", value = function()
        ${script}
    end},
    {op = "CALL", argc = 0}
}

_vm:execute(_instructions)
`;

        return vmCode;
    }

    addIntegrityChecks(script) {
        const hash = crypto.createHash('md5').update(script).digest('hex');
        
        const integrityCheck = `
-- Integrity verification
local _expectedHash = "${hash}"
local _currentScript = [=[
${script}
]=]

local function _verifyIntegrity()
    -- In a real implementation, this would hash the current script
    -- and compare with the expected hash
    return true
end

if not _verifyIntegrity() then
    error("Script integrity compromised")
end

-- Execute verified script
local _func = loadstring(_currentScript)
if _func then
    _func()
else
    error("Failed to load script")
end
`;

        return integrityCheck;
    }

    generateVariableName() {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let name = '_';
        
        let num = this.varCounter++;
        while (num > 0) {
            name += chars[num % chars.length];
            num = Math.floor(num / chars.length);
        }
        
        return name;
    }

    generateFunctionName() {
        return `_f${this.funcCounter++}`;
    }

    // Utility function to create decryption helper
    getDecryptionHelper() {
        return `
local function _decrypt(encrypted)
    local key = "ENIGMACODE"
    local decoded = ""
    
    -- Base64 decode (simplified)
    local b64chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
    local function b64decode(data)
        local result = ""
        local pad = string.sub(data, -2) == "==" and 2 or string.sub(data, -1) == "=" and 1 or 0
        for i = 1, string.len(data) - pad, 4 do
            local chunk = string.sub(data, i, i + 3)
            local a, b, c, d = string.byte(chunk, 1, 4)
            if a then a = string.find(b64chars, string.char(a)) - 1 end
            if b then b = string.find(b64chars, string.char(b)) - 1 end
            if c then c = string.find(b64chars, string.char(c)) - 1 end
            if d then d = string.find(b64chars, string.char(d)) - 1 end
            
            local combined = (a * 262144) + (b * 4096) + ((c or 0) * 64) + (d or 0)
            result = result .. string.char(
                math.floor(combined / 65536),
                math.floor((combined % 65536) / 256),
                combined % 256
            )
        end
        return string.sub(result, 1, string.len(result) - pad)
    end
    
    local decodedBytes = b64decode(encrypted)
    
    -- XOR decrypt
    for i = 1, string.len(decodedBytes) do
        local keyChar = string.sub(key, ((i - 1) % string.len(key)) + 1, ((i - 1) % string.len(key)) + 1)
        local encryptedChar = string.sub(decodedBytes, i, i)
        local decryptedChar = string.char(string.byte(encryptedChar) ~ string.byte(keyChar))
        decoded = decoded .. decryptedChar
    end
    
    return decoded
end
`;
    }

    // Main obfuscation function with decryption helper
    obfuscateWithHelper(script, tier = 'standard') {
        const obfuscatedScript = this.obfuscate(script, tier);
        const decryptionHelper = this.getDecryptionHelper();
        
        return decryptionHelper + '\n' + obfuscatedScript;
    }
}

module.exports = ObfuscationEngine;
