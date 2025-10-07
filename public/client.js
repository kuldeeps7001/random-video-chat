// Initialize Socket.io
const socket = io();

// DOM Elements
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const startBtn = document.getElementById('startBtn');
const nextBtn = document.getElementById('nextBtn');
const stopBtn = document.getElementById('stopBtn');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const chatMessages = document.getElementById('chatMessages');
const statusOverlay = document.getElementById('statusOverlay');
const statusMessage = document.getElementById('statusMessage');
const connectionStatus = document.getElementById('connectionStatus');

// WebRTC Configuration
const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

// State
let localStream = null;
let peerConnection = null;
let isConnected = false;
let currentRoom = null;

// Initialize
async function init() {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ 
      video: true, 
      audio: true 
    });
    localVideo.srcObject = localStream;
    startBtn.disabled = false;
    updateStatus('Ready to start', 'offline');
  } catch (error) {
    console.error('Error accessing media devices:', error);
    updateStatus('Camera/Microphone access denied', 'offline');
    alert('Please allow camera and microphone access to use this app');
  }
}

// Update UI Status
function updateStatus(message, status) {
  statusMessage.textContent = message;
  connectionStatus.textContent = status.charAt(0).toUpperCase() + status.slice(1);
  connectionStatus.className = `status-${status}`;
}

// Start looking for partner
startBtn.addEventListener('click', () => {
  socket.emit('find-partner');
  startBtn.disabled = true;
  nextBtn.disabled = true;
  stopBtn.disabled = false;
  updateStatus('Looking for someone...', 'connecting');
  statusOverlay.classList.remove('hidden');
});

// Skip to next partner
nextBtn.addEventListener('click', () => {
  socket.emit('skip-partner');
  cleanup();
  socket.emit('find-partner');
  updateStatus('Looking for someone...', 'connecting');
  statusOverlay.classList.remove('hidden');
  nextBtn.disabled = true;
});

// Stop chat
stopBtn.addEventListener('click', () => {
  socket.emit('skip-partner');
  cleanup();
  startBtn.disabled = false;
  nextBtn.disabled = true;
  stopBtn.disabled = true;
  updateStatus('Click "Start" to begin chatting', 'offline');
  statusOverlay.classList.remove('hidden');
});

// Socket Events
socket.on('waiting', () => {
  updateStatus('Waiting for someone to join...', 'connecting');
});

socket.on('partner-found', async (data) => {
  currentRoom = data.room;
  updateStatus('Partner found! Connecting...', 'connecting');
  
  // Enable chat
  chatInput.disabled = false;
  sendBtn.disabled = false;
  nextBtn.disabled = false;
  
  // Create peer connection
  createPeerConnection();
  
  // Add local stream
  localStream.getTracks().forEach(track => {
    peerConnection.addTrack(track, localStream);
  });
  
  // If initiator, create offer
  if (data.initiator) {
    try {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      socket.emit('offer', { offer, room: currentRoom });
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  }
});

socket.on('offer', async (data) => {
  try {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.emit('answer', { answer, room: currentRoom });
  } catch (error) {
    console.error('Error handling offer:', error);
  }
});

socket.on('answer', async (data) => {
  try {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
  } catch (error) {
    console.error('Error handling answer:', error);
  }
});

socket.on('ice-candidate', async (data) => {
  try {
    await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
  } catch (error) {
    console.error('Error adding ICE candidate:', error);
  }
});

socket.on('partner-disconnected', () => {
  addSystemMessage('Partner disconnected');
  cleanup();
  updateStatus('Partner disconnected. Click "Next" or "Stop"', 'offline');
  statusOverlay.classList.remove('hidden');
  startBtn.disabled = true;
  nextBtn.disabled = false;
  stopBtn.disabled = false;
});

// Create Peer Connection
function createPeerConnection() {
  peerConnection = new RTCPeerConnection(configuration);
  
  // Handle ICE candidates
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit('ice-candidate', { 
        candidate: event.candidate, 
        room: currentRoom 
      });
    }
  };
  
  // Handle remote stream
  peerConnection.ontrack = (event) => {
    remoteVideo.srcObject = event.streams[0];
    statusOverlay.classList.add('hidden');
    updateStatus('Connected', 'online');
    isConnected = true;
  };
  
  // Handle connection state
  peerConnection.onconnectionstatechange = () => {
    console.log('Connection state:', peerConnection.connectionState);
    if (peerConnection.connectionState === 'connected') {
      statusOverlay.classList.add('hidden');
      updateStatus('Connected', 'online');
    }
  };
}

// Chat functionality
sendBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});

function sendMessage() {
  const message = chatInput.value.trim();
  if (message && isConnected) {
    socket.emit('chat-message', message);
    addChatMessage(message, 'sent');
    chatInput.value = '';
  }
}

socket.on('chat-message', (message) => {
  addChatMessage(message, 'received');
});

function addChatMessage(message, type) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `chat-message ${type}`;
  messageDiv.textContent = message;
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addSystemMessage(message) {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'system-message';
  messageDiv.textContent = message;
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Cleanup
function cleanup() {
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }
  
  remoteVideo.srcObject = null;
  isConnected = false;
  currentRoom = null;
  
  // Disable chat
  chatInput.disabled = true;
  sendBtn.disabled = true;
  chatInput.value = '';
  
  // Clear chat messages
  chatMessages.innerHTML = '<div class="system-message">Send a message to start chatting...</div>';
}

// Initialize on load
window.addEventListener('load', init);