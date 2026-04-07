import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const ManageFees = () => {
    const { token } = useContext(AuthContext);
    const [students, setStudents] = useState([]);
    const [month, setMonth] = useState('April 2024');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchFeesAndStudents = async () => {
            setLoading(true);
            try {
                // First get all enrolled students for this center
                // 1. Fetch all students in the center
                const studentsRes = await axios.get('http://localhost:5000/api/teacher/students', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // 2. Fetch fees for the selected month to merge in known statuses
                const feesRes = await axios.get(`http://localhost:5000/api/fees?month=${month}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const allStudents = studentsRes.data.data;
                const paidFees = feesRes.data.data;

                // Merge: if a student has a fee record in feesRes, use that status, otherwise default to Pending
                const mergedRecords = allStudents.map(student => {
                    const feeRecord = paidFees.find(f => f.student._id === student._id);
                    return {
                        _id: student._id,
                        name: student.name,
                        studentId: student.studentId,
                        amount: feeRecord ? feeRecord.amount : 150, // Default fee
                        status: feeRecord ? feeRecord.status : 'Pending'
                    };
                });

                setStudents(mergedRecords);

            } catch (error) {
                console.error("Error fetching fees:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFeesAndStudents();
    }, [month, token]);

    const handleMark = async (studentId, status) => {
        setMessage('');
        try {
            // Check if it's a mock row (no real db _id)
            if (studentId.startsWith('mock_')) {
                setMessage(`Cannot mark mock student ${status}. Please create a real student in "Manage Students", then mark their fee.`);
                return;
            }

            const res = await axios.post('http://localhost:5000/api/fees', {
                studentId,
                month,
                amount: 150,
                status
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // If it triggered an SMS, the backend will return smsStatus
            if (res.data.smsStatus) {
                setMessage(`Status updated to ${status}. SMS Network says: ${res.data.smsStatus}`);
            } else {
                setMessage(`Fee successfully marked as ${status}`);
            }

            // Update UI optimistically
            setStudents(prev => prev.map(s => s._id === studentId ? { ...s, status } : s));
        } catch (error) {
            setMessage(error.response?.data?.message || 'Error updating fee');
        }
    };

    return (
        <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Manage Fees</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Track monthly payments and automatically alert parents of unpaid dues via SMS.</p>

            {message && (
                <div style={{
                    marginBottom: '1.5rem',
                    padding: '1rem',
                    background: message.includes('Error') || message.includes('Cannot mark') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    border: message.includes('Error') || message.includes('Cannot mark') ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
                    color: message.includes('Error') || message.includes('Cannot mark') ? '#EF4444' : '#10B981',
                    borderRadius: '8px'
                }}>
                    {message}
                </div>
            )}

            <div className="glass-panel" style={{ padding: '2rem' }}>
                <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <label style={{ fontWeight: 600 }}>Billing Month:</label>
                    <select className="form-control" style={{ width: 'auto' }} value={month} onChange={(e) => setMonth(e.target.value)}>
                        <option>March 2024</option>
                        <option>April 2024</option>
                        <option>May 2024</option>
                    </select>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                            <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Student</th>
                            <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Amount</th>
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
                                <td style={{ padding: '1rem' }}>${student.amount}</td>
                                <td style={{ padding: '1rem' }}>
                                    {student.status === 'Paid' && <span style={{ color: '#10B981', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>Paid</span>}
                                    {student.status === 'Unpaid' && <span style={{ color: '#EF4444', background: 'rgba(239, 68, 68, 0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>Unpaid</span>}
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    {student.status !== 'Paid' && (
                                        <button
                                            onClick={() => handleMark(student._id, 'Paid')}
                                            style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10B981', padding: '0.4rem 1rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', marginRight: '0.5rem' }}
                                        >
                                            Mark Paid
                                        </button>
                                    )}
                                    {student.status !== 'Unpaid' && (
                                        <button
                                            onClick={() => handleMark(student._id, 'Unpaid')}
                                            title="This will trigger an SMS to the Parent"
                                            style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#EF4444', padding: '0.4rem 1rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                                        >
                                            Mark Unpaid (Send SMS)
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageFees;
