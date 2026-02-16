import { ThreeDot } from 'react-loading-indicators';
import PropTypes from 'prop-types';
import { useTheme } from '../context/ThemeContext';

/**
 * LoadingSpinner Component
 * Reusable wrapper for ThreeDot loader with theme-aware colors
 */
const LoadingSpinner = ({ size = 'medium', text = '', className = '' }) => {
  const { theme } = useTheme();
  
  // Theme-appropriate colors
  const color = theme === 'dark' ? '#ef4444' : '#dc2626'; // red-500 for dark, red-600 for light
  
  // Size mapping
  const sizeMap = {
    small: 'small',
    medium: 'medium',
    large: 'large'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <ThreeDot 
        variant="bounce" 
        color={color} 
        size={sizeMap[size]} 
        text="" 
        textColor="" 
      />
      {text && (
        <p className="mt-3 text-sm md:text-base text-gray-600 dark:text-gray-400 font-medium">
          {text}
        </p>
      )}
    </div>
  );
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  text: PropTypes.string,
  className: PropTypes.string,
};

export default LoadingSpinner;
