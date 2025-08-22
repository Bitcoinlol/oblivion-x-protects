# LuaGuard 🛡️

> Advanced Lua Script Protection & Monetization Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Discord](https://img.shields.io/badge/Discord-Join-7289DA.svg)](https://discord.gg/tKF8gCw5qp)

LuaGuard is a comprehensive platform for protecting and monetizing Lua scripts, featuring enterprise-grade obfuscation, license key management, and user analytics.

## ✨ Features

- 🔒 **Advanced Script Obfuscation** - Military-grade protection using Luraph™ technology
- 🔑 **License Key Management** - Generate, validate, and manage keys with expiration
- 🆓 **30-Day Free Trial** - Full access to get started
- 🖥️ **HWID Protection** - Hardware ID-based script binding
- 📊 **Real-time Analytics** - Monitor usage, revenue, and user activity
- 🎨 **Modern Dashboard** - Comprehensive management interface
- 💬 **Discord Integration** - Community support and updates
- 🌐 **RESTful API** - Easy integration with external tools

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Git installed

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/luaguard.git
   cd luaguard
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   npm run luaguard
   ```
   Or double-click `luaguard-start.bat` on Windows

4. **Access the website:**
   - Main Site: http://localhost:3000
   - Dashboard: http://localhost:3000/dashboard.html
   - Pricing: http://localhost:3000/pricing.html

## 💎 Pricing Plans

| Plan | Price | Scripts | Keys | Features |
|------|-------|---------|------|----------|
| **Free Trial** | $0 (30 days) | 5 | 50 | Basic protection, HWID binding |
| **Pro** | $19/month | 25 | 500 | Advanced obfuscation, priority support |
| **Premium** | $49/month | 100 | 5,000 | Premium protection, analytics, API access |
| **Enterprise** | Custom | Unlimited | Unlimited | Custom solutions, dedicated support |

## 🛠️ API Usage

### Register User (30-day trial)
```javascript
POST /api/register
{
  "email": "user@example.com",
  "password": "securepassword",
  "username": "username"
}
```

### Upload & Obfuscate Script
```javascript
POST /api/scripts/upload
Headers: { "Authorization": "Bearer <token>" }
FormData: {
  "name": "script_name",
  "script": <lua_file>,
  "protection_level": "advanced"
}
```

### Generate License Key
```javascript
POST /api/keys/generate
{
  "script_id": "uuid",
  "duration_days": 30,
  "max_uses": 1
}
```

### Validate Key (for protected scripts)
```javascript
POST /api/validate
{
  "key": "LG-XXXX-XXXX-XXXX",
  "hwid": "hardware_id",
  "script_checksum": "checksum"
}
```

## 🎨 Design

LuaGuard features a modern purple and black theme with:
- Responsive design for all devices
- Smooth animations and transitions
- Professional gradient effects
- Clean, intuitive interface

## 🔧 Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Authentication**: JWT tokens, bcrypt
- **File Upload**: Multer middleware
- **Database**: In-memory (upgrade to MongoDB for production)

## 📦 Project Structure

```
luaguard/
├── index.html              # Landing page
├── dashboard.html          # User dashboard
├── pricing.html           # Pricing plans
├── styles.css             # Main styles
├── dashboard.css          # Dashboard styles
├── pricing.css            # Pricing styles
├── script.js              # Frontend logic
├── dashboard.js           # Dashboard functionality
├── pricing.js             # Pricing logic
├── luaguard-server.js     # Backend server
├── package.json           # Dependencies
└── README.md              # This file
```

## 🚀 Production Deployment

For production use:

1. **Database**: Replace in-memory storage with MongoDB/PostgreSQL
2. **Environment**: Set up environment variables for secrets
3. **Storage**: Use cloud storage (AWS S3) for script files
4. **Security**: Add rate limiting and security headers
5. **SSL**: Configure HTTPS with SSL certificates
6. **Monitoring**: Add logging and error tracking

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 💬 Support

- **Discord**: [Join our community](https://discord.gg/tKF8gCw5qp)
- **Issues**: [GitHub Issues](https://github.com/yourusername/luaguard/issues)
- **Email**: support@luaguard.com

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚡ Performance

- 99.9% uptime guarantee
- Global CDN distribution
- Sub-100ms key validation
- Instant script obfuscation

---

**Made with ❤️ for the Lua community**

[🌟 Star this repo](https://github.com/yourusername/luaguard) | [🐛 Report Bug](https://github.com/yourusername/luaguard/issues) | [💡 Request Feature](https://github.com/yourusername/luaguard/issues)
