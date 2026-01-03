import React, { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';

const ProtectedRoute = () => {
  const { accessToken, isLoaded } = useContext(StoreContext);
  const location = useLocation();

  if (!isLoaded) {
    return null;
  }

  if (!accessToken) {
    if (location.pathname === '/invite') {
      localStorage.setItem('returnUrl', location.pathname + location.search);
    }
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
export default ProtectedRoute;