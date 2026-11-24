import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Input, Badge } from '../components';
import { useState } from 'react';
import { useToast } from '../components/ToastProvider';
import { getGroups, createGroup } from '../store/store';

const GroupsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [isCreating, isCreatingGroup] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      dispatch(getGroups());
    }
  }, [user]);

  // Handle group creation
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    
    if (!newGroupName.trim()) {
      toast({
        title: 'Error',
        description: 'Group name is required',
        variant: 'error',
      });
      return;
    }

    setIsCreatingGroup(true);
    
    try {
      await dispatch(
        createGroup({
          name: newGroupName,
          description: newGroupDescription || '',
          isPrivate: true,
        })
      ).unwrap();

      toast({
        title: 'Success',
        description: 'Group created successfully!',
        variant: 'success',
      });
      
      setNewGroupName('');
      setNewGroupDescription('');
      setGroups(prev => [...prev, {
        id: `group_${Date.now()}`,
        name: newGroupName,
        description: newGroupDescription || '',
        isPrivate: true,
        isVerified: false,
        memberCount: 1,
      }]);
      navigate('/campus/groups');
    } catch (err) {
      toast({
        title: 'Error',
        description: err || 'Failed to create group',
        variant: 'error',
      });
    } finally {
      setIsCreatingGroup(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-campus-secondary">
            {user?.displayName || 'Student'} Groups
          </h2>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/campus/create-group')}
            className="flex items-center gap-1"
          >
            Create Group
          </Button>
        </div>
      </div>

      {/* Create Group Form */}
      {isCreatingGroup ? (
        <div className="mb-4">
          <Input
            placeholder="Group name"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            className="mb-2 rounded border border-gray-300 py-2 px-3"
            required
          />
          <Input
            placeholder="Description (optional)"
            value={newGroupDescription}
            onChange={(e) => setNewGroupDescription(e.target.value)}
            className="mb-2 rounded border border-gray-300 py-2 px-3"
          />
          <Button
            variant="primary"
            size="sm"
            onClick={() => setNewGroupName('').then(() => setNewGroupDescription(''))}
            disabled={isCreatingGroup}
          >
            Creating...
          </Button>
        </div>
      ) : (
        <div></div>
      )}

      {/* Groups List */}
      <div className="p-6">
        {groups.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No groups yet</p>
            <p className="mt-2">Create your first group above</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {groups.map((group) => (
              <Card
                key={group.id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-campus-secondary">{group.name}</h4>
                    <p className="text-sm text-gray-500">{group.description || 'No description'}</p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {group.memberCount} members
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/campus/group/${group.id}`)}
                  className="text-xs py-1 px-2"
                >
                  View
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupsPage;