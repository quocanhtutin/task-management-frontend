import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';

const PublicRoute = () => {
  const { accessToken, isLoaded } = useContext(StoreContext);

  if (!isLoaded) {
    return null;
  }

  return accessToken ? <Navigate to="/main/boards" replace /> : <Outlet />;
};

export default PublicRoute;