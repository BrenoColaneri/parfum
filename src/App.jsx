import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAppContext } from './context/AppProvider';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

import Login from './pages/Login';
import Home from './pages/Home';
import Inventory from './pages/Inventory';
import Wishlist from './pages/Wishlist';
import Analysis from './pages/Analysis';
import PerfumeDetails from './pages/PerfumeDetails';
import History from './pages/History';
import Settings from './pages/Settings';
import BottomNav from './components/BottomNav';
import FloatingChat from './components/FloatingChat';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isAuthLoading } = useAppContext();
  
  if (isAuthLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-color)', color: 'var(--accent)' }}>
        <Loader2 className="lucide-spin" size={48} style={{ marginBottom: '1rem' }} />
        <p style={{ color: 'var(--text-muted)' }}>Carregando sua coleção...</p>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="app-container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/inventory" element={<PrivateRoute><Inventory /></PrivateRoute>} />
          <Route path="/wishlist" element={<PrivateRoute><Wishlist /></PrivateRoute>} />
          <Route path="/analysis" element={<PrivateRoute><Analysis /></PrivateRoute>} />
          <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
          <Route path="/perfume/:id" element={<PrivateRoute><PerfumeDetails /></PrivateRoute>} />
        </Routes>
        
        {/* Render BottomNav only if authenticated (since it relies on context partially, and shouldn't be seen on login) */}
        <Routes>
          <Route path="/login" element={null} />
          <Route path="*" element={
            <PrivateRoute>
              <FloatingChat />
              <BottomNav />
            </PrivateRoute>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
