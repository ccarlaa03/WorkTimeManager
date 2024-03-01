import React from 'react';
import { NavLink } from 'react-router-dom';

const NavbarOwner = () => {
  return (
    <nav className="navbar">
      <ul>
        <li>
          <NavLink to="/owner-dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
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
      </ul>
    </nav>
  );
};

export default NavbarOwner;
