import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Card, Input, Button, Badge } from '../components';
import { useState } from 'react';
import { useToast } from '../components/ToastProvider';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const [bio, setBio] = useState(user?.bio || '');
  const [interests, setInterests] = useState(user?.interests || '');
  const [skills, setSkills] = useState(user?.skills || '');
  const [college, setCollege] = useState(user?.college || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [academicYear, setAcademicYear] = useState(user?.academicYear || '');
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setBio(user.bio || '');
      setInterests(user.interests || '');
      setSkills(user.skills || '');
      setCollege(user.college || '');
      setDepartment(user.department || '');
      setAcademicYear(user.academicYear || '');
    }
  }, [user]);

  const handleSave = async () => {
    if (!bio.trim() && !interests.trim() && !skills.trim()) {
      toast({
        title: 'Error',
        description: 'Nothing to save',
        variant: 'error',
      });
      return;
    }

    try {
      setIsEditing(false);
      toast({
        title: 'Success',
        description: 'Profile updated successfully!',
        variant: 'success',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err || 'Failed to update profile',
        variant: 'error',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-campus-secondary">
            {user?.displayName || 'Student'} Profile
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

      {/* Profile Image/Display */}
      <div className="bg-white rounded-xl p-6 mb-6 shadow-sm text-center">
        {user?.profilePictureUrl && (
          <img
            src={user.profilePictureUrl}
            alt={user.displayName}
            className="w-24 h-24 rounded-full object-cover mx-auto mb-3 border-2 border-campus-primary"
          />
        )}
        <h3 className="text-lg font-medium text-campus-secondary">{user?.displayName || 'No Name'}</h3>
        <p className="text-sm text-gray-500">{user?.college || 'University'}</p>
      </div>

      {/* Edit Form */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full rounded border border-gray-300 py-2 px-3 resize-none"
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interests
                </label>
                <textarea
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  rows={3}
                  className="w-full rounded border border-gray-300 py-2 px-3 resize-none"
                  disabled={!isEditing}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skills
                </label>
                <textarea
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  rows={3}
                  className="w-full rounded border border-gray-300 py-2 px-3 resize-none"
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  College
                </label>
                <select
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="w-full rounded border border-gray-300 py-2 px-3"
                  disabled={!isEditing}
                >
                  <option value="">Select College</option>
                  <option value="University of Example">University of Example</option>
                  <option value="State University">State University</option>
                  <option value="Community College">Community College</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Academic Year
                </label>
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full rounded border border-gray-300 py-2 px-3"
                  disabled={!isEditing}
                >
                  <option value="">Select Academic Year</option>
                  <option value="Freshman">Freshman</option>
                  <option value="Sophomore">Sophomore</option>
                  <option value="Junior">Junior</option>
                  <option value="Senior">Senior</option>
                  <option value="Graduate">Graduate</option>
                  <option value="PhD">PhD</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interests (comma-separated)
                </label>
                <input
                  type="text"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  className="w-full rounded border border-gray-300 py-2 px-3"
                  disabled={!isEditing}
                  placeholder="e.g., gaming, coding, sports"
                />
              </div>
            </div>
            
            <div>
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isEditing}
              >
                {isEditing ? 'Save Changes' : 'Edit Profile'}
              </Button>
              <Button
                variant="outline"
                type="button"
                size="md"
                onClick={() => setIsEditing(!isEditing)}
                className="mt-2"
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </Button>
            </div>
          </form>
        ) : (
          {/* Display View */}
          <div>
            <p className="text-sm text-gray-500 mb-2">Bio</p>
            <p className="whitespace-pre-wrap">{bio || 'No bio added'}</p>
            
            <p className="text-sm text-gray-500 mb-2">Interests</p>
            <p className="text-xs text-gray-400 capitalize">{interests ? interests.split(',').map((i: string) => i.trim()).join(', ') : 'No interests added'}</p>
            
            <p className="text-sm text-gray-500 mb-2">Skills</p>
            <p className="text-xs text-gray-400 capitalize">{skills ? skills.split(',').map((s: string) => s.trim()).join(', ') : 'No skills added'}</p>
            
            <p className="text-sm text-gray-500 mb-2">College</p>
            <p className="font-medium">{college || 'Not specified'}</p>
            
            <p className="text-sm text-gray-500 mb-2">Department</p>
            <p className="font-medium">{department || 'Not specified'}</p>
            
            <p className="text-sm text-gray-500 mb-2">Academic Year</p>
            <p className="font-medium">{academicYear || 'Not specified'}</p>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;