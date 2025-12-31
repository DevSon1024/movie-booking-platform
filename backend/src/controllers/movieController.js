import Movie from '../models/Movie.js';

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
  const { title, description, genre, duration, language, releaseDate, posterUrl, status, cast, crew } = req.body;

  const movie = new Movie({
    title,
    description,
    genre,
    duration,
    language,
    releaseDate,
    posterUrl,
    status,
    cast: cast || [],
    crew: crew || []
  });

  const createdMovie = await movie.save();
  res.status(201).json(createdMovie);
};

// @desc    Update movie
// @route   PUT /api/movies/:id
// @access  Private/Admin
const updateMovie = async (req, res) => {
  const { title, description, genre, duration, language, releaseDate, posterUrl, status, cast, crew } = req.body;
  
  const movie = await Movie.findById(req.params.id);

  if (movie) {
    movie.title = title || movie.title;
    movie.description = description || movie.description;
    movie.genre = genre || movie.genre;
    movie.duration = duration || movie.duration;
    movie.language = language || movie.language;
    movie.releaseDate = releaseDate || movie.releaseDate;
    movie.posterUrl = posterUrl || movie.posterUrl;
    movie.status = status || movie.status;
    
    if (cast) movie.cast = cast;
    if (crew) movie.crew = crew;

    const updatedMovie = await movie.save();
    res.json(updatedMovie);
  } else {
    res.status(404);
    throw new Error('Movie not found');
  }
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

export { getMovies, getAllMoviesAdmin, getMovieById, createMovie, updateMovie, deleteMovie };