import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

const StudentAttendance = () => {
    const { user, token } = useContext(AuthContext);
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/student/dashboard', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAttendance(res.data.data.attendance || []);
            } catch (error) {
                console.error("Error fetching attendance:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [token]);

    if (loading) return <div style={{ color: 'var(--text-muted)' }}>Loading Attendance...</div>;

    // Process data for the chart
    let chartData = [];
    if (attendance.length === 0) {
        // Show an empty graph with zero values
        chartData = [
            { date: 'Today', Present: 0, Absent: 0 }
        ];
    } else {
        // Group by date or just show the last N days straight
        // For visual simplicity, let's reverse to show oldest to newest left to right
        chartData = [...attendance].reverse().slice(-7).map(record => ({
            date: new Date(record.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            Present: record.status === 'Present' ? 1 : 0,
            Absent: record.status !== 'Present' ? 1 : 0
        }));
    }

    return (
        <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                {user?.role === 'parent' ? 'Childs Attendance' : 'My Attendance'}
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                {user?.role === 'parent' ? 'Review your child\'s daily attendance history.' : 'Review your daily attendance history.'}
            </p>

            {/* Graphical Representation */}
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '12px', marginBottom: '2rem', background: 'transparent' }}>
                <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-main)', fontSize: '1.2rem' }}>Attendance Overview</h3>
                <div style={{ width: '100%', height: 300, background: 'transparent' }}>
                    <ResponsiveContainer width="100%" height="100%" style={{ background: 'transparent' }}>
                        <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} style={{ background: 'transparent' }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis domain={[0, 'auto']} allowDecimals={false} stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                                cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Bar dataKey="Present" stackId="a" fill="#10B981" radius={[4, 4, 0, 0]} barSize={40} />
                            <Bar dataKey="Absent" stackId="a" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '12px' }}>
                <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-main)', fontSize: '1.2rem' }}>Detailed History</h3>
                <table className="student-data-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {attendance.length === 0 ? (
                            <tr>
                                <td colSpan="2" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                    No detailed records found.
                                </td>
                            </tr>
                        ) : (
                            attendance.map((record, index) => (
                                <tr key={index}>
                                    <td>{new Date(record.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
                                    <td>
                                        <span className={`status-badge ${record.status === 'Present' ? 'status-green' : 'status-red'}`}>
                                            {record.status}
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

export default StudentAttendance;
