import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppContext } from './context/AppProvider';

import Login from './pages/Login';
import Home from './pages/Home';
import Inventory from './pages/Inventory';
import Wishlist from './pages/Wishlist';
import Analysis from './pages/Analysis';
import PerfumeDetails from './pages/PerfumeDetails';
import BottomNav from './components/BottomNav';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAppContext();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/inventory" element={<PrivateRoute><Inventory /></PrivateRoute>} />
          <Route path="/wishlist" element={<PrivateRoute><Wishlist /></PrivateRoute>} />
          <Route path="/analysis" element={<PrivateRoute><Analysis /></PrivateRoute>} />
          <Route path="/perfume/:id" element={<PrivateRoute><PerfumeDetails /></PrivateRoute>} />
        </Routes>
        
        {/* Render BottomNav only if authenticated (since it relies on context partially, and shouldn't be seen on login) */}
        <Routes>
          <Route path="/login" element={null} />
          <Route path="*" element={
            <PrivateRoute>
              <BottomNav />
            </PrivateRoute>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
