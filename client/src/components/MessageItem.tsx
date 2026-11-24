import React, { useState } from 'react';
import { Button, Input } from '../components/ui';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  imageUrl?: string;
  fileUrl?: string;
  isDeleted?: boolean;
  replies?: Message[];
  reactions: { emoji: string; count: number; userReacted: boolean }[];
}

const ReactionBar = ({ reactions, onReact }: { reactions: any; onReact: () => void }) => {
  return (
    <div className="flex items-center gap-1 mt-1">
      {reactions.map((reaction: any, index: number) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          onClick={onReact}
          className={`rounded-full px-2 py-0.5 text-xs ${reaction.userReacted ? 'bg-campus-primary text-white' : ''}`}
        >
          {reaction.emoji} {reaction.count}
        </Button>
      ))}
    </div>
  );
};

const MessageItem = ({ message, onReply, onEdit, onDelete, onReact, isSelected }: {
  message: Message;
  onReply: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onReact: () => void;
  isSelected?: boolean;
}) => {
  const [showActions, setShowActions] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this message?')) {
      onDelete();
    }
  };

  return (
    <div
      className={`max-w-[75%] ${message.senderId === 'current-user' ? 'ml-auto' : 'mr-auto'} group`}
    >
      {message.replies && message.replies.length > 0 && (
        <div className="mb-1 ml-4 border-l-2 border-gray-200 pl-3">
          <p className="text-xs text-gray-500 font-medium">Replying to someone's message...</p>
        </div>
      )}
      
      <div
        className={`rounded-xl p-4 border transition-all ${
          message.senderId === 'current-user' 
            ? 'bg-campus-primary text-white' 
            : 'bg-white border-gray-200 text-gray-800'
        } ${isSelected ? 'ring-2 ring-campus-primary' : ''}`}
      >
        {/* Message Content */}
        <div className="flex space-y-2">
          {message.imageUrl && (
            <img
              src={message.imageUrl}
              alt="Sent image"
              className="rounded-lg max-w-xs cursor-pointer hover:opacity-80 transition"
            />
          )}
          {message.fileUrl && (
            <a href={message.fileUrl} target="_blank" rel="noopener noreferrer">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded border border-gray-100">
                <span className="text-2xl">📄</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">File.pdf</p>
                  <p className="text-xs text-gray-500">1.2 MB</p>
                </div>
              </div>
            </a>
          )}
          
          {!message.isDeleted && !message.imageUrl && !message.fileUrl && (
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          )}
          
          {message.isDeleted && (
            <p className="text-sm italic text-gray-400">This message has been deleted</p>
          )}
        </div>
        
        {/* Timestamp */}
        <div className={`flex items-center gap-2 mt-2 text-xs ${
          message.senderId === 'current-user' ? 'justify-end text-white text-opacity-70' : 'text-gray-400'
        }`}>
          <span>{message.timestamp.toLocaleTimeString()}</span>
          {message.senderId === 'current-user' && (
            <span>
              {message.status === 'sent' && '• Sent'}
              {message.status === 'delivered' && '• Delivered'}
              {message.status === 'read' && '• Read'}
            </span>
          )}
        </div>
        
        {/* Reactions */}
        <ReactionBar reactions={message.reactions} onReact={onReact} />
        
        {/* Action Buttons */}
        <div className={`flex items-center gap-1 mt-2 ${
          message.senderId === 'current-user' ? 'justify-end' : 'justify-start'
        }`}>
          <div className={`opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 ${
            message.senderId === 'current-user' ? 'justify-end' : 'justify-start'
          }`}>
            {message.senderId === 'current-user' && (
              <>
                <Button variant="outline" size="sm" className="px-2 py-1" onClick={onEdit}>
                  ✏️ Edit
                </Button>
                <Button variant="outline" size="sm" className="px-2 py-1" onClick={handleDelete}>
                  🗑️ Delete
                </Button>
              </>
            )}
            <Button variant="outline" size="sm" className="px-2 py-1" onClick={onReply}>
              ↩️ Reply
            </Button>
          </div>
        </div>
      </div>
      
      {/* Replies */}
      {message.replies && message.replies.length > 0 && (
        <div className="ml-8 mt-2 space-y-2 border-l-2 border-gray-100 pl-3">
          {message.replies.map((reply) => (
            <MessageItem
              key={reply.id}
              message={reply}
              onReply={() => {}}
              onEdit={() => {}}
              onDelete={() => {}}
              onReact={() => {}}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MessageItem;