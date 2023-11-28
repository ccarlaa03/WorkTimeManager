import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import VizitatorComponent from './components/vizitator/component-vizitator';
import AngajatComponent from './components/Angajat/component-angajat';
import HRComponent from './components/HR/component-hr';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
        <Route path="/" element={<VizitatorComponent />} />

          <Route path="/" element={<AngajatComponent />} />
    

          <Route path="/" element={<HRComponent />} />
      
          </Routes>
        </Router>
    </AuthProvider>
  );
}

export default App;

