import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/App.css';
import NavbarWrapper from './NavbarWrapper';
import Footer from './footer';
import Despre from './components/vizitator/Despre';
import Contact from './components/vizitator/Contact';
import Acasa from './components/vizitator/acasa';
import Login from './components/Logare/login';
import SignUp from './components/Logare/signup';
import DashboardAng from './components/Angajat/Angajat-dashboard';
import HrDashboard from './components/HR/HR-dashboard';
import ProgramLucru from './components/Angajat/program-lucru';
import Concedii from './components/Angajat/concedii';
import Feedback from './components/Angajat/feedback-ang';
import ProgramLucruHR from './components/HR/gestionare-prog';
import GestionareFormular from './components/HR/gestionare-formular';
import GestionareFeedback from './components/HR/gestionare-feedback';
import GestionareAngajati from './components/HR/gestionare-ang';
import GestionareProgramLucru from './components/HR/gestionare-prog';
import GestionareConcedii from './components/HR/gestionare-concedii';
import GestionareTraining from './components/HR/gestionare-training';
import Rapoarte from './components/HR/rapoarte';
import ProfilAngajatHR from './components/HR/profil-angajat';
import ProfilAngajat from './components/Angajat/angajat-profil';

const App = () => {


  return (
    <Router>
      <NavbarWrapper />
      <Routes>
        <Route path="/" element={<Acasa />} />
        <Route path="/Despre" element={<Despre />} />
        <Route path="/Contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/Amgajat-dashboard" element={<DashboardAng />} />
        <Route path="/program-lucru" element={<ProgramLucru />} />
        <Route path="/concedii" element={<Concedii />} />
        <Route path="/feedback-ang" element={<Feedback />} />
        <Route path="/angajat-profil" element={<ProfilAngajat />} />
        <Route path="/HR-dashboard" element={<HrDashboard />} />
        <Route path="/gestionare-feedback" element={<GestionareFeedback />} />
        <Route path="/gestionare-prog" element={<GestionareProgramLucru />} />
        <Route path="/gestionare-ang" element={<GestionareAngajati />} />
        <Route path="/gestionare-concedii" element={<GestionareConcedii />} />
        <Route path="/gestionare-formular" element={<GestionareFormular />} />
        <Route path="/gestionare-training" element={<GestionareTraining />} />

      </Routes>
      <Footer />
    </Router>
  );
};

export default App;
