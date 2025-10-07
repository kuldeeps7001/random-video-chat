const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const path = require('path');

// Serve static files
app.use(express.static('public'));

// Store waiting users
let waitingUser = null;
let activeRooms = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user looking for chat
  socket.on('find-partner', () => {
    if (waitingUser && waitingUser !== socket.id) {
      // Match with waiting user
      const room = `room-${Date.now()}`;
      const partner = waitingUser;
      
      socket.join(room);
      io.sockets.sockets.get(partner).join(room);
      
      // Store room info
      activeRooms.set(socket.id, { room, partner });
      activeRooms.set(partner, { room, partner: socket.id });
      
      // Notify both users
      io.to(partner).emit('partner-found', { room, initiator: true });
      socket.emit('partner-found', { room, initiator: false });
      
      waitingUser = null;
      console.log(`Matched: ${socket.id} with ${partner} in ${room}`);
    } else {
      // Add to waiting list
      waitingUser = socket.id;
      socket.emit('waiting');
      console.log('User waiting:', socket.id);
    }
  });

  // WebRTC signaling
  socket.on('offer', (data) => {
    const roomInfo = activeRooms.get(socket.id);
    if (roomInfo) {
      io.to(roomInfo.partner).emit('offer', data);
    }
  });

  socket.on('answer', (data) => {
    const roomInfo = activeRooms.get(socket.id);
    if (roomInfo) {
      io.to(roomInfo.partner).emit('answer', data);
    }
  });

  socket.on('ice-candidate', (data) => {
    const roomInfo = activeRooms.get(socket.id);
    if (roomInfo) {
      io.to(roomInfo.partner).emit('ice-candidate', data);
    }
  });

  // Text chat
  socket.on('chat-message', (message) => {
    const roomInfo = activeRooms.get(socket.id);
    if (roomInfo) {
      io.to(roomInfo.partner).emit('chat-message', message);
    }
  });

  // Skip to next partner
  socket.on('skip-partner', () => {
    handleDisconnect(socket, true);
  });

  // Disconnect handler
  socket.on('disconnect', () => {
    handleDisconnect(socket, false);
    console.log('User disconnected:', socket.id);
  });

  function handleDisconnect(socket, isSkip) {
    const roomInfo = activeRooms.get(socket.id);
    
    if (roomInfo) {
      // Notify partner
      io.to(roomInfo.partner).emit('partner-disconnected');
      
      // Clean up room info
      activeRooms.delete(socket.id);
      activeRooms.delete(roomInfo.partner);
      
      socket.leave(roomInfo.room);
      const partnerSocket = io.sockets.sockets.get(roomInfo.partner);
      if (partnerSocket) {
        partnerSocket.leave(roomInfo.room);
      }
    }
    
    // Remove from waiting list
    if (waitingUser === socket.id) {
      waitingUser = null;
    }
  }
});

const PORT = process.env.PORT || 3005;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});