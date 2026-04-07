import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: '', message: '' });
        
        if (password !== confirmPassword) {
            setStatus({ type: 'error', message: 'Passwords do not match!' });
            return;
        }

        setIsLoading(true);

        try {
            const res = await axios.post(`https://smart-tuition-curriculum.onrender.com/api/auth/reset-password/${token}`, { password });
            setStatus({ type: 'success', message: res.data.message });
            setTimeout(() => {
                navigate('/login');
            }, 2500);
        } catch (err) {
            setStatus({ type: 'error', message: err.response?.data?.message || 'Password reset failed. Link may be invalid/expired.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="form-container glass-panel">
            <h2 className="form-title">Create New Password</h2>
            <p className="form-subtitle">Please enter your new password below</p>

            {status.message && (
                <div className={status.type === 'error' ? 'error-msg' : 'success-msg'} style={status.type === 'success' ? { color: 'green', marginBottom: '1rem', textAlign: 'center' } : {}}>
                    {status.message}
                    {status.type === 'success' && <div style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Redirecting to login...</div>}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>New Password</label>
                    <input
                        type="password"
                        className="form-control"
                        placeholder="Enter new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Confirm Password</label>
                    <input
                        type="password"
                        className="form-control"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>

                <div style={{ marginTop: '2rem' }}>
                    <button type="submit" className="btn btn-primary" disabled={isLoading || status.type === 'success'}>
                        {isLoading ? 'Updating...' : 'Update Password'}
                    </button>
                </div>
            </form>

            <div className="auth-links" style={{ marginTop: '1.5rem' }}>
                <Link to="/login" className="link-text">Return to Login</Link>
            </div>
        </div>
    );
};

export default ResetPassword;
