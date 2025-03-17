import express from 'express';
import auth from '../middleware/auth';
import {
  getAllRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe
} from '../controllers/recipeController';

const router = express.Router();

// Get all recipes (with optional search/filter)
router.get('/', getAllRecipes);

// Get a single recipe by ID
router.get('/:id', getRecipeById);

// Create a new recipe (protected route)
router.post('/', auth, createRecipe);

// Update a recipe (protected route)
router.put('/:id', auth, updateRecipe);

// Delete a recipe (protected route)
router.delete('/:id', auth, deleteRecipe);

export default router;