'use client';

import { useEffect, useRef } from 'react';
import { useSocket } from '@/contexts/SocketContext';

interface Message {
  id: string;
  text: string;
  username: string;
  timestamp: Date;
  userId: string;
}

const MessageList = () => {
  const { messages, user } = useSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (timestamp: Date | string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const isOwnMessage = (message: Message) => {
    return message.userId === user?.id;
  };

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center text-gray-500">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-lg font-medium mb-2">No messages yet</p>
          <p className="text-sm">Be the first to start the conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto p-4 space-y-4"
      style={{ maxHeight: 'calc(100vh - 200px)' }}
    >
      {messages.map((message) => {
        const isOwn = isOwnMessage(message);
        
        return (
          <div
            key={message.id}
            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${
              isOwn ? 'order-2' : 'order-1'
            }`}>
              {/* Message Bubble */}
              <div className={`rounded-lg px-4 py-2 ${
                isOwn 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white border border-gray-200 text-gray-800'
              }`}>
                {/* Username (only for others' messages) */}
                {!isOwn && (
                  <div className="text-xs font-medium text-gray-600 mb-1">
                    {message.username}
                  </div>
                )}
                
                {/* Message Text */}
                <div className="text-sm leading-relaxed break-words">
                  {message.text}
                </div>
                
                {/* Timestamp */}
                <div className={`text-xs mt-1 ${
                  isOwn ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
            
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
              isOwn 
                ? 'order-1 mr-2 bg-blue-600 text-white' 
                : 'order-2 ml-2 bg-gray-300 text-gray-700'
            }`}>
              {isOwn ? 'You' : message.username.charAt(0).toUpperCase()}
            </div>
          </div>
        );
      })}
      
      {/* Auto-scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;