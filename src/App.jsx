import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Sidebar from './components/SideBar/SideBar';
import BoardsPage from './pages/BoardsPage/BoardsPage';
import MainLayout from './layouts/MainLayout.jsx';
import AuthLayout from './layouts/AuthLayout.jsx';
import ManagementTable from './pages/ManagementTable/ManagementTable';
import './App.css';
import Login from './pages/Auth/Login.jsx';
import Register from './pages/Auth/Register.jsx';
import ForgotPassword from './pages/Auth/ForgotPassword.jsx';


const App = () => {
  const location = useLocation();

  const showSidebar = location.pathname.startsWith('/main');

  return (
    <div className="app">
      <Navbar />

      {showSidebar ?
        ( // Bố cục có sidebar 
          <div className="main-layout">
            <Sidebar />
            <div className="page-content">
              <Routes>
                <Route path="/main/boards" element={<BoardsPage />} />
              </Routes>
            </div>
          </div>
        ) : (
          <div className="fullpage-content">
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />

              {/* Auth Pages */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
              </Route>

              <Route path="/boards/:title" element={<ManagementTable />} />
            </Routes>
          </div>
        )}
    </div>
  );
}

export default App
