import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';

const MainLayout = () => {
  return (
    <div className="main-app-layout">
      <Navbar />
      <main className="content">
        <Outlet /> 
      </main>
    </div>
  );
};

export default MainLayout;