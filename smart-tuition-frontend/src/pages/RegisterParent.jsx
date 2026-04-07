import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const RegisterParent = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        studentId: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const res = await axios.post('http://localhost:5000/api/auth/register/parent', formData);
            login(res.data.user, res.data.token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Check if Student ID exists.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="form-container glass-panel">
            <h2 className="form-title">Parent Registration</h2>
            <p className="form-subtitle">Link your account to an existing student</p>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Your Name</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Jane Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Email Address</label>
                    <input
                        type="email"
                        className="form-control"
                        placeholder="parent@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Password</label>
                    <input
                        type="password"
                        className="form-control"
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Student ID</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Enter Student ID provided by center"
                        value={formData.studentId}
                        onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                        required
                    />
                    <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block', marginTop: '0.25rem' }}>
                        Note: For this test phase, the student must already exist in the database.
                    </small>
                </div>

                {error && <div className="error-msg">{error}</div>}

                <div style={{ marginTop: '2rem' }}>
                    <button type="submit" className="btn btn-primary" disabled={isLoading}>
                        {isLoading ? 'Verifying & Creating...' : 'Link Account & Register'}
                    </button>
                </div>
            </form>

            <div className="auth-links">
                Already have an account? <Link to="/login" className="link-text">Login here</Link>
            </div>
        </div>
    );
};

export default RegisterParent;
