import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '../components';

const AdminDashboard = () => {
  const [users, setUsers] = useState([
    { id: 1, displayName: 'Alice Chen', email: 'alice@university.edu', college: 'University of Example', isVerified: true, isOnline: true },
    { id: 2, displayName: 'Bob Martinez', email: 'bob@stateuniversity.edu', college: 'State University', isVerified: false, isOnline: false },
    { id: 3, displayName: 'Carol Williams', email: 'carol@communitycollege.edu', college: 'Community College', isVerified: true, isOnline: true },
  ]);

  const [stats, setStats] = useState({
    totalUsers: 8245,
    totalColleges: 24,
    totalGroups: 156,
    totalMessages: 28475,
  });

  const [activeTab, setActiveTab] = useState('users');

  const [verifyDialogUser, setVerifyDialogUser] = useState(null);
  const [suspendDialogUser, setSuspendDialogUser] = useState(null);

  const handleVerify = (userId: number) => {
    setVerifyDialogUser(userId);
  };

  const handleSuspend = (userId: number) => {
    setSuspendDialogUser(userId);
  };

  const handleVerifyConfirm = () => {
    setUsers(users.map(u => u.id === verifyDialogUser ? { ...u, isVerified: true } : u));
    setVerifyDialogUser(null);
  };

  const handleSuspendConfirm = () => {
    // In real app, would call API
    alert('Account suspended');
    setSuspendDialogUser(null);
  };

  const [statsData, setStatsData] = useState({
    totalUsers: 8245,
    totalColleges: 24,
    totalGroups: 156,
    totalMessages: 28475,
    activeUsers: 1,
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-campus-secondary">Admin Dashboard</h2>
        <div className="flex items-center gap-2">
          <Badge variant="primary">Admin Panel</Badge>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>Refresh</Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="p-4">
            <div className="text-2xl font-bold text-campus-primary">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-sm text-gray-500">Total Users</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-2xl font-bold text-campus-primary">{stats.totalColleges}</div>
            <p className="text-sm text-gray-500">Colleges</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-2xl font-bold text-campus-primary">{stats.totalGroups}</div>
            <p className="text-sm text-gray-500">Groups</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-2xl font-bold text-campus-primary">{stats.totalMessages.toLocaleString()}</div>
            <p className="text-sm text-gray-500">Messages</p>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl p-3 shadow-sm mb-6">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'users', label: 'Users' },
            { id: 'statistics', label: 'Statistics' },
            { id: 'colleges', label: 'Colleges' },
            { id: 'moderation', label: 'Moderation' },
          ].map(tab => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div>
          {/* Users Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">ID</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">College</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Verified</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Online</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">#{user.id}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{user.displayName}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{user.email}</td>
                    <td className="px-4 py-3 text-gray-500">{user.college}</td>
                    <td className="px-4 py-3">
                      <Badge variant={user.isVerified ? 'primary' : 'default'}>
                        {user.isVerified ? 'Verified' : 'Not Verified'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {user.isOnline ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                          Online
                        </div>
                      ) : (
                        <div className="text-gray-400">Offline</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {!user.isVerified && (
                          <Button variant="outline" size="sm" onClick={() => handleVerify(user.id)}>
                            Verify
                          </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => handleSuspend(user.id)}>
                          Suspend
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Statistics Tab */}
      {activeTab === 'statistics' && (
        <div>
          <h3 className="text-lg font-medium text-gray-600 mb-4">Platform Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <div className="p-4">
                <div className="text-2xl font-bold text-campus-primary">{stats.totalUsers.toLocaleString()}</div>
                <p className="text-sm text-gray-500">Total Users</p>
              </div>
            </Card>
            <Card>
              <div className="p-4">
                <div className="text-2xl font-bold text-campus-primary">{stats.totalColleges}</div>
                <p className="text-sm text-gray-500">Colleges</p>
              </div>
            </Card>
            <Card>
              <div className="p-4">
                <div className="text-2xl font-bold text-campus-primary">{stats.totalGroups}</div>
                <p className="text-sm text-gray-500">Groups</p>
              </div>
            </Card>
            <Card>
              <div className="p-4">
                <div className="text-2xl font-bold text-campus-primary">{stats.totalMessages.toLocaleString()}</div>
                <p className="text-sm text-gray-500">Messages</p>
              </div>
            </Card>
          </div>
          
          {/* Quick Stats */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-medium text-campus-secondary mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between p-3 bg-gray-50 rounded">
                <span>Active Users</span>
                <Badge>{statsData.activeUsers.toLocaleString()}</Badge>
              </div>
              <div className="flex justify-between p-3 bg-gray-50 rounded">
                <span>Avg Messages per User</span>
                <Badge>3.2</Badge>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Colleges Tab */}
      {activeTab === 'colleges' && (
        <div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-medium text-gray-600 mb-4">Colleges Management</h3>
            <p className="text-sm text-gray-400">{stats.totalColleges} colleges registered</p>
          </div>
        </div>
      )}

      {/* Moderation Tab */}
      {activeTab === 'moderation' && (
        <div>
          <h3 className="text-lg font-medium text-gray-600 mb-4">Moderation Tools</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            <Card className="text-center">
              <div className="p-4">
                <div className="text-3xl font-bold text-campus-primary">0</div>
                <p className="text-sm text-gray-500">Reports Pending</p>
                <Button variant="outline" className="mt-2 text-sm">View All</Button>
              </div>
            </Card>
            <Card className="text-center">
              <div className="p-4">
                <div className="text-3xl font-bold text-campus-primary">0</div>
                <p className="text-sm text-gray-500">Banned Users</p>
                <Button variant="outline" className="mt-2 text-sm">View</Button>
              </div>
            </Card>
            <Card className="text-center">
              <div className="p-4">
                <div className="text-3xl font-bold text-campus-primary">0</div>
                <p className="text-sm text-gray-500">Archived Chats</p>
                <Button variant="outline" className="mt-2 text-sm">View</Button>
              </div>
            </Card>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-medium text-gray-600 mb-3">Announcements</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span>Allowed time frame</span>
                <Button variant="primary">Create Announcement</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Verify Confirmation Modal */}
      {verifyDialogUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-800 mb-2">Confirm Account Verification</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to verify this account? This will mark the user as a verified member.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setVerifyDialogUser(null)}>Cancel</Button>
              <Button variant="primary" onClick={handleVerifyConfirm}>Yes, Verify</Button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend Confirmation Modal */}
      {suspendDialogUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-800 mb-2">Confirm Account Suspension</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to suspend this user? This action will be logged and can be reviewed by other admins.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setSuspendDialogUser(null)}>Cancel</Button>
              <Button variant="primary" onClick={handleSuspendConfirm}>Yes, Suspend</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;