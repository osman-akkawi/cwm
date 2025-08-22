'use client';

import { useState } from 'react';
import { useSocket } from '@/contexts/SocketContext';

const RoomForm = () => {
  const [mode, setMode] = useState<'join' | 'create'>('join');
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [maxUsers, setMaxUsers] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  
  const { createRoom, joinRoom, error, isConnected } = useSocket();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      return;
    }
    
    setIsLoading(true);
    
    if (mode === 'create') {
      createRoom(username.trim(), maxUsers);
    } else {
      if (!roomCode.trim()) {
        setIsLoading(false);
        return;
      }
      joinRoom(roomCode.trim(), username.trim());
    }
    
    // Reset loading state after a delay to allow for server response
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex bg-gray-100 rounded-lg p-1">
        <button
          type="button"
          onClick={() => setMode('join')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            mode === 'join'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Join Room
        </button>
        <button
          type="button"
          onClick={() => setMode('create')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            mode === 'create'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Create Room
        </button>
      </div>

      {/* Connection Status */}
      <div className="flex items-center justify-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${
          isConnected ? 'bg-green-500' : 'bg-red-500'
        }`} />
        <span className="text-sm text-gray-600">
          {isConnected ? 'Connected' : 'Connecting...'}
        </span>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Username Input */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            Your Name
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            maxLength={20}
            disabled={isLoading || !isConnected}
          />
        </div>

        {/* Room Code Input (Join Mode) */}
        {mode === 'join' && (
          <div>
            <label htmlFor="roomCode" className="block text-sm font-medium text-gray-700 mb-1">
              Room Code
            </label>
            <input
              type="text"
              id="roomCode"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="Enter room code"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
              required
              maxLength={6}
              disabled={isLoading || !isConnected}
            />
          </div>
        )}

        {/* Max Users Input (Create Mode) */}
        {mode === 'create' && (
          <div>
            <label htmlFor="maxUsers" className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Users (2-50)
            </label>
            <input
              type="number"
              id="maxUsers"
              value={maxUsers}
              onChange={(e) => setMaxUsers(Math.max(2, Math.min(50, parseInt(e.target.value) || 2)))}
              min="2"
              max="50"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading || !isConnected}
            />
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !isConnected || !username.trim() || (mode === 'join' && !roomCode.trim())}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>{mode === 'create' ? 'Creating...' : 'Joining...'}</span>
            </div>
          ) : (
            mode === 'create' ? 'Create Room' : 'Join Room'
          )}
        </button>
      </form>

      {/* Instructions */}
      <div className="text-center text-sm text-gray-500">
        {mode === 'create' ? (
          <p>Create a new room and share the code with friends</p>
        ) : (
          <p>Enter the room code shared by your friend</p>
        )}
      </div>
    </div>
  );
};

export default RoomForm;