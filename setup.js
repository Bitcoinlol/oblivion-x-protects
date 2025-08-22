const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🛡️  EnigmaCode Setup Wizard');
console.log('='.repeat(50));

// Check if .env already exists
const envPath = path.join(__dirname, '.env');
let envExists = fs.existsSync(envPath);

if (envExists) {
    console.log('⚠️  Configuration file (.env) already exists.');
    console.log('This will overwrite your existing configuration.');
    console.log('');
}

// Generate secure secrets
const jwtSecret = crypto.randomBytes(64).toString('hex');
const mongoUri = 'mongodb://localhost:27017/enigmacode';

// Default configuration
const config = {
    PORT: '3000',
    MONGODB_URI: mongoUri,
    JWT_SECRET: jwtSecret,
    DISCORD_TOKEN: 'your_discord_bot_token_here',
    DISCORD_CLIENT_ID: 'your_discord_client_id_here',
    DISCORD_WEBHOOK_URL: 'your_webhook_url_for_notifications'
};

// Create .env file
const envContent = Object.entries(config)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

fs.writeFileSync(envPath, envContent);

console.log('✅ Configuration file created successfully!');
console.log('');
console.log('📋 Configuration Summary:');
console.log(`   Port: ${config.PORT}`);
console.log(`   Database: ${config.MONGODB_URI}`);
console.log(`   JWT Secret: Generated securely`);
console.log('');
console.log('🔧 Next Steps:');
console.log('1. Ensure MongoDB is installed and running');
console.log('2. Update Discord bot credentials in .env (optional)');
console.log('3. Run "npm install" to install dependencies');
console.log('4. Run "npm start" or use start.bat to launch');
console.log('');
console.log('🌐 Access your platform at: http://localhost:3000');
console.log('');

// Create a basic owner key for initial access
const mongoose = require('mongoose');

async function createOwnerKey() {
    try {
        console.log('🔑 Creating owner key...');
        
        await mongoose.connect(config.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        // Define User schema inline for setup
        const userSchema = new mongoose.Schema({
            keyId: { type: String, unique: true, required: true },
            plan: { type: String, enum: ['free', 'standard', 'premium', 'owner'], default: 'free' },
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

        // Check if owner key already exists
        const existingOwner = await User.findOne({ plan: 'owner' });
        
        if (!existingOwner) {
            const ownerKey = 'ENIGMA-OWNER-' + crypto.randomBytes(16).toString('hex').toUpperCase();
            
            const ownerUser = new User({
                keyId: ownerKey,
                plan: 'owner',
                expiresAt: new Date(Date.now() + (365 * 24 * 60 * 60 * 1000 * 10)), // 10 years
                isActive: true
            });

            await ownerUser.save();
            
            console.log('✅ Owner key created successfully!');
            console.log(`🔑 Your owner key: ${ownerKey}`);
            console.log('');
            console.log('⚠️  IMPORTANT: Save this key securely!');
            console.log('   This key grants full administrative access.');
            console.log('');
            
            // Save to file for reference
            const keyFile = path.join(__dirname, 'OWNER_KEY.txt');
            fs.writeFileSync(keyFile, `EnigmaCode Owner Key\nGenerated: ${new Date().toISOString()}\n\nKey: ${ownerKey}\n\nThis key grants full administrative access to EnigmaCode.\nKeep it secure and do not share it.\n`);
            console.log(`📄 Owner key saved to: ${keyFile}`);
        } else {
            console.log('ℹ️  Owner key already exists in database.');
        }
        
        await mongoose.disconnect();
        
    } catch (error) {
        console.log('⚠️  Could not create owner key (database not available)');
        console.log('   You can create it manually after starting the server.');
        console.log('');
    }
}

// Create owner key if MongoDB is available
createOwnerKey().finally(() => {
    console.log('🚀 Setup complete! You can now start EnigmaCode.');
    console.log('');
    console.log('Quick start commands:');
    console.log('   Windows: start.bat');
    console.log('   All platforms: npm start');
    console.log('');
});
