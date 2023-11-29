import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import VizitatorComponent from './components/vizitator/component-vizitator';
import AngajatComponent from './components/Angajat/component-angajat';
import HRComponent from './components/HR/component-hr';
import NavbarVizitator from './components/vizitator/navbar-vizitator';
import imagine1 from './photos/img1.jpg';
import imagine2 from './photos/img2.jpg';
import './styles/App.css';
import Footer from './footer';

function App() {
  return (
    <AuthProvider>
      <Router>
      <NavbarVizitator />
        <div>
          
        <section className='despre'>
            <h1>Bine ați venit la WorkTimeManager!</h1>
            <p>Soluția inovatoare pentru gestionarea eficientă a resurselor umane și a programului de lucru.</p>
            <p>Aplicația noastră își propune să simplifice și să modernizeze procesele din cadrul departamentelor de resurse umane, facilitând comunicarea internă și creând un mediu de lucru prietenos și organizat. Cu WTM, companiile pot gestiona cu ușurință programul de lucru al angajaților, să aprobe solicitări de concedii și să acceseze rapoarte detaliate pentru o analiză mai eficientă a performanțelor.</p>
          </section>

          <div className="image-container">
            <img src={imagine1} alt="Imagine1" className="imagine1" />
            <img src={imagine2} alt="Imagine2" className="imagine2" />
          </div>

          <Switch>
            <Route path="/vizitator" element={<VizitatorComponent />} />
            <Route path="/Angajat" element={<AngajatComponent />} />
            <Route path="/hr" element={<HRComponent />} />
          </Switch>

          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
