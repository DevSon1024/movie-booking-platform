import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/userRoutes.js';
import movieRoutes from './routes/movieRoutes.js';

const app = express();

app.use(cors({
    origin: 'https://localhost:5173',
    credentials: true
}));

// --- Routes ---
app.use('/api/users', userRoutes);
app.use('/api/users', userRoutes);
app.use('/api/movies', movieRoutes);

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

app.get('/',(req,res)=>{
    res.send('Movie Booking API is running...');
})

export default app;