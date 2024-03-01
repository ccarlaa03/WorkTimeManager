import React from 'react';
import { useLocation } from 'react-router-dom';
import NavbarAngajat from './components/Angajat/Navbar-angajat';
import NavbarVizitator from './components/vizitator/Navbar';
import NavbarHR from './components/HR/NavbarHR';
import NavbarOwner from './components/Owner/NavbarOwner';

const NavbarWrapper = () => {
  const location = useLocation();
  const isOwnerRoute = location.pathname.includes('/owner-');
  // Determinați dacă calea curentă corespunde unei rute de angajat
  const isAngajatRoute = location.pathname.startsWith('/user-dashboard') || 
                         location.pathname.startsWith('/program-lucru') || 
                         location.pathname.startsWith('/concedii') || 
                         location.pathname.startsWith('/feedback-ang') || 
                         location.pathname.startsWith('/user-profil');
  
  // Determinați dacă calea curentă corespunde unei rute de HR
  const isHrRoute = location.pathname.includes('/hr-') || location.pathname.includes('/gestionare-');

  // Returnați navbar-ul corespunzător
  if (isHrRoute) {
    return <NavbarHR />;
  } else if (isAngajatRoute) {
    return <NavbarAngajat />;
  } else if (isOwnerRoute) {
    return <NavbarOwner />; 
  } else {
    return <NavbarVizitator />;
  }
};

export default NavbarWrapper;
