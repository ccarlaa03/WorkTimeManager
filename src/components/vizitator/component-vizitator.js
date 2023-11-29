import React from 'react';
import NavbarVizitator from './navbar-vizitator';
import App from '../../App';
import Despre from './despre';
import Servicii from './servicii';
import Contact from './contact';
import Footer from '../../footer';

function VizitatorComponent() {
  return (
    <div>
      <NavbarVizitator />
      <App />
      <Despre />
      <Servicii />
      <Contact />
      <Footer/>
    </div>
  );
}

export default VizitatorComponent;