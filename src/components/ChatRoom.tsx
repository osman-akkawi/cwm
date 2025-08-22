'use client';

import { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import MessageList from '@/components/MessageList';
import MessageInput from '@/components/MessageInput';

const ChatRoom = () => {
  const { user, room, leaveRoom, isConnected } = useSocket();
  const [showRoomInfo, setShowRoomInfo] = useState(false);

  const handleLeaveRoom = () => {
    if (confirm('Are you sure you want to leave the room?')) {
      leaveRoom();
    }
  };

  const copyRoomCode = () => {
    if (room?.id) {
      navigator.clipboard.writeText(room.id);
      // You could add a toast notification here
      alert('Room code copied to clipboard!');
    }
  };

  if (!user || !room) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-xl font-semibold text-gray-800">
                  Room: {room.id}
                </h1>
                <p className="text-sm text-gray-600">
                  {room.currentUsers} / {room.maxUsers} users
                </p>
              </div>
              
              {/* Connection Status */}
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span className="text-xs text-gray-500">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Room Info Button */}
              <button
                onClick={() => setShowRoomInfo(!showRoomInfo)}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                title="Room Info"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>

              {/* Copy Room Code Button */}
              <button
                onClick={copyRoomCode}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                title="Copy Room Code"
              >
                Copy Code
              </button>

              {/* Leave Room Button */}
              <button
                onClick={handleLeaveRoom}
                className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
              >
                Leave
              </button>
            </div>
          </div>

          {/* Room Info Panel */}
          {showRoomInfo && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
              <h3 className="font-medium text-gray-800 mb-2">Room Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Room Code:</span>
                  <span className="ml-2 font-mono font-semibold">{room.id}</span>
                </div>
                <div>
                  <span className="text-gray-600">Your Name:</span>
                  <span className="ml-2 font-semibold">{user.username}</span>
                </div>
                <div>
                  <span className="text-gray-600">Users Online:</span>
                  <span className="ml-2">{room.currentUsers} / {room.maxUsers}</span>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <span className={`ml-2 ${
                    isConnected ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        {/* Messages */}
        <div className="flex-1 overflow-hidden">
          <MessageList />
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-200 bg-white">
          <div className="px-4 py-3">
            <MessageInput />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;