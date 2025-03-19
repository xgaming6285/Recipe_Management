import Recipe from '../models/Recipe';
import { AppError } from '../utils/errorHandler';
import catchAsync from '../utils/catchAsync';

// Get all recipes (with optional search/filter)
export const getAllRecipes = catchAsync(async (req, res, next) => {
  const { search, category, maxTime, minTime } = req.query;
  const query = {};

  if (search) {
    query.$text = { $search: search };
  }

  if (category) {
    query.category = category;
  }

  if (maxTime || minTime) {
    query.cookingTime = {};
    if (maxTime) query.cookingTime.$lte = Number(maxTime);
    if (minTime) query.cookingTime.$gte = Number(minTime);
  }

  const recipes = await Recipe.find(query)
    .populate('createdBy', 'username')
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: recipes.length,
    data: {
      recipes
    }
  });
});

// Get a single recipe by ID
export const getRecipeById = catchAsync(async (req, res, next) => {
  const recipe = await Recipe.findById(req.params.id).populate('createdBy', 'username');
  
  if (!recipe) {
    return next(new AppError('Recipe not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      recipe
    }
  });
});

// Create a new recipe
export const createRecipe = catchAsync(async (req, res, next) => {
  const { title, description, ingredients, steps, imageUrl, cookingTime, category } = req.body;

  const recipe = new Recipe({
    title,
    description,
    ingredients: Array.isArray(ingredients) ? ingredients : [ingredients],
    steps: Array.isArray(steps) ? steps : [steps],
    imageUrl: imageUrl || '',
    cookingTime,
    category,
    createdBy: req.user.id
  });

  const savedRecipe = await recipe.save();
  
  res.status(201).json({
    status: 'success',
    data: {
      recipe: savedRecipe
    }
  });
});

// Update a recipe
export const updateRecipe = catchAsync(async (req, res, next) => {
  const { title, description, ingredients, steps, imageUrl, cookingTime, category } = req.body;
  
  let recipe = await Recipe.findById(req.params.id);
  
  if (!recipe) {
    return next(new AppError('Recipe not found', 404));
  }
  
  if (recipe.createdBy.toString() !== req.user.id) {
    return next(new AppError('You are not authorized to update this recipe', 403));
  }
  
  const recipeFields = {
    title,
    description,
    ingredients: Array.isArray(ingredients) ? ingredients : [ingredients],
    steps: Array.isArray(steps) ? steps : [steps],
    imageUrl: imageUrl || recipe.imageUrl,
    cookingTime,
    category
  };

  recipe = await Recipe.findByIdAndUpdate(
    req.params.id,
    { $set: recipeFields },
    { new: true, runValidators: true }
  );
  
  res.status(200).json({
    status: 'success',
    data: {
      recipe
    }
  });
});

// Delete a recipe
export const deleteRecipe = catchAsync(async (req, res, next) => {
  const recipe = await Recipe.findById(req.params.id);
  
  if (!recipe) {
    return next(new AppError('Recipe not found', 404));
  }
  
  if (recipe.createdBy.toString() !== req.user.id) {
    return next(new AppError('You are not authorized to delete this recipe', 403));
  }
  
  await Recipe.findByIdAndDelete(req.params.id);
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});
