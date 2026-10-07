import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Search, Heart, CalendarDays, Settings } from 'lucide-react';

const BottomNav = () => {
  const location = useLocation();

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
      <NavLink 
        to="/settings" 
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
      >
        <Settings size={24} />
        <span>Ajustes</span>
      </NavLink>
    </nav>
  );
};

export default BottomNav;
