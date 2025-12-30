import express from 'express';
import { getCelebrities, addCelebrity, updateCelebrity, deleteCelebrity } from '../controllers/celebrityController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public route to get list (for forms)
router.get('/', getCelebrities);

// Admin only routes
router.post('/', protect, admin, addCelebrity);
router.put('/:id', protect, admin, updateCelebrity);
router.delete('/:id', protect, admin, deleteCelebrity);

export default router;