import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import MobileBottomNav from './components/MobileBottomNav';
import OnboardingModal from './components/OnboardingModal';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

const Browse = lazy(() => import('./pages/Browse'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Swaps = lazy(() => import('./pages/Swaps'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const Teams = lazy(() => import('./pages/Teams'));
const TeamDetail = lazy(() => import('./pages/TeamDetail'));
const Profile = lazy(() => import('./pages/Profile'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Workspaces = lazy(() => import('./pages/Workspaces'));
const NotFound = lazy(() => import('./pages/NotFound'));

import './index.css';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner" />;
  return user ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (user && !localStorage.getItem('ss_onboarded')) {
      setShowOnboarding(true);
    }
  }, [user]);

  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} /> : <Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/dashboard" element={<ProtectedRoute><Suspense fallback={<div className="spinner" />}><Dashboard /></Suspense></ProtectedRoute>} />
        <Route path="/browse" element={<ProtectedRoute><Suspense fallback={<div className="spinner" />}><Browse /></Suspense></ProtectedRoute>} />
        <Route path="/workspaces" element={<ProtectedRoute><Suspense fallback={<div className="spinner" />}><Workspaces /></Suspense></ProtectedRoute>} />
        <Route path="/swaps" element={<ProtectedRoute><Suspense fallback={<div className="spinner" />}><Swaps /></Suspense></ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute><Suspense fallback={<div className="spinner" />}><CalendarPage /></Suspense></ProtectedRoute>} />
        <Route path="/teams" element={<ProtectedRoute><Suspense fallback={<div className="spinner" />}><Teams /></Suspense></ProtectedRoute>} />
        <Route path="/teams/:id" element={<ProtectedRoute><Suspense fallback={<div className="spinner" />}><TeamDetail /></Suspense></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute><Suspense fallback={<div className="spinner" />}><Leaderboard /></Suspense></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Suspense fallback={<div className="spinner" />}><Profile /></Suspense></ProtectedRoute>} />
        <Route path="/profile/:id" element={<ProtectedRoute><Suspense fallback={<div className="spinner" />}><UserProfile /></Suspense></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><Suspense fallback={<div className="spinner" />}><AdminDashboard /></Suspense></ProtectedRoute>} />
        <Route path="*" element={<Suspense fallback={<div className="spinner" />}><NotFound /></Suspense>} />
      </Routes>
      {!user && <Footer />}
      {user && user.role !== 'admin' && <MobileBottomNav />}
      {showOnboarding && (
        <OnboardingModal onDone={() => setShowOnboarding(false)} />
      )}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <SocketProvider>
              <Navbar />
              <ErrorBoundary>
                <AppRoutes />
              </ErrorBoundary>
            </SocketProvider>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
