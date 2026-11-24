import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Card, Input, Button } from '../components';
import { useToast } from '../components/ToastProvider';

const SettingsPage = () => {
  const { user } = useSelector(state => state.auth);
  const [profileVisibility, setProfileVisibility] = useState(user?.profileVisibility || 'campus');
  const [displayNameVisibility, setDisplayNameVisibility] = useState(user?.displayNameVisibility || 'everyone');
  const [onlineStatusVisibility, setOnlineStatusVisibility] = useState(user?.onlineStatusVisibility || 'campus');
  const [lastSeenVisibility, setLastSeenVisibility] = useState(user?.lastSeenVisibility || 'everyone');
  const [profilePictureVisibility, setProfilePictureVisibility] = useState(user?.profilePictureVisibility || 'campus');
  const [messageReadReceipts, setMessageReadReceipts] = useState(user?.messageReadReceipts !== false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // In a real app, would call API to update settings
      toast({
        title: 'Success',
        description: 'Settings saved successfully!',
        variant: 'success',
      });
      setIsSaving(false);
    } catch (err) {
      toast({
        title: 'Error',
        description: err || 'Failed to save settings',
        variant: 'error',
      });
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-campus-secondary">
            Privacy Settings
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/campus')}
            className="text-sm"
          >
            Back
          </Button>
        </div>
      </div>

      {/* Settings Form */}
      <div className="bg-white rounded-xl p-6 shadow-sm max-w-md mx-auto">
        <h3 className="text-base font-medium text-campus-secondary mb-6">Who can see your content?</h3>
        
        {/* Profile Visibility */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profile Visibility
          </label>
          <select
            value={profileVisibility}
            onChange={(e) => setProfileVisibility(e.target.value)}
            className="w-full rounded border border-gray-300 py-2 px-3"
          >
            <option value="campus">Campus Only</option>
            <option value="friends">Friends</option>
            <option value="private">Private</option>
          </select>
        </div>
        
        {/* Display Name Visibility */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Display Name Visibility
          </label>
          <select
            value={displayNameVisibility}
            onChange={(e) => setDisplayNameVisibility(e.target.value)}
            className="w-full rounded border border-gray-300 py-2 px-3"
          >
            <option value="everyone">Everyone</option>
            <option value="campus">Campus Only</option>
            <option value="friends">Friends</option>
          </select>
        </div>
        
        {/* Online Status */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Online Status Visibility
          </label>
          <select
            value={onlineStatusVisibility}
            onChange={(e) => setOnlineStatusVisibility(e.target.value)}
            className="w-full rounded border border-gray-300 py-2 px-3"
          >
            <option value="campus">Campus Only</option>
            <option value="friends">Friends</option>
            <option value="private">Private</option>
          </select>
        </div>
        
        {/* Last Seen */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Seen Visibility
          </label>
          <select
            value={lastSeenVisibility}
            onChange={(e) => setLastSeenVisibility(e.target.value)}
            className="w-full rounded border border-gray-300 py-2 px-3"
          >
            <option value="everyone">Everyone</option>
            <option value="campus">Campus Only</option>
            <option value="friends">Friends</option>
          </select>
        </div>
        
        {/* Profile Picture */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profile Picture Visibility
          </label>
          <select
            value={profilePictureVisibility}
            onChange={(e) => setProfilePictureVisibility(e.target.value)}
            className="w-full rounded border border-gray-300 py-2 px-3"
          >
            <option value="campus">Campus Only</option>
            <option value="friends">Friends</option>
            <option value="none">Nobody</option>
          </select>
        </div>
        
        {/* Read Receipts */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Read Receipts
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={messageReadReceipts}
              onChange={(e) => setMessageReadReceipts(e.target.checked)}
              className="rounded border-gray-300 py-1 px-2"
            />
            Send read receipts when I read messages
          </label>
        </div>
        
        {/* Save Button */}
        <div className="mt-6">
          <Button
            variant="primary"
            size="md"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;