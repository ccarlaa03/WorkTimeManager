import React from 'react';
import { Route, Switch } from 'react-router-dom';
import AngajatDashboard from '../components/Angajat/AngajatDashboard';
import VizualizareProgramLucru from '../components/Angajat/VizualizareProgramLucru';
import ModificareProgramLucru from '../components/Angajat/ModificareProgramLucru';
import IstoricConcedii from '../components/Angajat/IstoricConcedii';
import VizualizareRapoarte from '../components/Angajat/VizualizareRapoarte';
import VizualizareFeedback from '../components/Angajat/VizualizareFeedback';
import VizualizareSoldConcediu from '../components/Angajat/VizualizareSoldConcediu';

const AngajatRoutes = () => {
  return (
    <Switch>
      <Route path="/angajat/dashboard" component={AngajatDashboard} />
      <Route path="/angajat/vizualizare-program" component={VizualizareProgramLucru} />
      <Route path="/angajat/modificare-program" component={ModificareProgramLucru} />
      <Route path="/angajat/istoric-concedii" component={IstoricConcedii} />
      <Route path="/angajat/vizualizare-rapoarte" component={VizualizareRapoarte} />
      <Route path="/angajat/vizualizare-feedback" component={VizualizareFeedback} />
      <Route path="/angajat/vizualizare-sold-concediu" component={VizualizareSoldConcediu} />
    </Switch>
  );
};

export default AngajatRoutes;


