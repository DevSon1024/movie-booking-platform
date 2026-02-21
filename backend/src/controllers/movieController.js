import Movie from '../models/Movie.js';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

// Helper to get file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const POSTER_DIR = path.join(__dirname, '../../data/moviePosters');

// Ensure poster directory exists
const ensurePosterDirExists = async () => {
  try {
    await fs.access(POSTER_DIR);
  } catch {
    await fs.mkdir(POSTER_DIR, { recursive: true });
  }
};

// Convert image to WebP format
const convertToWebP = async (inputPath, outputFilename) => {
  await ensurePosterDirExists();
  const outputPath = path.join(POSTER_DIR, outputFilename);
  
  await sharp(inputPath)
    .resize(500, 750, { fit: 'cover', withoutEnlargement: true }) // Standard movie poster ratio 2:3
    .webp({ quality: 85 })
    .toFile(outputPath);
    
  return outputFilename;
};

// Delete old poster file
const deletePosterFile = async (filename) => {
  if (!filename || filename.startsWith('http')) return; // Skip URLs
  
  try {
    const filePath = path.join(POSTER_DIR, filename);
    await fs.unlink(filePath);
  } catch (error) {
    console.log('Could not delete old poster:', error.message);
  }
};

// Helper to parse JSON safely
const parseJSON = (data) => {
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  }
  return data;
};

// @desc    Fetch active movies (Public)
// @route   GET /api/movies
// @access  Public
const getMovies = async (req, res) => {
  const { includeAll, search } = req.query;
  
  let matchStage = { isDeleted: false };
  
  if (!includeAll) {
    matchStage.status = { $in: ['UPCOMING', 'RUNNING'] };
  }
  
  if (search) {
    matchStage.title = { $regex: search, $options: 'i' };
  }
  
  try {
    const movies = await Movie.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'movie',
          as: 'reviews'
        }
      },
      {
        $addFields: {
          averageRating: { 
            $cond: { 
              if: { $gt: [{ $size: "$reviews" }, 0] }, 
              then: { $avg: "$reviews.rating" }, 
              else: 0 
            } 
          },
          reviewCount: { $size: "$reviews" }
        }
      },
      { $project: { reviews: 0 } },
      { $sort: { createdAt: -1 } }
    ]);
    
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch ALL movies with filters (Admin)
// @route   GET /api/movies/all
// @access  Private/Admin
const getAllMoviesAdmin = async (req, res) => {
  const { keyword, sort } = req.query;

  let query = { isDeleted: false };

  if (keyword) {
    query.title = { $regex: keyword, $options: 'i' };
  }

  let sortOption = { createdAt: -1 }; 
  if (sort === 'oldest') {
    sortOption = { createdAt: 1 };
  }

  const movies = await Movie.find(query).sort(sortOption);
  res.json(movies);
};

// @desc    Fetch single movie
// @route   GET /api/movies/:id
// @access  Public
const getMovieById = async (req, res) => {
  const movie = await Movie.findById(req.params.id);

  if (movie && !movie.isDeleted) {
    res.json(movie);
  } else {
    res.status(404);
    throw new Error('Movie not found');
  }
};

