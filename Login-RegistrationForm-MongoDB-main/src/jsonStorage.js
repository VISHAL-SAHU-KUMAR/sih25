const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

class JSONUserStorage {
    constructor() {
        this.dataDir = path.join(__dirname, '../data');
        this.usersFile = path.join(this.dataDir, 'users.json');
        this.ensureDataDirectory();
        this.ensureUsersFile();
    }

    ensureDataDirectory() {
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
            console.log('📁 Created data directory for JSON storage');
        }
    }

    ensureUsersFile() {
        if (!fs.existsSync(this.usersFile)) {
            const initialData = {
                users: [],
                lastUpdated: new Date().toISOString(),
                metadata: {
                    version: "1.0",
                    description: "Temporary user storage for SwasthyaSetu healthcare system",
                    totalUsers: 0
                }
            };
            this.writeUsersFile(initialData);
            console.log('📄 Created users.json file');
        }
    }

    readUsersFile() {
        try {
            const data = fs.readFileSync(this.usersFile, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error reading users file:', error);
            return { users: [], metadata: { totalUsers: 0 } };
        }
    }

    writeUsersFile(data) {
        try {
            data.lastUpdated = new Date().toISOString();
            data.metadata.totalUsers = data.users.length;
            fs.writeFileSync(this.usersFile, JSON.stringify(data, null, 2));
            return true;
        } catch (error) {
            console.error('Error writing users file:', error);
            return false;
        }
    }

    async findUserByEmail(email) {
        const data = this.readUsersFile();
        return data.users.find(user => user.email.toLowerCase() === email.toLowerCase());
    }

    async findUserById(userId) {
        const data = this.readUsersFile();
        return data.users.find(user => user.id === userId);
    }

    async findUserByName(name) {
        const data = this.readUsersFile();
        return data.users.find(user => user.name.toLowerCase() === name.toLowerCase());
    }

    async findUserByEmailOrName(identifier) {
        const data = this.readUsersFile();
        const lowerIdentifier = identifier.toLowerCase();
        return data.users.find(user => 
            user.email.toLowerCase() === lowerIdentifier || 
            user.name.toLowerCase() === lowerIdentifier
        );
    }

    async createUser(userData) {
        try {
            const data = this.readUsersFile();
            
            // Check if user already exists
            const existingUser = await this.findUserByEmail(userData.email);
            if (existingUser) {
                throw new Error('User with this email already exists');
            }

            // Hash password
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

            // Create new user object
            const newUser = {
                id: uuidv4(),
                name: userData.name?.trim(),
                email: userData.email?.toLowerCase().trim(),
                password: hashedPassword,
                role: userData.role || 'patient',
                createdAt: new Date().toISOString(),
                lastLogin: null,
                isActive: true,
                isVerified: false,
                // Additional fields based on role
                ...(userData.dateOfBirth && { dateOfBirth: userData.dateOfBirth }),
                ...(userData.gender && { gender: userData.gender }),
                ...(userData.maritalStatus && { maritalStatus: userData.maritalStatus }),
                ...(userData.address && { address: userData.address }),
                ...(userData.specialization && { specialization: userData.specialization }),
                ...(userData.licenseNumber && { licenseNumber: userData.licenseNumber }),
                ...(userData.experience && { experience: userData.experience }),
                ...(userData.department && { department: userData.department }),
                ...(userData.employeeId && { employeeId: userData.employeeId })
            };

            data.users.push(newUser);
            
            if (this.writeUsersFile(data)) {
                console.log(`✅ User created: ${newUser.name} (${newUser.role})`);
                // Return user without password
                const { password, ...userWithoutPassword } = newUser;
                return userWithoutPassword;
            } else {
                throw new Error('Failed to save user data');
            }
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    async comparePassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    async updateUserLastLogin(userId) {
        try {
            const data = this.readUsersFile();
            const userIndex = data.users.findIndex(user => user.id === userId);
            
            if (userIndex !== -1) {
                data.users[userIndex].lastLogin = new Date().toISOString();
                this.writeUsersFile(data);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error updating last login:', error);
            return false;
        }
    }

    async findUserByRole(identifier, role) {
        const data = this.readUsersFile();
        const lowerIdentifier = identifier.toLowerCase();
        return data.users.find(user => 
            (user.email.toLowerCase() === lowerIdentifier || 
             user.name.toLowerCase() === lowerIdentifier) &&
            user.role === role &&
            user.isActive
        );
    }

    // Get all users (for admin purposes)
    async getAllUsers() {
        const data = this.readUsersFile();
        return data.users.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });
    }

    // Get users by role
    async getUsersByRole(role) {
        const data = this.readUsersFile();
        return data.users
            .filter(user => user.role === role)
            .map(user => {
                const { password, ...userWithoutPassword } = user;
                return userWithoutPassword;
            });
    }

    // Get storage statistics
    getStats() {
        const data = this.readUsersFile();
        const stats = {
            totalUsers: data.users.length,
            usersByRole: {},
            lastUpdated: data.lastUpdated
        };

        // Count users by role
        data.users.forEach(user => {
            stats.usersByRole[user.role] = (stats.usersByRole[user.role] || 0) + 1;
        });

        return stats;
    }

    // Clear all users (for testing)
    async clearAllUsers() {
        const data = {
            users: [],
            lastUpdated: new Date().toISOString(),
            metadata: {
                version: "1.0",
                description: "Temporary user storage for SwasthyaSetu healthcare system",
                totalUsers: 0
            }
        };
        return this.writeUsersFile(data);
    }
}

module.exports = JSONUserStorage;