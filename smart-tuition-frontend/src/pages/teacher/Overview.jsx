import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';

const Overview = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState({
        totalStudents: 0,
        presentToday: 0,
        absentToday: 0,
        paidStudents: 0,
        unpaidStudents: 0
    });
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/teacher/dashboard', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data.success) {
                    setStats(res.data.data);
                }
            } catch (error) {
                console.error('Error fetching teacher dashboard:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    if (loading) return <div>Loading Overview...</div>;

    return (
        <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Welcome, {user?.name}</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Here is what's happening at your tuition center today.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>

                <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--primary)' }}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Total Students</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.totalStudents}</div>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #10B981' }}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Present Today</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10B981' }}>{stats.presentToday}</div>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #EF4444' }}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Absent Today</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#EF4444' }}>{stats.absentToday}</div>
                </div>

            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #10B981' }}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Fees Paid</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10B981' }}>{stats.paidStudents}</div>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #F59E0B' }}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Fees Pending</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#F59E0B' }}>{stats.unpaidStudents}</div>
                </div>
            </div>
        </div>
    );
};

export default Overview;
