import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManageAttendance = () => {
    const [students, setStudents] = useState([]);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAttendance = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');

                // 1. Fetch all students in the center
                const studentsRes = await axios.get('https://smart-tuition-curriculum.onrender.com/api/teacher/students', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // 2. Fetch attendance for the selected date
                const attendanceRes = await axios.get(`https://smart-tuition-curriculum.onrender.com/api/attendance?date=${date}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const allStudents = studentsRes.data.data;
                const attendanceRecords = attendanceRes.data.data;

                // Merge
                const merged = allStudents.map(student => {
                    // attendanceRecords populate student with _id, name, studentId
                    // We need to match by the populated student._id
                    const record = attendanceRecords.find(a => a.student._id === student._id);
                    return {
                        ...student,
                        status: record ? record.status : null
                    };
                });

                setStudents(merged);
            } catch (err) {
                console.error("Error fetching attendance data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAttendance();
    }, [date]);

    const handleMark = async (studentId, status) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('https://smart-tuition-curriculum.onrender.com/api/attendance', {
                studentId,
                status,
                date
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                setStudents(prev => prev.map(s => s._id === studentId ? { ...s, status } : s));
            }
        } catch (err) {
            console.error("Failed to mark attendance", err);
            alert(err.response?.data?.message || "Failed to save attendance");
        }
    };

    if (loading) return <div>Loading Students...</div>;

    return (
        <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Track Attendance</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Mark students present or absent for a specific date.</p>

            <div className="glass-panel" style={{ padding: '2rem' }}>
                <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <label style={{ fontWeight: 600 }}>Select Date:</label>
                    <input
                        type="date"
                        className="form-control"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        style={{ width: 'auto' }}
                    />
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                            <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Student</th>
                            <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Status</th>
                            <th style={{ padding: '1rem', color: 'var(--text-muted)', textAlign: 'right' }}>Action</th>
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
                                    {student.status === 'Present' && <span style={{ color: '#10B981', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>Present</span>}
                                    {student.status === 'Absent' && <span style={{ color: '#EF4444', background: 'rgba(239, 68, 68, 0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>Absent</span>}
                                    {!student.status && <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Not Marked</span>}
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    <button
                                        onClick={() => handleMark(student._id, 'Present')}
                                        style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10B981', padding: '0.4rem 1rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', marginRight: '0.5rem' }}
                                    >
                                        Mark Present
                                    </button>
                                    <button
                                        onClick={() => handleMark(student._id, 'Absent')}
                                        style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#EF4444', padding: '0.4rem 1rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                                    >
                                        Mark Absent
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageAttendance;
