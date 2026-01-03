import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PublicRoute = () => {
<<<<<<< Updated upstream
  const isAuthenticated = localStorage.getItem('accessToken');

  return isAuthenticated ? <Navigate to="/main/boards" replace /> : <Outlet />;
=======
  const { accessToken, isLoaded } = useContext(StoreContext);
  const returnUrl = localStorage.getItem('returnUrl');

  if (!isLoaded) {
    return null;
  }

  if (accessToken) {
    if (returnUrl) {
      localStorage.removeItem('returnUrl');
      return <Navigate to={returnUrl} replace />;
    }
    return <Navigate to="/main/boards" replace />;
  }

  return <Outlet />;
>>>>>>> Stashed changes
};

export default PublicRoute;