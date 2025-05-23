const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const protectedRoutes = require('./routes/protectedRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const exploreRoutes = require('./routes/explore');
const profileRoutes = require('./routes/profileRoutes');
const followRoutes = require('./routes/followRoutes');
const commentRoutes = require('./routes/commentRoutes');
const commentLikeRoutes = require('./routes/commentLikeRoutes');
const commentDislikeRoutes = require('./routes/commentDislikeRoutes');
const messageRoutes = require('./routes/messageRoutes');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Statik klasör: uploads klasöründeki dosyaları tarayıcıdan erişilebilir yap
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// WebSocket sunucusunu oluştur
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});
app.set('io', io);

// Middleware'ler
app.use(cors());
app.use(express.json());

// WebSocket bağlantı yönetimi
io.on('connection', (socket) => {
  console.log('Yeni bir kullanıcı bağlandı:', socket.id);
  socket.on('user_connected', (userId) => {
    socket.join(`user_${userId}`);
  });
  socket.on('disconnect', () => {
    console.log('Kullanıcı ayrıldı:', socket.id);
  });
});

// Route'lar
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);
app.use('/api', protectedRoutes);
app.use('/api', uploadRoutes);
app.use('/api', profileRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/explore', exploreRoutes);
app.use('/api/follow', followRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/comment-likes', commentLikeRoutes);
app.use('/api/comment-dislikes', commentDislikeRoutes);

// Ana endpoint
app.get('/', (req, res) => {
  res.send('TalentHub Backend Çalışıyor!');
});

server.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
}); 