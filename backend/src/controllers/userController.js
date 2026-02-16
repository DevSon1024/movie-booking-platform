import User from '../models/User.js';
import Booking from '../models/Booking.js';

// @desc    Get all users (admin only)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    
    // Query for active users (isActive !== false, includes undefined for old users)
    // Exclude admin users from the list
    const query = { 
      isActive: { $ne: false },
      role: { $ne: 'admin' }
    };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Get booking count for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const bookingCount = await Booking.countDocuments({ user: user._id });
        return {
          ...user,
          totalBookings: bookingCount,
        };
      })
    );

    const count = await User.countDocuments(query);

    res.json({
      users: usersWithStats,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalUsers: count,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
};

// @desc    Get user by ID with details
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password').lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user bookings
    const bookings = await Booking.find({ user: user._id })
      .populate('movie', 'title posterUrl')
      .populate({
        path: 'show',
        populate: { path: 'theatre', select: 'name city' }
      })
      .sort({ createdAt: -1 })
      .lean();

    // Get user reviews
    const Review = (await import('../models/Review.js')).default;
    const reviews = await Review.find({ user: user._id })
      .populate('movie', 'title posterUrl')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      user,
      bookings,
      reviews,
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Server error while fetching user details' });
  }
};

// @desc    Get user statistics
// @route   GET /api/admin/users/:id/stats
// @access  Private/Admin
const getUserStats = async (req, res) => {
  try {
    const userId = req.params.id;

    // Get all user bookings
    const bookings = await Booking.find({ user: userId })
      .populate('movie', 'genre')
      .lean();

    if (bookings.length === 0) {
      return res.json({
        totalBookings: 0,
        totalSpent: 0,
        averageTicketPrice: 0,
        favoriteGenres: [],
        bookingsByMonth: [],
        consistency: 0,
      });
    }

    // Calculate total spent
    const totalSpent = bookings.reduce((sum, booking) => sum + booking.totalPrice, 0);

    // Calculate average ticket price
    const totalSeats = bookings.reduce((sum, booking) => sum + booking.seats.length, 0);
    const averageTicketPrice = totalSeats > 0 ? totalSpent / totalSeats : 0;

    // Calculate favorite genres
    const genreCounts = {};
    bookings.forEach((booking) => {
      const genre = booking.movie?.genre || 'Unknown';
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    });

    const favoriteGenres = Object.entries(genreCounts)
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate bookings by month (last 6 months)
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    
    const bookingsByMonth = {};
    for (let i = 0; i < 6; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      bookingsByMonth[monthKey] = 0;
    }

    bookings.forEach((booking) => {
      const bookingDate = new Date(booking.createdAt);
      if (bookingDate >= sixMonthsAgo) {
        const monthKey = bookingDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        if (bookingsByMonth[monthKey] !== undefined) {
          bookingsByMonth[monthKey]++;
        }
      }
    });

    const bookingsByMonthArray = Object.entries(bookingsByMonth)
      .map(([month, count]) => ({ month, count }))
      .reverse();

    // Calculate consistency (bookings per month average)
    const consistency = bookings.length / 6;

    res.json({
      totalBookings: bookings.length,
      totalSpent,
      averageTicketPrice: Math.round(averageTicketPrice),
      favoriteGenres,
      bookingsByMonth: bookingsByMonthArray,
      consistency: Math.round(consistency * 10) / 10,
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ message: 'Server error while fetching user statistics' });
  }
};

// @desc    Delete user (soft delete)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting admin users
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete admin users' });
    }

    // Soft delete - mark as inactive
    user.isActive = false;
    await user.save();

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error while deleting user' });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const { name, email, city, phone, isActive } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (city !== undefined) user.city = city;
    if (phone !== undefined) user.phone = phone;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      city: user.city,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error while updating user' });
  }
};

export { getAllUsers, getUserById, getUserStats, deleteUser, updateUser };
