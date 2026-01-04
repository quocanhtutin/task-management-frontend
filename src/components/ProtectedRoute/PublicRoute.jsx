import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';

const PublicRoute = () => {
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
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;