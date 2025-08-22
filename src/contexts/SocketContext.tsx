'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface User {
  id: string;
  username: string;
  roomCode: string;
}

interface Message {
  id: string;
  text: string;
  username: string;
  timestamp: Date;
  userId: string;
}

interface Room {
  id: string;
  maxUsers: number;
  currentUsers: number;
  messages: Message[];
}

interface SocketContextType {
  socket: Socket | null;
  user: User | null;
  room: Room | null;
  messages: Message[];
  isConnected: boolean;
  createRoom: (username: string, maxUsers: number) => void;
  joinRoom: (roomCode: string, username: string) => void;
  sendMessage: (message: string) => void;
  leaveRoom: () => void;
  error: string | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const socketInstance = io();
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to server');
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from server');
    });

    socketInstance.on('room-created', (data) => {
      setUser(data.user);
      setRoom(data.room);
      setMessages(data.room.messages);
      setError(null);
      console.log('Room created:', data.roomCode);
    });

    socketInstance.on('room-joined', (data) => {
      setUser(data.user);
      setRoom(data.room);
      setMessages(data.room.messages);
      setError(null);
      console.log('Joined room:', data.roomCode);
    });

    socketInstance.on('room-error', (data) => {
      setError(data.message);
      console.error('Room error:', data.message);
    });

    socketInstance.on('new-message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    socketInstance.on('user-joined', (data) => {
      setRoom(prev => prev ? { ...prev, currentUsers: data.currentUsers } : null);
      console.log(`${data.user.username} joined the room`);
    });

    socketInstance.on('user-left', (data) => {
      setRoom(prev => prev ? { ...prev, currentUsers: data.currentUsers } : null);
      console.log(`${data.user.username} left the room`);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const createRoom = (username: string, maxUsers: number) => {
    if (socket) {
      setError(null);
      socket.emit('create-room', { username, maxUsers });
    }
  };

  const joinRoom = (roomCode: string, username: string) => {
    if (socket) {
      setError(null);
      socket.emit('join-room', { roomCode, username });
    }
  };

  const sendMessage = (message: string) => {
    if (socket && message.trim()) {
      socket.emit('send-message', { message: message.trim() });
    }
  };

  const leaveRoom = () => {
    if (socket) {
      socket.disconnect();
      socket.connect();
    }
    setUser(null);
    setRoom(null);
    setMessages([]);
    setError(null);
  };

  const value: SocketContextType = {
    socket,
    user,
    room,
    messages,
    isConnected,
    createRoom,
    joinRoom,
    sendMessage,
    leaveRoom,
    error
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};