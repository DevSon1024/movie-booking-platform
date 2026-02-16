import PropTypes from 'prop-types';

// Base Skeleton Component with enhanced shimmer effect
const Skeleton = ({ width = 'w-full', height = 'h-4', className = '' }) => (
  <div 
    className={`${width} ${height} bg-gray-200 dark:bg-gray-700 rounded relative overflow-hidden ${className}`}
  >
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent" />
  </div>
);

Skeleton.propTypes = {
  width: PropTypes.string,
  height: PropTypes.string,
  className: PropTypes.string,
};

/**
 * Movie Card Skeleton for grid layouts
 */
export const MovieCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md border border-gray-100 dark:border-gray-800 flex flex-col h-full">
    {/* Poster skeleton */}
    <div className="relative aspect-[2/3] overflow-hidden">
      <Skeleton width="w-full" height="h-full" className="rounded-none" />
    </div>
    
    {/* Content skeleton */}
    <div className="p-3 sm:p-4 flex flex-col flex-grow justify-between">
      <div>
        <Skeleton width="w-3/4" height="h-5" className="mb-2" />
        <Skeleton width="w-1/2" height="h-3" className="mb-3" />
      </div>
      
      <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-gray-100 dark:border-gray-700">
        <Skeleton width="w-16" height="h-3" />
        <Skeleton width="w-12" height="h-3" />
      </div>
    </div>
  </div>
);

/**
 * Hero Section Skeleton
 */
export const HeroSkeleton = () => (
  <div className="relative w-full h-[550px] bg-gray-900 dark:bg-black overflow-hidden">
    <div className="absolute inset-0 container mx-auto px-6 flex items-center justify-between z-10">
      <div className="w-full md:w-1/2 lg:w-5/12 flex flex-col items-start pl-4 md:pl-8 space-y-6">
        <Skeleton width="w-32" height="h-8" />
        <Skeleton width="w-full" height="h-12" />
        <div className="flex gap-4 w-full">
          <Skeleton width="w-24" height="h-6" />
          <Skeleton width="w-24" height="h-6" />
          <Skeleton width="w-24" height="h-6" />
        </div>
        <Skeleton width="w-full" height="h-16" />
        <div className="flex gap-5">
          <Skeleton width="w-32" height="h-12" className="rounded-full" />
          <Skeleton width="w-32" height="h-12" className="rounded-full" />
        </div>
      </div>
      
      <div className="hidden md:flex w-1/2 justify-center items-center pr-10">
        <Skeleton width="w-[340px]" height="h-[500px]" className="rounded-2xl" />
      </div>
    </div>
  </div>
);

/**
 * Now Showing Carousel Card Skeleton
 */
export const CarouselCardSkeleton = () => (
  <div className="min-w-[100%] md:min-w-[50%] lg:min-w-[25%] px-3">
    <div className="block rounded-xl overflow-hidden shadow-lg h-full bg-white dark:bg-gray-800">
      <div className="aspect-[2/3] overflow-hidden">
        <Skeleton width="w-full" height="h-full" className="rounded-none" />
      </div>
      <div className="p-4">
        <Skeleton width="w-3/4" height="h-5" className="mb-2" />
        <div className="flex justify-between items-center">
          <Skeleton width="w-16" height="h-4" />
          <Skeleton width="w-12" height="h-4" />
        </div>
      </div>
    </div>
  </div>
);

/**
 * Table Row Skeleton for admin tables
 */
export const TableRowSkeleton = ({ columns = 5 }) => (
  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
    {Array.from({ length: columns }).map((_, idx) => (
      <td key={idx} className="px-6 py-4 whitespace-nowrap">
        <Skeleton width="w-3/4" height="h-4" />
      </td>
    ))}
  </tr>
);

TableRowSkeleton.propTypes = {
  columns: PropTypes.number,
};

/**
 * Review Card Skeleton
 */
export const ReviewSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
    <div className="flex items-start gap-4 mb-4">
      <Skeleton width="w-12" height="h-12" className="rounded-full flex-shrink-0" />
      <div className="flex-1">
        <Skeleton width="w-32" height="h-5" className="mb-2" />
        <Skeleton width="w-24" height="h-4" />
      </div>
      <Skeleton width="w-16" height="h-6" className="rounded" />
    </div>
    <Skeleton width="w-full" height="h-4" className="mb-2" />
    <Skeleton width="w-5/6" height="h-4" className="mb-2" />
    <Skeleton width="w-4/6" height="h-4" />
  </div>
);

/**
 * Text Content Skeleton
 */
export const TextSkeleton = ({ lines = 3 }) => (
  <div className="space-y-2">
    {Array.from({ length: lines }).map((_, idx) => (
      <Skeleton 
        key={idx} 
        width={idx === lines - 1 ? 'w-4/5' : 'w-full'} 
        height="h-4" 
      />
    ))}
  </div>
);

TextSkeleton.propTypes = {
  lines: PropTypes.number,
};

/**
 * Profile Content Skeleton
 */
export const ProfileSkeleton = () => (
  <div className="max-w-4xl mx-auto">
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 p-8">
        <div className="flex items-center gap-6">
          <Skeleton width="w-24" height="h-24" className="rounded-full" />
          <div className="flex-1">
            <Skeleton width="w-48" height="h-8" className="mb-2" />
            <Skeleton width="w-64" height="h-5" />
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx}>
              <Skeleton width="w-24" height="h-4" className="mb-2" />
              <Skeleton width="w-full" height="h-10" className="rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

/**
 * Analytics Card Skeleton for Admin Overview
 */
export const AnalyticsCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
    <div className="flex items-center justify-between mb-4">
      <Skeleton width="w-32" height="h-5" />
      <Skeleton width="w-10" height="h-10" className="rounded-lg" />
    </div>
    <Skeleton width="w-24" height="h-8" className="mb-2" />
    <Skeleton width="w-40" height="h-4" />
  </div>
);

export default Skeleton;
