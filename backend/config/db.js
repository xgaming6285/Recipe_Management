import mongoose from 'mongoose';
import { AppError } from '../utils/errorHandler';

// Function to connect to MongoDB with retry mechanism
const connectWithRetry = async (retries = 5, delay = 5000) => {
    for (let i = 0; i < retries; i++) {
        try {
            const conn = await mongoose.connect(process.env.MONGODB_URI, {
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            });
            console.log(`MongoDB Connected: ${conn.connection.host}`);
            return;
        } catch (err) {
            if (i === retries - 1) {
                console.error(`Failed to connect to MongoDB after ${retries} attempts`);
                throw new AppError(`Database connection failed: ${err.message}`, 500);
            }
            console.log(`Retrying connection in ${delay/1000} seconds... (Attempt ${i + 1}/${retries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
};

// Main connection function
const connectDB = async () => {
    try {
        await connectWithRetry();
    } catch (error) {
        throw new AppError(`Database connection failed: ${error.message}`, 500);
    }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
    // Attempt to reconnect
    connectWithRetry().catch(err => {
        console.error('Failed to reconnect after disconnection:', err);
    });
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
    // Attempt to reconnect
    connectWithRetry().catch(err => {
        console.error('Failed to reconnect after error:', err);
    });
});

// Handle application termination
process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
    } catch (err) {
        console.error('Error during MongoDB connection closure:', err);
        process.exit(1);
    }
});

export default connectDB;
