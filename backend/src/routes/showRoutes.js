import express from 'express';
import { 
  createShow, 
  getShows, 
  getShowById, // <--- MAKE SURE THIS IS IMPORTED
  deleteShow 
} from '../controllers/showController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getShows)
  .post(protect, admin, createShow);

router.route('/:id')
  .get(getShowById) // <--- Now this will work
  .delete(protect, admin, deleteShow);

export default router;