# Oblivion X Protects - API Documentation

Complete API reference for developers integrating with the Oblivion X Protects platform.

## 🔑 Authentication

All API requests require authentication using an API key in the Authorization header:

```http
Authorization: Bearer YOUR_API_KEY_HERE
```

### API Key Types

- **Free Trial**: `TRIAL-XXXX-XXXX-XXXX` (30 days, limited features)
- **Standard**: `STD-XXXX-XXXX-XXXX` (monthly subscription)
- **Premium**: `PREM-XXXX-XXXX-XXXX` (advanced features)
- **Owner**: `OWNER-MASTER-KEY-2024` (full admin access)

## 🌐 Base URL

```
Local Development: http://localhost:8080
Production: https://yourdomain.com
```

## 📋 Core API Endpoints

### Authentication & User Management

#### Register New User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "roblox_username",
  "email": "user@example.com",
  "password": "secure_password"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "username": "roblox_username",
    "email": "user@example.com",
    "apiKey": "TRIAL-XXXX-XXXX-XXXX",
    "plan": "trial",
    "expiresAt": "2024-02-15T10:30:00Z"
  },
  "token": "jwt_token_here"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "apiKey": "YOUR_API_KEY"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "username": "roblox_username",
    "plan": "premium",
    "expiresAt": "2024-12-31T23:59:59Z",
    "scriptsUsed": 5,
    "scriptsLimit": 100
  },
  "token": "jwt_token_here"
}
```

#### Get User Profile
```http
GET /api/user/profile
Authorization: Bearer YOUR_API_KEY
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "username": "roblox_username",
    "email": "user@example.com",
    "plan": "premium",
    "apiKey": "PREM-XXXX-XXXX-XXXX",
    "expiresAt": "2024-12-31T23:59:59Z",
    "scriptsUsed": 15,
    "scriptsLimit": 100,
    "keysGenerated": 250,
    "keysLimit": 5000,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Script Management

#### Upload & Protect Script
```http
POST /api/scripts/upload
Authorization: Bearer YOUR_API_KEY
Content-Type: multipart/form-data

FormData:
- script: <lua_file>
- name: "My Script"
- description: "Script description"
- protectionLevel: "premium" | "standard"
- whitelist: ["123456789", "987654321"]
- blacklist: ["111111111"]
- maxExecutions: 1000
- expiresAt: "2024-12-31T23:59:59Z"
```

**Response:**
```json
{
  "success": true,
  "script": {
    "id": "script_uuid",
    "name": "My Script",
    "description": "Script description",
    "protectionLevel": "premium",
    "obfuscatedCode": "obfuscated_lua_code_here",
    "loadstringUrl": "https://api.oblivionx.com/execute/script_uuid",
    "accessToken": "access_token_for_loadstring",
    "whitelist": ["123456789", "987654321"],
    "blacklist": ["111111111"],
    "maxExecutions": 1000,
    "currentExecutions": 0,
    "expiresAt": "2024-12-31T23:59:59Z",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### Get User Scripts
```http
GET /api/scripts
Authorization: Bearer YOUR_API_KEY
```

**Response:**
```json
{
  "success": true,
  "scripts": [
    {
      "id": "script_uuid",
      "name": "My Script",
      "protectionLevel": "premium",
      "executions": 45,
      "maxExecutions": 1000,
      "status": "active",
      "createdAt": "2024-01-15T10:30:00Z",
      "expiresAt": "2024-12-31T23:59:59Z"
    }
  ],
  "total": 1,
  "limit": 100
}
```

#### Get Script Details
```http
GET /api/scripts/:scriptId
Authorization: Bearer YOUR_API_KEY
```

**Response:**
```json
{
  "success": true,
  "script": {
    "id": "script_uuid",
    "name": "My Script",
    "description": "Script description",
    "protectionLevel": "premium",
    "loadstringUrl": "https://api.oblivionx.com/execute/script_uuid",
    "whitelist": ["123456789"],
    "blacklist": [],
    "executions": 45,
    "maxExecutions": 1000,
    "status": "active",
    "createdAt": "2024-01-15T10:30:00Z",
    "lastExecuted": "2024-01-16T14:20:00Z"
  }
}
```

#### Update Script Settings
```http
PUT /api/scripts/:scriptId
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "name": "Updated Script Name",
  "description": "Updated description",
  "whitelist": ["123456789", "555555555"],
  "blacklist": ["111111111"],
  "maxExecutions": 2000,
  "expiresAt": "2024-12-31T23:59:59Z"
}
```

#### Delete Script
```http
DELETE /api/scripts/:scriptId
Authorization: Bearer YOUR_API_KEY
```

### Script Execution & Validation

#### Execute Protected Script (Loadstring Endpoint)
```http
GET /api/execute/:scriptId?token=ACCESS_TOKEN&userId=ROBLOX_USER_ID
```

**Response (Success):**
```lua
-- Protected Lua script with anti-tampering
local function validateUser()
    -- User validation logic
    return true
