import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);

    // Set axios default auth header globally
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete axios.defaults.headers.common['Authorization'];
    }

    // Fetch logged in user details if token exists
    useEffect(() => {
        const fetchUser = async () => {
            try {
                if (token) {
                    const res = await axios.get('http://localhost:5000/api/auth/me');
                    setUser(res.data.data);
                }
            } catch (error) {
                console.error('Error fetching user:', error);
                logout();
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [token]);

    const login = (userData, authToken) => {
        localStorage.setItem('token', authToken);
        setToken(authToken);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
