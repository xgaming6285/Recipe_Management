import User from '../models/User.js ';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/errorHandler.js';
import catchAsync from '../utils/catchAsync.js';

// Create token function
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// Register a new user
export const signup = catchAsync(async (req, res, next) => {
  const { username, email, password } = req.body;
  
  // Check if user already exists
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    return next(new AppError('User with this email or username already exists', 409));
  }
  
  // Create new user
  const newUser = await User.create({
    username,
    email,
    password
  });
  
  // Create token
  const token = createToken(newUser._id);
  
  // Remove password from output
  newUser.password = undefined;
  
  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser
    }
  });
});

// Login user
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  
  // Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }
  
  // Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');
  
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  
  // If everything ok, send token to client
  const token = createToken(user._id);
  
  // Remove password from output
  user.password = undefined;
  
  res.status(200).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
});

// Refresh token
export const refreshToken = catchAsync(async (req, res, next) => {
  const { token } = req.body;

  if (!token) {
    return next(new AppError('Please provide a token', 400));
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError('The user belonging to this token no longer exists', 401));
    }

    // Generate new token
    const newToken = createToken(user._id);

    res.status(200).json({
      status: 'success',
      token: newToken
    });
  } catch (err) {
    return next(new AppError('Invalid token', 401));
  }
});