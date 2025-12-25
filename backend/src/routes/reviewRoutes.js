import express from 'express';
import { createReview, getMovieReviews } from '../controllers/reviewController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createReview);

router.get('/:movieId', getMovieReviews);

export default router;