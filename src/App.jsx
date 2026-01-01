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
import WorkspaceMember from './pages/WorkspaceMember/WorkspaceMember.jsx';
import Home from './pages/Home/Home.jsx';
import MembersRedirect from './components/MembersRedirect/MembersRedirect.jsx';

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
          <Route path="/boards" element={<Navigate to="/main/boards" replace />} />
          <Route path="/settings" element={<Navigate to="/main/settings" replace />} />
          <Route path="/members" element={<MembersRedirect />} />
        </Route>
        <Route element={<BoardLayout />}>
          <Route path="/board/:boardId" element={<ManagementTable />} />
        </Route>
      </Route>

      <Route element={<MainLayout />}>
        <Route path='/home' element={<Home />} />
        <Route path="/workspace/:title/boards" element={<BoardsPage />} />
        <Route path="/workspace/:title/members" element={<WorkspaceMember />} />
      </Route>
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;