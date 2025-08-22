const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');

const dev = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 3000;

const app = next({ dev });
const handle = app.getRequestHandler();

// Store rooms and users in memory
const rooms = new Map();
const users = new Map();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? [process.env.FRONTEND_URL || "https://*.fly.dev", "https://*.fly.app"] 
        : ["http://localhost:3000", "http://127.0.0.1:3000"],
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Create a new room
    socket.on('create-room', (data) => {
      const { username, maxUsers = 10 } = data;
      const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const room = {
        id: roomCode,
        maxUsers: parseInt(maxUsers),
        users: new Map(),
        messages: [],
        createdAt: new Date()
      };
      
      rooms.set(roomCode, room);
      
      // Add user to room
      const user = {
        id: socket.id,
        username,
        roomCode
      };
      
      users.set(socket.id, user);
      room.users.set(socket.id, user);
      
      socket.join(roomCode);
      
      socket.emit('room-created', {
        roomCode,
        user,
        room: {
          id: room.id,
          maxUsers: room.maxUsers,
          currentUsers: room.users.size,
          messages: room.messages
        }
      });
      
      socket.to(roomCode).emit('user-joined', {
        user,
        currentUsers: room.users.size
      });
      
      console.log(`Room ${roomCode} created by ${username}`);
    });

    // Join an existing room
    socket.on('join-room', (data) => {
      const { roomCode, username } = data;
      const room = rooms.get(roomCode.toUpperCase());
      
      if (!room) {
        socket.emit('room-error', { message: 'Room not found' });
        return;
      }
      
      if (room.users.size >= room.maxUsers) {
        socket.emit('room-error', { message: 'Room is full' });
        return;
      }
      
      // Check if username is already taken in this room
      const existingUser = Array.from(room.users.values()).find(u => u.username === username);
      if (existingUser) {
        socket.emit('room-error', { message: 'Username already taken in this room' });
        return;
      }
      
      const user = {
        id: socket.id,
        username,
        roomCode: room.id
      };
      
      users.set(socket.id, user);
      room.users.set(socket.id, user);
      
      socket.join(room.id);
      
      socket.emit('room-joined', {
        roomCode: room.id,
        user,
        room: {
          id: room.id,
          maxUsers: room.maxUsers,
          currentUsers: room.users.size,
          messages: room.messages
        }
      });
      
      socket.to(room.id).emit('user-joined', {
        user,
        currentUsers: room.users.size
      });
      
      console.log(`${username} joined room ${room.id}`);
    });

    // Send message
    socket.on('send-message', (data) => {
      const user = users.get(socket.id);
      if (!user) return;
      
      const room = rooms.get(user.roomCode);
      if (!room) return;
      
      const message = {
        id: uuidv4(),
        text: data.message,
        username: user.username,
        timestamp: new Date(),
        userId: socket.id
      };
      
      room.messages.push(message);
      
      // Keep only last 100 messages
      if (room.messages.length > 100) {
        room.messages = room.messages.slice(-100);
      }
      
      io.to(user.roomCode).emit('new-message', message);
      
      console.log(`Message from ${user.username} in room ${user.roomCode}: ${data.message}`);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      const user = users.get(socket.id);
      if (user) {
        const room = rooms.get(user.roomCode);
        if (room) {
          room.users.delete(socket.id);
          
          socket.to(user.roomCode).emit('user-left', {
            user,
            currentUsers: room.users.size
          });
          
          // Delete room if empty
          if (room.users.size === 0) {
            rooms.delete(user.roomCode);
            console.log(`Room ${user.roomCode} deleted (empty)`);
          }
        }
        
        users.delete(socket.id);
        console.log(`${user.username} disconnected from room ${user.roomCode}`);
      }
      
      console.log('User disconnected:', socket.id);
    });
  });

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, '0.0.0.0', () => {
      console.log(`> Ready on http://0.0.0.0:${port}`);
    });
});