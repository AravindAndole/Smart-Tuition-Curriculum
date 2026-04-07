import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const StudentNotices = () => {
    const { token } = useContext(AuthContext);
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/student/dashboard', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setNotices(res.data.data.notices || []);
            } catch (error) {
                console.error("Error fetching notices:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [token]);

    if (loading) return <div style={{ color: 'var(--text-muted)' }}>Loading Notices...</div>;

    return (
        <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Center Notices</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Stay up to date with the latest announcements.</p>

            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '12px' }}>
                {notices.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                        No new notices right now.
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {notices.map((notice, index) => (
                            <div key={index} style={{
                                padding: '1.5rem',
                                background: 'rgba(255,255,255,0.02)',
                                borderLeft: '4px solid #818CF8',
                                borderRadius: '8px',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <h4 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.2rem' }}>{notice.title}</h4>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{new Date(notice.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                                    {notice.content}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentNotices;
