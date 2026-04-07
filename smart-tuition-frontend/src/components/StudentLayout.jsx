import React, { useContext } from 'react';
import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './StudentLayout.css';

const StudentLayout = () => {
    const { user } = useContext(AuthContext);

    // Hardcoded route guard: strictly restrict to students and parents
    if (user?.role !== 'student' && user?.role !== 'parent') {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="student-layout">
            <aside className="student-sidebar">
                <div className="sidebar-header">
                    <h2>{user?.role === 'parent' ? 'Parent Portal' : 'Student Portal'}</h2>
                    <p>ID: {user?.student || 'Student'}</p>
                </div>

                <nav className="sidebar-nav">
                    <NavLink to="/dashboard/student/overview" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                        Dashboard Overview
                    </NavLink>
                    <NavLink to="/dashboard/student/attendance" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                        {user?.role === 'parent' ? 'Childs Attendance' : 'My Attendance'}
                    </NavLink>
                    <NavLink to="/dashboard/student/homework" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                        {user?.role === 'parent' ? 'Assign Homework' : 'My Homework'}
                    </NavLink>
                    <NavLink to="/dashboard/student/progress" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                        {user?.role === 'parent' ? 'Childs Progress' : 'Grades & Progress'}
                    </NavLink>
                    <NavLink to="/dashboard/student/fees" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                        {user?.role === 'parent' ? 'Fee Status' : 'My Fee Status'}
                    </NavLink>
                    <NavLink to="/dashboard/student/notices" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                        Center Notices
                    </NavLink>
                </nav>
            </aside>

            <main className="student-main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default StudentLayout;
