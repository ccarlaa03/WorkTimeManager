import React, { useState, useEffect } from 'react';
import imagine1 from '../../photos/img1.jpg';
import imagine2 from '../../photos/img2.jpg';
import '../../styles/App.css';

const Acasa = () => {
  const [informatii, setInformatii] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/informatii-acasa/') 
      .then(data => {
        setInformatii(data);
      })
      .catch(error => console.log(error));
  }, []);

  return (
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
  );
};

export default Acasa;
