import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
  const { userInfo } = useSelector((state) => state.auth);

  if (userInfo && userInfo.role === 'admin') {
    return <Outlet />; // Render the child admin page
  } else {
    return <Navigate to="/" replace />; // Kick them to home
  }
};

export default AdminRoute;