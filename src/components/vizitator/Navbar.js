import React from 'react';
import { Link } from 'react-router-dom';
//import { useAuth } from '../../AuthContext'; 

const Navbar = ({ currentPage, handlePageChange }) => {

  return (
    <nav>
      <ul>
        <li><Link to="/" onClick={() => handlePageChange('Acasa')} className={currentPage === 'Acasa' ? 'active' : ''}>Acasa</Link></li>
        <li><Link to="/Despre" onClick={() => handlePageChange('Despre')} className={currentPage === 'Despre' ? 'active' : ''}>Despre</Link></li>
        <li><Link to="/Contact" onClick={() => handlePageChange('Contact')} className={currentPage === 'Contact' ? 'active' : ''}>Contact</Link></li>
        <li><Link to="/login" onClick={() => handlePageChange('Login')} className={currentPage === 'Login' ? 'active' : ''}>Log In</Link></li>


      </ul>
    </nav>
  );
}

export default Navbar;
