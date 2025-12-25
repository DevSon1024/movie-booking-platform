import mongoose from 'mongoose';
import dotenv from 'dotenv';
// import users from './data/users.js';
import User from './src/models/User.js';
import Movie from './src/models/Movie.js';
import Theatre from './src/models/Theatre.js';
import Show from './src/models/Show.js';
import Booking from './src/models/Booking.js';
import Review from './src/models/Review.js';
import connectDB from './src/config/db.js';

dotenv.config();
connectDB();

const importData = async () => {
  try {
    // 1. CLEAR EXISTING DATA
    await Booking.deleteMany();
    await Review.deleteMany();
    await Show.deleteMany();
    await Movie.deleteMany();
    await Theatre.deleteMany();
    await User.deleteMany();

    console.log('Data Destroyed...');

    // 2. CREATE USERS
    const createdUsers = await User.insertMany([
      { name: 'Admin User', email: 'admin@example.com', password: 'password123', role: 'admin' },
      { name: 'John Doe', email: 'user@example.com', password: 'password123', role: 'user' },
    ]);
    const adminUser = createdUsers[0]._id;

    console.log('Users Imported...');

    // 3. CREATE THEATRE
    const theatre = new Theatre({
      name: 'PVR Icon: Phoenix Mall',
      city: 'Mumbai',
      owner: adminUser,
      screens: [{
        name: 'IMAX Screen 1',
        seatLayout: { rows: 5, cols: 8, price: 250 } // 40 Seats
      }]
    });
    const createdTheatre = await theatre.save();

    console.log('Theatre Imported...');

    // 4. CREATE MOVIES
    const movies = await Movie.insertMany([
      {
        title: 'Inception',
        description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
        genre: 'Sci-Fi, Action',
        duration: 148,
        language: 'English',
        releaseDate: new Date('2010-07-16'),
        posterUrl: 'https://image.tmdb.org/t/p/original/9gk7admal4zl548vGrf1ttLPksl.jpg',
        status: 'RUNNING'
      },
      {
        title: 'Avengers: Endgame',
        description: 'After the devastating events of Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos\' actions and restore balance to the universe.',
        genre: 'Action, Adventure',
        duration: 181,
        language: 'English',
        releaseDate: new Date('2019-04-26'),
        posterUrl: 'https://image.tmdb.org/t/p/original/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
        status: 'ENDED' // Good for testing Reviews
      },
      {
        title: 'Dune: Part Two',
        description: 'Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.',
        genre: 'Sci-Fi, Adventure',
        duration: 166,
        language: 'English',
        releaseDate: new Date('2024-03-01'),
        posterUrl: 'https://image.tmdb.org/t/p/original/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
        status: 'UPCOMING'
      }
    ]);

    console.log('Movies Imported...');

    // 5. CREATE SHOW FOR "INCEPTION"
    // We need to generate seat objects manually for the seeder
    const screen = createdTheatre.screens[0];
    let generatedSeats = [];
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let r = 0; r < screen.seatLayout.rows; r++) {
      for (let c = 1; c <= screen.seatLayout.cols; c++) {
        generatedSeats.push({
          row: alphabet[r],
          number: c,
          isBooked: false,
          price: screen.seatLayout.price
        });
      }
    }

    // Create a show for Tomorrow at 6 PM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(18, 0, 0, 0);

    await Show.create({
      movie: movies[0]._id, // Inception
      theatre: createdTheatre._id,
      screenName: screen.name,
      startTime: tomorrow,
      seats: generatedSeats
    });

    console.log('Shows Imported!');
    console.log('DATA IMPORT SUCCESS!');
    process.exit();

  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

importData();