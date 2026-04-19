import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import Login from './pages/Login';
import Lobby from './pages/Lobby';
import Catalog from './pages/Catalog';
import AdminDashboard from './pages/AdminDashboard';
import Layout from './components/Layout';

function App() {
  const { token, user, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // If no auth context and no token exists
  if (!token) {
    return <Login />;
  }

  const CatalogWall = ({ children }) => {
     if (user?.role === 'admin') return children;
     if (!user?.isApproved) return <Navigate to="/discover" replace />;
     return children;
  };

  const AdminRoute = ({ children }) => {
     if (user?.role !== 'admin') return <Navigate to="/" replace />;
     return children;
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Navigate to="/" replace />} />
        
        <Route path="/" element={<Layout />}>
            <Route index element={user?.role === 'admin' ? <Navigate to="/admin" replace /> : (user?.isApproved ? <Navigate to="/catalog" replace /> : <Navigate to="/discover" replace />)} />
            <Route path="discover" element={<Lobby />} />
            <Route path="catalog/:categoryId?" element={<CatalogWall><Catalog /></CatalogWall>} />
            <Route path="admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
