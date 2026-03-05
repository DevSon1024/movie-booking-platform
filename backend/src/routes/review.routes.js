import express from "express";
import {
  createReview,
  getMovieReviews,
  updateReview,
  deleteReview,
  getMyReviews,
  canReviewMovie,
  toggleVoteReview,
} from "../controllers/review.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/movie/:movieId", getMovieReviews);

// Protected routes
router.post("/", protect, createReview);
router.get("/my-reviews", protect, getMyReviews);
router.get("/can-review/:movieId", protect, canReviewMovie);
router.put("/:reviewId/vote", protect, toggleVoteReview);
router.put("/:reviewId", protect, updateReview);
router.delete("/:reviewId", protect, deleteReview);

export default router;
