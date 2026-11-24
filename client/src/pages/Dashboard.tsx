import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { Card, Button, Badge, Sidebar } from '../components';
import { getUserStats, getRecentActivity } from '../store/api';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastProvider';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const { stats, activity } = useSelector(state => state.dashboard);
  const { isLoading } = useSelector(state => state.ui);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      dispatch(getUserStats());
      dispatch(getRecentActivity());
    }
  }, [user, dispatch]);

  if (!user) {
    return <p className="text-center text-gray-600">Please login to view the dashboard</p>;
  }

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-campus-primary mx-auto my-4"></div>
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  // Feature navigation
  const features = [
    { name: 'Messages', icon: 'message', href: '/campus/messages', count: stats?.totalMessages || 0 },
    { name: 'Groups', icon: 'grid', href: '/campus/groups', count: stats?.totalGroups || 0 },
    { name: 'Directory', icon: 'users', href: '/campus/directory', count: 0 },
    { name: 'Profile', icon: 'user', href: '/campus/profile', count: 0 },
    { name: 'Settings', icon: 'settings', href: '/campus/settings', count: 0 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-campus-secondary">
            Welcome, {user.displayName || 'Student'}
          </h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => dispatch(logout())}
            className="text-sm"
          >
            Logout
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <div className="p-4">
              <div className="text-2xl font-bold text-campus-primary">{stats?.totalMessages || 0}</div>
              <p className="text-sm text-gray-500">Messages</p>
            </div>
          </Card>
          
          <Card>
            <div className="p-4">
              <div className="text-2xl font-bold text-campus-primary">{stats?.totalGroups || 0}</div>
              <p className="text-sm text-gray-500">Groups</p>
            </div>
          </Card>
          
          <Card>
            <div className="p-4">
              <div className="text-2xl font-bold text-campus-primary">{stats?.totalChannels || 0}</div>
              <p className="text-sm text-gray-500">Channels</p>
            </div>
          </Card>
          
          <Card>
            <div className="p-4">
              <div className="text-2xl font-bold text-campus-primary">{stats?.unreadCount || 0}</div>
              <p className="text-sm text-gray-500">Unread</p>
            </div>
          </Card>
        </div>

        {/* Quick Feature Links */}
        <div className="bg-white rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-campus-secondary mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {features.map((feature) => (
              <Button
                key={feature.name}
                variant="outline"
                size="sm"
                onClick={() => navigate(feature.href)}
                className="justify-start px-3 py-1 text-sm"
              >
                <span className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0">
                  {/* Simplified icon */}
                  <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path className="w-3 h-3" d="M2.25 12l8.954-3.452 3.157 8.775L2.25 21l8.516-2.945L14.707 9.688 2.25 2.388z"/>
                  </svg>
                </span>
                {feature.name} <span className="text-xs text-gray-500">{feature.count > 0 ? `(${feature.count})` : ''}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6">
          <h2 className="text-xl font-semibold text-campus-secondary mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {activity?.map((item, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded border border-gray-100">
                <p className="text-sm text-gray-500">{item.time ago}</p>
                <p className="font-medium">{item.title}</p>
              </div>
            ))}
            {activity.length === 0 && (
              <p className="text-center text-gray-500 py-8">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;