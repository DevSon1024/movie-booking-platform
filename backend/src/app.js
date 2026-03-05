import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

// Import routes
import userRoutes from "./routes/user.routes.js";
import movieRoutes from "./routes/movie.routes.js";
import theatreRoutes from "./routes/theatre.routes.js";
import showRoutes from "./routes/show.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import celebrityRoutes from "./routes/celebrity.routes.js";
import adminUserRoutes from "./routes/adminUser.routes.js";

// Import error middleware
import { notFound, errorHandler } from "./middlewares/error.middleware.js";

dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/theatres", theatreRoutes);
app.use("/api/shows", showRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/celebrities", celebrityRoutes); // REGISTERED
app.use("/api", adminUserRoutes); // Admin user management

// Health check
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Error Handling Middleware (MUST BE LAST)
app.use(notFound);
app.use(errorHandler);

export default app;
