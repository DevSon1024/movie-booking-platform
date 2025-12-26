import express from 'express';
import { 
  createTheatre, 
  getTheatres, 
  getTheatreById, 
  updateTheatre, 
  deleteTheatre 
} from '../controllers/theatreController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getTheatres)
  .post(protect, admin, createTheatre);

router.route('/:id')
  .get(getTheatreById)
  .put(protect, admin, updateTheatre)
  .delete(protect, admin, deleteTheatre);

export default router;