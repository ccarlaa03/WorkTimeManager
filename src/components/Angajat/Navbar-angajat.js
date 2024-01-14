import React from 'react';
import { NavLink } from 'react-router-dom';

const NavbarAngajat = () => {
  return (
    <nav className="navbar">
      <ul className="navbar-nav">
        <li>
          <NavLink to="/user-dashboard" activeClassName="active">
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/program-lucru" activeClassName="active">
            Program de Lucru
          </NavLink>
        </li>
        <li>
          <NavLink to="/concedii" activeClassName="active">
            Concedii
          </NavLink>
        </li>
        <li>
          <NavLink to="/feedback-ang" activeClassName="active">
            Feedback
          </NavLink>
        </li>
        <li>
          <NavLink to="/user-profil" activeClassName="active">
            Profilul Meu
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default NavbarAngajat;
