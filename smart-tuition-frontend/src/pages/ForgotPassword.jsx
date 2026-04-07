import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: '', message: '' });
        setIsLoading(true);

        try {
            const res = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
            setStatus({ type: 'success', message: res.data.message });
        } catch (err) {
            setStatus({ type: 'error', message: err.response?.data?.message || 'Failed to send reset link.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="form-container glass-panel">
            <h2 className="form-title">Reset Password</h2>
            <p className="form-subtitle">Enter your email to receive a password reset link</p>

            {status.message && (
                <div className={status.type === 'error' ? 'error-msg' : 'success-msg'} style={status.type === 'success' ? { color: 'green', marginBottom: '1rem', textAlign: 'center' } : {}}>
                    {status.message}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Email Address</label>
                    <input
                        type="email"
                        className="form-control"
                        placeholder="Enter your registered email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div style={{ marginTop: '2rem' }}>
                    <button type="submit" className="btn btn-primary" disabled={isLoading}>
                        {isLoading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </div>
            </form>

            <div className="auth-links" style={{ marginTop: '1.5rem' }}>
                Remember your password? <Link to="/login" className="link-text">Sign In back here</Link>
            </div>
        </div>
    );
};

export default ForgotPassword;
