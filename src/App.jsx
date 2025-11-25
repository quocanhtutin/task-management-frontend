import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout.jsx';
import AuthLayout from './layouts/AuthLayout.jsx';
import ManagementTable from './pages/ManagementTable/ManagementTable';
import BoardsPage from './pages/BoardsPage/BoardsPage';
import Login from './pages/Auth/Login.jsx';
import Register from './pages/Auth/Register.jsx';
import ForgotPassword from './pages/Auth/ForgotPassword.jsx';
import BoardLayout from './layouts/BoardLayout.jsx';

const App = () => {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      <Route element={<MainLayout />}>
        <Route path="/main/boards" element={<BoardsPage />} />
      </Route>

      <Route element={<BoardLayout />}>
        <Route path="/boards/:title" element={<ManagementTable />} />
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />

    </Routes>
  );
}

export default App;