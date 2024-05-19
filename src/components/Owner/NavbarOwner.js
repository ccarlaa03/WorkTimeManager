import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const NavbarOwner = () => {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');
  // Funcția logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('api/login/');
  };

  return (
    <nav className="navbar">
      <ul>
        <li>
          <NavLink to="/owner-dashboard/" className={({ isActive }) => isActive ? 'active' : ''}>
            Dashboard 
          </NavLink>
        </li>
        <li>
          <NavLink to="/owner-statistici" className={({ isActive }) => isActive ? 'active' : ''}>
           Angajati
          </NavLink>
        </li>
        <li>
          <NavLink to="/owner-setari" className={({ isActive }) => isActive ? 'active' : ''}>
            Setări companie
          </NavLink>
        </li>
        <li>
          <NavLink to="/owner-rapoarte" className={({ isActive }) => isActive ? 'active' : ''}>
            Rapoarte feedback
          </NavLink>
          </li>
          <li>
          <NavLink to="/owner-rapoarte" className={({ isActive }) => isActive ? 'active' : ''}>
            Rapoarte cursuri
          </NavLink>
          </li>
          <li>
          <NavLink to="/logout" onClick={handleLogout}>
            Log out
          </NavLink>
          </li>
      </ul>
    </nav>
  );
};

export default NavbarOwner;
