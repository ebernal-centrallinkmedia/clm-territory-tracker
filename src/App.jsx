import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import MapView from './pages/MapView';
import Dashboard from './pages/Dashboard';
import FollowUps from './pages/FollowUps';
import Nav from './components/Nav';

function ProtectedLayout({ children, user }) {
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: '#f1f5f9' }}>
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {children}
      </div>
      <Nav />
    </div>
  );
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100dvh', background: '#0a1628', color: '#14b8c8', fontSize: 18 }}>
      Loading CLM Tracker…
    </div>
  );

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/" element={
          <ProtectedLayout user={user}>
            <MapView user={user} />
          </ProtectedLayout>
        } />
        <Route path="/dashboard" element={
          <ProtectedLayout user={user}>
            <Dashboard user={user} />
          </ProtectedLayout>
        } />
        <Route path="/follow-ups" element={
          <ProtectedLayout user={user}>
            <FollowUps user={user} />
          </ProtectedLayout>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
