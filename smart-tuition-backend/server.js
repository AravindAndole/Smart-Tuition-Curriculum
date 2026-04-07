const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();
const http = require('http');
const server = http.createServer(app);

// Initialize Socket.io
const initSocket = require('./socket');
initSocket(server);

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/fees', require('./routes/feeRoutes'));
app.use('/api/chat', chatRoutes);
app.use('/api/student', require('./routes/studentRoutes'));
app.use('/api/notices', require('./routes/noticeRoutes'));
app.use('/api/teacher', require('./routes/teacherRoutes'));
app.use('/api/homework', require('./routes/homeworkRoutes'));

app.get('/', (req, res) => {
    res.send('Smart Tuition System API Phase 1 is running');
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smart-tuition')
    .then(() => {
        console.log('MongoDB connected');
        server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });
