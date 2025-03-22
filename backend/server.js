import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import { 
    errorHandler, 
    handleUnhandledRejection, 
    handleUncaughtException 
} from './utils/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import recipeRoutes from './routes/recipeRoutes.js';
import connectDB from './config/db.js';

// Handle uncaught exceptions
process.on('uncaughtException', handleUncaughtException);

// Load env variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: true,
  maxAge: 86400, // 24 hours
  exposedHeaders: ['set-cookie']
}));
app.use(express.json());

app.use(helmet());
app.use(compression());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // Limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/recipes', recipeRoutes);

// Request size limits
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Timeout handling
app.use((req, res, next) => {
  req.setTimeout(5000, () => {
    res.status(408).send('Request timeout');
  });
  next();
});

// Error Handling Middleware
app.all('*', (req, res, next) => {
    const err = new Error(`Can't find ${req.originalUrl} on this server!`);
    err.status = 'fail';
    err.statusCode = 404;
    next(err);
});
app.use(errorHandler);

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
        handleUnhandledRejection(err);
        server.close(() => process.exit(1));
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();