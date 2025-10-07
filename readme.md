# 🎥 Random Video Chat Platform

A free, open-source Omegle-style random video chat application built with WebRTC, Socket.io, and Node.js.

## ✨ Features

- 🎯 **Random Matching** - Instantly connect with strangers worldwide
- 📹 **Video & Audio** - High-quality peer-to-peer streaming
- 💬 **Text Chat** - Send messages during video calls
- ⏭️ **Skip/Next** - Move to next partner instantly
- 🔒 **No Authentication** - No signup required, completely anonymous
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🆓 **100% Free** - No ads, no premium features

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js, Express
- **Real-time**: Socket.io
- **Video/Audio**: WebRTC
- **STUN Server**: Google's free STUN servers

## 📁 Project Structure

```
random-video-chat/
├── server.js              # Backend server & Socket.io logic
├── public/
│   ├── index.html        # Main UI
│   ├── style.css         # Styling
│   └── client.js         # WebRTC & Socket.io client
├── package.json          # Dependencies
├── README.md            # This file
└── DEPLOYMENT.md        # Deployment guide
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- Modern browser (Chrome, Firefox, Safari, Edge)
- Camera and microphone

### Installation

1. **Clone or create the project**:
```bash
mkdir random-video-chat
cd random-video-chat
```

2. **Create all files** (use the artifacts provided above):
   - `server.js`
   - `package.json`
   - Create `public/` folder
   - `public/index.html`
   - `public/style.css`
   - `public/client.js`

3. **Install dependencies**:
```bash
npm install
```

4. **Start the server**:
```bash
npm start
```

5. **Open in browser**:
   - Go to `http://localhost:3000`
   - Open in another browser/tab to test
   - Allow camera/microphone permissions
   - Click "Start" on both windows

## 🎮 How to Use

1. **Start**: Click the "Start" button to begin searching for a partner
2. **Wait**: The system will match you with another available user
3. **Chat**: Once connected, you can video chat and send text messages
4. **Next**: Click "Next" to skip to another random person
5. **Stop**: Click "Stop" to end your session

## 🔧 Configuration

### Change Port
Edit `server.js`:
```javascript
const PORT = process.env.PORT || 3000; // Change 3000 to your preferred port
```

### Add More STUN Servers
Edit `client.js`:
```javascript
const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }, // Add more
  ]
};
```

### Add TURN Server (for better connectivity)
```javascript
const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    {
      urls: 'turn:your-turn-server.com:3478',
      username: 'username',
      credential: 'password'
    }
  ]
};
```

## 🌐 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions on:
- Render.com (Recommended)
- Railway.app
- Fly.io
- Glitch.com
- Cyclic.sh
- Self-hosting (Oracle Cloud, DigitalOcean, etc.)

**Quick Deploy to Render**:
1. Push code to GitHub
2. Go to https://render.com
3. New Web Service → Connect GitHub
4. Deploy!

## 📊 How It Works

### Architecture
```
User A                Server               User B
  |                     |                    |
  |---> find-partner -->|                    |
  |                     |<--- find-partner --|
  |<--- partner-found --|                    |
  |                     |--- partner-found ->|
  |                     |                    |
  |------ offer ------->|                    |
  |                     |------- offer ----->|
  |                     |<------ answer -----|
  |<----- answer -------|                    |
  |                     |                    |
  |<======= WebRTC P2P Connection =========>|
  |           (Video/Audio Stream)          |
  |                     |                    |
  |--- chat-message --->|                    |
  |                     |--- chat-message -->|
```

### WebRTC Flow
1. User requests media permissions (camera/mic)
2. User clicks "Start" and joins waiting pool
3. Server matches two waiting users
4. Users exchange SDP offers/answers via Socket.io
5. Users exchange ICE candidates
6. Direct P2P connection established
7. Video/audio streams directly between users (not through server!)

## 🔐 Security Considerations

⚠️ **Important**: This is a basic implementation. For production use, consider:

- **Content Moderation**: Implement AI-based inappropriate content detection
- **User Reports**: Add reporting and blocking features
- **Rate Limiting**: Prevent spam and abuse
- **Age Verification**: Add age gates if required by law
- **HTTPS Only**: Always use HTTPS in production
- **Privacy Policy**: Create and display a privacy policy
- **Terms of Service**: Define acceptable use

## 🐛 Troubleshooting

### Camera/Mic Not Working
- Ensure you're using HTTPS (required for WebRTC)
- Check browser permissions
- Try a different browser

### Not Connecting to Partner
- Check browser console for errors
- Verify Socket.io connection
- Test with local network first
- May need TURN server for strict NAT/firewalls

### Page Not Loading
- Check if server is running: `npm start`
- Verify port 3000 is not in use
- Check firewall settings

### Socket Disconnects Frequently
- Check server logs
- May need to configure Socket.io timeouts
- Ensure stable internet connection

## 📈 Performance Tips

- **Use TURN Server**: For users behind strict NAT/firewalls (70-80% work with STUN only)
- **Load Balancing**: Use Socket.io Redis adapter for multiple servers
- **CDN**: Serve static files via CDN
- **Compression**: Enable gzip compression
- **Monitoring**: Use PM2 or similar for process management

## 🤝 Contributing

This is an open-source educational project. Feel free to:
- Fork and modify
- Submit issues
- Create pull requests
- Share improvements

## ⚖️ Legal & Safety

**Important Notices**:
- This platform connects strangers anonymously
- Users may encounter inappropriate content
- Implement moderation for public deployment
- Comply with local laws regarding online platforms
- Consider age restrictions and parental controls
- Omegle shut down in 2023 due to moderation challenges

**Use responsibly and ensure proper safety measures before public launch.**

## 📝 License

MIT License - Feel free to use for learning, personal projects, or commercial use.

## 🙏 Credits

Built with:
- [Socket.io](https://socket.io/) - Real-time communication
- [WebRTC](https://webrtc.org/) - Peer-to-peer video/audio
- [Express](https://expressjs.com/) - Web framework

## 📞 Support

For issues or questions:
- Check the console for errors (F12)
- Review the code comments
- Test locally before deploying
- Refer to [DEPLOYMENT.md](DEPLOYMENT.md) for hosting help

## 🎯 Roadmap / Future Features

- [ ] Room codes for private chats
- [ ] Interest tags/filtering
- [ ] Gender filter
- [ ] Country/language filter
- [ ] Screen sharing
- [ ] File sharing
- [ ] Emoji reactions
- [ ] User count display
- [ ] Chat history (optional)
- [ ] Better mobile experience
- [ ] Dark/light mode toggle

---

**Star ⭐ this project if you find it useful!**

**Happy coding! 🚀**