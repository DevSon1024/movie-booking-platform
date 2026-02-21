import express from 'express';
import { createBooking, getMyBookings, getBookingsByShow } from '../controllers/bookingController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createBooking);
router.get('/mybookings', protect, getMyBookings);
router.get('/show/:showId', protect, admin, getBookingsByShow);

export default router;