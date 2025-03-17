import express from 'express';
import { getUserProfile, getUserRecipes } from '../controllers/userController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Protected routes - requires authentication
router.get('/me', protect, getUserProfile);
router.get('/me/recipes', protect, getUserRecipes);

export default router;