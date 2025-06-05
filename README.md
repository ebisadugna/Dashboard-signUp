# Task Management Application

A full-stack task management application built with React, Node.js, Express, and MongoDB.

## Project Structure

```
├── frontend/         # React frontend application
└── backend/         # Node.js + Express backend application
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB installed locally or MongoDB Atlas account
- npm or yarn package manager

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/task-manager
   JWT_SECRET=your_jwt_secret_key
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the frontend development server:
   ```bash
   npm start
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Features

- User authentication (Login/Signup)
- JWT-based authorization
- Task management (CRUD operations)
- Protected routes
- Responsive design with Tailwind CSS

## Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Protected API endpoints
- Environment variable configuration
- CORS protection 