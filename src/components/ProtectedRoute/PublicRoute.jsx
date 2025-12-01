import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PublicRoute = () => {
  const isAuthenticated = localStorage.getItem('accessToken');

  return isAuthenticated ? <Navigate to="/main/boards" replace /> : <Outlet />;
};

export default PublicRoute;