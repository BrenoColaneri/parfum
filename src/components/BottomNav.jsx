import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Search, Heart, CalendarDays } from 'lucide-react';

const BottomNav = () => {
  const location = useLocation();
  // Don't show bottom nav on analysis screen (often considered a detail/modal screen in flows)
  // Actually, let's show it everywhere except if explicitly hidden, but the prompt says Screen 3 is a rationale.
  // We will show it on Home and Inventory.
  
  if (location.pathname === '/analysis') {
    return null;
  }

  return (
    <nav className="bottom-nav">
      <NavLink 
        to="/" 
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
      >
        <Home size={24} />
        <span>Início</span>
      </NavLink>
      
      <NavLink 
        to="/inventory" 
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
      >
        <Search size={24} />
        <span>Biblioteria</span>
      </NavLink>
      <NavLink 
        to="/wishlist" 
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
      >
        <Heart size={24} />
        <span>Desejos</span>
      </NavLink>
      <NavLink 
        to="/history" 
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
      >
        <CalendarDays size={24} />
        <span>Histórico</span>
      </NavLink>
    </nav>
  );
};

export default BottomNav;
