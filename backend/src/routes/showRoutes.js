import express from 'express';
import { addShow, getShowsByMovie, getShowDetails } from '../controllers/showController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, admin, addShow);

router.get('/movie/:movieId', getShowsByMovie);
router.get('/:id', getShowDetails);

export default router;