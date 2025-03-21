import express from 'express';
import {
  getRecipes,
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  getUserRecipes
} from '../controllers/recipeController';
import { protect, authorize } from '../middleware/auth';
import { validateRecipeInput } from '../middleware/validation';

const router = express.Router();

router.post('/', validateRecipeInput, createRecipe);
router.put('/:id', validateRecipeInput, updateRecipe);

// Public routes
router.get('/', getRecipes);
router.get('/:id', getRecipe);

// Protected routes
router.use(protect);

// User routes
router.get('/user/recipes', getUserRecipes);
router.post('/', createRecipe);

// Owner or Admin routes
router.put('/:id', updateRecipe);

// Owner, Admin, or Moderator routes
router.delete('/:id', deleteRecipe);

// Admin only routes
router.use(authorize('admin'));
router.route('/admin/all')
  .get(getRecipes)
  .post(createRecipe);

export default router;