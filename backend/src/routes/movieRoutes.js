import express from 'express';
import {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
} from '../controllers/movieController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public: Get all movies
// Admin: Create a movie
router.route('/')
  .get(getMovies)
  .post(protect, admin, createMovie);

// Public: Get one movie
// Admin: Update movie (e.g., change status to ENDED)
router.route('/:id')
  .get(getMovieById)
  .put(protect, admin, updateMovie);

export default router;