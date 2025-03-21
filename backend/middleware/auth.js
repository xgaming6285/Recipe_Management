import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AppError } from '../utils/errorHandler';
import catchAsync from '../utils/catchAsync';

export const protect = catchAsync(async (req, res, next) => {
  try {
    let token;
    
    // Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return next(new AppError('You are not logged in. Please log in to get access.', 401));
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }
    
    // Grant access to protected route
    req.user = currentUser;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token. Please log in again.'
    });
  }
});

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};

// Middleware to check if user owns the resource or is admin
export const checkOwnership = (Model) => catchAsync(async (req, res, next) => {
  const resource = await Model.findById(req.params.id);
  
  if (!resource) {
    return next(new AppError('Resource not found', 404));
  }

  if (resource.createdBy && resource.createdBy.toString() !== req.user._id.toString() && !req.user.isAdmin()) {
    return next(new AppError('You do not have permission to perform this action', 403));
  }

  req.resource = resource;
  next();
});