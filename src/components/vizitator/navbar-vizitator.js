import React from 'react';
import { Link } from 'react-router-dom';


function NavbarVizitator() {
  return (
    <nav>
      <ul>
      <li><Link to="/acasa">Acasa</Link></li>
      <li><Link to="/despre">Despre Noi</Link></li>
      <li><Link to="/servicii">Servicii</Link></li>
      <li><Link to="/contact">Contact</Link></li>
      <li><Link to="/log-in">Log In</Link></li>
     
      </ul>
    </nav>
  );
}

export default NavbarVizitator;
