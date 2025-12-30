import Movie from '../models/Movie.js';

// @desc    Fetch active movies (Public)
// @route   GET /api/movies
// @access  Public
const getMovies = async (req, res) => {
  const { includeAll, search } = req.query;
  
  let query = { isDeleted: false };
  
  // If includeAll is true, show all statuses (for search)
  if (!includeAll) {
    // Default behavior: only show UPCOMING and RUNNING
    query.status = { $in: ['UPCOMING', 'RUNNING'] };
  }
  
  // If search query is provided
  if (search) {
    query.title = { $regex: search, $options: 'i' };
  }
  
  const movies = await Movie.find(query).sort({ createdAt: -1 });
  
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
  // Update 1: Extract cast and crew from req.body
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
    // Update 2: Include them in object creation
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
  // Update 3: Extract cast and crew here as well
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
    
    // Update 4: Update the fields if they exist in the request
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