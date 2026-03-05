import express from "express";
import {
  createTheatre,
  getTheatres,
  getTheatreById,
  updateTheatre,
  deleteTheatre,
} from "../controllers/theatre.controller.js";
import { protect, admin } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/").get(getTheatres).post(protect, admin, createTheatre);

router
  .route("/:id")
  .get(getTheatreById)
  .put(protect, admin, updateTheatre)
  .delete(protect, admin, deleteTheatre);

export default router;
