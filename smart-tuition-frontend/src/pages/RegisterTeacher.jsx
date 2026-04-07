import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const RegisterTeacher = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        tuitionCenterName: ''
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
            const res = await axios.post('https://smart-tuition-curriculum.onrender.com/api/auth/register/teacher', formData);
            login(res.data.user, res.data.token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="form-container glass-panel">
            <h2 className="form-title">Teacher Registration</h2>
            <p className="form-subtitle">Create a new account and setup a tuition center</p>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Full Name</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="John Doe"
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
                        placeholder="teacher@example.com"
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
                    <label>Tuition Center Name</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Excel Academy"
                        value={formData.tuitionCenterName}
                        onChange={(e) => setFormData({ ...formData, tuitionCenterName: e.target.value })}
                        required
                    />
                </div>

                {error && <div className="error-msg">{error}</div>}

                <div style={{ marginTop: '2rem' }}>
                    <button type="submit" className="btn btn-primary" disabled={isLoading}>
                        {isLoading ? 'Creating Account...' : 'Register Teacher'}
                    </button>
                </div>
            </form>

            <div className="auth-links">
                Already have an account? <Link to="/login" className="link-text">Login here</Link>
            </div>
        </div>
    );
};

export default RegisterTeacher;
