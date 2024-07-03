import React, { useEffect } from 'react';
import imag1 from '../../photos/img1.jpg';
import imag2 from '../../photos/img2.jpg';
import imag5 from '../../photos/img5.jpg';
import '../../styles/App.css';
import axios from 'axios';
import ErrorBoundary from '../../ErrorBoundary';

const Acasa = () => {
  useEffect(() => {
    axios.get('http://localhost:8000/acasa/')
      .then(response => {
        console.log(response.data); 
      })
      .catch(error => {
        console.error('Eroare la preluarea datelor:', error);
       
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
          <img src={imag1} alt="Imagine1" className="imge" />
          <img src={imag2} alt="Imagine2" className="image" />
          <img src={imag5} alt="Imagine2" className="image" />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Acasa;
