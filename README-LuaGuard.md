# LuaGuard - Advanced Lua Script Protection

LuaGuard is a comprehensive Lua script protection and monetization platform, similar to Luarmor, featuring advanced obfuscation, license key management, and user analytics.

## Features

- **Advanced Obfuscation**: Military-grade Lua script protection
- **License Key Management**: Generate, validate, and manage license keys
- **30-Day Free Trial**: New users get full access for 30 days
- **HWID Protection**: Hardware ID-based script binding
- **Real-time Analytics**: Monitor script usage and revenue
- **Modern Dashboard**: Comprehensive management interface
- **Discord Integration**: Community support and updates

## Quick Start

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start the Server**:
   ```bash
   npm run luaguard
   # OR double-click luaguard-start.bat
   ```

3. **Access the Website**:
   - Main Site: http://localhost:3000
   - Dashboard: http://localhost:3000/dashboard.html
   - Pricing: http://localhost:3000/pricing.html

## API Endpoints

- `POST /api/register` - User registration with 30-day trial
- `POST /api/login` - User authentication
- `POST /api/scripts/upload` - Upload and obfuscate Lua scripts
- `POST /api/keys/generate` - Generate license keys
- `POST /api/keys/validate` - Validate license keys (for protected scripts)
- `POST /api/validate` - Public key validation endpoint
- `GET /api/dashboard` - Get user dashboard data
- `GET /api/scripts/:id/download` - Download protected script

## Protection Levels

1. **Basic**: Standard obfuscation with variable renaming
2. **Advanced**: Enhanced protection with control flow obfuscation
3. **Premium**: Military-grade protection with VM detection

## Pricing Plans

- **Free Trial**: 30 days, 5 scripts, 50 keys
- **Pro**: $19/month, 25 scripts, 500 keys
- **Premium**: $49/month, 100 scripts, 5000 keys
- **Enterprise**: Custom pricing, unlimited everything

## Discord Community

Join our Discord server for support and updates: https://discord.gg/tKF8gCw5qp

## File Structure

```
/
├── index.html          # Main landing page
├── dashboard.html      # User dashboard
├── pricing.html        # Pricing plans
├── styles.css          # Main CSS styles
├── dashboard.css       # Dashboard-specific styles
├── pricing.css         # Pricing page styles
├── script.js           # Frontend JavaScript
├── dashboard.js        # Dashboard functionality
├── pricing.js          # Pricing page logic
├── luaguard-server.js  # Backend server
├── luaguard-start.bat  # Windows startup script
└── README-LuaGuard.md  # This file
```

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Authentication**: JWT tokens, bcrypt hashing
- **File Upload**: Multer middleware
- **Database**: In-memory (upgrade to MongoDB for production)

## Production Deployment

For production deployment:

1. Replace in-memory database with MongoDB or PostgreSQL
2. Add environment variables for JWT secret and database connection
3. Implement proper file storage (AWS S3, etc.)
4. Add rate limiting and security headers
5. Set up SSL certificates
6. Configure reverse proxy (nginx)

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- HWID-based script binding
- File upload validation
- Rate limiting (ready for implementation)
- CORS protection

## License

MIT License - Feel free to modify and distribute.
