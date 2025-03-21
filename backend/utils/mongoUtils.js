import mongoose from 'mongoose';

// Utility function for pagination
const paginateResults = async (model, query = {}, page = 1, limit = 10, populate = '') => {
  const skip = (page - 1) * limit;
  
  const [results, total] = await Promise.all([
    model
      .find(query)
      .populate(populate)
      .skip(skip)
      .limit(limit)
      .exec(),
    model.countDocuments(query)
  ]);

  return {
    results,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      hasNextPage: skip + results.length < total,
      hasPrevPage: page > 1
    }
  };
};

// Advanced search with filters and sorting
const advancedSearch = async (model, searchParams) => {
  const {
    searchTerm,
    filters = {},
    sort = { createdAt: -1 },
    page = 1,
    limit = 10
  } = searchParams;

  let query = {};

  // Text search if searchTerm is provided
  if (searchTerm) {
    query.$text = { $search: searchTerm };
  }

  // Apply filters
  Object.keys(filters).forEach(key => {
    if (filters[key]) {
      query[key] = filters[key];
    }
  });

  return paginateResults(model, query, page, limit);
};

// Aggregate recipes by category with stats
const getRecipeStats = async (Recipe) => {
  return await Recipe.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        avgRating: { $avg: '$averageRating' },
        avgCookingTime: { $avg: '$cookingTime' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

// Get popular ingredients across all recipes
const getPopularIngredients = async (Recipe, limit = 10) => {
  return await Recipe.aggregate([
    { $unwind: '$ingredients' },
    {
      $group: {
        _id: '$ingredients.name',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: limit }
  ]);
};

// Get user recipe statistics
const getUserRecipeStats = async (Recipe, userId) => {
  return await Recipe.aggregate([
    { $match: { createdBy: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalRecipes: { $sum: 1 },
        avgRating: { $avg: '$averageRating' },
        totalRatings: { $sum: { $size: '$ratings' } },
        categories: { $addToSet: '$category' }
      }
    },
    {
      $project: {
        _id: 0,
        totalRecipes: 1,
        avgRating: { $round: ['$avgRating', 1] },
        totalRatings: 1,
        categoryCount: { $size: '$categories' }
      }
    }
  ]);
};

// Transaction helper for operations that need atomicity
const executeTransaction = async (operations) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const results = await Promise.all(operations.map(op => op(session)));
    await session.commitTransaction();
    return results;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export {
  paginateResults,
  advancedSearch,
  getRecipeStats,
  getPopularIngredients,
  getUserRecipeStats,
  executeTransaction
}; 