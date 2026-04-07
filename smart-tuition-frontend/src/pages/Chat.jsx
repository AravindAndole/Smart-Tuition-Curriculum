import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';
import './Chat.css';

const Chat = () => {
    const { user, token } = useContext(AuthContext);
    const [socket, setSocket] = useState(null);
    const [usersList, setUsersList] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom of messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // INITIALIZE SOCKET & FETCH USERS
    useEffect(() => {
        if (!token || !user) return;

        // Connect to Socket.io with JWT token
        const newSocket = io('https://smart-tuition-curriculum.onrender.com', {
            auth: { token }
        });

        setSocket(newSocket);

        // Fetch initial list of valid chat partners
        const fetchUsers = async () => {
            try {
                const res = await axios.get('https://smart-tuition-curriculum.onrender.com/api/chat/users');
                setUsersList(res.data.data);
            } catch (err) {
                console.error('Failed to fetch chat users', err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();

        // Socket Event Listener: Receive Message
        newSocket.on('receive_message', (message) => {
            // Add to messages if we are currently looking at the chat with the sender/receiver
            setMessages((prev) => {
                // If it belongs to active chat, append it
                return [...prev, message];
            });
        });

        // Socket Event Listener: Message Read
        newSocket.on('message_read', ({ messageId }) => {
            setMessages((prev) =>
                prev.map(msg => msg._id === messageId ? { ...msg, readStatus: true } : msg)
            );
        });

        return () => newSocket.disconnect();
    }, [token, user]);

    // SWITCH CHAT TAB
    const selectChat = async (targetUser) => {
        setActiveChat(targetUser);

        // Tell socket server we are focusing on this room
        if (socket) {
            socket.emit('join_room', { targetUserId: targetUser._id });
        }

        try {
            // Fetch history and automatically mark unread as read in backend
            const res = await axios.get(`https://smart-tuition-curriculum.onrender.com/api/chat/${targetUser._id}`);
            setMessages(res.data.data);
        } catch (err) {
            console.error('Failed to fetch messages', err);
        }
    };

    // SEND MESSAGE
    const sendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeChat || !socket) return;

        socket.emit('send_message', {
            receiverId: activeChat._id,
            content: newMessage.trim()
        });

        setNewMessage('');
    };

    if (loading) return <div>Loading chat...</div>;

    return (
        <div className="chat-container">
            {/* Sidebar: List of contacts */}
            <div className="chat-sidebar glass-panel">
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
                    <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Conversations</h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {user?.role === 'teacher' ? 'Your Students\' Parents' : 'Your Student\'s Teacher'}
                    </p>
                </div>

                <div className="chat-user-list">
                    {usersList.length === 0 ? (
                        <p style={{ padding: '1rem', color: 'var(--text-muted)', textAlign: 'center' }}>No users found.</p>
                    ) : (
                        usersList.map((chatUser) => (
                            <div
                                key={chatUser._id}
                                className={`chat-user-card ${activeChat?._id === chatUser._id ? 'active' : ''}`}
                                onClick={() => selectChat(chatUser)}
                            >
                                <div style={{ fontWeight: 600 }}>{chatUser.name}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    {chatUser.role === 'parent' ? `Parent of ${chatUser.studentName}` : `Teacher: ${chatUser.tuitionCenterName}`}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main Chat Interface */}
            <div className="chat-main glass-panel">
                {activeChat ? (
                    <>
                        <div className="chat-header">
                            <h3 style={{ margin: 0 }}>{activeChat.name}</h3>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                {activeChat.role === 'parent' ? `Parent of ${activeChat.studentName}` : 'Teacher'}
                            </p>
                        </div>

                        <div className="chat-messages">
                            {messages.map((msg, idx) => {
                                const isSentByMe = msg.senderId === user._id || msg.senderId.toString() === user.id;

                                // Fire off a mark_read socket event if we just viewed an unread received message
                                // For a more robust app, use IntersectionObserver
                                if (!isSentByMe && !msg.readStatus && socket) {
                                    socket.emit('mark_read', { messageId: msg._id });
                                    msg.readStatus = true; // prevent firing multiple times local
                                }

                                return (
                                    <div key={msg._id || idx} className={`message-bubble ${isSentByMe ? 'sent' : 'received'}`}>
                                        {msg.content}
                                        <span className="message-time">
                                            {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        {isSentByMe && (
                                            <span className={`message-status ${msg.readStatus ? 'read' : ''}`}>
                                                {msg.readStatus ? 'Read' : 'Delivered'}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        <form className="chat-input-area" onSubmit={sendMessage}>
                            <input
                                type="text"
                                className="chat-input"
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="btn-send"
                                disabled={!newMessage.trim()}
                            >
                                Send
                            </button>
                        </form>
                    </>
                ) : (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                        Select a conversation from the sidebar to start chatting
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;
