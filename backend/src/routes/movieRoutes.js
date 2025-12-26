import express from 'express';
import {
  getMovies,
  getAllMoviesAdmin,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie
} from '../controllers/movieController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public: Get active movies
// Admin: Create movie
router.route('/')
  .get(getMovies)
  .post(protect, admin, createMovie);

// Admin: Get ALL movies (including Ended, excluding Deleted) for management
router.get('/all', protect, admin, getAllMoviesAdmin);

// Single Movie Operations
router.route('/:id')
  .get(getMovieById)
  .put(protect, admin, updateMovie)
  .delete(protect, admin, deleteMovie); // Soft Delete

export default router;