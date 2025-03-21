import Recipe from '../models/Recipe';
import { AppError } from '../utils/errorHandler';
import catchAsync from '../utils/catchAsync';
import APIFeatures from '../utils/apiFeatures';
import {
  advancedSearch,
  getRecipeStats,
  getPopularIngredients,
  getUserRecipeStats,
  executeTransaction
} from '../utils/mongoUtils';

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

// Get recipes with pagination and filtering
exports.getRecipes = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, difficulty, searchTerm } = req.query;
    
    const searchParams = {
      searchTerm,
      filters: {
        ...(category && { category }),
        ...(difficulty && { difficulty })
      },
      page: parseInt(page),
      limit: parseInt(limit)
    };

    const results = await advancedSearch(Recipe, searchParams);
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get recipe statistics
exports.getStats = async (req, res) => {
  try {
    const stats = await getRecipeStats(Recipe);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get popular ingredients
exports.getPopularIngredients = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const ingredients = await getPopularIngredients(Recipe, parseInt(limit));
    res.json(ingredients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's recipe statistics
exports.getUserStats = async (req, res) => {
  try {
    const stats = await getUserRecipeStats(Recipe, req.user._id);
    res.json(stats[0] || {});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create recipe with transaction
exports.createRecipe = async (req, res) => {
  try {
    const recipe = new Recipe({
      ...req.body,
      createdBy: req.user._id
    });

    // Example of using transaction for creating a recipe and updating user stats
    const operations = [
      async (session) => {
        return await recipe.save({ session });
      },
      async (session) => {
        // Update user's recipe count or other stats
        return await User.findByIdAndUpdate(
          req.user._id,
          { $inc: { recipeCount: 1 } },
          { session }
        );
      }
    ];

    const [savedRecipe] = await executeTransaction(operations);
    res.status(201).json(savedRecipe);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Find similar recipes
exports.findSimilarRecipes = async (req, res) => {
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
exports.searchRecipes = async (req, res) => {
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
exports.bulkUpdateRecipes = async (req, res) => {
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

module.exports = exports;
