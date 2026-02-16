import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  getMovies,
  getAllMoviesAdmin,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
  servePoster
} from '../controllers/movieController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Get directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../data/moviePosters');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `poster_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Serve movie poster images
router.get('/images/:filename', servePoster);

// Public: Get active movies
// Admin: Create movie
router.route('/')
  .get(getMovies)
  .post(protect, admin, upload.single('posterFile'), createMovie);

// Admin: Get ALL movies (including Ended, excluding Deleted) for management
router.get('/all', protect, admin, getAllMoviesAdmin);

// Single Movie Operations
router.route('/:id')
  .get(getMovieById)
  .put(protect, admin, upload.single('posterFile'), updateMovie)
  .delete(protect, admin, deleteMovie); // Soft Delete

export default router;