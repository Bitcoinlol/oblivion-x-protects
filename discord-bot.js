const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, EmbedBuilder } = require('discord.js');
const mongoose = require('mongoose');
require('dotenv').config();

// Import models (assuming same schema as server.js)
const User = mongoose.model('User');
const Project = mongoose.model('Project');
const Activity = mongoose.model('Activity');

class EnigmaCodeBot {
    constructor() {
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.DirectMessages
            ]
        });

        this.commands = new Map();
        this.ownerIds = ['YOUR_DISCORD_USER_ID']; // Replace with actual owner Discord IDs
        this.webhookUrl = process.env.DISCORD_WEBHOOK_URL; // For notifications
        
        this.init();
    }

    async init() {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/enigmacode');
        console.log('Discord Bot connected to MongoDB');

        // Setup commands
        this.setupCommands();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Register slash commands
        await this.registerSlashCommands();
        
        // Login to Discord
        await this.client.login(process.env.DISCORD_TOKEN);
    }

    setupCommands() {
        // User Commands
        this.commands.set('key-status', {
            data: new SlashCommandBuilder()
                .setName('key-status')
                .setDescription('Check the status of your EnigmaCode key'),
            ownerOnly: false,
            execute: this.keyStatus.bind(this)
        });

        this.commands.set('check-user-id', {
            data: new SlashCommandBuilder()
                .setName('check-user-id')
                .setDescription('Check if a Roblox User ID is whitelisted or blacklisted')
                .addStringOption(option =>
                    option.setName('roblox-id')
                        .setDescription('The Roblox User ID to check')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('project-id')
                        .setDescription('The Project ID to check against')
                        .setRequired(true)),
            ownerOnly: false,
            execute: this.checkUserId.bind(this)
        });

        this.commands.set('view-whitelisted-users', {
            data: new SlashCommandBuilder()
                .setName('view-whitelisted-users')
                .setDescription('View all whitelisted users for a project')
                .addStringOption(option =>
                    option.setName('project-id')
                        .setDescription('The Project ID')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('page')
                        .setDescription('Page number (default: 1)')
                        .setRequired(false)),
            ownerOnly: false,
            execute: this.viewWhitelistedUsers.bind(this)
        });

        this.commands.set('view-blacklisted-users', {
            data: new SlashCommandBuilder()
                .setName('view-blacklisted-users')
                .setDescription('View all blacklisted users for a project')
                .addStringOption(option =>
                    option.setName('project-id')
                        .setDescription('The Project ID')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('page')
                        .setDescription('Page number (default: 1)')
                        .setRequired(false)),
            ownerOnly: false,
            execute: this.viewBlacklistedUsers.bind(this)
        });

        // Admin Commands
        this.commands.set('generate-key', {
            data: new SlashCommandBuilder()
                .setName('generate-key')
                .setDescription('Generate a new key (Admin Only)')
                .addStringOption(option =>
                    option.setName('plan-type')
                        .setDescription('The plan type')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Free (30 days)', value: 'free' },
                            { name: 'Standard (1 year)', value: 'standard' },
                            { name: 'Premium (1 year)', value: 'premium' }
                        )),
            ownerOnly: true,
            execute: this.generateKey.bind(this)
        });

        this.commands.set('whitelist-user', {
            data: new SlashCommandBuilder()
                .setName('whitelist-user')
                .setDescription('Manually whitelist a Roblox User ID (Admin Only)')
                .addStringOption(option =>
                    option.setName('roblox-id')
                        .setDescription('The Roblox User ID')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('project-id')
                        .setDescription('The Project ID')
                        .setRequired(true)),
            ownerOnly: true,
            execute: this.whitelistUser.bind(this)
        });

        this.commands.set('blacklist-user', {
            data: new SlashCommandBuilder()
                .setName('blacklist-user')
                .setDescription('Manually blacklist a Roblox User ID (Admin Only)')
                .addStringOption(option =>
                    option.setName('roblox-id')
                        .setDescription('The Roblox User ID')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('project-id')
                        .setDescription('The Project ID')
                        .setRequired(true)),
            ownerOnly: true,
            execute: this.blacklistUser.bind(this)
        });

        this.commands.set('view-all-projects', {
            data: new SlashCommandBuilder()
                .setName('view-all-projects')
                .setDescription('View all projects on the platform (Admin Only)')
                .addIntegerOption(option =>
                    option.setName('page')
                        .setDescription('Page number (default: 1)')
                        .setRequired(false)),
            ownerOnly: true,
            execute: this.viewAllProjects.bind(this)
        });
    }

    setupEventListeners() {
        this.client.once('ready', () => {
            console.log(`EnigmaCode Discord Bot is ready! Logged in as ${this.client.user.tag}`);
            this.client.user.setActivity('EnigmaCode Platform', { type: 'WATCHING' });
        });

        this.client.on('interactionCreate', async (interaction) => {
            if (!interaction.isChatInputCommand()) return;

            const command = this.commands.get(interaction.commandName);
            if (!command) return;

            // Check if command is owner-only
            if (command.ownerOnly && !this.ownerIds.includes(interaction.user.id)) {
                await interaction.reply({
                    content: '❌ This command is restricted to platform administrators.',
                    ephemeral: true
                });
                return;
            }

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(`Error executing command ${interaction.commandName}:`, error);
                
                const errorMessage = '❌ There was an error executing this command.';
                
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: errorMessage, ephemeral: true });
                } else {
                    await interaction.reply({ content: errorMessage, ephemeral: true });
                }
            }
        });
    }

    async registerSlashCommands() {
        const commands = Array.from(this.commands.values()).map(cmd => cmd.data.toJSON());
        
        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
        
        try {
            console.log('Started refreshing application (/) commands.');
            
            await rest.put(
                Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
                { body: commands }
            );
            
            console.log('Successfully reloaded application (/) commands.');
        } catch (error) {
            console.error('Error registering slash commands:', error);
        }
    }

    // User Commands Implementation

    async keyStatus(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            // For this demo, we'll need the user to provide their key
            // In a real implementation, you might link Discord users to their keys
            const embed = new EmbedBuilder()
                .setColor(0x9333ea)
                .setTitle('🔑 Key Status Check')
                .setDescription('To check your key status, please use the following format:')
                .addFields({
                    name: 'Format',
                    value: 'Please provide your EnigmaCode key in a DM to check its status.',
                    inline: false
                })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Key status error:', error);
            await interaction.editReply({ content: '❌ Failed to check key status.' });
        }
    }

    async checkUserId(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const robloxId = interaction.options.getString('roblox-id');
            const projectId = interaction.options.getString('project-id');

            const project = await Project.findOne({ projectId, isActive: true });

            if (!project) {
                await interaction.editReply({ content: '❌ Project not found.' });
                return;
            }

            const isWhitelisted = project.whitelistedUsers.includes(robloxId);
            const isBlacklisted = project.blacklistedUsers.includes(robloxId);

            let status = 'Not listed';
            let statusEmoji = '⚪';
            let statusColor = 0x666666;

            if (isWhitelisted) {
                status = 'Whitelisted';
                statusEmoji = '✅';
                statusColor = 0x27ca3f;
            } else if (isBlacklisted) {
                status = 'Blacklisted';
                statusEmoji = '❌';
                statusColor = 0xff5f56;
            }

            const embed = new EmbedBuilder()
                .setColor(statusColor)
                .setTitle('👤 User Status Check')
                .addFields(
                    { name: 'Roblox User ID', value: robloxId, inline: true },
                    { name: 'Project ID', value: projectId, inline: true },
                    { name: 'Status', value: `${statusEmoji} ${status}`, inline: true }
                )
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Check user ID error:', error);
            await interaction.editReply({ content: '❌ Failed to check user status.' });
        }
    }

    async viewWhitelistedUsers(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const projectId = interaction.options.getString('project-id');
            const page = interaction.options.getInteger('page') || 1;
            const usersPerPage = 10;

            const project = await Project.findOne({ projectId, isActive: true });

            if (!project) {
                await interaction.editReply({ content: '❌ Project not found.' });
                return;
            }

            const whitelistedUsers = project.whitelistedUsers || [];
            const totalUsers = whitelistedUsers.length;
            const totalPages = Math.ceil(totalUsers / usersPerPage);

            if (totalUsers === 0) {
                await interaction.editReply({ content: '📋 No whitelisted users found for this project.' });
                return;
            }

            const startIndex = (page - 1) * usersPerPage;
            const endIndex = startIndex + usersPerPage;
            const usersOnPage = whitelistedUsers.slice(startIndex, endIndex);

            const embed = new EmbedBuilder()
                .setColor(0x27ca3f)
                .setTitle(`✅ Whitelisted Users - ${project.name}`)
                .setDescription(`**Project ID:** ${projectId}\n**Total Users:** ${totalUsers}`)
                .addFields({
                    name: `Users (Page ${page}/${totalPages})`,
                    value: usersOnPage.length > 0 ? usersOnPage.join('\n') : 'No users on this page',
                    inline: false
                })
                .setFooter({ text: `Page ${page} of ${totalPages}` })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('View whitelisted users error:', error);
            await interaction.editReply({ content: '❌ Failed to retrieve whitelisted users.' });
        }
    }

    async viewBlacklistedUsers(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const projectId = interaction.options.getString('project-id');
            const page = interaction.options.getInteger('page') || 1;
            const usersPerPage = 10;

            const project = await Project.findOne({ projectId, isActive: true });

            if (!project) {
                await interaction.editReply({ content: '❌ Project not found.' });
                return;
            }

            const blacklistedUsers = project.blacklistedUsers || [];
            const totalUsers = blacklistedUsers.length;
            const totalPages = Math.ceil(totalUsers / usersPerPage);

            if (totalUsers === 0) {
                await interaction.editReply({ content: '📋 No blacklisted users found for this project.' });
                return;
            }

            const startIndex = (page - 1) * usersPerPage;
            const endIndex = startIndex + usersPerPage;
            const usersOnPage = blacklistedUsers.slice(startIndex, endIndex);

            const embed = new EmbedBuilder()
                .setColor(0xff5f56)
                .setTitle(`❌ Blacklisted Users - ${project.name}`)
                .setDescription(`**Project ID:** ${projectId}\n**Total Users:** ${totalUsers}`)
                .addFields({
                    name: `Users (Page ${page}/${totalPages})`,
                    value: usersOnPage.length > 0 ? usersOnPage.join('\n') : 'No users on this page',
                    inline: false
                })
                .setFooter({ text: `Page ${page} of ${totalPages}` })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('View blacklisted users error:', error);
            await interaction.editReply({ content: '❌ Failed to retrieve blacklisted users.' });
        }
    }

    // Admin Commands Implementation

    async generateKey(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const planType = interaction.options.getString('plan-type');
            
            // Generate key logic (same as server.js)
            const keyId = this.generateKeyId(planType);
            const expiresAt = this.getExpirationDate(planType);

            const user = new User({
                keyId,
                plan: planType,
                expiresAt,
                createdAt: new Date(),
                isActive: true
            });

            await user.save();

            // Log activity
            const activity = new Activity({
                userId: 'SYSTEM',
                action: 'Key Generated',
                details: `${planType.charAt(0).toUpperCase() + planType.slice(1)} key generated via Discord bot`,
                timestamp: new Date()
            });
            await activity.save();

            // Send key via DM
            try {
                await interaction.user.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0x9333ea)
                            .setTitle('🔑 New Key Generated')
                            .addFields(
                                { name: 'Plan', value: planType.charAt(0).toUpperCase() + planType.slice(1), inline: true },
                                { name: 'Key', value: `\`${keyId}\``, inline: false },
                                { name: 'Expires', value: expiresAt.toLocaleDateString(), inline: true }
                            )
                            .setTimestamp()
                    ]
                });

                await interaction.editReply({ content: '✅ Key generated successfully and sent via DM!' });
            } catch (dmError) {
                // If DM fails, send in channel but hide the key
                await interaction.editReply({ 
                    content: `✅ Key generated successfully! Key: \`${keyId}\` (expires: ${expiresAt.toLocaleDateString()})`
                });
            }
        } catch (error) {
            console.error('Generate key error:', error);
            await interaction.editReply({ content: '❌ Failed to generate key.' });
        }
    }

    async whitelistUser(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const robloxId = interaction.options.getString('roblox-id');
            const projectId = interaction.options.getString('project-id');

            const project = await Project.findOne({ projectId, isActive: true });

            if (!project) {
                await interaction.editReply({ content: '❌ Project not found.' });
                return;
            }

            // Add to whitelist, remove from blacklist
            if (!project.whitelistedUsers.includes(robloxId)) {
                project.whitelistedUsers.push(robloxId);
            }
            project.blacklistedUsers = project.blacklistedUsers.filter(id => id !== robloxId);

            await project.save();

            // Log activity
            const activity = new Activity({
                userId: project.userId,
                action: 'User Whitelisted',
                details: `Whitelisted Roblox User ID: ${robloxId} via Discord bot`,
                robloxUserId: robloxId,
                projectId: projectId,
                timestamp: new Date()
            });
            await activity.save();

            await interaction.editReply({ 
                content: `✅ User ${robloxId} has been whitelisted for project ${projectId}` 
            });
        } catch (error) {
            console.error('Whitelist user error:', error);
            await interaction.editReply({ content: '❌ Failed to whitelist user.' });
        }
    }

    async blacklistUser(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const robloxId = interaction.options.getString('roblox-id');
            const projectId = interaction.options.getString('project-id');

            const project = await Project.findOne({ projectId, isActive: true });

            if (!project) {
                await interaction.editReply({ content: '❌ Project not found.' });
                return;
            }

            // Add to blacklist, remove from whitelist
            if (!project.blacklistedUsers.includes(robloxId)) {
                project.blacklistedUsers.push(robloxId);
            }
            project.whitelistedUsers = project.whitelistedUsers.filter(id => id !== robloxId);

            await project.save();

            // Log activity
            const activity = new Activity({
                userId: project.userId,
                action: 'User Blacklisted',
                details: `Blacklisted Roblox User ID: ${robloxId} via Discord bot`,
                robloxUserId: robloxId,
                projectId: projectId,
                timestamp: new Date()
            });
            await activity.save();

            await interaction.editReply({ 
                content: `✅ User ${robloxId} has been blacklisted for project ${projectId}` 
            });
        } catch (error) {
            console.error('Blacklist user error:', error);
            await interaction.editReply({ content: '❌ Failed to blacklist user.' });
        }
    }

    async viewAllProjects(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const page = interaction.options.getInteger('page') || 1;
            const projectsPerPage = 10;

            const totalProjects = await Project.countDocuments({ isActive: true });
            const totalPages = Math.ceil(totalProjects / projectsPerPage);

            if (totalProjects === 0) {
                await interaction.editReply({ content: '📋 No projects found on the platform.' });
                return;
            }

            const projects = await Project.find({ isActive: true })
                .select('projectId name userId type createdAt')
                .skip((page - 1) * projectsPerPage)
                .limit(projectsPerPage)
                .sort({ createdAt: -1 });

            const projectList = projects.map(project => {
                const typeEmoji = project.type === 'free-for-all' ? '🌐' : '👥';
                const createdDate = project.createdAt.toLocaleDateString();
                return `${typeEmoji} **${project.name}** (\`${project.projectId}\`)\nOwner: ${project.userId} | Created: ${createdDate}`;
            }).join('\n\n');

            const embed = new EmbedBuilder()
                .setColor(0x9333ea)
                .setTitle('📁 All Projects on Platform')
                .setDescription(`**Total Projects:** ${totalProjects}`)
                .addFields({
                    name: `Projects (Page ${page}/${totalPages})`,
                    value: projectList || 'No projects on this page',
                    inline: false
                })
                .setFooter({ text: `Page ${page} of ${totalPages}` })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('View all projects error:', error);
            await interaction.editReply({ content: '❌ Failed to retrieve projects.' });
        }
    }

    // Utility functions
    generateKeyId(plan = 'free') {
        const crypto = require('crypto');
        const prefix = plan === 'free' ? 'FREE' : plan === 'standard' ? 'STD' : 'PREM';
        const randomString = crypto.randomBytes(16).toString('hex').toUpperCase();
        return `${prefix}-${randomString}`;
    }

    getExpirationDate(plan) {
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

    // Real-time notification methods
    async sendNotification(type, data) {
        if (!this.webhookUrl) return;

        const { WebhookClient } = require('discord.js');
        const webhook = new WebhookClient({ url: this.webhookUrl });

        let embed;

        switch (type) {
            case 'key_activation':
                embed = new EmbedBuilder()
                    .setColor(0x27ca3f)
                    .setTitle('🔑 Key Activated')
                    .setDescription(`Key \`${data.keyId}\` has been activated by Roblox User ID: \`${data.robloxUserId}\``)
                    .setTimestamp();
                break;

            case 'tamper_detected':
                embed = new EmbedBuilder()
                    .setColor(0xff5f56)
                    .setTitle('🚨 Tamper Attempt Detected')
                    .setDescription(`Tamper attempt detected from Roblox User ID: \`${data.robloxUserId}\`. Global ban has been applied.`)
                    .setTimestamp();
                break;

            case 'blacklist_attempt':
                embed = new EmbedBuilder()
                    .setColor(0xffbd2e)
                    .setTitle('⚠️ Blacklisted User Attempt')
                    .setDescription(`Blacklisted user \`${data.robloxUserId}\` attempted to run a script and was kicked.`)
                    .addFields({ name: 'Project', value: data.projectId, inline: true })
                    .setTimestamp();
                break;

            default:
                return;
        }

        try {
            await webhook.send({ embeds: [embed] });
        } catch (error) {
            console.error('Webhook notification error:', error);
        }
    }
}

// Initialize bot
const bot = new EnigmaCodeBot();

// Export for use in main server
module.exports = bot;
