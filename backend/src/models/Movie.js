import mongoose from "mongoose";

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    genre: {
      type: String, // e.g., "Action, Sci-Fi"
      required: true,
    },
    duration: {
      type: Number, // in minutes
      required: true,
    },
    language: {
      type: String,
      required: true,
    },
    releaseDate: {
      type: Date,
      required: true,
    },
    posterUrl: {
      type: String, // We will store just the URL string
      required: true,
    },
    // VIVA TOPIC: Lifecycle Management
    status: {
      type: String,
      enum: ["UPCOMING", "RUNNING", "ENDED"],
      default: "UPCOMING",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Movie = mongoose.model("Movie", movieSchema);
export default Movie;
