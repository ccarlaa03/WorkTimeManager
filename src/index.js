// src/index.js
import React from 'react';
//import ReactDOM from 'react-dom';
import App from './App'; 
import { createRoot } from 'react-dom/client';


/*ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);*/
const root = createRoot(document.getElementById('root'));
root.render(<App />);



/*import React from 'react';
import { StrictMode } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import App from './App'; 
import VizitatorComponent from './components/vizitator/component-vizitator';
import AngajatComponent from './components/Angajat/component-angajat';
import HRComponent from './components/HR/component-hr';

const root = (
  <Router>
    <StrictMode>
      <App/>
      <Switch>
        <Route path="/" element={<App />} />
        <Route path="/component-vizitator" element={<VizitatorComponent />} />
        <Route path="/angajat" element={<AngajatComponent />} />
        <Route path="/hr" element={<HRComponent />} />
      </Switch>
    </StrictMode>
  </Router>
);

export default root; */
