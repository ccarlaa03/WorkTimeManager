import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/App.css';
import NavbarWrapper from './NavbarWrapper';
import Footer from './footer';
import Despre from './components/vizitator/Despre';
import Contact from './components/vizitator/Contact';
import Acasa from './components/vizitator/acasa';
import Login from './components/Logare/login';
import SignUp from './components/Logare/signup';
import DashboardAng from './components/Angajat/employee-dashboard';
import HrDashboard from './components/Hr/hr-dashboard';
import ProgramLucru from './components/Angajat/program-lucru';
import Concedii from './components/Angajat/concedii';
import Feedback from './components/Angajat/feedback-ang';
import ProgramLucruHR from './components/Hr/gestionare-prog';
import GestionareFormular from './components/Hr/gestionare-formular';
import GestionareFeedback from './components/Hr/gestionare-feedback';
import GestionareAngajati from './components/Hr/gestionare-ang';
import GestionareProgramLucru from './components/Hr/gestionare-prog';
import GestionareConcedii from './components/Hr/gestionare-concedii';
import GestionareTraining from './components/Hr/gestionare-training';
import ProfilAngajatHR from './components/Hr/profil-angajat';
import ProfilAngajat from './components/Angajat/angajat-profil';
import OwnerDashboard from './components/Owner/owner-dashboard';
import LogoutComponent from './components/Logare/logout';


const App = () => {


  return (
    <Router>
      <NavbarWrapper />
      <Routes>
        <Route path="/" element={<Acasa />} />
        <Route path="/Despre" element={<Despre />} />
        <Route path="/Contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<LogoutComponent />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/employee-dashboard" element={<DashboardAng />} />
        <Route path="/program-lucru" element={<ProgramLucru />} />
        <Route path="/concedii" element={<Concedii />} />
        <Route path="/feedback-ang" element={<Feedback />} />
        <Route path="/angajat-profil" element={<ProfilAngajat />} />
        <Route path="/Hr-dashboard" element={<HrDashboard />} />
        <Route path="/gestionare-feedback" element={<GestionareFeedback />} />
        <Route path="/gestionare-prog" element={<GestionareProgramLucru />} />
        <Route path="/gestionare-ang" element={<GestionareAngajati />} />
        <Route path="/gestionare-concedii" element={<GestionareConcedii />} />
        <Route path="/gestionare-formular" element={<GestionareFormular />} />
        <Route path="/gestionare-training" element={<GestionareTraining />} />
        <Route path="/owner-dashboard" element={<OwnerDashboard />} />
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;
