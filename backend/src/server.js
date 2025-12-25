// backend/src/server.js
import app from './app.js'
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Load env vars
dotenv.config();

connectDB();
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${process.env.NODE_ENV} mode on port ${PORT}`);
});