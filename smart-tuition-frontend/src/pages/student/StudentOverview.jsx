import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const StudentOverview = () => {
    const { user, token } = useContext(AuthContext);
    const [stats, setStats] = useState({
        attendancePct: 0,
        progress: 'Not Rated',
        feeStatus: 'Unknown',
        totalHomework: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/student/dashboard', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const data = res.data.data;

                // Calculate derived stats
                const totalAttendance = data.attendance?.length || 0;
                const totalPresent = data.attendance?.filter(a => a.status === 'Present').length || 0;
                const attendancePct = totalAttendance === 0 ? 0 : Math.round((totalPresent / totalAttendance) * 100);

                // Get latest progress
                const latestProgress = data.progress?.length > 0 ? data.progress[0].rating : 'Not Rated';

                // Get fee status for latest month (mocking finding 'Unpaid' if any exists, else Paid)
                // In a perfect system we'd check the current month, but for summary we'll just look for any unpaid.
                const hasUnpaid = data.fees?.some(f => f.status === 'Unpaid');
                const feeStatus = !data.fees || data.fees.length === 0 ? 'No Records' : (hasUnpaid ? 'Unpaid' : 'Paid');

                // Total homework
                let totalHomework = data.homework?.length || 0;

                // Add pending custom requests from parent
                if (user?.role === 'parent') {
                    try {
                        const usersRes = await axios.get('http://localhost:5000/api/chat/users', { headers: { Authorization: `Bearer ${token}` } });
                        const teacher = usersRes.data.data[0];
                        if (teacher) {
                            const chatRes = await axios.get(`http://localhost:5000/api/chat/${teacher._id}`, { headers: { Authorization: `Bearer ${token}` } });
                            const pendingRequests = chatRes.data.data.filter(m => m.content.startsWith('[Homework Assignment Request]: ')).length;
                            totalHomework += pendingRequests;
                        }
                    } catch (e) {
                        console.error("Failed to fetch pending requests count", e);
                    }
                }

                setStats({
                    attendancePct,
                    progress: latestProgress,
                    feeStatus,
                    totalHomework
                });

            } catch (error) {
                console.error("Error fetching overview stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [token, user]);

    if (loading) return <div style={{ color: 'var(--text-muted)' }}>Loading Overview...</div>;

    return (
        <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                {user?.role === 'parent' ? 'Childs Dashboard Overview' : 'Dashboard Overview'}
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                {user?.role === 'parent' ? 'A quick snapshot of your child\'s academic standing.' : 'A quick snapshot of your academic standing.'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>

                {/* Attendance Summary Card */}
                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px', borderLeft: '4px solid #818CF8' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Attendance Rate</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                        {stats.attendancePct}%
                    </div>
                </div>

                {/* Progress Summary Card */}
                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px', borderLeft: stats.progress === 'Good' ? '4px solid #10B981' : stats.progress === 'Needs Improvement' ? '4px solid #EF4444' : '4px solid #F59E0B' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Current Standing</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', lineHeight: '1.3' }}>
                        {stats.progress}
                    </div>
                </div>

                {/* Homework Summary Card */}
                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px', borderLeft: '4px solid #8B5CF6' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Assigned Homework</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                        {stats.totalHomework}
                    </div>
                </div>

                {/* Fees Summary Card */}
                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px', borderLeft: stats.feeStatus === 'Paid' ? '4px solid #10B981' : stats.feeStatus === 'No Records' ? '4px solid #94A3B8' : '4px solid #EF4444' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Fee Status</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: stats.feeStatus === 'Paid' ? '#10B981' : stats.feeStatus === 'No Records' ? '#94A3B8' : '#EF4444' }}>
                        {stats.feeStatus}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default StudentOverview;
