import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavbarAngajat from './components/Angajat/Navbar-angajat';
import NavbarVizitator from './components/vizitator/Navbar';
import NavbarHR from './components/HR/NavbarHR';
import NavbarOwner from './components/Owner/NavbarOwner';

const NavbarWrapper = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(!localStorage.getItem('token'));
  const userRole = localStorage.getItem('role');

  useEffect(() => {
    console.log('isAuthenticated:', isAuthenticated);
    console.log('userRole:', userRole);
  }, [isAuthenticated, userRole]);

  const handleLogout = async () => {
    try {
      if (isAuthenticated) {
        await axios.post('/logout', {
          refresh_token: localStorage.getItem('refresh_token')
        }, {
          headers: {'Content-Type': 'application/json'},
          withCredentials: true
        });
        localStorage.clear();
        setIsAuthenticated(false); 
        navigate('/login');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Decide which Navbar to render based on the user's role
  switch (userRole) {
    case 'owner':
      return <NavbarOwner onLogout={handleLogout} />;
    case 'hr':
      return <NavbarHR onLogout={handleLogout} />;
    case 'employee':
      return <NavbarAngajat onLogout={handleLogout} />;
    default:
      return <NavbarVizitator />;
  }
};

export default NavbarWrapper;
