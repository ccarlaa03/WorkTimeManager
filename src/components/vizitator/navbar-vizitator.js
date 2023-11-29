
import React from 'react';
import { Link } from 'react-router-dom';

function NavbarVizitator() {
  return (
    <nav>
      <ul>
        <li><Link to="/vizitator/App">Acasa</Link></li>
        <li><Link to="/vizitator/despre">Despre Noi</Link></li>
        <li><Link to="/vizitator/servicii">Servicii</Link></li>
        <li><Link to="/vizitator/contact">Contact</Link></li>
        <li><Link to="/Login">Log In</Link></li>
      </ul>
    </nav>
  );
}

export default NavbarVizitator;
