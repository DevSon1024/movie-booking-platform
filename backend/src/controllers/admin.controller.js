import Booking from "../models/Booking.model.js";
import Movie from "../models/Movie.model.js";
import User from "../models/User.model.js";
import Theatre from "../models/Theatre.model.js";

// @desc    Get Admin Dashboard Stats (Revenue, Tickets, Active Movies, Users, Theatres, Revenue Trend)
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
    const stats = await Booking.aggregate([
      {
        $match: {
          paymentStatus: "CONFIRMED",
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" },
          totalTickets: { $sum: { $size: "$seats" } },
        },
      },
    ]);

    const revenue = stats.length > 0 ? stats[0].totalRevenue : 0;
    const ticketsSold = stats.length > 0 ? stats[0].totalTickets : 0;

    // 3. Count Active Movies (Status = 'RUNNING')
    const activeMovies = await Movie.countDocuments({ status: "RUNNING" });

    // 4. Count Total Users & Theatres (global counts, not date-filtered)
    const totalUsers = await User.countDocuments();
    const totalTheatres = await Theatre.countDocuments();

    // 5. Revenue Trend — daily breakdown of confirmed bookings
    const revenueTrend = await Booking.aggregate([
      {
        $match: {
          paymentStatus: "CONFIRMED",
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          dailyRevenue: { $sum: "$totalPrice" },
          dailyTickets: { $sum: { $size: "$seats" } },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          dailyRevenue: 1,
          dailyTickets: 1,
        },
      },
    ]);

    res.json({
      revenue,
      ticketsSold,
      activeMovies,
      totalUsers,
      totalTheatres,
      revenueTrend,
    });
  } catch (error) {
    res.status(500);
    throw new Error("Error fetching dashboard stats: " + error.message);
  }
};

export { getDashboardStats };
