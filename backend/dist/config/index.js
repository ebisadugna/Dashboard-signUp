import dotenv from 'dotenv';
dotenv.config();
export const config = {
    port: process.env.PORT || 5000,
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    jwtExpiresIn: '1d',
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/dashboard',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000'
};
