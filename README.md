# RecipeHub

A full-stack recipe management application built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

## Project Structure

```
RecipeHub/
├── backend/                 # Backend (Node.js + Express)
└── frontend/               # Frontend (React + Tailwind)
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
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

3. Create a .env file with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/recipehub
   JWT_SECRET=your_jwt_secret_key_here
   NODE_ENV=development
   ```

4. Start the server:
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

3. Start the development server:
   ```bash
   npm start
   ```

## Features

- User authentication (signup, login, logout)
- Create, read, update, and delete recipes
- Search and filter recipes
- User profiles
- Responsive design

## Tech Stack

- **Frontend:**
  - React.js
  - React Router
  - Tailwind CSS
  - Axios

- **Backend:**
  - Node.js
  - Express.js
  - MongoDB with Mongoose
  - JWT Authentication

## License

MIT 