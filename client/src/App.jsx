import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';
import ErrorBoundary from './components/ErrorBoundary';
import Spinner from './components/Spinner';
import Navbar from './components/Navbar';
import MobileBottomNav from './components/MobileBottomNav';
const OnboardingModal = lazy(() => import('./components/OnboardingModal'));
const CommandPalette = lazy(() => import('./components/CommandPalette'));
const KeyboardShortcutsModal = lazy(() => import('./components/KeyboardShortcutsModal'));
const StairsPreloader = lazy(() => import('./components/StairsPreloader'));
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));

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
const Badges = lazy(() => import('./pages/Badges'));
const NotFound = lazy(() => import('./pages/NotFound'));
const NavbarPreview = lazy(() => import('./pages/NavbarPreview'));
const GoogleAuthCallback = lazy(() => import('./pages/GoogleAuthCallback'));

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  return user ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { user } = useAuth();
  const location = useLocation();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (user && !localStorage.getItem('ss_onboarded')) {
      setShowOnboarding(true);
    }
  }, [user]);

  return (
    <>
      <Routes>
        <Route path="/" element={<Suspense fallback={<Spinner />}><Landing /></Suspense>} />
        <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} /> : <Suspense fallback={<Spinner />}><Login /></Suspense>} />
        <Route path="/register" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} /> : <Suspense fallback={<Spinner />}><Register /></Suspense>} />
        <Route path="/forgot-password" element={<Suspense fallback={<Spinner />}><ForgotPassword /></Suspense>} />
        <Route path="/reset-password/:token" element={<Suspense fallback={<Spinner />}><ResetPassword /></Suspense>} />
        <Route path="/dashboard" element={<ProtectedRoute><Suspense fallback={<Spinner />}><Dashboard /></Suspense></ProtectedRoute>} />
        <Route path="/browse" element={<ProtectedRoute><Suspense fallback={<Spinner />}><Browse /></Suspense></ProtectedRoute>} />
        <Route path="/workspaces" element={<ProtectedRoute><Suspense fallback={<Spinner />}><Workspaces /></Suspense></ProtectedRoute>} />
        <Route path="/swaps" element={<ProtectedRoute><Suspense fallback={<Spinner />}><Swaps /></Suspense></ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute><Suspense fallback={<Spinner />}><CalendarPage /></Suspense></ProtectedRoute>} />
        <Route path="/teams" element={<ProtectedRoute><Suspense fallback={<Spinner />}><Teams /></Suspense></ProtectedRoute>} />
        <Route path="/teams/:id" element={<ProtectedRoute><Suspense fallback={<Spinner />}><TeamDetail /></Suspense></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute><Suspense fallback={<Spinner />}><Leaderboard /></Suspense></ProtectedRoute>} />
        <Route path="/badges" element={<ProtectedRoute><Suspense fallback={<Spinner />}><Badges /></Suspense></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Suspense fallback={<Spinner />}><Profile /></Suspense></ProtectedRoute>} />
        <Route path="/profile/:id" element={<ProtectedRoute><Suspense fallback={<Spinner />}><UserProfile /></Suspense></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><Suspense fallback={<Spinner />}><AdminDashboard /></Suspense></ProtectedRoute>} />
        <Route path="/navbar-preview" element={<Suspense fallback={<Spinner />}><NavbarPreview /></Suspense>} />
        <Route path="/auth/google/callback" element={<Suspense fallback={<Spinner />}><GoogleAuthCallback /></Suspense>} />
        <Route path="*" element={<Suspense fallback={<Spinner />}><NotFound /></Suspense>} />
      </Routes>
      {user && user.role !== 'admin' && location.pathname !== '/navbar-preview' && <MobileBottomNav />}
      {showOnboarding && (
        <Suspense fallback={null}>
          <OnboardingModal onDone={() => setShowOnboarding(false)} />
        </Suspense>
      )}
    </>
  );
}

/**
 * Shows the splash screen on every load/refresh, but only when the user
 * is NOT authenticated. Once auth loading resolves, we decide immediately.
 */
function SplashGate({ children }) {
  const { user, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!loading) {
      setShowSplash(!user);   // show splash only for guests
      setReady(true);
    }
  }, [loading, user]);

  return (
    <>
      {ready && showSplash && (
        <Suspense fallback={null}>
          <StairsPreloader onDone={() => setShowSplash(false)} />
        </Suspense>
      )}
      {children}
    </>
  );
}

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, gcTime: 5 * 60_000, retry: 1, refetchOnWindowFocus: false } } });

function Shell() {
  const location = useLocation();
  const isPreview = location.pathname === '/navbar-preview';

  return (
    <SplashGate>
      {!isPreview && <Navbar />}
      <Suspense fallback={null}>
        <CommandPalette />
        <KeyboardShortcutsModal />
      </Suspense>
      <main id="main-content">
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </main>
    </SplashGate>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <SocketProvider>
              <Shell />
            </SocketProvider>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}
