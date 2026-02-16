import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const useDocumentTitle = (title) => {
  const location = useLocation();
  const { siteName } = useSelector((state) => state.settings);

  useEffect(() => {
    const appName = siteName || 'Movie Booking Platform';
    document.title = title ? `${title} | ${appName}` : appName;
  }, [title, location, siteName]);
};

export default useDocumentTitle;
