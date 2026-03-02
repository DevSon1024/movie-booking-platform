import http from 'http';
import app from './app.js';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { initSocket } from './services/socketService.js';

// Load env vars
dotenv.config();

connectDB();
const PORT = process.env.PORT || 5000;

// Create HTTP server instead of listening directly on Express app
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});