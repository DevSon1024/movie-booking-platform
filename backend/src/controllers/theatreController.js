import Theatre from '../models/Theatre.js';

// @desc    Create a theatre
// @route   POST /api/theatres
// @access  Private/Admin
const createTheatre = async (req, res) => {
  const { name, city, address, facilities, screens } = req.body;

  const theatre = new Theatre({
    name,
    city,
    address,
    facilities,
    screens,
    owner: req.user._id,
  });

  const createdTheatre = await theatre.save();
  res.status(201).json(createdTheatre);
};

// @desc    Get all theatres (with optional city filter)
// @route   GET /api/theatres
// @access  Public
const getTheatres = async (req, res) => {
  const { city } = req.query;
  const query = city ? { city: { $regex: city, $options: 'i' } } : {};
  
  const theatres = await Theatre.find(query).sort({ createdAt: -1 });
  res.json(theatres);
};

// @desc    Get single theatre
// @route   GET /api/theatres/:id
// @access  Public
const getTheatreById = async (req, res) => {
  const theatre = await Theatre.findById(req.params.id);
  if (theatre) {
    res.json(theatre);
  } else {
    res.status(404);
    throw new Error('Theatre not found');
  }
};

// @desc    Update theatre
// @route   PUT /api/theatres/:id
// @access  Private/Admin
const updateTheatre = async (req, res) => {
  const theatre = await Theatre.findById(req.params.id);

  if (theatre) {
    theatre.name = req.body.name || theatre.name;
    theatre.city = req.body.city || theatre.city;
    theatre.address = req.body.address || theatre.address;
    theatre.facilities = req.body.facilities || theatre.facilities;
    theatre.screens = req.body.screens || theatre.screens;

    const updatedTheatre = await theatre.save();
    res.json(updatedTheatre);
  } else {
    res.status(404);
    throw new Error('Theatre not found');
  }
};

// @desc    Delete theatre
// @route   DELETE /api/theatres/:id
// @access  Private/Admin
const deleteTheatre = async (req, res) => {
  const theatre = await Theatre.findById(req.params.id);

  if (theatre) {
    await theatre.deleteOne();
    res.json({ message: 'Theatre removed' });
  } else {
    res.status(404);
    throw new Error('Theatre not found');
  }
};

export { createTheatre, getTheatres, getTheatreById, updateTheatre, deleteTheatre };