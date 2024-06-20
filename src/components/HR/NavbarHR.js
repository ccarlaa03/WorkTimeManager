import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const NavbarHR = () => {
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
          <NavLink to="/HR-dashboard" className={({ isActive }) => isActive ? 'active' : ''}>Dashboard HR</NavLink>
        </li>
        <li>
          <NavLink to="/gestionare-ang" className={({ isActive }) => isActive ? 'active' : ''}>Gestionare angajați</NavLink>
        </li>
        <li>
          <NavLink to="/gestionare-prog" className={({ isActive }) => isActive ? 'active' : ''}>Program de lucru</NavLink>
        </li>
        <li>
          <NavLink to="/formulare-feedback" className={({ isActive }) => isActive ? 'active' : ''}> Feedback</NavLink>
        </li>
        <li>
          <NavLink to="/gestionare-concedii" className={({ isActive }) => isActive ? 'active' : ''}>Concedii</NavLink>
        </li>
        <li>
          <NavLink to="/gestionare-training" className={({ isActive }) => isActive ? 'active' : ''}>Training</NavLink>
        </li>
        <li>
          <NavLink to="/logout" onClick={handleLogout}>Log out</NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default NavbarHR;
