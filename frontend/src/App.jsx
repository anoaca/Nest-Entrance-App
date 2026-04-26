import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import StudentLogin from './pages/StudentLogin';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import StudentExam from './pages/StudentExam';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to={requiredRole === 'admin' ? "/admin/login" : "/"} />;
  if (requiredRole && user.role !== requiredRole) {
     return <Navigate to="/" />; // fallback
  }
  return children;
};

function AppConfig() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        {/* Student Routes */}
        <Route path="/" element={<StudentLogin />} />
        <Route path="/exam" element={<ProtectedRoute requiredRole="student"><StudentExam /></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/*" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppConfig />
    </AuthProvider>
  );
}

export default App;