end

if validateUser() then
    -- Your obfuscated script code here
else
    game.Players.LocalPlayer:Kick("Access denied")
end
```

**Response (Access Denied):**
```json
{
  "error": "Access denied",
  "reason": "User not whitelisted",
  "userId": "123456789",
  "scriptId": "script_uuid"
}
```

#### Validate User Access
```http
POST /api/validate
Content-Type: application/json

{
  "scriptId": "script_uuid",
  "userId": "123456789",
  "hwid": "hardware_id_optional"
}
```

**Response:**
```json
{
  "success": true,
  "access": "granted",
  "user": {
    "id": "123456789",
    "status": "whitelisted",
    "executions": 5,
    "lastAccess": "2024-01-16T14:20:00Z"
  },
  "script": {
    "id": "script_uuid",
    "name": "My Script",
    "executions": 45,
    "maxExecutions": 1000
  }
}
```

### User Management (Whitelist/Blacklist)

#### Add User to Whitelist
```http
POST /api/scripts/:scriptId/whitelist
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "userId": "123456789",
  "username": "roblox_username_optional"
}
```

#### Remove User from Whitelist
```http
DELETE /api/scripts/:scriptId/whitelist/:userId
Authorization: Bearer YOUR_API_KEY
```

#### Add User to Blacklist
```http
POST /api/scripts/:scriptId/blacklist
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "userId": "123456789",
  "reason": "Violation of terms"
}
```

#### Get Script Users
```http
GET /api/scripts/:scriptId/users
Authorization: Bearer YOUR_API_KEY
```

**Response:**
```json
{
  "success": true,
  "whitelist": [
    {
      "userId": "123456789",
      "username": "player1",
      "addedAt": "2024-01-15T10:30:00Z",
      "executions": 5,
      "lastAccess": "2024-01-16T14:20:00Z"
    }
  ],
  "blacklist": [
    {
      "userId": "111111111",
      "reason": "Violation of terms",
      "addedAt": "2024-01-14T09:15:00Z"
    }
  ]
}
```

### Analytics & Statistics

#### Get Dashboard Stats
```http
GET /api/analytics/dashboard
Authorization: Bearer YOUR_API_KEY
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalScripts": 15,
    "totalExecutions": 1250,
    "activeUsers": 45,
    "securityEvents": 3,
    "apiKeyStatus": {
      "plan": "premium",
      "daysRemaining": 287,
      "expiresAt": "2024-12-31T23:59:59Z"
    },
    "usage": {
      "scriptsUsed": 15,
      "scriptsLimit": 100,
      "executionsToday": 89,
      "executionsThisMonth": 1250
    }
  }
}
```

#### Get Script Analytics
```http
GET /api/analytics/scripts/:scriptId?timeRange=24h
Authorization: Bearer YOUR_API_KEY
```

**Response:**
```json
{
  "success": true,
  "analytics": {
    "executions": {
      "total": 1250,
      "today": 89,
      "thisWeek": 456,
      "thisMonth": 1250
    },
    "users": {
      "unique": 45,
      "returning": 32,
      "new": 13
    },
    "timeline": [
      {
        "timestamp": "2024-01-16T00:00:00Z",
        "executions": 12,
        "uniqueUsers": 8
      }
    ],
    "topUsers": [
      {
        "userId": "123456789",
        "username": "player1",
        "executions": 25,
        "lastAccess": "2024-01-16T14:20:00Z"
      }
    ]
  }
}
```

#### Get Security Events
```http
GET /api/analytics/security?limit=50
Authorization: Bearer YOUR_API_KEY
```

**Response:**
```json
{
  "success": true,
  "events": [
    {
      "id": "event_uuid",
      "type": "unauthorized_access",
      "severity": "medium",
      "userId": "111111111",
      "scriptId": "script_uuid",
      "ip": "192.168.1.100",
      "location": "United States",
      "details": "User attempted to access blacklisted script",
      "timestamp": "2024-01-16T14:20:00Z"
    }
  ],
  "total": 3
}
```

### Admin Endpoints (Owner Key Required)

#### Generate API Key
```http
POST /api/admin/keys/generate
Authorization: Bearer OWNER-MASTER-KEY-2024
Content-Type: application/json

