import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavbarAngajat from './components/Angajat/Navbar-angajat';
import NavbarVizitator from './components/vizitator/Navbar';
import NavbarHR from './components/HR/NavbarHR';
import NavbarOwner from './components/Owner/NavbarOwner';

const NavbarWrapper = () => {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token'); // Asigură-te că există un token în localStorage
  const userRole = localStorage.getItem('role'); // Presupunem că rolul este stocat în localStorage la login

  const handleLogout = async () => {
    try {
      await axios.post('/api/logout/');
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      navigate('/login');
    } catch (error) {
      console.error('Eroare la logout:', error);
    }
  };

  // În funcție de rolul utilizatorului, decide care navbar să returnezi
  if (isAuthenticated && userRole === 'owner') {
    return <NavbarOwner onLogout={handleLogout} />;
  } else if (isAuthenticated && userRole === 'employee') {
    return <NavbarAngajat onLogout={handleLogout} />;
  } else if (isAuthenticated && userRole === 'hr') {
    return <NavbarHR onLogout={handleLogout} />;
  } else {
    // Dacă nu este autentificat, arată navbar-ul pentru vizitatori
    return <NavbarVizitator />;
  }
};

export default NavbarWrapper;
