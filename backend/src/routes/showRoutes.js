import express from 'express';
import { createShow, getShows, deleteShow } from '../controllers/showController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getShows)
  .post(protect, admin, createShow);

router.route('/:id')
  .delete(protect, admin, deleteShow);

export default router;