'use client';

import { useState } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import ChatRoom from '@/components/ChatRoom';
import RoomForm from '@/components/RoomForm';

export default function Home() {
  const { user, room } = useSocket();

  if (user && room) {
    return <ChatRoom />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Chat App</h1>
          <p className="text-gray-600">Join or create a chat room to get started</p>
        </div>
        <RoomForm />
      </div>
    </div>
  );
}
