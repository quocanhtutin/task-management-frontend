import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout.jsx';
import AuthLayout from './layouts/AuthLayout.jsx';
import ManagementTable from './pages/ManagementTable/ManagementTable';
import BoardsPage from './pages/BoardsPage/BoardsPage';
import Login from './pages/Auth/Login.jsx';
import Register from './pages/Auth/Register.jsx';
import ForgotPassword from './pages/Auth/ForgotPassword.jsx';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import PublicRoute from './components/ProtectedRoute/PublicRoute';
import BoardLayout from './layouts/BoardLayout.jsx';
import SettingsPage from './pages/Settings/SettingsPage';

const App = () => {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/main/boards" element={<BoardsPage />} />
          <Route path="/main/settings" element={<SettingsPage />} />
        </Route>
        <Route element={<BoardLayout />}>
          <Route path="/board/:boardId" element={<ManagementTable />} />
        </Route>

      </Route>
      <Route path="/" element={<Navigate to="/login" replace />} />

    </Routes>
  );
}

export default App;