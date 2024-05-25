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
import HrDashboard from './components/HR/hr-dashboard';
import ProgramLucru from './components/Angajat/program-lucru';
import Concedii from './components/Angajat/concedii';
import Feedback from './components/Angajat/feedback-ang';
import GestionareFeedback from './components/HR/gestionare-feedback';
import GestionareAngajati from './components/HR/gestionare-ang';
import GestionareProgramLucru from './components/HR/gestionare-prog';
import GestionareConcedii from './components/HR/gestionare-concedii';
import GestionareTraining from './components/HR/gestionare-training';
import FeedbackForm from './components/HR/formulare-feeedback';
import ProfilAngajat from './components/Angajat/angajat-profil';
import OwnerDashboard from './components/Owner/owner-dashboard';
import LogoutComponent from './components/Logare/logout';
import { AuthProvider } from './AuthContext';
import FeedbackDetails from './components/HR/feedback-details';
import TrainingEmployee from './components/Angajat/training';
import EmployeeManagement from './components/Owner/gestionare-angajati';
import ProfilAngajatOwner from './components/Owner/profil-angajt';
import RapoarteTraining from './components/Owner/rapoarte-training';
import RapoarteFeedback from './components/Owner/rapoarte-feedback';

const App = () => {


  return (
    <AuthProvider>
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
          <Route path="/Hr-dashboard" element={<HrDashboard />} />
          <Route path="/gestionare-feedback" element={<GestionareFeedback />} />
          <Route path="/gestionare-prog" element={<GestionareProgramLucru />} />
          <Route path="/angajat-profil/:user_id" element={<ProfilAngajat />} />
          <Route path="/gestionare-ang" element={<GestionareAngajati />} />
          <Route path="/gestionare-concedii" element={<GestionareConcedii />} />
          <Route path="/training" element={<TrainingEmployee />} />
          <Route path="/gestionare-training" element={<GestionareTraining />} />
          <Route path="/owner-dashboard" element={<OwnerDashboard />} />
          <Route path="/formulare-feeedback" element={<FeedbackForm />} />
          <Route path="/feedback-details/:form_id" element={<FeedbackDetails />} />
          <Route path="/gestionare-angajati" element={<EmployeeManagement />} />
          <Route path="/gestionare-angajati/owner/angajat-profil/:user_id" element={<ProfilAngajatOwner />} />
          <Route path="/owner-rapoarte-training" element={<RapoarteTraining />} />
          <Route path="/owner-rapoarte-feedback" element={<RapoarteFeedback />} />
        </Routes>
        <Footer />
      </Router>
    </AuthProvider>
  );
};

export default App;
