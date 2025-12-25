import Show from '../models/Show.js';
import Theatre from '../models/Theatre.js';

// @desc    Add a new show (and generate seats)
// @route   POST /api/shows
// @access  Private/Admin
const addShow = async (req, res) => {
  const { movieId, theatreId, screenName, startTime, priceOverride } = req.body;

  // 1. Get Theatre details to know the layout
  const theatre = await Theatre.findById(theatreId);
  if (!theatre) {
    res.status(404);
    throw new Error('Theatre not found');
  }

  // 2. Find the specific screen
  const screen = theatre.screens.find(s => s.name === screenName);
  if (!screen) {
    res.status(404);
    throw new Error('Screen not found in this theatre');
  }

  // 3. Generate Seat Map Logic
  // We create an array of seat objects: A1, A2... B1, B2...
  let generatedSeats = [];
  const rows = screen.seatLayout.rows; // e.g., 5
  const cols = screen.seatLayout.cols; // e.g., 8
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  for (let r = 0; r < rows; r++) {
    for (let c = 1; c <= cols; c++) {
      generatedSeats.push({
        row: alphabet[r],
        number: c,
        isBooked: false,
        price: priceOverride || screen.seatLayout.price
      });
    }
  }

  // 4. Create the Show
  const show = new Show({
    movie: movieId,
    theatre: theatreId,
    screenName: screenName,
    startTime: startTime,
    seats: generatedSeats
  });

  const createdShow = await show.save();
  res.status(201).json(createdShow);
};

// @desc    Get shows by Movie ID (For booking page)
// @route   GET /api/shows/movie/:movieId
// @access  Public
const getShowsByMovie = async (req, res) => {
  const shows = await Show.find({ movie: req.params.movieId })
    .populate('theatre', 'name city') // Include theatre details
    .select('-seats.userId'); // Don't send user IDs to frontend (Privacy)
  
  res.json(shows);
};

// @desc    Get single show details (with seat status)
// @route   GET /api/shows/:id
// @access  Public
const getShowDetails = async (req, res) => {
  const show = await Show.findById(req.params.id)
    .populate('movie', 'title')
    .populate('theatre', 'name city');

  if (show) {
    res.json(show);
  } else {
    res.status(404);
    throw new Error('Show not found');
  }
};

export { addShow, getShowsByMovie, getShowDetails };