import React, { useState, useEffect } from 'react';
import imagine1 from '../../photos/img1.jpg';
import imagine2 from '../../photos/img2.jpg';
import '../../styles/App.css';
import axios from 'axios';
import ErrorBoundary from '../../ErrorBoundary';

const Acasa = () => {
  useEffect(() => {
    // Efectuează cererea GET fără token de autorizare
    axios.get('http://localhost:8000/acasa/')
      .then(response => {
        console.log(response.data);  // Aici poți gestiona datele primite
      })
      .catch(error => {
        console.error('Eroare la preluarea datelor:', error);
        // Aici poți adăuga logică suplimentară în caz de eroare
      });
  }, []);

  return (
    <ErrorBoundary>
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
    </div>
    </ErrorBoundary>
  );
};

export default Acasa;
