import User from '../models/User';
import Recipe from '../models/Recipe';
import { asyncHandler } from 'express-async-handler';

// Get current user profile
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  res.status(200).json(user);
});

// Get recipes created by current user
const getUserRecipes = asyncHandler(async (req, res) => {
  const recipes = await Recipe.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
  
  res.status(200).json(recipes);
});

export { getUserProfile, getUserRecipes };