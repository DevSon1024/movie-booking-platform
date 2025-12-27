import Show from '../models/Show.js';
import Movie from '../models/Movie.js';
import Theatre from '../models/Theatre.js';

// @desc    Create a new Show
// @route   POST /api/shows
// @access  Private/Admin
const createShow = async (req, res) => {
  const { movieId, theatreId, screenName, startTime, price } = req.body;

  const movie = await Movie.findById(movieId);
  if (!movie) {
    res.status(404);
    throw new Error('Movie not found');
  }

  const theatre = await Theatre.findById(theatreId);
  if (!theatre) {
    res.status(404);
    throw new Error('Theatre not found');
  }

  const screen = theatre.screens.find(s => s.name === screenName);
  if (!screen) {
    res.status(404);
    throw new Error('Screen not found in this theatre');
  }

  const start = new Date(startTime);
  const end = new Date(start.getTime() + (movie.duration * 60000) + (15 * 60000));

  const overlappingShow = await Show.findOne({
    theatre: theatreId,
    screenName: screenName,
    $or: [
      { startTime: { $lt: end }, endTime: { $gt: start } }
    ]
  });

  if (overlappingShow) {
    res.status(400);
    throw new Error('Show time overlaps with an existing show on this screen.');
  }

  const generatedSeats = [];
  const rowLabels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  
  for(let r = 0; r < screen.seatLayout.rows; r++) {
      for(let c = 1; c <= screen.seatLayout.cols; c++) {
          generatedSeats.push({
              row: rowLabels[r],
              number: c,
              isBooked: false
          });
      }
  }

  const show = new Show({
    movie: movieId,
    theatre: theatreId,
    screenName,
    startTime: start,
    endTime: end,
    price,
    seats: generatedSeats
  });

  const createdShow = await show.save();
  res.status(201).json(createdShow);
};

// @desc    Get All Shows (Filtered)
// @route   GET /api/shows
// @access  Public
const getShows = async (req, res) => {
  const { movieId, date, theatreId } = req.query;
  let query = {};

  if (movieId) query.movie = movieId;
  if (theatreId) query.theatre = theatreId;
  
  if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0,0,0,0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23,59,59,999);
      query.startTime = { $gte: startOfDay, $lte: endOfDay };
  }

  const shows = await Show.find(query)
    .populate('movie', 'title duration language')
    // FIX: Added 'address facilities' to populate
    .populate('theatre', 'name city address facilities') 
    .sort({ startTime: 1 });

  res.json(shows);
};

// @desc    Get Single Show by ID
// @route   GET /api/shows/:id
// @access  Public
const getShowById = async (req, res) => {
  const show = await Show.findById(req.params.id)
    .populate('movie', 'title duration language')
    // FIX: Added 'address facilities' here too
    .populate('theatre', 'name city address facilities'); 

  if (show) {
    res.json(show);
  } else {
    res.status(404);
    throw new Error('Show not found');
  }
};

// @desc    Delete Show
// @route   DELETE /api/shows/:id
// @access  Private/Admin
const deleteShow = async (req, res) => {
    const show = await Show.findById(req.params.id);
    if(show) {
        await show.deleteOne();
        res.json({ message: 'Show deleted'});
    } else {
        res.status(404);
        throw new Error('Show not found');
    }
}

export { createShow, getShows, getShowById, deleteShow };