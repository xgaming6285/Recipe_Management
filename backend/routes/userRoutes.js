import express from 'express';
import { getUserProfile, getUserRecipes } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Protected routes - requires authentication
router.get('/me', protect, getUserProfile);
router.get('/me/recipes', protect, getUserRecipes);

export default router;