import React from 'react';
import { Route, Switch } from 'react-router-dom';
import HRDashboard from '../components/HR/HRDashboard';
import HRProfil from '../components/HR/HRProfil';
import ListaAngajati from '../components/HR/ListaAngajati';
import ProgramLucruAngajati from '../components/HR/ProgramLucru';
import IstoricConcediiAngajati from '../components/HR/IstoricConcedii';
import ListaAccidenteMunca from '../components/HR/ListaAccidente';
import Rapoarte from '../components/HR/Rapoarte';
import Training from '../components/HR/Training';

const HRRoutes = () => {
  return (
    <Switch>
      <Route path="/hr/dashboard" component={HRDashboard} />
      <Route path="/hr/profil" component={HRProfil} />
      <Route path="/hr/lista-angajati" component={ListaAngajati} />
      <Route path="/hr/vizualizare-program" component={VizualizareProgramLucru} />
      <Route path="/hr/lista-accidente-munca" component={ListaAccidente} />
      <Route path="/hr/vizualizare-rapoarte" component={Rapoarte} />
      <Route path="/hr/training" component={Training} />
    </Switch>
  );
};

export default HRRoutes;
