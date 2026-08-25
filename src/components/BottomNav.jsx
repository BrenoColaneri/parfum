import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Search, Heart, CalendarDays, Sparkles } from 'lucide-react';

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
        <span>Perfil</span>
      </NavLink>
      <NavLink 
        to="/analysis" 
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
      >
        <Sparkles size={24} />
        <span>Ferramentas</span>
      </NavLink>
    </nav>
  );
};

export default BottomNav;
