import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManageHomework = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    const [subject, setSubject] = useState('Mathematics');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [requestMessageId, setRequestMessageId] = useState(null); // Track if tied to a parent request
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState('');

    const [pendingRequests, setPendingRequests] = useState([]);
    const [pendingLoading, setPendingLoading] = useState(true);

    const fetchAssignments = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('https://smart-tuition-curriculum.onrender.com/api/homework', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setAssignments(res.data.data);
            }
        } catch (err) {
            console.error('Error fetching homework:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchPendingRequests = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('https://smart-tuition-curriculum.onrender.com/api/homework/pending', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setPendingRequests(res.data.data);
            }
        } catch (err) {
            console.error('Error fetching pending requests:', err);
        } finally {
            setPendingLoading(false);
        }
    };

    useEffect(() => {
        fetchAssignments();
        fetchPendingRequests();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !description.trim() || !dueDate) return;

        setSubmitLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('https://smart-tuition-curriculum.onrender.com/api/homework', {
                subject,
                title,
                description,
                dueDate,
                requestMessageId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                // Ensure new item appears right away
                setAssignments(prev => [...prev, { ...res.data.data, assignedBy: { name: 'You' } }]
                    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)));

                setTitle('');
                setDescription('');
                setDueDate('');
                setRequestMessageId(null);
                
                // Refresh pending requests if we just fulfilled one
                if (requestMessageId) fetchPendingRequests();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to post homework');
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Homework Assigned</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Assign tasks and track upcoming deadlines.</p>

            {/* PENDING REQUESTS FROM PARENTS */}
            {(!pendingLoading && pendingRequests.length > 0) && (
                <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                        <h3 style={{ margin: 0, color: '#FCD34D' }}>Pending Requests from Parents</h3>
                        <span style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#FCD34D', padding: '4px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                            {pendingRequests.length} Requires Action
                        </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {pendingRequests.map(req => (
                            <div key={req._id} style={{
                                padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                            }}>
                                <div>
                                    <div style={{ fontSize: '0.9rem', color: '#FCD34D', marginBottom: '4px' }}>Requested by {req.parentName} for {req.studentName}</div>
                                    <div style={{ color: 'white' }}>"{req.description}"</div>
                                </div>
                                <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', width: 'auto' }}
                                    onClick={() => {
                                        setDescription(`Requested by ${req.parentName}:\n${req.description}`);
                                        setTitle(`Custom Homework for ${req.studentName}`);
                                        setRequestMessageId(req._id);
                                        // Scroll to form smoothly
                                        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                                    }}
                                >
                                    Assign This
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', color: requestMessageId ? '#FCD34D' : 'inherit' }}>
                    {requestMessageId ? 'Fulfilling Parent Request' : 'Create New Assignment'}
                </h3>
                
                {requestMessageId && (
                    <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(245, 158, 11, 0.1)', color: '#FCD34D', borderRadius: '6px', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Currently drafting an assignment to fulfill a pending parent request.</span>
                        <button onClick={() => { setRequestMessageId(null); setTitle(''); setDescription(''); }}
                                style={{ background: 'transparent', border: '1px solid rgba(245, 158, 11, 0.4)', color: '#FCD34D', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>
                            Cancel Fulfilling Request
                        </button>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Subject</label>
                            <select className="form-control" value={subject} onChange={e => setSubject(e.target.value)}>
                                <option>Mathematics</option>
                                <option>Science</option>
                                <option>English</option>
                                <option>History</option>
                                <option>Coding</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Title/Topic</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="e.g. Algebra Worksheet #4"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Description/Instructions</label>
                        <textarea
                            className="form-control"
                            placeholder="Provide details about what the student needs to complete..."
                            rows="3"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        ></textarea>
                    </div>

                    <div style={{ width: '50%' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Due Date</label>
                        <input
                            type="date"
                            className="form-control"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            required
                        />
                    </div>

                    {error && <p className="error-msg">{error}</p>}

                    <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', padding: '0.8rem 2rem' }} disabled={submitLoading}>
                        {submitLoading ? 'Assigning...' : 'Assign Homework'}
                    </button>
                </form>
            </div>

            <div className="glass-panel" style={{ padding: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                    Active Assignments
                </h3>

                {loading ? (
                    <p>Loading assignments...</p>
                ) : assignments.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>No homework assigned yet.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {assignments.map((hw, idx) => {
                            const isPastDue = new Date(hw.dueDate) < new Date(new Date().setHours(0, 0, 0, 0));
                            return (
                                <div key={idx} style={{
                                    padding: '1.5rem',
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                            <h4 style={{ color: 'var(--text-main)', margin: 0 }}>{hw.title}</h4>
                                            <span style={{ fontSize: '0.75rem', padding: '2px 8px', background: 'rgba(129, 140, 248, 0.2)', color: '#818CF8', borderRadius: '12px' }}>{hw.subject}</span>
                                        </div>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: '0 0 1rem 0' }}>{hw.description}</p>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            Assigned by {hw.assignedBy?.name || 'Center'}
                                        </div>
                                    </div>
                                    <div style={{
                                        textAlign: 'right',
                                        color: isPastDue ? '#EF4444' : '#10B981',
                                        background: isPastDue ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '8px',
                                        fontWeight: 600
                                    }}>
                                        Due: {new Date(hw.dueDate).toLocaleDateString()}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageHomework;