// @desc    Create a movie
// @route   POST /api/movies
// @access  Private/Admin
const createMovie = async (req, res) => {
  try {
    const { title, description, genre, duration, language, releaseDate, posterUrl, trailerUrl, status, cast, crew, streamingLinks } = req.body;
    const posterFile = req.file;

    // Use uploaded file or URL
    let finalPosterPath = posterUrl;

    if (posterFile) {
        const webpFilename = `poster_${Date.now()}.webp`;
        await convertToWebP(posterFile.path, webpFilename);
        
        // Delete original uploaded file
        await fs.unlink(posterFile.path);
        
        // Use relative path for local images
        finalPosterPath = `/api/movies/images/${webpFilename}`;
    }

    const movie = new Movie({
      title,
      description,
      genre,
      duration,
      language,
      releaseDate,
      posterUrl: finalPosterPath,
      trailerUrl,
      status,
      cast: cast ? parseJSON(cast) : [],
      crew: crew ? parseJSON(crew) : [],
      streamingLinks: status === 'ENDED' && streamingLinks ? parseJSON(streamingLinks) : []
    });

    // Note: If cast/crew are sent as JSON strings in FormData, we might need to parse them.
    // For now assuming they come as objects/arrays or standard body-parser handles it if using simple form fields.
    // However, with FormData, complex arrays often need `JSON.parse` if sent as stringified JSON.
    // Note: If cast/crew are sent as strings in FormData, we parse them.

    const createdMovie = await movie.save();
    res.status(201).json(createdMovie);
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) {
      try { await fs.unlink(req.file.path); } catch {}
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update movie
// @route   PUT /api/movies/:id
// @access  Private/Admin
const updateMovie = async (req, res) => {
  try {
    const { title, description, genre, duration, language, releaseDate, posterUrl, trailerUrl, status, cast, crew, streamingLinks } = req.body;
    const posterFile = req.file;
    
    const movie = await Movie.findById(req.params.id);

    if (movie) {
      let finalPosterPath = posterUrl || movie.posterUrl;

      // Handle new file upload
      if (posterFile) {
          const webpFilename = `poster_${Date.now()}.webp`;
          await convertToWebP(posterFile.path, webpFilename);
          
          // Delete original uploaded file
          await fs.unlink(posterFile.path);
          
          // Delete old image if it was a local file and different from new one
          // (Actually, simply replacing it is enough, but we should check if we are overwriting properties)
          if (movie.posterUrl && movie.posterUrl.includes('/api/movies/images/')) {
            const oldFilename = path.basename(movie.posterUrl);
            await deletePosterFile(oldFilename);
          }

          finalPosterPath = `/api/movies/images/${webpFilename}`;
      } else if (posterUrl && posterUrl !== movie.posterUrl) {
          // If URL changed to a different URL (external), delete old local file if exists
           if (movie.posterUrl && movie.posterUrl.includes('/api/movies/images/')) {
              const oldFilename = path.basename(movie.posterUrl);
              await deletePosterFile(oldFilename);
           }
      }

      movie.title = title || movie.title;
      movie.description = description || movie.description;
      movie.genre = genre || movie.genre;
      movie.duration = duration || movie.duration;
      movie.language = language || movie.language;
      movie.releaseDate = releaseDate || movie.releaseDate;
      movie.posterUrl = finalPosterPath;
      movie.trailerUrl = trailerUrl || movie.trailerUrl;
      movie.status = status || movie.status;
      
      if (cast) movie.cast = parseJSON(cast);
      if (crew) movie.crew = parseJSON(crew);
      
      if (status === 'ENDED' && streamingLinks) {
        movie.streamingLinks = parseJSON(streamingLinks);
      } else if (status !== 'ENDED') {
        movie.streamingLinks = [];
      }

      const updatedMovie = await movie.save();
      res.json(updatedMovie);
    } else {
      res.status(404);
      throw new Error('Movie not found');
    }
  } catch (error) {
     // Clean up uploaded file on error
     if (req.file) {
      try { await fs.unlink(req.file.path); } catch {}
    }
    res.status(500).json({ message: error.message });
  }
};

// Serve poster images
const servePoster = (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(POSTER_DIR, filename);
  
  if (!fsSync.existsSync(filePath)) {
    return res.status(404).json({ message: 'Poster not found' });
  }
  
  res.sendFile(filePath);
};

// @desc    Soft delete movie
// @route   DELETE /api/movies/:id
// @access  Private/Admin
const deleteMovie = async (req, res) => {
  const movie = await Movie.findById(req.params.id);

  if (movie) {
    movie.isDeleted = true;
    await movie.save();
    res.json({ message: 'Movie removed' });
  } else {
    res.status(404);
    throw new Error('Movie not found');
  }
};

export { getMovies, getAllMoviesAdmin, getMovieById, createMovie, updateMovie, deleteMovie, servePoster };