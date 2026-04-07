import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const res = await axios.post('https://smart-tuition-curriculum.onrender.com/api/auth/login', formData);
            login(res.data.user, res.data.token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="form-container glass-panel">
            <h2 className="form-title">Welcome Back</h2>
            <p className="form-subtitle">Login to access your tuition dashboard</p>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Email Address</label>
                    <input
                        type="email"
                        className="form-control"
                        placeholder="enter your email"
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
                        placeholder="enter your password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                    />
                </div>

                {error && <div className="error-msg">{error}</div>}

                <div style={{ marginTop: '2rem' }}>
                    <button type="submit" className="btn btn-primary" disabled={isLoading}>
                        {isLoading ? 'Signing In...' : 'Sign In'}
                    </button>
                </div>
            </form>

            <div className="auth-links" style={{ marginBottom: '1rem', textAlign: 'center' }}>
                <Link to="/forgot-password" className="link-text">Forgot Password?</Link>
            </div>

            <div className="auth-links">
                Don't have an account? <Link to="/register-parent" className="link-text">Parent Sign Up</Link> or{' '}
                <Link to="/register-teacher" className="link-text">Teacher Sign Up</Link>
            </div>
        </div>
    );
};

export default Login;
