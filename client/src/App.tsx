import React from 'react';
import { BrowserRoutes, route, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ChatPage from './pages/ChatPage';
import GroupsPage from './pages/GroupsPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import ToastProvider from './components/ToastProvider';

function App() {
  return (
    <ToastProvider>
      <BrowserRoutes>
        {/* Public routes */}
        <route path="login" element={<Login />} />
        <route path="register" element={<Register />} />
        
        {/* Protected routes - require authentication */}
        <route path="/" element={<Dashboard />} />
        <route path="campus/messages" element={<ChatPage />} />
        <route path="campus/groups" element={<GroupsPage />} />
        <route path="campus/profile" element={<ProfilePage />} />
        <route path="campus/settings" element={<SettingsPage />} />
        
        {/* Redirect all other routes to login */}
        <route path="*" element={<Login />} />
      </BrowserRoutes>
    </BrowserRoutes>
  );
}

export default App;