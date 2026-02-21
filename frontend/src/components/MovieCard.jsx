import { Link } from 'react-router-dom';

const MovieCard = ({ movie }) => {
  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-red-500/20 transition duration-300 border border-gray-700 flex flex-col h-full">
      {/* Poster Image */}
      <div className="h-96 overflow-hidden relative group">
        <img 
          src={movie.posterUrl} 
          alt={movie.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
        />
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 text-xs font-bold rounded ${
            movie.status === 'RUNNING' ? 'bg-green-500 text-black' : 'bg-yellow-500 text-black'
          }`}>
            {movie.status}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-xl font-bold mb-1 truncate">{movie.title}</h3>
        <p className="text-gray-400 text-sm mb-2">{movie.genre}</p>
        
        <div className="mt-auto">
          {movie.status === 'RUNNING' ? (
            <Link 
              to={`/movie/${movie._id}`} 
              className="block w-full text-center bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded transition"
            >
              Book Tickets
            </Link>
          ) : movie.status === 'ENDED' ? (
             <div className="flex flex-col gap-2">
                <Link 
                  to={`/movie/${movie._id}#reviews`} 
                  className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition"
                >
                  Rate Now
                </Link>
                <Link 
                  to={`/movie/${movie._id}`} 
                  className="block w-full text-center bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded transition"
                >
                  Watch Online
                </Link>
             </div>
          ) : (
            <button disabled className="w-full bg-gray-600 text-gray-400 font-semibold py-2 rounded cursor-not-allowed">
              {movie.status === 'UPCOMING' ? 'Coming Soon' : movie.status}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieCard;