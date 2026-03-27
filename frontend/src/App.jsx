import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfileBuilder from './pages/candidate/ProfileBuilder';
import ProfilePreview from './pages/candidate/ProfilePreview';
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import CandidateDetail from './pages/recruiter/CandidateDetail';

function ProtectedRoute({ children, requiredRole }) {
  const { user, token } = useAuthStore();
  if (!token || !user) return <Navigate to="/login" replace />;
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'recruiter' ? '/recruiter' : '/build'} replace />;
  }
  return children;
}

export default function App() {
  const { user, token } = useAuthStore();
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ style: { background:'#111118', color:'#f0f0f8', border:'1px solid #1e1e2e', fontFamily:'DM Sans, sans-serif' } }} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={token ? <Navigate to={user?.role==='recruiter'?'/recruiter':'/build'} replace /> : <LoginPage />} />
        <Route path="/register" element={token ? <Navigate to={user?.role==='recruiter'?'/recruiter':'/build'} replace /> : <RegisterPage />} />
        <Route path="/build" element={<ProtectedRoute requiredRole="candidate"><ProfileBuilder /></ProtectedRoute>} />
        <Route path="/profile/:shareId" element={<ProfilePreview />} />
        <Route path="/my-profile" element={<ProtectedRoute requiredRole="candidate"><ProfilePreview /></ProtectedRoute>} />
        <Route path="/recruiter" element={<ProtectedRoute requiredRole="recruiter"><RecruiterDashboard /></ProtectedRoute>} />
        <Route path="/recruiter/candidate/:id" element={<ProtectedRoute requiredRole="recruiter"><CandidateDetail /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}