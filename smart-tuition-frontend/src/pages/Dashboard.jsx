import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
    const { user, token } = useContext(AuthContext);
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboard = async () => {
            setLoading(true);
            try {
                if (user?.role === 'teacher') {
                    // Handled outside
                } else if (user?.role === 'student' || user?.role === 'parent') {
                    // Fetch secure student read-only dashboard
                    const res = await axios.get('http://localhost:5000/api/student/dashboard', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setDashboardData(res.data.data);
                } else {
                    setDashboardData({ message: `Welcome to the ${user.role} Dashboard!` });
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Error fetching secure data');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, [user]);

    if (user?.role === 'teacher') {
        return <Navigate to="/dashboard/teacher/overview" replace />;
    }

    if (user?.role === 'student' || user?.role === 'parent') {
        return <Navigate to="/dashboard/student/overview" replace />;
    }

    if (loading) return <div style={{ color: 'white', padding: '3rem', textAlign: 'center' }}>Loading dashboard...</div>;

    return (
        <div style={{ padding: '3rem 2rem', maxWidth: '1000px', margin: '0 auto' }}>
            <div className="glass-panel" style={{ padding: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                    Hello, <span style={{ color: 'var(--secondary)' }}>{user?.name}</span>
                </h1>

                <div style={{
                    display: 'inline-block',
                    background: 'rgba(16, 185, 129, 0.2)',
                    color: '#10B981',
                    padding: '0.5rem 1rem',
                    borderRadius: '50px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    fontSize: '0.85rem',
                    letterSpacing: '1px',
                    marginBottom: '2rem'
                }}>
                    Role: {user?.role}
                </div>

                {error && <p className="error-msg">{error}</p>}

                {/* =========================================
            PARENT DASHBOARD
            ========================================= */}
                {user?.role === 'parent' && (
                    <div style={{
                        background: 'rgba(15, 23, 42, 0.4)',
                        border: '1px solid var(--glass-border)',
                        padding: '2rem',
                        borderRadius: '12px'
                    }}>
                        <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Parent Overview</h3>
                        <p style={{ fontSize: '1.2rem', color: '#E2E8F0' }}>Welcome to the Parent Portal.</p>
                        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>
                            Linked Student ID: {user.student}
                        </p>
                    </div>
                )}

                {/* =========================================
            STUDENT & PARENT READ-ONLY DASHBOARD
            ========================================= */}
                {user?.role === 'parent' && dashboardData && (
                    <div>
                        <div style={{
                            background: 'rgba(15, 23, 42, 0.4)',
                            border: '1px solid var(--glass-border)',
                            padding: '2rem',
                            borderRadius: '12px',
                            marginBottom: '2rem'
                        }}>
                            <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>My Academic Dashboard</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Welcome back. You have read-only access to your records below.</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>

                            {/* Attendance */}
                            <div style={{ background: 'rgba(15, 23, 42, 0.4)', border: '1px solid var(--glass-border)', padding: '1.5rem', borderRadius: '12px' }}>
                                <h4 style={{ color: '#818CF8', marginBottom: '1rem' }}>Recent Attendance</h4>
                                {dashboardData.attendance?.length === 0 ? (
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No attendance records yet.</p>
                                ) : (
                                    dashboardData.attendance.map((record, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                                            <span style={{ fontSize: '0.9rem' }}>{new Date(record.date).toLocaleDateString()}</span>
                                            <span style={{ fontSize: '0.9rem', color: record.status === 'Present' ? '#10B981' : '#EF4444' }}>{record.status}</span>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Progress */}
                            <div style={{ background: 'rgba(15, 23, 42, 0.4)', border: '1px solid var(--glass-border)', padding: '1.5rem', borderRadius: '12px' }}>
                                <h4 style={{ color: '#818CF8', marginBottom: '1rem' }}>My Grades & Progress</h4>
                                {dashboardData.progress?.length === 0 ? (
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No grades posted yet.</p>
                                ) : (
                                    dashboardData.progress.map((prog, i) => (
                                        <div key={i} style={{ marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                                            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{prog.subject}</div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem' }}>
                                                <span className={`status-badge ${prog.rating === 'Good' ? 'status-green' :
                                                        prog.rating === 'Needs Improvement' ? 'status-red' :
                                                            'status-yellow'
                                                    }`}>
                                                    {prog.rating}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Homework */}
                            <div style={{ background: 'rgba(15, 23, 42, 0.4)', border: '1px solid var(--glass-border)', padding: '1.5rem', borderRadius: '12px' }}>
                                <h4 style={{ color: '#818CF8', marginBottom: '1rem' }}>Active Homework</h4>
                                {dashboardData.homework?.length === 0 ? (
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No active homework assigned.</p>
                                ) : (
                                    dashboardData.homework.map((hw, i) => (
                                        <div key={i} style={{ marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                                            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{hw.title} <span style={{ fontSize: '0.75rem', padding: '2px 6px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', verticalAlign: 'middle', marginLeft: '6px' }}>{hw.subject}</span></div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>{hw.description}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#EF4444', marginTop: '0.4rem' }}>Due: {new Date(hw.dueDate).toLocaleDateString()}</div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Notices */}
                            <div style={{ background: 'rgba(15, 23, 42, 0.4)', border: '1px solid var(--glass-border)', padding: '1.5rem', borderRadius: '12px' }}>
                                <h4 style={{ color: '#818CF8', marginBottom: '1rem' }}>Center Center Notices</h4>
                                {dashboardData.notices?.length === 0 ? (
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No recent notices.</p>
                                ) : (
                                    dashboardData.notices.map((notice, i) => (
                                        <div key={i} style={{ marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                                            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{notice.title}</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>{notice.content}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>{new Date(notice.createdAt).toLocaleDateString()}</div>
                                        </div>
                                    ))
                                )}
                            </div>

                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Dashboard;
