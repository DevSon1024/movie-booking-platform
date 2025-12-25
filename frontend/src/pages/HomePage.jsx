import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMovies } from '../redux/slices/movieSlice';
import MovieCard from '../components/MovieCard';

const HomePage = () => {
  const dispatch = useDispatch();
  // Access global state: { movies, loading, error }
  const { movies, loading, error } = useSelector((state) => state.movies);

  // Fetch movies when component mounts
  useEffect(() => {
    dispatch(fetchMovies());
  }, [dispatch]);

  if (loading) return <div className="text-center mt-20 text-2xl animate-pulse">Loading Movies...</div>;
  if (error) return <div className="text-center mt-20 text-red-500">Error: {error}</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 border-l-4 border-red-600 pl-4">Now Showing & Upcoming</h1>
      
      {movies.length === 0 ? (
        <p className="text-gray-400">No movies found. Admin needs to add some!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {movies.map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;