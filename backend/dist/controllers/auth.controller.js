import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../config';
import User from '../models/user.model';
const client = new OAuth2Client(config.googleClientId);
export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        // Input validation
        if (!name || !email || !password) {
            return res.status(400).json({
                message: 'Please provide all required fields',
                details: {
                    name: !name ? 'Name is required' : null,
                    email: !email ? 'Email is required' : null,
                    password: !password ? 'Password is required' : null
                }
            });
        }
        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }
        // Password strength validation
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }
        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }
        // Create new user
        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password
        });
        // Generate JWT
        const token = jwt.sign({ id: user._id, email: user.email }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
        // Log successful registration
        console.log(`User registered successfully: ${email}`);
        res.status(201).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    }
    catch (error) {
        // Detailed error logging
        console.error('Registration error:', {
            error: error.message,
            stack: error.stack,
            body: req.body
        });
        // MongoDB duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Email already registered' });
        }
        // Mongoose validation error
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({
                message: 'Validation error',
                details: validationErrors
            });
        }
        res.status(500).json({
            message: 'Error creating account',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Input validation
        if (!email || !password) {
            return res.status(400).json({
                message: 'Please provide both email and password'
            });
        }
        // Find user
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        // Generate JWT
        const token = jwt.sign({ id: user._id, email: user.email }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
        // Log successful login
        console.log(`User logged in successfully: ${email}`);
        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    }
    catch (error) {
        console.error('Login error:', {
            error: error.message,
            stack: error.stack,
            body: req.body
        });
        res.status(500).json({ message: 'Error logging in' });
    }
};
export const googleSignIn = async (req, res) => {
    try {
        const { credential } = req.body;
        // Verify Google token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: config.googleClientId
        });
        const payload = ticket.getPayload();
        if (!payload) {
            return res.status(400).json({ message: 'Invalid token payload' });
        }
        const { email, name, picture, sub: googleId } = payload;
        // Find or create user
        let user = await User.findOne({ email });
        if (!user) {
            user = await User.create({
                email,
                name,
                googleId
            });
        }
        // Generate JWT
        const token = jwt.sign({ id: user._id, email: user.email }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name
            }
        });
    }
    catch (error) {
        console.error('Google sign-in error:', error);
        res.status(500).json({ message: 'Authentication failed' });
    }
};
export const validateToken = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ user });
    }
    catch (error) {
        console.error('Token validation error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
