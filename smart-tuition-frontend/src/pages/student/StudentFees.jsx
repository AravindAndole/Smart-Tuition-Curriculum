import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const StudentFees = () => {
    const { user, token } = useContext(AuthContext);
    const [fees, setFees] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get('https://smart-tuition-curriculum.onrender.com/api/student/dashboard', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setFees(res.data.data.fees || []);
            } catch (error) {
                console.error("Error fetching fees:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [token]);

    if (loading) return <div style={{ color: 'var(--text-muted)' }}>Loading Fees...</div>;

    return (
        <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                {user?.role === 'parent' ? 'Childs Fee Status' : 'My Fee Status'}
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                {user?.role === 'parent' ? 'Review your child\'s monthly payment status.' : 'Review your monthly payment status.'}
            </p>

            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '12px' }}>
                <table className="student-data-table">
                    <thead>
                        <tr>
                            <th>Month</th>
                            <th>Amount</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {fees.length === 0 ? (
                            <tr>
                                <td colSpan="3" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                    No fee records found.
                                </td>
                            </tr>
                        ) : (
                            fees.map((record, index) => (
                                <tr key={index}>
                                    <td style={{ fontWeight: 500 }}>{record.month}</td>
                                    <td>${record.amount}</td>
                                    <td>
                                        <span className={`status-badge ${record.status === 'Paid' ? 'status-green' : 'status-red'}`}>
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

export default StudentFees;
