import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import Sidebar from '../components/SideBar/SideBar';
import './MainLayout.css';

const MainLayout = () => {
  return (
    <div className="app">
      <Navbar />
      <div className="main-layout">
        <Sidebar />
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;