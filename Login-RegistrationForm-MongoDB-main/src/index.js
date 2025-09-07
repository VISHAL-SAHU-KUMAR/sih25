const express = require("express");
const app = express();
const path = require("path");
const hbs = require("hbs");
const collection = require("./mongodb");
const UserStorage = require("./userStorage");
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const validator = require('validator');
require('dotenv').config();

// Initialize storage system
const userStorage = new UserStorage();

const templatePath = path.join(__dirname, "../templates");

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Login rate limiting
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 login requests per windowMs
    message: 'Too many login attempts, please try again later.'
});

app.use(express.json());
app.set("view engine", "hbs");
app.set("views", templatePath);
app.use(express.urlencoded({ extended: false }));

// JWT middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
};

// Routes
app.get("/", (req, res) => {
    res.render("login");
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

app.post("/signup", async (req, res) => {
    try {
        const { name, email, password, 'confirm-password': confirmPassword } = req.body;

        // Validation
        if (!name || !email || !password || !confirmPassword) {
            return res.render("signup", {
                error: "All fields are required."
            });
        }

        if (!validator.isEmail(email)) {
            return res.render("signup", {
                error: "Please enter a valid email address."
            });
        }

        if (password.length < 7) {
            return res.render("signup", {
                error: "Password must be at least 7 characters long."
            });
        }

        if (password !== confirmPassword) {
            return res.render("signup", {
                error: "Passwords do not match."
            });
        }

        // Check if user already exists using storage system
        const existingUser = await userStorage.findUserByEmail(email);
        if (existingUser) {
            return res.render("signup", {
                error: "User with this email already exists."
            });
        }

        const userData = {
            name: validator.escape(name.trim()),
            email: email.toLowerCase().trim(),
            password,
        };

        await userStorage.createUser(userData);
        console.log(`✅ User registered via web form: ${userData.name} (Storage: ${userStorage.getStorageType()})`);
        
        res.render("login", { 
            success: "Account created successfully! Please login." 
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.render("signup", {
            error: "An error occurred during registration. Please try again."
        });
    }
});

app.post("/login", loginLimiter, async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.render("login", {
                error: "Username/Email and password are required."
            });
        }

        // Find user by username or email using storage system
        const user = await userStorage.findUserByEmailOrName(username);

        if (!user) {
            return res.render("login", {
                error: "Invalid credentials."
            });
        }

        // Check if account is active
        if (!user.isActive) {
            return res.render("login", {
                error: "Account is deactivated. Please contact support."
            });
        }

        // Compare password using storage system
        const isPasswordValid = await userStorage.comparePassword(password, user);
        if (!isPasswordValid) {
            return res.render("login", {
                error: "Invalid credentials."
            });
        }

        // Update last login
        await userStorage.updateLastLogin(user);

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user.id || user._id, 
                email: user.email, 
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        console.log(`✅ User logged in via web: ${user.name} (Storage: ${userStorage.getStorageType()})`);

        // For web interface, render home page
        res.render("home", {
            user: {
                name: user.name,
                email: user.email,
                role: user.role
            },
            token
        });

    } catch (error) {
        console.error('Login error:', error);
        res.render("login", {
            error: "An error occurred during login. Please try again."
        });
    }
});

// API endpoint for frontend integration
app.post("/api/login", loginLimiter, async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: "Username/Email and password are required." });
        }

        const user = await userStorage.findUserByEmailOrName(username);

        if (!user || !user.isActive) {
            return res.status(401).json({ error: "Invalid credentials." });
        }

        const isPasswordValid = await userStorage.comparePassword(password, user);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid credentials." });
        }

        await userStorage.updateLastLogin(user);

        const token = jwt.sign(
            { 
                userId: user.id || user._id, 
                email: user.email, 
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        console.log(`✅ User logged in via API: ${user.name} (Storage: ${userStorage.getStorageType()})`);

        res.json({
            success: true,
            token,
            user: {
                id: user.id || user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('API Login error:', error);
        res.status(500).json({ error: "Internal server error." });
    }
});

// API endpoint for frontend registration
app.post("/api/signup", async (req, res) => {
    try {
        const { name, email, password, confirmPassword, role = 'patient', ...additionalData } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({ error: "Name, email, and password are required." });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({ error: "Please enter a valid email address." });
        }

        if (password.length < 7) {
            return res.status(400).json({ error: "Password must be at least 7 characters long." });
        }

        if (confirmPassword && password !== confirmPassword) {
            return res.status(400).json({ error: "Passwords do not match." });
        }

        // Check if user already exists using storage system
        const existingUser = await userStorage.findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: "User with this email already exists." });
        }

        const userData = {
            name: validator.escape(name.trim()),
            email: email.toLowerCase().trim(),
            password,
            role: ['patient', 'doctor', 'admin'].includes(role) ? role : 'patient',
            ...additionalData
        };

        const newUser = await userStorage.createUser(userData);

        // Generate JWT token for immediate login
        const token = jwt.sign(
            { 
                userId: newUser.id, 
                email: newUser.email, 
                role: newUser.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        console.log(`✅ User registered via API: ${newUser.name} (${newUser.role}) (Storage: ${userStorage.getStorageType()})`);

        res.status(201).json({
            success: true,
            message: "Account created successfully!",
            token,
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error('API Signup error:', error);
        res.status(500).json({ error: "Internal server error." });
    }
});

// Role-based registration endpoints
app.post("/api/auth/patient/register", async (req, res) => {
    try {
        const { name, email, password, confirmPassword, ...additionalData } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({ error: "Name, email, and password are required." });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({ error: "Please enter a valid email address." });
        }

        if (password.length < 7) {
            return res.status(400).json({ error: "Password must be at least 7 characters long." });
        }

        if (confirmPassword && password !== confirmPassword) {
            return res.status(400).json({ error: "Passwords do not match." });
        }

        // Check if user already exists using storage system
        const existingUser = await userStorage.findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: "User with this email already exists." });
        }

        const userData = {
            name: validator.escape(name.trim()),
            email: email.toLowerCase().trim(),
            password,
            role: 'patient',
            ...additionalData
        };

        const newUser = await userStorage.createUser(userData);

        // Generate JWT token for immediate login
        const token = jwt.sign(
            { 
                userId: newUser.id, 
                email: newUser.email, 
                role: newUser.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        console.log(`✅ Patient registered: ${newUser.name} (Storage: ${userStorage.getStorageType()})`);

        res.status(201).json({
            success: true,
            message: "Patient account created successfully!",
            token,
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error('Patient registration error:', error);
        res.status(500).json({ error: "Internal server error." });
    }
});

app.post("/api/auth/doctor/register", async (req, res) => {
    try {
        const { name, email, password, confirmPassword, ...additionalData } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({ error: "Name, email, and password are required." });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({ error: "Please enter a valid email address." });
        }

        if (password.length < 7) {
            return res.status(400).json({ error: "Password must be at least 7 characters long." });
        }

        // Check if user already exists using storage system
        const existingUser = await userStorage.findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: "User with this email already exists." });
        }

        const userData = {
            name: validator.escape(name.trim()),
            email: email.toLowerCase().trim(),
            password,
            role: 'doctor',
            ...additionalData
        };

        const newUser = await userStorage.createUser(userData);

        // Generate JWT token for immediate login
        const token = jwt.sign(
            { 
                userId: newUser.id, 
                email: newUser.email, 
                role: newUser.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        console.log(`✅ Doctor registered: ${newUser.name} (Storage: ${userStorage.getStorageType()})`);

        res.status(201).json({
            success: true,
            message: "Doctor account created successfully!",
            token,
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error('Doctor registration error:', error);
        res.status(500).json({ error: "Internal server error." });
    }
});

app.post("/api/auth/authority/register", async (req, res) => {
    try {
        const { name, email, password, confirmPassword, ...additionalData } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({ error: "Name, email, and password are required." });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({ error: "Please enter a valid email address." });
        }

        if (password.length < 7) {
            return res.status(400).json({ error: "Password must be at least 7 characters long." });
        }

        // Check if user already exists using storage system
        const existingUser = await userStorage.findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: "User with this email already exists." });
        }

        const userData = {
            name: validator.escape(name.trim()),
            email: email.toLowerCase().trim(),
            password,
            role: 'admin', // Authority users get admin role
            ...additionalData
        };

        const newUser = await userStorage.createUser(userData);

        // Generate JWT token for immediate login
        const token = jwt.sign(
            { 
                userId: newUser.id, 
                email: newUser.email, 
                role: newUser.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        console.log(`✅ Authority registered: ${newUser.name} (Storage: ${userStorage.getStorageType()})`);

        res.status(201).json({
            success: true,
            message: "Authority account created successfully!",
            token,
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error('Authority registration error:', error);
        res.status(500).json({ error: "Internal server error." });
    }
});

// Role-based login endpoints
app.post("/api/auth/patient/login", loginLimiter, async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: "Username/Email and password are required." });
        }

        const user = await userStorage.findUserByEmailOrName(username);

        if (!user || !user.isActive || user.role !== 'patient') {
            return res.status(401).json({ error: "Invalid credentials or not a patient account." });
        }

        const isPasswordValid = await userStorage.comparePassword(password, user);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid credentials." });
        }

        await userStorage.updateLastLogin(user);

        const token = jwt.sign(
            { 
                userId: user._id, 
                email: user.email, 
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Patient login error:', error);
        res.status(500).json({ error: "Internal server error." });
    }
});

