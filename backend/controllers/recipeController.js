import Recipe from '../models/Recipe';

// Get all recipes (with optional search/filter)
export const getAllRecipes = async (req, res) => {
  try {
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

    res.json(recipes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single recipe by ID
export const getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate('createdBy', 'username');
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.json(recipe);
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new recipe
export const createRecipe = async (req, res) => {
  try {
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
    res.status(201).json(savedRecipe);
  } catch (err) {
    console.error(err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a recipe
export const updateRecipe = async (req, res) => {
  try {
    const { title, description, ingredients, steps, imageUrl, cookingTime, category } = req.body;
    
    let recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    if (recipe.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'User not authorized to update this recipe' });
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
    
    res.json(recipe);
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a recipe
export const deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    if (recipe.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'User not authorized to delete this recipe' });
    }
    
    await Recipe.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Recipe deleted' });
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};
