import express from 'express';
import { createTheatre, getTheatres } from '../controllers/theatreController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getTheatres)
  .post(protect, admin, createTheatre);

export default router;