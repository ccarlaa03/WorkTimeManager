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
          <NavLink to="/gestionare-ang" activeClassName="active">Gestionare angajați</NavLink>
        </li>
        <li>
          <NavLink to="/gestionare-prog" activeClassName="active">Program de lucru</NavLink>
        </li>
        <li>
          <NavLink to="/gestionare-feedback" activeClassName="active"> Feedback</NavLink>
        </li>
        <li>
          <NavLink to="/gestionare-concedii" activeClassName="active">Concedii</NavLink>
        </li>
        <li>
          <NavLink to="/gestionare-training" activeClassName="active">Training</NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default NavbarHR;
