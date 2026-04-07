import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const StudentHomework = () => {
    const { user, token } = useContext(AuthContext);
    const [homework, setHomework] = useState([]);
    const [loading, setLoading] = useState(true);
    const [customAssignment, setCustomAssignment] = useState('');
    const [sending, setSending] = useState(false);
    const [sendSuccess, setSendSuccess] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch official dashboard summary
                const res = await axios.get('https://smart-tuition-curriculum.onrender.com/api/student/dashboard', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                let officialHomework = res.data.data.homework || [];

                // 2. If parent, fetch chat messages to append "Pending Teacher" requests natively
                if (user?.role === 'parent') {
                    try {
                        const usersRes = await axios.get('https://smart-tuition-curriculum.onrender.com/api/chat/users', { headers: { Authorization: `Bearer ${token}` } });
                        const teacher = usersRes.data.data[0];
                        if (teacher) {
                            const chatRes = await axios.get(`https://smart-tuition-curriculum.onrender.com/api/chat/${teacher._id}`, { headers: { Authorization: `Bearer ${token}` } });
                            const messages = chatRes.data.data;
                            
                            // Map those messages to the homework list visually
                            const customRequests = messages
                                .filter(m => m.content.startsWith('[Homework Assignment Request]: '))
                                .map(m => {
                                    const futureDate = new Date(m.createdAt);
                                    futureDate.setDate(futureDate.getDate() + 1);
                                    return {
                                        title: "Parent Request",
                                        description: m.content.replace('[Homework Assignment Request]: ', ''),
                                        subject: "Custom Request",
                                        dueDate: futureDate.toISOString(),
                                        status: "Pending Teacher"
                                    };
                                });
                            
                            // Combine them
                            officialHomework = [...officialHomework, ...customRequests];
                        }
                    } catch (e) {
                         console.error("Failed to fetch pending requests", e);
                    }
                }

                setHomework(officialHomework);
            } catch (error) {
                console.error("Error fetching homework:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [token, user]);

    if (loading) return <div style={{ color: 'var(--text-muted)' }}>Loading Homework...</div>;

    return (
        <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                {user?.role === 'parent' ? 'Assign Homework' : 'My Homework'}
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                {user?.role === 'parent' ? 'Review assigned tasks and assign additional homework.' : 'Review your assigned tasks and due dates.'}
            </p>

            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '12px' }}>
                {homework.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                        No homework assigned right now.
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {homework.map((hw, index) => (
                            <div key={index} style={{
                                padding: '1.5rem',
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '8px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)', fontSize: '1.1rem' }}>{hw.title}</h4>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{hw.description}</div>
                                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
                                        <span style={{ color: '#818CF8' }}>{hw.subject}</span>
                                        <span style={{ color: '#EF4444' }}>Due: {new Date(hw.dueDate).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div>
                                    <span className={`status-badge ${hw.status === 'Completed' ? 'status-green' : 'status-yellow'}`}>
                                        {hw.status || 'Pending'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {user?.role === 'parent' && (
                <div className="glass-panel" style={{ padding: '2rem', borderRadius: '12px', marginTop: '2rem', borderTop: '4px solid #8B5CF6' }}>
                    <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        Assign Additional Homework
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                        Need to give your child more practice? Type an assignment here and it will be sent directly to the Teacher's message inbox.
                    </p>
                    <textarea 
                        style={{
                            width: '100%',
                            minHeight: '100px',
                            background: 'rgba(15, 23, 42, 0.4)',
                            border: '1px solid var(--glass-border)',
                            color: 'var(--text-main)',
                            padding: '1rem',
                            borderRadius: '8px',
                            marginBottom: '1rem'
                        }}
                        placeholder="e.g. Please assign 20 extra algebra equations for this weekend."
                        value={customAssignment}
                        onChange={(e) => setCustomAssignment(e.target.value)}
                    ></textarea>
                    {sendSuccess && (
                        <div style={{ color: sendSuccess.includes('Error') ? '#EF4444' : '#10B981', fontSize: '0.9rem', marginBottom: '1rem' }}>{sendSuccess}</div>
                    )}
                    <button 
                        className="btn-primary" 
                        disabled={sending || !customAssignment.trim()}
                        onClick={async () => {
                            setSending(true);
                            setSendSuccess('');
                            try {
                                // 1. Find the parent's assigned teacher using the chat users endpoint
                                const usersRes = await axios.get('https://smart-tuition-curriculum.onrender.com/api/chat/users', {
                                    headers: { Authorization: `Bearer ${token}` }
                                });
                                // In the parent chat flow, the array returned only holds their 1 teacher
                                const teacher = usersRes.data.data[0];
                                
                                if (!teacher) {
                                    setSendSuccess("Error: Could not find assigned teacher.");
                                    setSending(false);
                                    return;
                                }

                                // 2. Send the message payload
                                await axios.post('https://smart-tuition-curriculum.onrender.com/api/chat/message', {
                                    receiverId: teacher._id,
                                    content: `[Homework Assignment Request]: ${customAssignment.trim()}`
                                }, {
                                    headers: { Authorization: `Bearer ${token}` }
                                });

                                // Append visually to the list
                                const futureDate = new Date();
                                futureDate.setDate(futureDate.getDate() + 1);
                                setHomework(prev => [...prev, {
                                    title: "Parent Request",
                                    description: customAssignment.trim(),
                                    subject: "Custom Request",
                                    dueDate: futureDate.toISOString(),
                                    status: "Pending Teacher"
                                }]);

                                setSendSuccess("Homework request sent to the Teacher!");
                                setCustomAssignment('');
                            } catch (error) {
                                console.error('Error sending assignment to teacher:', error);
                                setSendSuccess("Error: Failed to send assignment.");
                            } finally {
                                setSending(false);
                            }
                        }}
                        style={{ opacity: (sending || !customAssignment.trim()) ? 0.7 : 1 }}
                    >
                        {sending ? 'Sending...' : 'Send to Teacher via Message Box'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default StudentHomework;
