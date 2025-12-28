import mongoose from "mongoose";

const castCrewSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  role: { type: String, required: true },
  profession: { type: String }
}, { _id: false });

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
      type: String,
      required: true,
    },
    duration: {
      type: Number,
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
      type: String, 
      required: true,
    },
    // New Fields for Cast and Crew
    cast: [castCrewSchema],
    crew: [castCrewSchema],
    
    status: {
      type: String,
      enum: ["UPCOMING", "RUNNING", "ENDED"],
      default: "UPCOMING",
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true,
  }
);

const Movie = mongoose.model("Movie", movieSchema);
export default Movie;