import React from 'react';
import { NavLink } from 'react-router-dom';

const NavbarHR = () => {
  return (
    <nav className="navbar">
      <ul className="navbar-nav">
        <li>
          <NavLink to="/hr-dashboard" activeClassName="active">Dashboard HR</NavLink>
        </li>
        <li>
          <NavLink to="/gestionare-ang" activeClassName="active">Gestionare Angajați</NavLink>
        </li>
        <li>
          <NavLink to="/gestionare-prog" activeClassName="active">Gestionare Program</NavLink>
        </li>
        <li>
          <NavLink to="/gestionare-feedback" activeClassName="active">Gestionare Feedback</NavLink>
        </li>
        <li>
          <NavLink to="/gestionare-concedii" activeClassName="active">Gestionare Concedii</NavLink>
        </li>
        <li>
          <NavLink to="/hr-profil" activeClassName="active">Profilul Meu</NavLink>
        </li>
        <li>
          <NavLink to="/recrutare" activeClassName="active">Recrutare</NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default NavbarHR;
