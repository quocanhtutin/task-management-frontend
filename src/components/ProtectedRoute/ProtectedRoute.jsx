import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';

const ProtectedRoute = () => {
  const { accessToken, isLoaded } = useContext(StoreContext);

  if (!isLoaded) {
    return <div className="loading-container">Đang tải dữ liệu...</div>; 
  }

  return accessToken ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;