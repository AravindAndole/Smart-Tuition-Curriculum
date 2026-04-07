import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <Link to="/" className="nav-brand">
                <span className="text-gradient">Smart Tuition Curriculum</span>
            </Link>
            <div className="nav-links">
                {user ? (
                    <>
                        {user.role !== 'student' && (
                            <>
                                <Link to="/dashboard" className="nav-item">Dashboard</Link>
                                <Link to="/chat" className="nav-item">Messages</Link>
                                <span style={{ color: 'var(--text-muted)' }}>|</span>
                                <span style={{ color: 'var(--secondary)', fontWeight: 600 }}>{user.name} ({user.role})</span>
                            </>
                        )}
                        <button onClick={handleLogout} className="btn-logout">Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="nav-item">Login</Link>
                        <Link to="/register-teacher" className="nav-item">Teacher Setup</Link>
                        <Link to="/register-parent" className="nav-item">Parent Setup</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
