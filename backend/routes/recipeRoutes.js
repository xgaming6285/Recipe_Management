import express from 'express';
import {
  getRecipes,
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  getUserRecipes
} from '../controllers/recipeController.js';
import { protect, authorize } from '../middleware/auth.js';
import validateRecipeInput from '../middleware/validateRecipe.js';

const router = express.Router();

// Public routes
router.get('/', getRecipes);
router.get('/:id', getRecipe);

// Protected routes
router.use(protect);

// User routes
router.get('/user/:userId', getUserRecipes);
router.post('/', validateRecipeInput, createRecipe);

// Owner or Admin routes
router.put('/:id', validateRecipeInput, updateRecipe);

// Owner, Admin, or Moderator routes
router.delete('/:id', deleteRecipe);

// Admin only routes
router.use(authorize('admin'));
router.route('/admin/all')
  .get(getRecipes)
  .post(createRecipe);

export default router;