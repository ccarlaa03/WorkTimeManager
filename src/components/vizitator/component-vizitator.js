import React from 'react';
import NavbarVizitator from './navbar-vizitator';
import Acasa from './acasa';
import Despre from './despre';
import Servicii from './servicii';
import Contact from './contact';
import Footer from '../../footer';

function VizitatorComponent() {
  return (
    <div>
      <NavbarVizitator />
      <Acasa />
      <Despre />
      <Servicii />
      <Contact />
      <Footer/>
    </div>
  );
}

export default VizitatorComponent;