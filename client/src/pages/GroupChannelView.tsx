import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Badge, MessageItem } from '../components';
import { Sidebar } from '../components/Sidebar';
import { FileUploader } from '../components/FileUploader';

interface GroupMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  imageUrl?: string;
  fileUrl?: string;
  reactions: { emoji: string; count: number; userReacted: boolean }[];
}

interface Channel {
  id: string;
  name: string;
  description: string;
  isAnnouncement: boolean;
  isCampusDefault: boolean;
  memberCount: number;
}

const GroupChannelView = () => {
  const [channels, setChannels] = useState<Channel[]>([
    { id: 1, name: '#general', description: 'General campus discussions', isAnnouncement: false, isCampusDefault: true, memberCount: 45 },
    { id: 2, name: '#announcements', description: 'Official campus announcements', isAnnouncement: true, isCampusDefault: true, memberCount: 45 },
    { id: 3, name: '#academics', description: 'Study groups and homework help', isAnnouncement: false, isCampusDefault: true, memberCount: 32 },
    { id: 4, name: '#placement-discussions', description: 'Job postings and career advice', isAnnouncement: false, isCampusDefault: true, memberCount: 28 },
    { id: 5, name: '#events', description: 'Campus events and meetups', isAnnouncement: false, isCampusDefault: true, memberCount: 38 },
    { id: 6, name: '#buy-sell', description: 'Buy and sell items on campus', isAnnouncement: false, isCampusDefault: true, memberCount: 25 },
  ]);

  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<GroupMessage[]>([
    {
      id: '1',
      senderId: 'system',
      senderName: 'Campus Chatbox',
      content: 'Welcome to the campus community! Feel free to introduce yourself in #general.',
      timestamp: new Date(),
      status: 'delivered',
      reactions: [],
    },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [files, setFiles] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState('messages');

  useEffect(() => {
    if (selectedChannel) {
      // Load messages for this channel
      setMessages([
        {
          id: '1',
          senderId: 'system',
          senderName: 'Campus Chatbox',
          content: `Welcome to ${selectedChannel.name}! This channel is for ${selectedChannel.description}.`,
          timestamp: new Date(),
          status: 'delivered',
          reactions: [],
        },
      ]);
    }
  }, [selectedChannel]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !files.length) return;

    const newMsg: GroupMessage = {
      id: Date.now().toString(),
      senderId: 'current-user',
      senderName: 'You',
      content: newMessage.trim(),
      timestamp: new Date(),
      status: 'sent',
      imageUrl: files.find(f => f.type.startsWith('image/'))?.preview,
      fileUrl: files.find(f => !f.type.startsWith('image/'))?.preview,
      reactions: [],
    };

    setMessages([...messages, newMsg]);
    setNewMessage('');
    setFiles([]);
    
    // Simulate response
    setTimeout(() => {
      const responseMsg: GroupMessage = {
        id: Date.now().toString() + 'r',
        senderId: 'other-user',
        senderName: 'Alice Chen',
        content: 'Good point! What about ordering pizza for the party?',
        timestamp: new Date(),
        status: 'delivered',
        reactions: [{ emoji: '👍', count: 2, userReacted: false }],
      };
      setMessages(prev => [...prev, responseMsg]);
    }, 1000);
  };

  const handleReact = (messageId: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id === messageId) {
        const currentReaction = m.reactions.find(r => r.userReacted);
        return {
          ...m,
          reactions: currentReaction
            ? m.reactions.map(r => r.emoji === currentReaction.emoji 
                ? { ...r, count: r.count - 1, userReacted: false } 
                : r)
                .filter(r => r.count > 0)
            : m.reactions.concat([{ emoji: '👍', count: 1, userReacted: true }])
        };
      }
      return m;
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex h-full">
        {/* Left Sidebar - Channels */}
        <div className="hidden md:flex flex-col border-r border-gray-200 bg-white w-64">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-campus-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path className="w-5 h-5" d="M5 4h3v16H5zm4 0h3v16H9zm-8 0h3v16H1zm18.03 14c1.57 0 2.92-2.5 2.92-2.5S22.01 10.6 20.03 10.6C18.05 10.6 16.7 13.1 16.7 13.1s1.35 2.5 3.33 2.5zM8 10H6c0-4 3-5 5-5a3 3 0 003-3c0-1.5-1.2-2.5-2.5-2.5S8.5 4 8 4z"/>
              </svg>
              <h3 className="font-medium text-gray-800">#Channels</h3>
            </div>
            <Button variant="outline" size="sm">
              New
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3">
            {channels.map(channel => (
              <Button
                key={channel.id}
                variant={selectedChannel?.id === channel.id ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSelectedChannel(channel)}
                className={`w-full justify-start px-3 py-2 text-sm mb-1 rounded-lg ${
                  selectedChannel?.id === channel.id ? 'bg-campus-primary text-white' : ''
                }`}
              >
                <span className={`mr-2 ${selectedChannel?.id === channel.id ? 'text-white' : ''}`}>{channel.name}</span>
                {channel.isAnnouncement && (
                  <Badge variant="primary" className="ml-2 text-xs px-1">📢</Badge>
                )}
                {channel.isCampusDefault && (
                  <Badge variant="default" className="ml-2 text-xs px-1">✓</Badge>
                )}
                <span className={`ml-auto text-xs ${selectedChannel?.id === channel.id ? 'text-white' : 'text-gray-400'}`}>
                  {channel.memberCount}
                </span>
              </Button>
            ))}
          </div>

          <div className="p-3 border-t border-gray-200">
            <Button variant="outline" size="sm" className="w-full justify-start">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path className="w-4 h-4" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              Create Channel
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-full">
          {selectedChannel ? (
            <>
              {/* Channel Header */}
              <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-campus-primary bg-opacity-10 flex items-center justify-center text-xl">
                    {selectedChannel.name[1].toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-gray-800 flex items-center gap-2">
                      {selectedChannel.name}
                      {selectedChannel.isAnnouncement && (
                        <Badge variant="primary" className="px-1.5 text-xs">📢</Badge>
                      )}
                      {selectedChannel.isCampusDefault && (
                        <Badge variant="default" className="px-1.5 text-xs">✓</Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-3">
                      <span>{selectedChannel.memberCount} members</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        3 online
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setViewMode('info')}>
                    View Info
                  </Button>
                  <Button variant="outline" size="sm">
                    Leave
                  </Button>
                </div>
              </div>

              {viewMode === 'messages' ? (
                <>
                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.map((message) => (
                      <MessageItem
                        key={message.id}
                        message={message}
                        onReply={() => {}}
                        onEdit={() => {}}
                        onDelete={() => {}}
                        onReact={() => handleReact(message.id)}
                      />
                    ))}
                    {!messages.length && (
                      <div className="text-center py-16 text-gray-400">
                        <p>No messages yet</p>
                      </div>
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200 bg-white">
                    <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-2">
                      <div className="flex-1 relative">
                        <Input
                          placeholder={`Message ${selectedChannel.name}...`}
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          className="w-full pr-10 py-2 border border-gray-300 rounded focus:outline-none focus:border-campus-primary"
                        />
                        <FileUploader onFilesAdded={setFiles} disabled={!newMessage.trim()} />
                      </div>
                      <Button 
                        type="submit" 
                        variant="primary" 
                        size="sm"
                        disabled={!newMessage.trim() && !files.length}
                      >
                        Send
                      </Button>
                    </form>
                    {files.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {files.map(file => (
                          <div key={file.id} className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{file.type.startsWith('image/') ? '🖼️' : '📄'}</span>
                            <span className="truncate">{file.name}</span>
                            <Button variant="ghost" size="sm" onClick={() => setFiles(files.filter(f => f.id !== file.id))}>
                              ✕
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 p-6">
                  <h4 className="text-lg font-medium text-campus-secondary mb-4">Channel Info</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-campus-primary bg-opacity-10 flex items-center justify-center text-2xl">
                        {selectedChannel.name[1].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{selectedChannel.name}</p>
                        <p className="text-sm text-gray-500">{selectedChannel.description}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">View Members</Button>
                    <Button variant="outline" size="sm">Pin Channel</Button>
                    <Button variant="outline" size="sm">View Online Users</Button>
                    <Button variant="outline" size="sm">Mute Channel</Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path className="w-12 h-12" d="M5 5h14a2 2 0 012 2v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V7a2 2 0 01-2-2z"/>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">Select a channel</h3>
              <p className="text-sm text-gray-400">Start conversations in one of the campus channels</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupChannelView;