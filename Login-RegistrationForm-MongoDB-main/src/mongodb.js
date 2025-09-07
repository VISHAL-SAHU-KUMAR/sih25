const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB using environment variable with explicit database name to avoid case issues
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/swasthyasetu", {
    dbName: 'swasthyasetu' // Explicitly set database name to lowercase
})
.then(() => {
    console.log("MongoDB Connected Successfully!");
})
.catch((error) => {
    console.log("Failed to Connect to MongoDB:", error.message);
});

const LogInSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: true,
        minlength: 7
    },
    role: {
        type: String,
        enum: ['patient', 'doctor', 'admin'],
        default: 'patient'
    },
    // Additional fields for patients
    dateOfBirth: {
        type: Date
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other', 'prefer-not-to-say']
    },
    maritalStatus: {
        type: String,
        enum: ['single', 'married', 'divorced', 'widowed', 'separated']
    },
    address: {
        type: String,
        trim: true
    },
    // Additional fields for doctors
    specialization: {
        type: String,
        trim: true
    },
    licenseNumber: {
        type: String,
        trim: true
    },
    experience: {
        type: Number
    },
    // Additional fields for authorities/admins
    department: {
        type: String,
        trim: true
    },
    employeeId: {
        type: String,
        trim: true
    },
    // Common fields
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    profilePicture: {
        type: String
    }
});

// Hash password before saving
LogInSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
        this.password = await bcrypt.hash(this.password, saltRounds);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
LogInSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const collection = new mongoose.model("LogInCollection", LogInSchema);

module.exports = collection;