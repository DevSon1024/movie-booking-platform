import Show from '../models/Show.js';
import Movie from '../models/Movie.js';
import Theatre from '../models/Theatre.js';

// @desc    Create a new Show
// @route   POST /api/shows
// @access  Private/Admin
const createShow = async (req, res) => {
  try {
    const { movieId, theatreId, screenName, startTime, price } = req.body;

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    const theatre = await Theatre.findById(theatreId);
    if (!theatre) {
      return res.status(404).json({ message: 'Theatre not found' });
    }

    const screen = theatre.screens.find(s => s.name === screenName);
    if (!screen) {
      return res.status(404).json({ message: 'Screen not found in this theatre' });
    }

    const start = new Date(startTime);
    const end = new Date(start.getTime() + (movie.duration * 60000) + (15 * 60000));

    const overlappingShow = await Show.findOne({
      theatre: theatreId,
      screenName: screenName,
      status: { $ne: 'cancelled' },
      $or: [
        { startTime: { $lt: end }, endTime: { $gt: start } }
      ]
    });

    if (overlappingShow) {
      return res.status(400).json({ message: 'Show time overlaps with an existing show on this screen.' });
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
      seats: generatedSeats,
      status: 'active'
    });

    const createdShow = await show.save();
    res.status(201).json(createdShow);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get All Shows (Filtered)
// @route   GET /api/shows
// @access  Public
const getShows = async (req, res) => {
  try {
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
      .populate('theatre', 'name city address facilities') 
      .sort({ startTime: 1 });

    res.json(shows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Single Show by ID
// @route   GET /api/shows/:id
// @access  Public
const getShowById = async (req, res) => {
  try {
    const show = await Show.findById(req.params.id)
      .populate('movie', 'title duration language')
      .populate('theatre', 'name city address facilities'); 

    if (show) {
      res.json(show);
    } else {
      res.status(404).json({ message: 'Show not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Show
// @route   PUT /api/shows/:id
// @access  Private/Admin
const updateShow = async (req, res) => {
  try {
    const { movieId, theatreId, screenName, startTime, price } = req.body;

    const show = await Show.findById(req.params.id);
    
    if (!show) {
      return res.status(404).json({ message: 'Show not found' });
    }

    // Prevent updating cancelled shows
    if (show.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot update a cancelled show' });
    }

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    const theatre = await Theatre.findById(theatreId);
    if (!theatre) {
      return res.status(404).json({ message: 'Theatre not found' });
    }

    const screen = theatre.screens.find(s => s.name === screenName);
    if (!screen) {
      return res.status(404).json({ message: 'Screen not found in this theatre' });
    }

    const start = new Date(startTime);
    const end = new Date(start.getTime() + (movie.duration * 60000) + (15 * 60000));

    // Check for overlapping shows (excluding current show)
    const overlappingShow = await Show.findOne({
      _id: { $ne: req.params.id },
      theatre: theatreId,
      screenName: screenName,
      status: { $ne: 'cancelled' },
      $or: [
        { startTime: { $lt: end }, endTime: { $gt: start } }
      ]
    });

    if (overlappingShow) {
      return res.status(400).json({ message: 'Show time overlaps with an existing show on this screen.' });
    }

    // Update show details
    show.movie = movieId;
    show.theatre = theatreId;
    show.screenName = screenName;
    show.startTime = start;
    show.endTime = end;
    show.price = price;

    const updatedShow = await show.save();
    
    // Populate before sending response
    await updatedShow.populate('movie', 'title duration language');
    await updatedShow.populate('theatre', 'name city address facilities');

    res.json(updatedShow);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel Show (Soft Delete)
// @route   PATCH /api/shows/:id/cancel
// @access  Private/Admin
const cancelShow = async (req, res) => {
  try {
    const { reason } = req.body;

    const show = await Show.findById(req.params.id)
      .populate('movie', 'title duration language')
      .populate('theatre', 'name city address facilities');
    
    if (!show) {
      return res.status(404).json({ message: 'Show not found' });
    }

    if (show.status === 'cancelled') {
      return res.status(400).json({ message: 'Show is already cancelled' });
    }

    show.status = 'cancelled';
    show.cancelReason = reason || 'No reason provided';
    show.cancelledAt = new Date();

    const cancelledShow = await show.save();

    // TODO: Send notifications to users who booked this show
    // You can implement email/notification logic here

    res.json(cancelledShow);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete Show (Permanent)
// @route   DELETE /api/shows/:id
// @access  Private/Admin
const deleteShow = async (req, res) => {
  try {
    const show = await Show.findById(req.params.id);
    
    if (show) {
      await show.deleteOne();
      res.json({ message: 'Show deleted permanently' });
    } else {
      res.status(404).json({ message: 'Show not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { createShow, getShows, getShowById, updateShow, cancelShow, deleteShow };