import Theatre from '../models/Theatre.js';

// @desc    Create a theatre
// @route   POST /api/theatres
// @access  Private/Admin
const createTheatre = async (req, res) => {
  const { name, city, screens } = req.body;

  const theatre = new Theatre({
    name,
    city,
    screens,
    owner: req.user._id,
  });

  const createdTheatre = await theatre.save();
  res.status(201).json(createdTheatre);
};

// @desc    Get all theatres
// @route   GET /api/theatres
// @access  Public
const getTheatres = async (req, res) => {
  const theatres = await Theatre.find({});
  res.json(theatres);
};

export { createTheatre, getTheatres };