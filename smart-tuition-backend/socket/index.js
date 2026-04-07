const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');

const initSocket = (server) => {
    const io = socketIo(server, {
        cors: {
            origin: '*', // For dev purposes, adjust in production
            methods: ['GET', 'POST']
        }
    });

    // Socket Authentication Middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error: No token provided'));
        }
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
            socket.user = decoded; // Attach user info to socket
            next();
        } catch (err) {
            next(new Error('Authentication error: Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`User connected to socket: ${socket.user.id} (${socket.user.role})`);

        // Join a unique room for one-to-one chat
        // Room ID is created by sorting the two user IDs to ensure both users join the same room
        socket.on('join_room', ({ targetUserId }) => {
            const roomIds = [socket.user.id, targetUserId].sort();
            const roomName = `chat_${roomIds[0]}_${roomIds[1]}`;
            socket.join(roomName);
            console.log(`User ${socket.user.id} joined room: ${roomName}`);
        });

        // Handle sending message
        socket.on('send_message', async (data) => {
            try {
                const { receiverId, content } = data;

                // Save to DB
                const newMessage = await Message.create({
                    senderId: socket.user.id,
                    receiverId: receiverId,
                    content: content
                });

                const roomIds = [socket.user.id, receiverId].sort();
                const roomName = `chat_${roomIds[0]}_${roomIds[1]}`;

                // Broadcast to everyone in the room (including sender to confirm receipt, or just receiver)
                io.to(roomName).emit('receive_message', newMessage);

            } catch (err) {
                console.error('Socket send_message error:', err);
                socket.emit('error', 'Failed to send message');
            }
        });

        // Handle marking message as read
        socket.on('mark_read', async ({ messageId }) => {
            try {
                const msg = await Message.findById(messageId);
                if (msg && msg.receiverId.toString() === socket.user.id) {
                    msg.readStatus = true;
                    await msg.save();

                    const roomIds = [msg.senderId.toString(), msg.receiverId.toString()].sort();
                    const roomName = `chat_${roomIds[0]}_${roomIds[1]}`;

                    io.to(roomName).emit('message_read', { messageId });
                }
            } catch (err) {
                console.error('Socket mark_read error:', err);
            }
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.user.id}`);
        });
    });

    return io;
};

module.exports = initSocket;
