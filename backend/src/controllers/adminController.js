import Booking from '../models/Booking.js';
import Movie from '../models/Movie.js';

// @desc    Get Admin Dashboard Stats (Revenue, Tickets, Active Movies)
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // 1. Build Date Filter for Bookings
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };
    }

    // 2. Aggregate Revenue & Tickets Sold
    // We match 'CONFIRMED' bookings and the optional date range
    const stats = await Booking.aggregate([
      {
        $match: {
          paymentStatus: 'CONFIRMED',
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalPrice' },
          totalTickets: { $sum: { $size: '$seats' } },
        },
      },
    ]);

    const revenue = stats.length > 0 ? stats[0].totalRevenue : 0;
    const ticketsSold = stats.length > 0 ? stats[0].totalTickets : 0;

    // 3. Count Active Movies (Status = 'RUNNING')
    // Note: Active movies count usually reflects current state, independent of the date filter
    const activeMovies = await Movie.countDocuments({ status: 'RUNNING' });

    res.json({
      revenue,
      ticketsSold,
      activeMovies,
    });
  } catch (error) {
    res.status(500);
    throw new Error('Error fetching dashboard stats: ' + error.message);
  }
};

export { getDashboardStats };