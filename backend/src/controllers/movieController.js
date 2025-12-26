import Movie from '../models/Movie.js';

// @desc    Fetch active movies (Public)
// @route   GET /api/movies
// @access  Public
const getMovies = async (req, res) => {
  // Public only sees UPCOMING or RUNNING, and NOT deleted
  const movies = await Movie.find({
    status: { $in: ['UPCOMING', 'RUNNING'] },
    isDeleted: false
  }).sort({ createdAt: -1 });
  
  res.json(movies);
};

// @desc    Fetch ALL movies with filters (Admin)
// @route   GET /api/movies/all
// @access  Private/Admin
const getAllMoviesAdmin = async (req, res) => {
  const { keyword, sort } = req.query;

  // Base query: Not deleted (Soft delete check)
  let query = { isDeleted: false };

  // Search logic
  if (keyword) {
    query.title = { $regex: keyword, $options: 'i' };
  }

  // Sort logic
  let sortOption = { createdAt: -1 }; // Default: Latest
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
  const { title, description, genre, duration, language, releaseDate, posterUrl, status } = req.body;

  const movie = new Movie({
    title,
    description,
    genre,
    duration,
    language,
    releaseDate,
    posterUrl,
    status
  });

  const createdMovie = await movie.save();
  res.status(201).json(createdMovie);
};

// @desc    Update movie
// @route   PUT /api/movies/:id
// @access  Private/Admin
const updateMovie = async (req, res) => {
  const { title, description, genre, duration, language, releaseDate, posterUrl, status } = req.body;
  
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
    // Soft delete: Mark as deleted instead of removing document
    movie.isDeleted = true;
    await movie.save();
    res.json({ message: 'Movie removed' });
  } else {
    res.status(404);
    throw new Error('Movie not found');
  }
};

export { getMovies, getAllMoviesAdmin, getMovieById, createMovie, updateMovie, deleteMovie };