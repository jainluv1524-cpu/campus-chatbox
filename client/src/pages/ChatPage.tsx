import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Card, Input, Button, Badge } from '../components';
import { Card as ChatCard } from '../components/ui';
import { useToast } from '../components/ToastProvider';
import { sendMessage } from '../services/socketService';
import { login, register } from '../store/store';

const ChatPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessageContent, setNewMessageContent] = useState('');
  const [isWriting, setIsWriting] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();

  // Initialize Socket.IO connection
  useEffect(() => {
    if (user) {
      // Initialize socket connection
      const socket = require('socket.io-client')('http://localhost:3002');
      
      socket.on('connect', () => {
        console.log('Connected to Socket.IO server');
      });
      
      socket.on('receive-message', (message) => {
        setMessages(prev => [...prev, message]);
        toast({
          title: 'New Message',
          description: message.sender?.name || 'Someone sent you a message',
          variant: 'success',
        });
      });

      socket.on('user-status', (data) => {
        console.log('User status:', data);
      });

      socket.on('disconnect', () => {
        console.log('Disconnected from Socket.IO');
      });

      // Cleanup on unmount
      return () => socket.disconnect();
    }
  }, [user]);

  // Load conversations when user changes
  useEffect(() => {
    if (user) {
      setConversations([
        {
          id: 1,
          name: 'John Doe',
          avatar: '',
          lastMessage: 'Hey, how are you?',
          lastMessageTime: '2:30 PM',
          unreadCount: 2,
          online: true,
        },
        {
          id: 2,
          name: 'Sarah Smith',
          avatar: '',
          lastMessage: 'See you at the campus event',
          lastMessageTime: '1:45 PM',
          unreadCount: 0,
          online: false,
        },
        {
          id: 3,
          name: 'Mike Johnson',
          avatar: '',
          lastMessage: 'Project meeting tomorrow?',
          lastMessageTime: '12:00 PM',
          unreadCount: 1,
          online: true,
        },
      ]);
    }
  }, [user]);

  // Load messages when conversation changes
  useEffect(() => {
    if (selectedConversation) {
      setMessages([
        { id: 1, content: 'Welcome to Campus Chatbox!', sender: { name: 'System', avatar: '' }, timestamp: new Date(), status: 'read' },
      ]);
    }
  }, [selectedConversation]);

  // Handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessageContent.trim() || !selectedConversation) {
      return;
    }

    const messageContent = newMessageContent.trim();
    setNewMessageContent('');
    
    // Create message object
    const message = {
      id: Date.now().toString(),
      content: messageContent,
      sender: { name: user.displayName || 'You', avatar: user.profilePictureUrl },
      timestamp: new Date(),
      status: 'sent',
    };

    setMessages(prev => [...prev, message]);
    
    // Send via Socket.IO
    try {
      const socket = require('socket.io-client')('http://localhost:3002');
      socket.emit('send-message', {
        conversationId: selectedConversation.id,
        senderId: user.id,
        receiverId: selectedConversation.id,
        content: messageContent,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'error',
      });
    }
  };

  // Handle input change with typing indicator
  const handleInputChange = (e) => {
    setNewMessageContent(e.target.value);
    if (!isWriting && selectedConversation) {
      setIsWriting(true);
      setTimeout(() => setIsWriting(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex h-full">
      {/* Left Sidebar - Conversations */}
      <div className="hidden md:flex flex-col border-r border-gray-200 bg-white w-80">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-medium text-campus-secondary">Messages</h3>
          <Button variant="outline" size="sm" onClick={() => navigate('/campus/directory')}>
            <span className="w-4 h-4 rounded flex items-center justify-center">
              <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path className="w-3 h-3" d="M5 3v14l5-5.5L19 17l5-5.5V3z"/>
              </svg>
            </span>
            New
          </Button>
        </div>
        
        <div className="overflow-y-auto p-3">
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No conversations yet</p>
              <p className="mt-2">Start a new conversation</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <Button
                key={conv.id}
                variant={selectedConversation?.id === conv.id ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSelectedConversation(conv)}
                className={`w-full justify-start px-3 py-2 text-sm rounded-lg ${selectedConversation?.id === conv.id ? 'bg-campus-primary text-white' : ''}`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                      {conv.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium truncate">{conv.name}</div>
                      <div className="text-xs text-gray-500 truncate">{conv.lastMessage}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant={conv.online ? 'primary' : 'default'}>{conv.online ? 'Online' : 'Offline'}</Badge>
                    {conv.unreadCount > 0 && <Badge variant="danger">{conv.unreadCount}</Badge>}
                  </div>
                </div>
              </Button>
            ))
          )}
        </div>
      </div>

      {/* Right Panel - Chat */}
      <div className="flex-1 flex flex-col h-full">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                  {selectedConversation.name.charAt(0)}
                </div>
                <div>
                  <div className="font-medium text-gray-800">{selectedConversation.name}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${selectedConversation.online ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                    {selectedConversation.online ? 'Online' : 'Offline'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path className="w-4 h-4" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                  </svg>
                </Button>
                <Button variant="outline" size="sm">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path className="w-4 h-4" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v-.343C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                  </svg>
                </Button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`max-w-[75%] ${message.sender.name === 'You' ? 'ml-auto' : 'mr-auto'}`}>
                  <div className={`p-3 rounded-xl ${message.sender.name === 'You' ? 'bg-campus-primary text-white' : 'bg-white border border-gray-200 text-gray-800'}`}>
                    <div className={`flex space-y-1 ${message.sender.name === 'You' ? 'justify-end' : ''}`}>
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs text-gray-400">{message.timestamp ? message.timestamp.toLocaleTimeString() : ''}</p>
                    </div>
                  </div>
                </div>
              ))}
              {!messages.length && (
                <div className="text-center py-16 text-gray-400">
                  <p>No messages yet</p>
                  <p className="mt-2">Start a conversation</p>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessageContent}
                  onChange={handleInputChange}
                  disabled={isWriting}
                  className="flex-1 rounded-l border border-gray-300 py-2 px-3"
                  maxHeight="120"
                />
                <Button variant="primary" size="sm" onClick={handleSendMessage} disabled={!newMessageContent.trim() || !selectedConversation}>
                  Send
                </Button>
              </form>
              {isWriting && (
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
                  <span>{user.displayName || 'You'} is typing...</span>
                </div>
              )}
            </div>
          </>
        ) : (
          {/* No Conversation Selected */}
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path className="w-12 h-12" d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-600">Select a conversation</h3>
            <p className="text-sm text-gray-400 mt-1">Your messages will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;