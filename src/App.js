import React, { useState } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
//import { AuthProvider } from './AuthContext';
import Footer from './footer';
import Navbar from './components/vizitator/Navbar';
import Despre from './components/vizitator/Despre';
import Contact from './components/vizitator/Contact';
import Acasa from './components/vizitator/acasa';
import Login from './components/Logare/login';

const App = () => {
  const [currentPage, setCurrentPage] = useState('Acasa');
  const handlePageChange = (page) => {
    setCurrentPage(page);
  }

  return (

    <Router>
      <div>
        <Navbar currentPage={currentPage} handlePageChange={handlePageChange} />

        <Route path="/" exact component={Acasa} />
        <Route path="/Despre" exact component={Despre} />
        <Route path="/Contact" exact component={Contact} />
        <Route path="/login" exact component={Login} />
        
          <Footer/>
 </div>
    </Router>
      
)}

export default App;


