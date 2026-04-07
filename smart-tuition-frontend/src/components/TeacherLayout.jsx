import React, { useContext } from 'react';
import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './TeacherLayout.css';

const TeacherLayout = () => {
    const { user, loading } = useContext(AuthContext);

    if (loading) return <div>Loading...</div>;

    // Protect this layout: Only teachers can access
    if (!user || user.role !== 'teacher') {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="teacher-layout">
            {/* Sidebar Navigation */}
            <aside className="teacher-sidebar glass-panel">
                <div className="sidebar-header">
                    <h2>Teacher Portal</h2>
                    <p className="center-id">Center ID: {user.tuitionCenter}</p>
                </div>

                <nav className="sidebar-nav">
                    <NavLink to="/dashboard/teacher/overview" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        Dashboard Overview
                    </NavLink>
                    <NavLink to="/dashboard/teacher/students" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        Manage Students
                    </NavLink>
                    <NavLink to="/dashboard/teacher/attendance" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        Attendance Tracking
                    </NavLink>
                    <NavLink to="/dashboard/teacher/homework" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        Homework Assigned
                    </NavLink>
                    <NavLink to="/dashboard/teacher/progress" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        Student Progress
                    </NavLink>
                    <NavLink to="/dashboard/teacher/fees" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        Fee Payments
                    </NavLink>
                    <NavLink to="/dashboard/teacher/notices" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        Center Notices
                    </NavLink>
                    <NavLink to="/dashboard/teacher/complaints" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        Complaints log
                    </NavLink>
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="teacher-main-content">
                <div className="glass-panel content-wrapper">
                    {/* Outlet renders the matched child route component */}
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default TeacherLayout;
