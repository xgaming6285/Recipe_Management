import Recipe from '../models/Recipe.js';
import { AppError } from '../utils/errorHandler.js';
import catchAsync from '../utils/catchAsync.js';
import APIFeatures from '../utils/apiFeatures.js';
import {
  advancedSearch,
  getRecipeStats,
  getUserRecipeStats,
  executeTransaction
} from '../utils/mongoUtils.js';

// Get recipes with pagination and filtering
export const getRecipes = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, category, difficulty, searchTerm } = req.query;
  
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

  await Recipe.deleteOne({ _id: req.params.id });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// Get user's recipes
export const getUserRecipes = catchAsync(async (req, res) => {
  const userId = req.params.userId;
  
  const features = new APIFeatures(
    Recipe.find({ createdBy: userId }),
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

// Get recipe statistics
export const getStats = async (req, res) => {
  try {
    const stats = await getRecipeStats(Recipe);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get popular ingredients
export const getPopularIngredients = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const ingredients = await Recipe.aggregate([
      { $unwind: "$ingredients" },
      { $group: { _id: "$ingredients.name", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) }
    ]);
    res.json(ingredients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's recipe statistics
export const getUserStats = async (req, res) => {
  try {
    const stats = await getUserRecipeStats(Recipe, req.user._id);
    res.json(stats[0] || {});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Find similar recipes
export const findSimilarRecipes = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const similarRecipes = await Recipe.findSimilar(recipeId);
    res.json(similarRecipes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Advanced recipe search with aggregation
export const searchRecipes = async (req, res) => {
  try {
    const { minRating, maxCookingTime, tags } = req.query;
    
    const aggregation = [
      {
        $match: {
          ...(minRating && { averageRating: { $gte: parseFloat(minRating) } }),
          ...(maxCookingTime && { cookingTime: { $lte: parseInt(maxCookingTime) } }),
          ...(tags && { tags: { $in: tags.split(',') } })
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'author'
        }
      },
      {
        $addFields: {
          author: { $arrayElemAt: ['$author', 0] }
        }
      },
      {
        $project: {
          title: 1,
          description: 1,
          cookingTime: 1,
          difficulty: 1,
          averageRating: 1,
          'author.username': 1
        }
      }
    ];

    const recipes = await Recipe.aggregate(aggregation);
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Bulk update recipes (with validation)
export const bulkUpdateRecipes = async (req, res) => {
  try {
    const { updates } = req.body;
    
    const operations = updates.map(update => async (session) => {
      const recipe = await Recipe.findById(update.recipeId);
      if (!recipe) {
        throw new Error(`Recipe ${update.recipeId} not found`);
      }
      
      Object.assign(recipe, update.data);
      await recipe.validate();
      
      return Recipe.findByIdAndUpdate(
        update.recipeId,
        update.data,
        { new: true, runValidators: true, session }
      );
    });

    const updatedRecipes = await executeTransaction(operations);
    res.json(updatedRecipes);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
