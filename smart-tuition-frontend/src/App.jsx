import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import RegisterTeacher from './pages/RegisterTeacher';
import RegisterParent from './pages/RegisterParent';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import TeacherLayout from './components/TeacherLayout';
import Overview from './pages/teacher/Overview';
import StudentsList from './pages/teacher/StudentsList';
import ManageAttendance from './pages/teacher/ManageAttendance';
import ManageHomework from './pages/teacher/ManageHomework';
import ManageProgress from './pages/teacher/ManageProgress';
import ManageFees from './pages/teacher/ManageFees';
import ManageNotices from './pages/teacher/ManageNotices';

// Student Layout
import StudentLayout from './components/StudentLayout';
import StudentOverview from './pages/student/StudentOverview';
import StudentAttendance from './pages/student/StudentAttendance';
import StudentHomework from './pages/student/StudentHomework';
import StudentProgress from './pages/student/StudentProgress';
import StudentFees from './pages/student/StudentFees';
import StudentNotices from './pages/student/StudentNotices';

import { AuthContext } from './context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <div className="content">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/register-teacher" element={<RegisterTeacher />} />
          <Route path="/register-parent" element={<RegisterParent />} />
          {/* Generic Root Dashboard (redirects teacher to sidebar, renders student/parent view directly) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Teacher Dedicated Sub-Routes with Sidebar Layout */}
          <Route path="/dashboard/teacher" element={<ProtectedRoute><TeacherLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<Overview />} />
            {/* Adding placeholders for the rest of the pages to prevent 404s while building */}
            <Route path="students" element={<StudentsList />} />
            <Route path="attendance" element={<ManageAttendance />} />
            <Route path="homework" element={<ManageHomework />} />
            <Route path="progress" element={<ManageProgress />} />
            <Route path="fees" element={<ManageFees />} />
            <Route path="notices" element={<ManageNotices />} />
            <Route path="complaints" element={<div style={{ padding: '2rem' }}><h2>Feature Development Incoming...</h2></div>} />
          </Route>

          {/* Student Dedicated Sub-Routes with Sidebar Layout */}
          <Route path="/dashboard/student" element={<ProtectedRoute><StudentLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<StudentOverview />} />
            <Route path="attendance" element={<StudentAttendance />} />
            <Route path="homework" element={<StudentHomework />} />
            <Route path="progress" element={<StudentProgress />} />
            <Route path="fees" element={<StudentFees />} />
            <Route path="notices" element={<StudentNotices />} />
          </Route>



          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;
