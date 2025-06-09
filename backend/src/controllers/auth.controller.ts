import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';
import { config } from '../config';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    console.log("Registering new user:", { email, name });

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

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Check if first user (make them admin)
    const isFirstUser = (await User.countDocuments()) === 0;
    const role = isFirstUser ? 'admin' : 'user';
    
    // Create new user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    console.log("User created successfully:", { id: user._id, email: user.email, role: user.role });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
};

export const login = async (req: Request, res: Response) => {
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
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    console.log(`User logged in successfully: ${email}`);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
};

export const getUserData = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    console.error('Get user data error:', error);
    res.status(500).json({ message: 'Error getting user data' });
  }
};

export const handleGoogleSignIn = async (req: Request, res: Response) => {
  try {
    console.log("Handling Google sign-in request");
    const { uid, email, name, photoURL } = req.body;

    // Get Firebase token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    try {
      // Verify Firebase token
      const idToken = authHeader.split('Bearer ')[1];
      const decodedToken = await auth.verifyIdToken(idToken);
      console.log("Verified Firebase token for:", decodedToken.email);

      // Check if token UID matches provided UID
      if (decodedToken.uid !== uid) {
        console.log("Token UID mismatch:", { tokenUid: decodedToken.uid, providedUid: uid });
        return res.status(403).json({ message: 'Unauthorized access' });
      }

      // Find or create user
      let user = await User.findOne({ uid });
      if (!user) {
        console.log("User not found, creating new user");
        
        // Check if first user (make them admin)
        const isFirstUser = (await User.countDocuments()) === 0;
        const role = isFirstUser ? 'admin' : 'user';
        console.log("User role:", role);
        
        // Create new user
        user = await User.create({
          uid,
          email,
          name,
          photoURL,
          role
        });
        console.log("Created new user:", user);
      } else {
        console.log("Found existing user:", user);
        // Update user data if needed
        if (name !== user.name || photoURL !== user.photoURL) {
          user.name = name;
          user.photoURL = photoURL;
          await user.save();
          console.log("Updated user data");
        }
      }

      res.json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          uid: user.uid,
          photoURL: user.photoURL
        }
      });
    } catch (tokenError) {
      console.error("Token verification error:", tokenError);
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Google sign-in error:', error);
    res.status(500).json({ message: 'Authentication failed' });
  }
}; 