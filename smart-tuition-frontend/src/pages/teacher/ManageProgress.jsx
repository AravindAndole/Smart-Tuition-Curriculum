import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManageProgress = () => {
    const [students, setStudents] = useState([]);
    const [subject, setSubject] = useState('Mathematics');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchProgress = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/api/teacher/progress?subject=${subject}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setStudents(res.data.data);
            }
        } catch (err) {
            console.error(err);
            setError('Failed to load student progress');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProgress();
    }, [subject]);

    const handleUpdate = async (studentId, rating) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`http://localhost:5000/api/teacher/progress/${studentId}`, { subject, rating }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                // Update UI optimistically
                setStudents(prev => prev.map(s => s._id === studentId ? { ...s, rating } : s));
            }
        } catch (err) {
            alert('Failed to update student progress. Please try again.');
        }
    };

    return (
        <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Student Progress</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Evaluate and report student performance to their parents.</p>

            <div className="glass-panel" style={{ padding: '2rem' }}>
                <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <label style={{ fontWeight: 600 }}>Subject Area:</label>
                    <select className="form-control" style={{ width: 'auto' }} value={subject} onChange={(e) => setSubject(e.target.value)}>
                        <option>Mathematics</option>
                        <option>Science</option>
                        <option>English</option>
                    </select>
                </div>

                {loading ? (
                    <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading records...</p>
                ) : error ? (
                    <p style={{ textAlign: 'center', padding: '2rem', color: '#EF4444' }}>{error}</p>
                ) : students.length === 0 ? (
                    <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No enrolled students found.</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Student</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Current Standing</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Update Assessment</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student) => (
                                <tr key={student._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: 500 }}>{student.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{student.studentId}</div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        {student.rating === 'Good' && <span style={{ color: '#10B981' }}>🟢 {student.rating}</span>}
                                        {student.rating === 'Average' && <span style={{ color: '#F59E0B' }}>🟡 {student.rating}</span>}
                                        {student.rating === 'Needs Improvement' && <span style={{ color: '#EF4444' }}>🔴 {student.rating}</span>}
                                        {!student.rating && <span style={{ color: 'var(--text-muted)' }}>Not Evaluated</span>}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <select
                                            className="form-control"
                                            style={{ width: 'auto', padding: '0.4rem', fontSize: '0.9rem' }}
                                            value={student.rating || ''}
                                            onChange={(e) => handleUpdate(student._id, e.target.value)}
                                        >
                                            <option value="" disabled>Select Standing...</option>
                                            <option value="Good">Good</option>
                                            <option value="Average">Average</option>
                                            <option value="Needs Improvement">Needs Improvement</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default ManageProgress;
