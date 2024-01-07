import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/App.css';
import { AuthProvider } from './database/AuthContext';
import ProtectedRoute from './database/route';
import ReactDOM from 'react-dom';
import Footer from './footer';
import Navbar from './components/vizitator/Navbar';
import Despre from './components/vizitator/Despre';
import Contact from './components/vizitator/Contact';
import Acasa from './components/vizitator/acasa';
import Login from './components/Logare/login';
import SignUp from './components/Logare/signup';
import ProfilAng from './components/Angajat/user-profil';
import DashboardAng from './components/Angajat/user-dashboard';
import HrDashboard from './components/HR/hr-dashboard';
import ProgramLucru from './components/Angajat/program-lucru';
import Concedii from './components/Angajat/concedii';
import FeedbackAng from './components/Angajat/feedback-ang';


const App = () => {
  const [authenticated, setAuthenticated] = useState(false);

  return (
    <Router>
      <AuthProvider>
        <div>
          <Navbar authenticated={authenticated} />

          <Routes>
            <Route path="/" element={<Acasa />} />
            <Route path="/Despre" element={<Despre />} />
            <Route path="/Contact" element={<Contact />} />
            <Route path="/user-dashboard" element={<DashboardAng />} />
            <Route path="/login" element={<Login setAuthenticated={setAuthenticated} />} />
            <Route path="/signup" element={<SignUp setAuthenticated={setAuthenticated} />} />
            <Route path="/hr-dashboard" element={<HrDashboard />} />
            <Route path="/program-lucru" element={<ProgramLucru />} />
            
           <Route path="/user-profil" element={
            <ProtectedRoute roles={['angajat']}>
              <ProfilAng />
            </ProtectedRoute>
          } />
          </Routes>
        
        </div>
      </AuthProvider>
      <Footer/>
    </Router>
    
  );
};

ReactDOM.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

export default App;
