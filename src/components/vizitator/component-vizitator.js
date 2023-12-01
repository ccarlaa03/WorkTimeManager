import React from 'react';
import { Switch, Route } from 'react-router-dom';
import App from '../../App';
import Despre from './despre';
import Servicii from './servicii';
import Contact from './contact';

function VizitatorComponent() {
  return (
    <div>
   
    <Switch>
      <Route path="/" element={<App />} />
      <Route path="/despre" element={<Despre />} />
      <Route path="/servicii" element={<Servicii />} />
      <Route path="/contact" element={<Contact />} />
    </Switch>
    </div>
  );
}

export default VizitatorComponent;
