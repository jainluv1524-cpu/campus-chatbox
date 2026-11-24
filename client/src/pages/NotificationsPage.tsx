import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '../components';
import { Icon } from 'lucide-react';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'message', title: 'New Message', description: 'John sent you a message', time: '2 minutes ago', read: false, icon: 'MailIcon' },
    { id: 2, type: 'group', title: 'Group Invite', description: 'You have been invited to join the Chess Club', time: '1 hour ago', read: false, icon: 'UsersIcon' },
    { id: 3, type: 'admin', title: 'System Alert', description: 'Profile picture visibility has been updated', time: '3 hours ago', read: true, icon: 'InfoIcon' },
    { id: 4, type: 'report', title: 'User Report', description: 'Suspected content violation reported', time: '1 day ago', read: true, icon: 'AlertIcon' },
  ]);

  const [activeFilter, setActiveFilter] = useState('all');

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIconByType = (type: string) => {
    const iconMap: { [key: string]: string } = {
      'MailIcon': 'MailIcon',
      'UsersIcon': 'UsersIcon',
      'InfoIcon': 'InfoIcon',
      'AlertIcon': 'AlertIcon',
      'MessageIcon': 'MessageIcon',
    };
    return iconMap[type] || 'MessageIcon';
  };

  const filteredNotifications = notifications.filter(notif =>
    activeFilter === 'all' || notif.type === activeFilter
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-campus-secondary">Notifications</h2>
          <p className="text-sm text-gray-500">{unreadCount} unread</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            Mark All as Read
          </Button>
          <Button variant="outline" size="sm" onClick={() => {
            notifications.forEach(n => deleteNotification(n.id));
          }}>
            Clear All
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl p-3 mb-6 shadow-sm">
        <div className="flex gap-2">
          {[
            { id: 'all', label: 'All' },
            { id: 'message', label: 'Messages' },
            { id: 'group', label: 'Groups' },
            { id: 'admin', label: 'Admin' },
            { id: 'report', label: 'Reports' },
          ].map(tab => (
            <Button
              key={tab.id}
              variant={activeFilter === tab.id ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter(tab.id)}
            >
              {tab.label}
              {activeFilter === tab.id && (
                <Badge variant="primary" className="ml-2">
                  {notifications.filter(n => n.type === tab.id).length}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-200">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p>No notifications yet</p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors ${!notif.read ? 'bg-blue-50' : ''}`}
            >
              {/* Icon */}
              <div className={`p-3 rounded-full flex items-center justify-center ${!notif.read ? 'bg-campus-primary bg-opacity-10 text-campus-primary' : 'bg-gray-100 text-gray-400'}`}>
                {/* Icon would come from lucide-react */}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path className="w-5 h-5" d="M3 8l7-7 7 7M4 10.405V19a1 1 0 011 1v1a2 2 0 01-2-2V4.405M12 20h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-gray-800">{notif.title}</h3>
                  {!notif.read && (
                    <Badge variant="primary">New</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500">{notif.description}</p>
                <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => markAsRead(notif.id)}>
                  Mark as Read
                </Button>
                <Button variant="ghost" size="sm" onClick={() => deleteNotification(notif.id)}>
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;