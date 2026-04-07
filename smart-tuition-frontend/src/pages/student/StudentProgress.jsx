import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const StudentProgress = () => {
    const { user, token } = useContext(AuthContext);
    const [progress, setProgress] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get('https://smart-tuition-curriculum.onrender.com/api/student/dashboard', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setProgress(res.data.data.progress || []);
            } catch (error) {
                console.error("Error fetching progress:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [token]);

    if (loading) return <div style={{ color: 'var(--text-muted)' }}>Loading Progress...</div>;

    return (
        <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                {user?.role === 'parent' ? 'Childs Grades & Progress' : 'Grades & Progress'}
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                {user?.role === 'parent' ? 'Review your child\'s current academic standing across subjects.' : 'Review your current academic standing across subjects.'}
            </p>

            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '12px' }}>
                <table className="student-data-table">
                    <thead>
                        <tr>
                            <th>Date Posted</th>
                            <th>Subject</th>
                            <th>Current Standing</th>
                        </tr>
                    </thead>
                    <tbody>
                        {progress.length === 0 ? (
                            <tr>
                                <td colSpan="3" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                    No grades or progress reports found.
                                </td>
                            </tr>
                        ) : (
                            progress.map((record, index) => (
                                <tr key={index}>
                                    <td>{new Date(record.date).toLocaleDateString()}</td>
                                    <td style={{ fontWeight: 500 }}>{record.subject}</td>
                                    <td>
                                        <span className={`status-badge ${record.rating === 'Good' ? 'status-green' :
                                            record.rating === 'Needs Improvement' ? 'status-red' :
                                                'status-yellow'
                                            }`}>
                                            {record.rating}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StudentProgress;
