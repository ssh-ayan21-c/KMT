import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import useAuthStore from './store/authStore';
import Login from './pages/Login';
import Lobby from './pages/Lobby';
import Catalog from './pages/Catalog';
import AdminDashboard from './pages/AdminDashboard';
import About from './pages/About';
import Layout from './components/Layout';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
    const { token, user } = useAuthStore();
    const location = useLocation();

    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!user) {
        // This state handles the gap between token detection and user data fetching
        return (
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#393939', color: 'white' }}>
                 <div className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>KAMRAN MEKRANI TRADE</div>
                 <div style={{ color: 'var(--text-secondary)' }}>Synchronizing profile...</div>
            </div>
        );
    }

    if (requireAdmin && user.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return children;
};

function App() {
  const { token, user, initialize } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const runInit = async () => {
        try {
            await initialize();
        } catch (e) {
            console.error("Init failed", e);
        } finally {
            if (mounted) setIsInitializing(false);
        }
    };

    runInit();
    
    return () => { mounted = false; };
  }, [initialize]);

  if (isInitializing) {
    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#393939', color: 'white' }}>
             <img src="/logo.png" alt="KMT Logo" style={{ height: '80px', filter: 'invert(1)', marginBottom: '2rem' }} />
             <div style={{ color: 'var(--text-secondary)', fontWeight: 300, letterSpacing: '0.3em', fontSize: '0.7rem' }}>ESTABLISHING ENCRYPTED CONNECTION...</div>
             <div style={{ marginTop: '2rem', width: '200px', height: '2px', background: 'rgba(255,255,255,0.1)', position: 'relative', overflow: 'hidden' }}>
                  <div className="loading-bar-anim" style={{ height: '100%', background: 'var(--accent-primary)', width: '50%' }}></div>
             </div>
             <button 
                onClick={() => { localStorage.clear(); window.location.reload(); }} 
                style={{ marginTop: '3rem', background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)', padding: '0.4rem 0.8rem', fontSize: '0.6rem', borderRadius: '4px', cursor: 'pointer' }}
             >
                FORCE LOGOUT / RESET SESSION
             </button>
        </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={!token ? <Login /> : <Navigate to="/" replace />} />
      
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={
              user?.role === 'admin' 
                ? <Navigate to="/admin" replace /> 
                : (user?.isApproved ? <Navigate to="/catalog" replace /> : <Navigate to="/discover" replace />)
          } />
          
          <Route path="discover" element={<Lobby />} />
          
          <Route path="catalog/:categoryId?" element={<Catalog />} />
          
          <Route path="about" element={<About />} />
          
          <Route path="admin" element={
              <ProtectedRoute requireAdmin={true}>
                  <AdminDashboard />
              </ProtectedRoute>
          } />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
