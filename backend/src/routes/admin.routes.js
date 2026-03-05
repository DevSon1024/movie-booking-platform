import express from "express";
import { protect, admin } from "../middlewares/auth.middleware.js";
import { getDashboardStats } from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/stats", protect, admin, getDashboardStats);

export default router;
