import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const NavbarAngajat = () => {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');
  // Funcția logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <ul className="navbar-nav">
        <li>
          <NavLink to="/user-dashboard" activeClassName="active">Dashboard</NavLink>
        </li>
        <li>
          <NavLink to="/program-lucru" activeClassName="active">Program de lucru</NavLink>
        </li>
        <li>
          <NavLink to="/concedii" activeClassName="active"> Concedi</NavLink>
        </li>
        <li>
          <NavLink to="/feedback-ang" activeClassName="active">Feedback</NavLink>
        </li>
        <li>
          <NavLink to="/user-profil" activeClassName="active">Profilul meu</NavLink>
        </li>
        <li>
          <NavLink to="/logout" onClick={handleLogout}>Log out</NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default NavbarAngajat;
