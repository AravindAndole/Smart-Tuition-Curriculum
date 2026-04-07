import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StudentsList = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Form State (Create)
    const [newStudentName, setNewStudentName] = useState('');
    const [newStudentEmail, setNewStudentEmail] = useState('');
    const [newStudentPassword, setNewStudentPassword] = useState('');
    const [generatedCreds, setGeneratedCreds] = useState(null);
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState('');

    // Form State (Edit)
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', email: '', password: '' });
    const [updateLoading, setUpdateLoading] = useState(false);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/teacher/students', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data.success) {
                    setStudents(res.data.data);
                }
            } catch (err) {
                setError('Failed to load students');
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, []);
    const handleCreateStudent = async (e) => {
        e.preventDefault();
        if (!newStudentName.trim()) return;

        setCreateLoading(true);
        setCreateError('');
        setGeneratedCreds(null);

        const token = localStorage.getItem('token'); // Fallback if auth context isn't passed down easily

        try {
            const res = await axios.post('http://localhost:5000/api/auth/student', {
                name: newStudentName,
                email: newStudentEmail,
                password: newStudentPassword
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setGeneratedCreds(res.data.data);
            setNewStudentName('');
            setNewStudentEmail('');
            setNewStudentPassword('');

            // Add to list immediately so teacher sees it sync
            setStudents(prev => [{
                _id: res.data.data._id,
                name: res.data.data.name,
                studentId: res.data.data.studentId
            }, ...prev]);

        } catch (err) {
            setCreateError(err.response?.data?.message || 'Failed to generate student');
        } finally {
            setCreateLoading(false);
        }
    };

    const handleEditClick = (student) => {
        setEditingId(student._id);
        setEditForm({ name: student.name, email: '', password: '' }); // Only set name explicitly, leave email/password blank unless changing
    };

    const handleUpdateSubmit = async (e, id) => {
        e.preventDefault();
        setUpdateLoading(true);
        const token = localStorage.getItem('token');
        try {
            const res = await axios.put(`http://localhost:5000/api/teacher/students/${id}`, editForm, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Update local state
            setStudents(prev => prev.map(s => s._id === id ? { ...s, name: res.data.data.name } : s));
            setEditingId(null);
            alert("Student details updated successfully!");
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update student');
        } finally {
            setUpdateLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this student and their account entirely?")) return;
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`http://localhost:5000/api/teacher/students/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStudents(prev => prev.filter(s => s._id !== id));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete student');
        }
    };

    if (loading) return <div>Loading Students...</div>;

    return (
        <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Manage Students</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Add new students and manage existing accounts.</p>

            {/* CREATE STUDENT FORM */}
            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                    Create New Student Account
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                    Enter a name at minimum. If you leave the Email and Password fields blank, a random secure login will be automatically generated.
                </p>

                <form onSubmit={handleCreateStudent} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Full Name *</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Student Name"
                            value={newStudentName}
                            onChange={(e) => setNewStudentName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Custom Email (Optional)</label>
                        <input
                            type="email"
                            className="form-control"
                            placeholder="e.g. john@student.com"
                            value={newStudentEmail}
                            onChange={(e) => setNewStudentEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Custom Password (Optional)</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. Pass123!"
                            value={newStudentPassword}
                            onChange={(e) => setNewStudentPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem 1rem', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} disabled={createLoading}>
                        {createLoading ? 'Generating...' : 'Create Account'}
                    </button>
                </form>

                {createError && <p className="error-msg" style={{ textAlign: 'left', marginTop: '1rem' }}>{createError}</p>}

                {generatedCreds && (
                    <div style={{
                        marginTop: '2rem',
                        padding: '1.5rem',
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '8px'
                    }}>
                        <h4 style={{ color: '#10B981', marginBottom: '1rem' }}>✅ Account Successfully Generated!</h4>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '1rem' }}>
                            Please copy and share these secure login details with the student immediately:
                        </p>

                        <div style={{ background: 'rgba(0,0,0,0.4)', padding: '1.5rem', borderRadius: '8px', fontFamily: 'monospace', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ marginBottom: '0.5rem' }}><strong style={{ color: 'var(--text-muted)' }}>Student Name:</strong> {generatedCreds.name}</div>
                            <div style={{ marginBottom: '0.5rem' }}><strong style={{ color: 'var(--text-muted)' }}>Student DB ID:</strong> {generatedCreds.studentId}</div>
                            <div style={{ marginBottom: '0.5rem' }}><strong style={{ color: 'var(--text-muted)' }}>Login Email:</strong> <span style={{ color: '#818CF8' }}>{generatedCreds.loginEmail}</span></div>
                            <div><strong style={{ color: 'var(--text-muted)' }}>Password:</strong> <span style={{ color: '#818CF8', background: 'rgba(129, 140, 248, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>{generatedCreds.password}</span></div>
                        </div>
                    </div>
                )}
            </div>

            {/* STUDENT LIST */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                    Enrolled Students
                </h3>

                {students.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                        No students found. Generate a student above to get started.
                    </p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                    <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Name</th>
                                    <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Student ID</th>
                                    <th style={{ padding: '1rem', color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((student, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        {editingId === student._id ? (
                                            <td colSpan="3" style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)' }}>
                                                <form onSubmit={(e) => handleUpdateSubmit(e, student._id)} style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1.5fr auto auto', gap: '0.5rem', alignItems: 'center', width: '100%' }}>
                                                    <input 
                                                        type="text" className="form-control" value={editForm.name} 
                                                        onChange={e => setEditForm({...editForm, name: e.target.value})} 
                                                        placeholder="Name" required
                                                    />
                                                    <input 
                                                        type="email" className="form-control" value={editForm.email} 
                                                        onChange={e => setEditForm({...editForm, email: e.target.value})} 
                                                        placeholder="New Email (leave blank to keep)"
                                                    />
                                                    <input 
                                                        type="text" className="form-control" value={editForm.password} 
                                                        onChange={e => setEditForm({...editForm, password: e.target.value})} 
                                                        placeholder="New Password (leave blank to keep)"
                                                    />
                                                    <button type="submit" className="btn btn-primary" disabled={updateLoading} style={{ padding: '0.5rem 1rem', width: 'auto' }}>Save</button>
                                                    <button type="button" onClick={() => setEditingId(null)} style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', width: 'auto' }}>Cancel</button>
                                                </form>
                                            </td>
                                        ) : (
                                            <>
                                                <td style={{ padding: '1rem' }}>{student.name}</td>
                                                <td style={{ padding: '1rem', fontFamily: 'monospace', color: '#818CF8' }}>{student.studentId}</td>
                                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                    <button onClick={() => handleEditClick(student)} style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'white', padding: '0.4rem 1rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', marginRight: '0.5rem' }}>Edit</button>
                                                    <button onClick={() => handleDelete(student._id)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#EF4444', padding: '0.4rem 1rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Delete</button>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

        </div>
    );
};

export default StudentsList;
