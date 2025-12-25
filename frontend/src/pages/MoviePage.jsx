import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { format } from 'date-fns';

const MoviePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [movieRes, showRes] = await Promise.all([
          api.get(`/movies/${id}`),
          api.get(`/shows/movie/${id}`)
        ]);
        setMovie(movieRes.data);
        setShows(showRes.data);
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="text-white text-center mt-20">Loading...</div>;
  if (!movie) return <div className="text-white text-center mt-20">Movie not found</div>;

  return (
    <div className="text-white">
      {/* Movie Header / Banner */}
      <div className="relative h-80 w-full overflow-hidden">
        <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover opacity-30 blur-sm" />
        <div className="absolute inset-0 flex items-end p-8 bg-gradient-to-t from-gray-900">
          <div className="flex gap-6">
            <img src={movie.posterUrl} className="w-32 h-48 object-cover rounded shadow-xl" />
            <div>
              <h1 className="text-4xl font-bold">{movie.title}</h1>
              <p className="text-gray-300 mt-2">{movie.genre} • {movie.duration} min</p>
              <p className="text-gray-400 mt-4 max-w-2xl">{movie.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Showtimes Section */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6 border-l-4 border-red-600 pl-3">Select Showtime</h2>
        
        {shows.length === 0 ? (
          <p className="text-gray-400">No shows available for this movie yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shows.map((show) => (
              <div key={show._id} className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-red-500 transition">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg">{show.theatre.name}</h3>
                    <p className="text-sm text-gray-400">{show.theatre.city}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-mono text-green-400">
                      {format(new Date(show.startTime), 'p')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(show.startTime), 'PPP')}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => navigate(`/book/${show._id}`)}
                  className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white py-2 rounded transition"
                >
                  Select Seats
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MoviePage;