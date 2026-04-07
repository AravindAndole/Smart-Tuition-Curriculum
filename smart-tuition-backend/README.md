# Smart Tuition Management System - Phase 1

## Overview
This is the backend for Phase 1 of the Smart Tuition Management System. It uses Node.js, Express, MongoDB, and JSON Web Tokens (JWT) for authentication.

## Folder Structure
```text
smart-tuition-backend/
├── controllers/
│   └── authController.js    # Handles registration and login logic
├── middleware/
│   └── authMiddleware.js    # JWT protection and role-based authorization rules
├── models/
│   ├── Student.js           # Student database schema
│   ├── TuitionCenter.js     # Tuition Center database schema
│   └── User.js              # User schema (Teachers, Parents, Students)
├── routes/
│   └── authRoutes.js        # API Routes for authentication
├── server.js                # Application entry point
├── package.json
└── README.md
```

## Setup Instructions

### 1. Pre-requisites
- Node.js installed (v16+)
- MongoDB server running locally or a MongoDB Atlas connection URI

### 2. Backend Installation
1. Open up your terminal and navigate to the `smart-tuition-backend` directory.
2. Install the necessary dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory (optional, but recommended):
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/smart-tuition
   JWT_SECRET=your_super_secret_key_here
   ```

### 3. Running the Server
You can run the server in development mode using `nodemon` or standard node mode:
```bash
npm run dev
```
*(Runs on port 5000 by default)*

### 4. API Testing Guide (Using Postman or similar tools)

#### Register Teacher & Create Tuition Center
- **URL**: `POST /api/auth/register/teacher`
- **Body** (JSON):
  ```json
  {
    "name": "John Doe",
    "email": "teacher@example.com",
    "password": "password123",
    "tuitionCenterName": "Excel Academy"
  }
  ```

*(To test Parent Registration, you must first create a Student manually in your database with a unique `studentId` since Phase 1 doesn't include the UI/Route to create a student yet)*

#### Register Parent
- **URL**: `POST /api/auth/register/parent`
- **Body** (JSON):
  ```json
  {
    "name": "Jane Parent",
    "email": "parent@example.com",
    "password": "password123",
    "studentId": "STU12345"
  }
  ```

#### Login
- **URL**: `POST /api/auth/login`
- **Body** (JSON):
  ```json
  {
    "email": "teacher@example.com",
    "password": "password123"
  }
  ```
*(On success, this returns a JWT `token`)*

#### Test Protected Route
- **URL**: `GET /api/auth/me`
- **Headers**:
  - `Authorization: Bearer <your_jwt_token>`

#### Test Role-based Protected Route
- **URL**: `GET /api/auth/dashboard/teacher`
- **Headers**:
  - `Authorization: Bearer <your_jwt_token_from_teacher_login>`

## Frontend Architecture Note
For the React Frontend, you can set it up inside a sibling directory `smart-tuition-frontend`.
Use Vite or Create React App:
```bash
npx create-vite smart-tuition-frontend --template react
cd smart-tuition-frontend
npm install
npm install axios react-router-dom
```
From there, build your React components and hook up HTTP calls using `axios` pointing to `http://localhost:5000/api/auth/...`.
