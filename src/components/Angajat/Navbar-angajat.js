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
          <NavLink to="/employee-dashboard" activeclassname="active">Dashboard</NavLink>
        </li>
        <li>
          <NavLink to="/program-lucru" activeclassname="active">Program de lucru</NavLink>
        </li>
        <li>
          <NavLink to="/concedii" activeclassname="active"> Concedi</NavLink>
        </li>
        <li>
          <NavLink to="/feedback-ang" activeclassname="active">Feedback</NavLink>
        </li>

        <li>
          <NavLink to="/logout" onClick={handleLogout}>Log out</NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default NavbarAngajat;
