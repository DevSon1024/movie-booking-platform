import Show from '../models/Show.js';
import Movie from '../models/Movie.js';
import Theatre from '../models/Theatre.js';

// @desc    Create a new Show
// @route   POST /api/shows
// @access  Private/Admin
const createShow = async (req, res) => {
  const { movieId, theatreId, screenName, startTime, price } = req.body;

  // 1. Fetch Movie to get duration
  const movie = await Movie.findById(movieId);
  if (!movie) {
    res.status(404);
    throw new Error('Movie not found');
  }

  // 2. Fetch Theatre to get Screen Layout
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

  // 3. Calculate End Time (Start Time + Duration + 15min buffer for cleaning)
  const start = new Date(startTime);
  const end = new Date(start.getTime() + (movie.duration * 60000) + (15 * 60000));

  // 4. CHECK OVERLAP: Ensure no other show exists on this screen during this time
  const overlappingShow = await Show.findOne({
    theatre: theatreId,
    screenName: screenName,
    $or: [
      { startTime: { $lt: end }, endTime: { $gt: start } } // Logic: (StartA < EndB) and (EndA > StartB)
    ]
  });

  if (overlappingShow) {
    res.status(400);
    throw new Error('Show time overlaps with an existing show on this screen.');
  }

  // 5. Generate Seat Map based on Screen Layout (Rows X Cols)
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

// @desc    Get All Shows (Filtered by Movie or Date optional)
// @route   GET /api/shows
// @access  Public
const getShows = async (req, res) => {
  const { movieId, date, theatreId } = req.query;
  let query = {};

  if (movieId) query.movie = movieId;
  if (theatreId) query.theatre = theatreId;
  
  // Date Filter (Specific Day)
  if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0,0,0,0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23,59,59,999);
      
      query.startTime = { $gte: startOfDay, $lte: endOfDay };
  }

  // Only show future shows if public, or all if admin (simplified for now)
  // query.startTime = { $gte: new Date() }; 

  const shows = await Show.find(query)
    .populate('movie', 'title duration')
    .populate('theatre', 'name city')
    .sort({ startTime: 1 });

  res.json(shows);
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

export { createShow, getShows, deleteShow };