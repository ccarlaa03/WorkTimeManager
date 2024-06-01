import React from 'react';
import '../../styles/App.css';
import imagine3 from '../../photos/img3.jpg';


const Despre = () => {
  return (
    <>
      <section className="despre">
        <h1>Despre noi și serviciile noastre</h1>

        <div className="image">
          <img src={imagine3} alt="Imagine3" className="imagine3" />
        </div>

        <div className="content1">
          <div className="column">
            <h2>Scopul nostru</h2>
            <p>Scopul nostru este să simplificăm și să modernizăm procesele din cadrul departamentelor de resurse umane, facilitând comunicarea internă și creând un mediu de lucru prietenos și organizat.</p>
          </div>

          <div className="column">
            <h2>Politici și proceduri</h2>
            <p>Implementăm politici și proceduri eficiente pentru recrutare, evaluare a performanței, dezvoltare profesională și multe altele, asigurându-ne că angajații noștri se bucură de o experiență de lucru de calitate.</p>
          </div>

          <div className="column">
            <h2>Avantajele angajatului</h2>
            <p>Oferta noastră include beneficii atractive, programe de dezvoltare profesională și o cultură organizațională care încurajează excelența și colaborarea.</p>
          </div>

          <div className="column">
            <h2>Serviciile oferite de noi</h2>
            <p>Oferim o gamă variată de servicii menite să optimizeze gestionarea resurselor umane și să îmbunătățească mediul de lucru. Printre acestea se numără:
              Recrutare și selecție de personal. Training și dezvoltare profesională. Gestionarea programului de lucru </p>
          </div>

        </div>
      </section>

    </>
  );
};

export default Despre;
