import Recipe from '../models/Recipe';
import { AppError } from '../utils/errorHandler';
import catchAsync from '../utils/catchAsync';
import APIFeatures from '../utils/apiFeatures';

// Get all recipes with filtering, sorting, and pagination
export const getRecipes = catchAsync(async (req, res) => {
  const features = new APIFeatures(Recipe.find(), req.query)
    .filter()
    .search()
    .sort()
    .limitFields()
    .paginate();

  const recipes = await features.query.populate({
    path: 'createdBy',
    select: 'username'
  });

  res.status(200).json({
    success: true,
    count: recipes.length,
    data: recipes
  });
});

// Get single recipe
export const getRecipe = catchAsync(async (req, res, next) => {
  const recipe = await Recipe.findById(req.params.id).populate({
    path: 'createdBy',
    select: 'username'
  });

  if (!recipe) {
    return next(new AppError('Recipe not found', 404));
  }

  res.status(200).json({
    success: true,
    data: recipe
  });
});

// Create new recipe
export const createRecipe = catchAsync(async (req, res) => {
  req.body.createdBy = req.user._id;
  
  const recipe = await Recipe.create(req.body);
  
  res.status(201).json({
    success: true,
    data: recipe
  });
});

// Update recipe
export const updateRecipe = catchAsync(async (req, res, next) => {
  let recipe = await Recipe.findById(req.params.id);

  if (!recipe) {
    return next(new AppError('Recipe not found', 404));
  }

  // Check ownership or admin status
  if (recipe.createdBy.toString() !== req.user._id.toString() && !req.user.isAdmin()) {
    return next(new AppError('Not authorized to update this recipe', 403));
  }

  recipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: recipe
  });
});

// Delete recipe
export const deleteRecipe = catchAsync(async (req, res, next) => {
  const recipe = await Recipe.findById(req.params.id);

  if (!recipe) {
    return next(new AppError('Recipe not found', 404));
  }

  // Check ownership or admin/moderator status
  if (recipe.createdBy.toString() !== req.user._id.toString() && !req.user.isModeratorOrAdmin()) {
    return next(new AppError('Not authorized to delete this recipe', 403));
  }

  await recipe.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// Get user's recipes
export const getUserRecipes = catchAsync(async (req, res) => {
  const features = new APIFeatures(
    Recipe.find({ createdBy: req.user._id }),
    req.query
  )
    .filter()
    .search()
    .sort()
    .limitFields()
    .paginate();

  const recipes = await features.query;

  res.status(200).json({
    success: true,
    count: recipes.length,
    data: recipes
  });
});
