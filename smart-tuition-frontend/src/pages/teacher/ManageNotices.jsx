import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManageNotices = () => {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchNotices = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/notices', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setNotices(res.data.data);
            }
        } catch (err) {
            console.error('Error fetching notices:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotices();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;

        setSubmitLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/api/notices', {
                title,
                content
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                // Prepend new notice
                setNotices([{ ...res.data.data, postedBy: { name: 'You' } }, ...notices]);
                setTitle('');
                setContent('');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to post notice');
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Center Notices</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Post announcements for all enrolled students and their parents.</p>

            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                    Post New Notice
                </h3>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Notice Title</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. Holiday Tomorrow"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Announcement Details</label>
                        <textarea
                            className="form-control"
                            placeholder="Type the notice content here..."
                            rows="3"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                        ></textarea>
                    </div>

                    {error && <p className="error-msg">{error}</p>}

                    <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', padding: '0.8rem 2rem' }} disabled={submitLoading}>
                        {submitLoading ? 'Posting...' : 'Post Notice'}
                    </button>
                </form>
            </div>

            <div className="glass-panel" style={{ padding: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                    Recent Notices
                </h3>

                {loading ? (
                    <p>Loading notices...</p>
                ) : notices.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>No notices posted yet.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {notices.map((n, idx) => (
                            <div key={idx} style={{
                                padding: '1.5rem',
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '8px'
                            }}>
                                <h4 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>{n.title}</h4>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1rem' }}>{n.content}</p>
                                <div style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>
                                    Posted by {n.postedBy?.name || 'Center'} • {new Date(n.date).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageNotices;
