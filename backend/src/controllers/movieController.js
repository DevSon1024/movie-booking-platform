import Movie from '../models/Movie.js';

// @desc    Fetch all movies
// @route   GET /api/movies
// @access  Public
const getMovies = async (req, res) => {
  const movies = await Movie.find({});
  res.json(movies);
};

// @desc    Fetch single movie
// @route   GET /api/movies/:id
// @access  Public
const getMovieById = async (req, res) => {
  const movie = await Movie.findById(req.params.id);

  if (movie) {
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

// @desc    Update movie status (Lifecycle trigger)
// @route   PUT /api/movies/:id
// @access  Private/Admin
const updateMovie = async (req, res) => {
  const { title, description, duration, posterUrl, status } = req.body;
  
  const movie = await Movie.findById(req.params.id);

  if (movie) {
    movie.title = title || movie.title;
    movie.description = description || movie.description;
    movie.duration = duration || movie.duration;
    movie.posterUrl = posterUrl || movie.posterUrl;
    movie.status = status || movie.status;

    const updatedMovie = await movie.save();
    res.json(updatedMovie);
  } else {
    res.status(404);
    throw new Error('Movie not found');
  }
};

export { getMovies, getMovieById, createMovie, updateMovie };