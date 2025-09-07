const collection = require('./mongodb');
const JSONUserStorage = require('./jsonStorage');

class UserStorage {
    constructor() {
        this.jsonStorage = new JSONUserStorage();
        this.useJSON = process.env.USE_JSON_STORAGE === 'true' || false;
        this.mongoAvailable = false;
        this.checkMongoConnection();
    }

    async checkMongoConnection() {
        try {
            // Test MongoDB connection by attempting to count documents
            await collection.countDocuments();
            this.mongoAvailable = true;
            console.log('✅ MongoDB connection available');
        } catch (error) {
            this.mongoAvailable = false;
            console.log('⚠️ MongoDB not available, using JSON storage');
            this.useJSON = true;
        }
    }

    getStorageType() {
        return this.useJSON ? 'JSON' : 'MongoDB';
    }

    async findUserByEmail(email) {
        if (this.useJSON) {
            return await this.jsonStorage.findUserByEmail(email);
        } else {
            return await collection.findOne({ email: email.toLowerCase() });
        }
    }

    async findUserById(userId) {
        if (this.useJSON) {
            return await this.jsonStorage.findUserById(userId);
        } else {
            return await collection.findById(userId);
        }
    }

    async findUserByEmailOrName(identifier) {
        if (this.useJSON) {
            return await this.jsonStorage.findUserByEmailOrName(identifier);
        } else {
            return await collection.findOne({
                $or: [
                    { name: identifier },
                    { email: identifier.toLowerCase() }
                ]
            });
        }
    }

    async findUserByRole(identifier, role) {
        if (this.useJSON) {
            return await this.jsonStorage.findUserByRole(identifier, role);
        } else {
            return await collection.findOne({
                $and: [
                    {
                        $or: [
                            { name: identifier },
                            { email: identifier.toLowerCase() }
                        ]
                    },
                    { role: role },
                    { isActive: true }
                ]
            });
        }
    }

    async createUser(userData) {
        if (this.useJSON) {
            return await this.jsonStorage.createUser(userData);
        } else {
            const newUser = await collection.create(userData);
            const { password, ...userWithoutPassword } = newUser.toObject();
            return userWithoutPassword;
        }
    }

    async comparePassword(plainPassword, user) {
        if (this.useJSON) {
            return await this.jsonStorage.comparePassword(plainPassword, user.password);
        } else {
            return await user.comparePassword(plainPassword);
        }
    }

    async updateLastLogin(user) {
        if (this.useJSON) {
            return await this.jsonStorage.updateUserLastLogin(user.id);
        } else {
            user.lastLogin = new Date();
            await user.save();
            return true;
        }
    }

    async getAllUsers() {
        if (this.useJSON) {
            return await this.jsonStorage.getAllUsers();
        } else {
            return await collection.find({}).select('-password');
        }
    }

    async getUsersByRole(role) {
        if (this.useJSON) {
            return await this.jsonStorage.getUsersByRole(role);
        } else {
            return await collection.find({ role }).select('-password');
        }
    }

    getStats() {
        if (this.useJSON) {
            return this.jsonStorage.getStats();
        } else {
            // For MongoDB, you would implement similar stats logic
            return { storageType: 'MongoDB', note: 'Stats not implemented for MongoDB' };
        }
    }

    // Switch storage method (useful for testing)
    switchToJSON() {
        this.useJSON = true;
        console.log('🔄 Switched to JSON storage');
    }

    switchToMongoDB() {
        if (this.mongoAvailable) {
            this.useJSON = false;
            console.log('🔄 Switched to MongoDB storage');
        } else {
            console.log('⚠️ Cannot switch to MongoDB - not available');
        }
    }
}

module.exports = UserStorage;