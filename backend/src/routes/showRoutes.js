import express from 'express';
import { 
  createShow, 
  getShows, 
  getShowById,
  updateShow,
  cancelShow,
  deleteShow 
} from '../controllers/showController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getShows)
  .post(protect, admin, createShow);

router.route('/:id')
  .get(getShowById)
  .put(protect, admin, updateShow)
  .delete(protect, admin, deleteShow);

router.patch('/:id/cancel', protect, admin, cancelShow);

export default router;