{
  "plan": "premium",
  "duration": "1y",
  "customKey": "CUSTOM-KEY-FORMAT",
  "scriptsLimit": 100,
  "keysLimit": 5000
}
```

**Response:**
```json
{
  "success": true,
  "apiKey": {
    "key": "PREM-XXXX-XXXX-XXXX",
    "plan": "premium",
    "scriptsLimit": 100,
    "keysLimit": 5000,
    "expiresAt": "2025-01-16T14:20:00Z",
    "createdAt": "2024-01-16T14:20:00Z"
  }
}
```

#### Get All Users
```http
GET /api/admin/users?page=1&limit=50
Authorization: Bearer OWNER-MASTER-KEY-2024
```

#### Get Platform Statistics
```http
GET /api/admin/stats
Authorization: Bearer OWNER-MASTER-KEY-2024
```

**Response:**
```json
{
  "success": true,
  "platform": {
    "totalUsers": 1250,
    "activeUsers": 89,
    "totalScripts": 5678,
    "totalExecutions": 125000,
    "revenue": {
      "monthly": 2500,
      "total": 15000
    },
    "plans": {
      "trial": 45,
      "standard": 89,
      "premium": 156
    }
  }
}
```

## 🔧 JavaScript SDK

### Installation
```javascript
// Include in your HTML
<script src="https://cdn.oblivionx.com/sdk/oblivion-sdk.js"></script>

// Or npm install (if available)
npm install oblivion-x-protects-sdk
```

### Usage Examples

```javascript
// Initialize SDK
const oblivion = new OblivionSDK({
  apiKey: 'YOUR_API_KEY',
  baseUrl: 'https://api.oblivionx.com'
});

// Upload and protect script
const result = await oblivion.uploadScript({
  name: 'My Script',
  scriptContent: luaCode,
  protectionLevel: 'premium',
  whitelist: ['123456789'],
  maxExecutions: 1000
});

console.log('Loadstring URL:', result.loadstringUrl);

// Get user scripts
const scripts = await oblivion.getScripts();

// Validate user access
const access = await oblivion.validateUser('script_id', 'user_id');

// Get analytics
const analytics = await oblivion.getAnalytics('script_id', '24h');
```

## 🛡️ Security Considerations

### Rate Limiting
- **General API**: 100 requests per 15 minutes per IP
- **Script Execution**: 1000 requests per hour per script
- **Authentication**: 5 failed attempts = 15 minute lockout

### Input Validation
- All inputs are sanitized and validated
- File uploads limited to .lua files under 10MB
- User IDs must be valid Roblox user IDs

### Error Handling
```json
{
  "success": false,
  "error": "validation_error",
  "message": "Invalid script format",
  "details": {
    "field": "script",
    "code": "INVALID_LUA_SYNTAX"
  }
}
```

### Common Error Codes
- `INVALID_API_KEY`: API key is invalid or expired
- `INSUFFICIENT_PERMISSIONS`: Operation requires higher privileges
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `SCRIPT_NOT_FOUND`: Script ID doesn't exist
- `USER_BLACKLISTED`: User is blocked from accessing script
- `EXECUTION_LIMIT_REACHED`: Script has reached maximum executions

## 📱 Webhook Integration

### Setup Webhooks
```http
POST /api/webhooks
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "url": "https://yoursite.com/webhook",
  "events": ["script.executed", "user.blacklisted", "security.threat"],
  "secret": "your_webhook_secret"
}
```

### Webhook Events

#### Script Executed
```json
{
  "event": "script.executed",
  "timestamp": "2024-01-16T14:20:00Z",
  "data": {
    "scriptId": "script_uuid",
    "userId": "123456789",
    "ip": "192.168.1.100",
    "location": "United States"
  }
}
```

#### Security Threat Detected
```json
{
  "event": "security.threat",
  "timestamp": "2024-01-16T14:20:00Z",
  "data": {
    "type": "unauthorized_access",
    "severity": "high",
    "userId": "111111111",
    "scriptId": "script_uuid",
    "details": "Multiple failed access attempts"
  }
}
```

## 🧪 Testing

### Test API Key
Use `TEST-1234-5678-9012` for testing (limited functionality)

### Postman Collection
Download the complete Postman collection: [Download Link]

### cURL Examples

```bash
# Get user profile
curl -X GET "https://api.oblivionx.com/api/user/profile" \
  -H "Authorization: Bearer YOUR_API_KEY"

# Upload script
curl -X POST "https://api.oblivionx.com/api/scripts/upload" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "script=@myscript.lua" \
  -F "name=My Script" \
  -F "protectionLevel=premium"

# Validate user
curl -X POST "https://api.oblivionx.com/api/validate" \
  -H "Content-Type: application/json" \
  -d '{"scriptId":"script_uuid","userId":"123456789"}'
```

---

This API documentation covers all endpoints and features available in the Oblivion X Protects platform. For additional support, join our Discord server or contact the development team.