app.post("/api/auth/doctor/login", loginLimiter, async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: "Username/Email and password are required." });
        }

        const user = await userStorage.findUserByEmailOrName(username);

        if (!user || !user.isActive || user.role !== 'doctor') {
            return res.status(401).json({ error: "Invalid credentials or not a doctor account." });
        }

        const isPasswordValid = await userStorage.comparePassword(password, user);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid credentials." });
        }

        await userStorage.updateLastLogin(user);

        const token = jwt.sign(
            { 
                userId: user.id || user._id, 
                email: user.email, 
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        console.log(`✅ Doctor logged in: ${user.name} (Storage: ${userStorage.getStorageType()})`);

        res.json({
            success: true,
            token,
            user: {
                id: user.id || user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Doctor login error:', error);
        res.status(500).json({ error: "Internal server error." });
    }
});

app.post("/api/auth/authority/login", loginLimiter, async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: "Username/Email and password are required." });
        }

        const user = await userStorage.findUserByEmailOrName(username);

        if (!user || !user.isActive || user.role !== 'admin') {
            return res.status(401).json({ error: "Invalid credentials or not an authority account." });
        }

        const isPasswordValid = await userStorage.comparePassword(password, user);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid credentials." });
        }

        await userStorage.updateLastLogin(user);

        const token = jwt.sign(
            { 
                userId: user.id || user._id, 
                email: user.email, 
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        console.log(`✅ Authority logged in: ${user.name} (Storage: ${userStorage.getStorageType()})`);

        res.json({
            success: true,
            token,
            user: {
                id: user.id || user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Authority login error:', error);
        res.status(500).json({ error: "Internal server error." });
    }
});

// Protected route example
app.get("/api/profile", authenticateToken, async (req, res) => {
    try {
        const user = await userStorage.findUserById(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        
        // Remove password from response
        const { password, ...userProfile } = user;
        res.json({ user: userProfile });
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ error: "Internal server error." });
    }
});

app.get("/logout", (req, res) => {
    res.redirect("/");
});

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({ 
        status: "OK", 
        timestamp: new Date().toISOString(),
        storage: {
            type: userStorage.getStorageType(),
            mongoAvailable: userStorage.mongoAvailable,
            stats: userStorage.getStats()
        }
    });
});

// Storage management endpoints
app.get("/api/storage/info", (req, res) => {
    res.json({
        success: true,
        storage: {
            currentType: userStorage.getStorageType(),
            mongoAvailable: userStorage.mongoAvailable,
            useJSON: userStorage.useJSON,
            stats: userStorage.getStats()
        }
    });
});

app.post("/api/storage/switch", (req, res) => {
    const { type } = req.body;
    
    try {
        if (type === 'json') {
            userStorage.switchToJSON();
            res.json({ success: true, message: "Switched to JSON storage", currentType: "JSON" });
        } else if (type === 'mongodb') {
            userStorage.switchToMongoDB();
            res.json({ success: true, message: "Switched to MongoDB storage", currentType: userStorage.getStorageType() });
        } else {
            res.status(400).json({ error: "Invalid storage type. Use 'json' or 'mongodb'" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/api/users", authenticateToken, async (req, res) => {
    try {
        const users = await userStorage.getAllUsers();
        res.json({ success: true, users, storageType: userStorage.getStorageType() });
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve users" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`SwasthyaSetu Auth Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
