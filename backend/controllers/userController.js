import User from '../models/User';
import Recipe from '../models/Recipe';
import { AppError } from '../utils/errorHandler';
import catchAsync from '../utils/catchAsync';

// Get current user profile
export const getUserProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('-password');
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

// Get recipes created by current user
export const getUserRecipes = catchAsync(async (req, res, next) => {
  const recipes = await Recipe.find({ createdBy: req.user.id })
    .sort({ createdAt: -1 });
  
  res.status(200).json({
    status: 'success',
    results: recipes.length,
    data: {
      recipes
    }
  });
});