# Oblivion X Protects - Deployment Guide

Complete setup and deployment instructions for the Oblivion X Protects platform.

## 🚀 Quick Local Setup

### Method 1: Simple HTTP Server (Recommended for Testing)

1. **Navigate to project directory**
   ```bash
   cd "c:\Users\latwa\Downloads\New folder (3)"
   ```

2. **Start local server**
   ```bash
   # Python 3.x
   python -m http.server 8080
   
   # Python 2.x (if needed)
   python -m SimpleHTTPServer 8080
   
   # Node.js alternative
   npx http-server -p 8080
   ```

3. **Access the website**
   - Landing Page: `http://localhost:8080/index.html`
   - Login: `http://localhost:8080/login.html`
   - Dashboard: `http://localhost:8080/dashboard.html`

### Method 2: Node.js Development Server

1. **Install dependencies**
   ```bash
   npm install express cors bcryptjs jsonwebtoken crypto multer mongoose discord.js dotenv
   ```

2. **Start the server**
   ```bash
   node luaguard-server.js
   ```

3. **Access at** `http://localhost:3000`

## 🔧 Production Deployment

### Prerequisites

- **Server**: Ubuntu 20.04+ or Windows Server 2019+
- **Node.js**: Version 16+ with npm
- **Database**: MongoDB 4.4+
- **Domain**: SSL certificate for HTTPS
- **Discord Bot**: Bot token and application setup

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Install PM2 for process management
sudo npm install -g pm2
```

### Step 2: Application Deployment

```bash
# Clone repository
git clone https://github.com/your-username/oblivion-x-protects.git
cd oblivion-x-protects

# Install dependencies
npm install

# Create production environment file
cp .env.example .env
```

### Step 3: Environment Configuration

Create `.env` file with production values:

```env
# Server Configuration
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Security
JWT_SECRET=your_super_secure_jwt_secret_key_here_minimum_32_chars
ENCRYPTION_KEY=your_encryption_key_for_script_protection_32_chars
SESSION_SECRET=your_session_secret_key_here

# Database
MONGODB_URI=mongodb://localhost:27017/oblivion-x-protects
# For MongoDB Atlas (cloud):
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/oblivion-x-protects

# Discord Bot Configuration
DISCORD_TOKEN=your_discord_bot_token_here
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_GUILD_ID=your_discord_server_id
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your/webhook/url

# Owner Configuration
OWNER_API_KEY=OWNER-MASTER-KEY-2024
OWNER_DISCORD_ID=your_discord_user_id

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# File Upload
MAX_FILE_SIZE=10485760  # 10MB in bytes
UPLOAD_PATH=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW=900000  # 15 minutes
RATE_LIMIT_MAX=100        # requests per window

# Security Headers
CORS_ORIGIN=https://yourdomain.com
```

### Step 4: Discord Bot Setup

1. **Create Discord Application**
   - Go to https://discord.com/developers/applications
   - Click "New Application"
   - Name it "Oblivion X Protects"

2. **Create Bot**
   - Go to "Bot" section
   - Click "Add Bot"
   - Copy the token to your `.env` file

3. **Set Bot Permissions**
   - Applications Commands
   - Send Messages
   - Use Slash Commands
   - Read Message History

4. **Invite Bot to Server**
   ```
   https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=2147483648&scope=bot%20applications.commands
   ```

### Step 5: SSL Certificate Setup

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Step 6: Nginx Configuration

Create `/etc/nginx/sites-available/oblivion-x-protects`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/oblivion-x-protects /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 7: Start Application

```bash
# Start with PM2
pm2 start luaguard-server.js --name "oblivion-x-protects"

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup
# Follow the generated command

# Monitor logs
pm2 logs oblivion-x-protects
```

## 🔒 Security Hardening

### Firewall Configuration

```bash
# Enable UFW
sudo ufw enable

# Allow SSH, HTTP, HTTPS
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443

# Allow MongoDB (if external access needed)
sudo ufw allow 27017
```

### MongoDB Security

```bash
# Create admin user
mongo
use admin
db.createUser({
  user: "admin",
  pwd: "secure_password_here",
  roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase", "readWriteAnyDatabase"]
})

# Enable authentication
sudo nano /etc/mongod.conf
# Add:
# security:
#   authorization: enabled

sudo systemctl restart mongod
```

### Application Security

1. **Rate Limiting**: Implemented in server code
2. **Input Validation**: Sanitize all user inputs
3. **CORS**: Configure allowed origins
4. **Headers**: Security headers via Nginx
5. **Secrets**: Use environment variables only

## 📊 Monitoring & Logging

### PM2 Monitoring

```bash
# Install PM2 monitoring
pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

### Application Logs

```javascript
// Add to luaguard-server.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});
```

## 🚀 Scaling & Performance

### Database Optimization

```javascript
// Add indexes for better performance
db.users.createIndex({ "apiKey": 1 })
db.users.createIndex({ "email": 1 })
db.scripts.createIndex({ "userId": 1 })
db.keys.createIndex({ "key": 1 })
db.keys.createIndex({ "expiresAt": 1 })
```

### Load Balancing

For high traffic, use multiple server instances:

```bash
# Start multiple instances
pm2 start luaguard-server.js -i max --name "oblivion-x-protects"
```

### CDN Integration

Use CloudFlare or AWS CloudFront for:
- Static asset delivery
- DDoS protection
- Global caching
- SSL termination

## 🔄 Backup & Recovery

### Database Backup

```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --db oblivion-x-protects --out /backups/mongodb_$DATE
tar -czf /backups/mongodb_$DATE.tar.gz /backups/mongodb_$DATE
rm -rf /backups/mongodb_$DATE

# Keep only last 7 days
find /backups -name "mongodb_*.tar.gz" -mtime +7 -delete
```

### Application Backup

```bash
#!/bin/bash
# app-backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf /backups/app_$DATE.tar.gz /path/to/oblivion-x-protects --exclude=node_modules --exclude=logs
```

### Automated Backups

```bash
# Add to crontab
0 2 * * * /path/to/backup.sh
0 3 * * * /path/to/app-backup.sh
```

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   sudo lsof -i :3000
   sudo kill -9 <PID>
   ```

2. **MongoDB Connection Failed**
   ```bash
   sudo systemctl status mongod
   sudo systemctl restart mongod
   ```

3. **Discord Bot Not Responding**
   - Check bot token in `.env`
   - Verify bot permissions
   - Check Discord API status

4. **SSL Certificate Issues**
   ```bash
   sudo certbot renew --dry-run
   sudo nginx -t
   ```

### Log Locations

- **Application**: `pm2 logs oblivion-x-protects`
- **Nginx**: `/var/log/nginx/access.log`, `/var/log/nginx/error.log`
- **MongoDB**: `/var/log/mongodb/mongod.log`
- **System**: `/var/log/syslog`

## 📈 Performance Monitoring

### Health Check Endpoint

Add to your server:

```javascript
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version
  });
});
```

### Monitoring Tools

- **PM2 Monitor**: `pm2 monit`
- **htop**: System resource monitoring
- **MongoDB Compass**: Database monitoring
- **New Relic/DataDog**: Application performance monitoring

---

This deployment guide covers everything needed to run Oblivion X Protects in production. For additional support, refer to the API documentation and troubleshooting sections.
